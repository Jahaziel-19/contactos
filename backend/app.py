#________________________________________________________________________________________________________________________
#                                                   FLASK   
from flask import Flask, request, jsonify, redirect, url_for, session, Response
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS, cross_origin
# jwt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

import os
import csv
import re
import bcrypt
import datetime

from io import StringIO
from config import Config
#from dotenv import load_dotenv


app = Flask(__name__) # Declaración de la app de flask
app.config.from_object(Config) # Obtener las configuraciones del proyecto

CORS(app, origins='*') #, supports_credentials=True , resources={r"/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173"], "allow_headers":"*"}}

#jwt token

jwt = JWTManager(app)

'''
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,  # Asegura que solo se acceda a las cookies a través de HTTP(S)
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=False  # Desactiva el uso seguro para desarrollo local (HTTPS)
)
'''
# Configuración de la base de datos con Mongo (pymongo)
mongo = PyMongo(app)
db_users = mongo.db.users # usuarios de la base de datos
db_contactos = mongo.db.contactos # contactos de la base de datos


# Cargar usuario JWT
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user

# Serialziar documentos
def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc


#________________________________________________________________________________________________________________________
#
#                                                   API USERS   
#________________________________________________________________________________________________________________________

@cross_origin(supports_credentials=True)
@app.route('/register', methods=['POST'])
def register():
    # Verificar si la solicitud tiene el tipo de contenido correcto
    if not request.is_json:
        print("Error: Tipo de contenido no es application/json")
        return jsonify({"error": "El tipo de contenido debe ser application/json"}), 400
    
    # Intentar cargar el contenido JSON
    try:
        data = request.get_json()
        #print("Datos recibidos en el servidor:", data)
    except Exception as e:
        print(f"Error al procesar el JSON: {str(e)}")
        return jsonify({"error": f"Error al procesar JSON: {str(e)}"}), 400

    # Extraer los datos esperados
    username = data.get('name')
    phone_number = data.get('number')
    email = data.get('email')
    password = data.get('password')

    # Verificar formato del correo
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "El formato del correo no es válido"}), 400
    
    if not phone_number.isdigit():
        return jsonify({"error": "El número de teléfono debe contener solo dígitos"}), 400


    # Verificar si algún campo está vacío o no fue enviado
    if not all([username, phone_number, email, password]):
        print("Error: Todos los campos son requeridos.")
        return jsonify({"error": "Todos los campos son requeridos"}), 400

    # Codificar y hashear la contraseña
    password = password.encode('utf-8')  
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())  

    # Verificar si el usuario ya existe
    if db_users.find_one({"phone_number": phone_number}):
        print(f"Error: Ya existe un usuario con ese número {phone_number}")
        return jsonify({"error": "Ya existe un usuario con ese número"}), 400

    # Crear nuevo usuario en la base de datos
    try:
        db_users.insert_one({
            "username": username,
            "phone_number": phone_number,
            "email": email,
            "password": hashed_password
        })
        print(f"Usuario registrado exitosamente: {username}")
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Exception as db_error:
        print(f"Error al insertar en la base de datos: {str(db_error)}")
        return jsonify({"error": f"Error al registrar usuario: {str(db_error)}"}), 500

# Ruta para el inicio de sesión
@cross_origin(supports_credentials=True)
@app.route('/login', methods=['POST']) 
def login():
    phone_number = request.json.get('phone_number')
    password = request.json.get('password').encode('utf-8')

    if not phone_number or not password:
        return jsonify({"error": "Credenciales incompletas"}), 400

    user = db_users.find_one({"phone_number": phone_number})

    if user and bcrypt.checkpw(password, user['password']):
        # Generar un token JWT con el ID del usuario
        access_token = create_access_token(identity=str(user['_id']))

        print(f"Inicio de sesión exitoso: {user['username']}")
        return jsonify(access_token=access_token), 200

    return jsonify({"error": "Credenciales inválidas"}), 401


# Verificar la autenticacion del usuario
@cross_origin(supports_credentials=True)
@app.route('/auth/check', methods=['GET'])
@jwt_required()
def check_auth():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

    
# Ruta para obtener un usuario por ID
@app.route('/users/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        user = db_users.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # Excluir campo de contraseña
        if user:
            user["_id"] = str(user["_id"])  # Convertir ObjectId a string
            return jsonify(user), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except:
        return jsonify({"error": "ID de usuario inválido"}), 400


# Ruta para actualizar un usuario por ID
@app.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        update_data = request.json
        allowed_fields = {'username', 'phone_number', 'email', 'password'}
        '''
        if not set(update_data.keys()).issubset(allowed_fields):
            return jsonify({"error": "Campos no válidos en la solicitud"}), 400
        '''

        # Verificar si se quiere actualizar el número de teléfono
        if 'phone_number' in update_data:
            nuevo_numero = update_data['phone_number']

            # Buscar un usuario que tenga ese número y que no sea el usuario que se está actualizando
            usuario_existente = db_users.find_one({"phone_number": nuevo_numero, "_id": {"$ne": ObjectId(user_id)}})

            if usuario_existente:
                return jsonify({"error": "El número de teléfono ya está en uso por otro usuario"}), 400

        # Si se incluye contraseña, la encriptamos antes de actualizar
        if 'password' in update_data:
            update_data['password'] = bcrypt.hashpw(update_data['password'].encode('utf-8'), bcrypt.gensalt())

        # Actualizar el usuario con los nuevos datos
        result = db_users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        if result.matched_count > 0:
            return jsonify({"message": "Usuario actualizado exitosamente"}), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": "ID de usuario inválido o error en la operación: " + str(e)}), 400

# Ruta para obtener todos los usuarios
@app.route('/users', methods=['GET'])
def obtener_todos_usuarios():
    try:
        # Obtener todos los usuarios de la colección, excluyendo la contraseña
        usuarios = list(db_users.find({}, {"password": 0}))

        # Convertir ObjectId a string para cada usuario
        for usuario in usuarios:
            usuario['_id'] = str(usuario['_id'])

        return jsonify(usuarios), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Ruta para eliminar un usuario por ID
@app.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        result = db_users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Usuario eliminado exitosamente"}), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except:
        return jsonify({"error": "ID de usuario inválido"}), 400
    
#________________________________________________________________________________________________________________________
#
#                                                   API CONTACTOS   
#________________________________________________________________________________________________________________________

# Ruta para agregar un contacto
@app.route('/contactos', methods=['POST'])
@jwt_required()
def agregar_contacto():
    current_user_id = get_jwt_identity()
    
    try:
        id = db_contactos.insert_one({
            'nombre': request.json['nombre'],
            'telefono': request.json['telefono'],
            'email': request.json['email'],
            'user_id': current_user_id  # Relaciona el contacto con el usuario logueado
        })
        return jsonify({"id": str(id.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para buscar contactos por nombre, teléfono o correo electrónico
@app.route('/contactos/buscar/<parametro>', methods=['GET'])
@jwt_required()
def buscar_contacto(parametro):
    try:
        # Crear el filtro inicial para asegurarse de que solo se busque en los contactos del usuario logueado
        filtro = {"user_id": get_jwt_identity()}

        # Aplicar el parámetro de búsqueda a todos los campos relevantes: nombre, teléfono y email
        filtro["$or"] = [
            {"nombre": {"$regex": parametro, "$options": "i"}},
            {"telefono": {"$regex": parametro, "$options": "i"}},
            {"email": {"$regex": parametro, "$options": "i"}}
        ]

        # Buscar los contactos que coincidan con el filtro
        contactos = list(db_contactos.find(filtro))

        # Convertir ObjectId a string y preparar los datos para la respuesta
        for contacto in contactos:
            serialize_doc(contacto)

        return jsonify(contactos), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para consultar un contacto por ID
@app.route('/contacto/<string:id>', methods=['GET'])
@jwt_required()
def obtener_contacto(id):     
    try:
        contacto = db_contactos.find_one({'_id': ObjectId(id)})
        if contacto:
            return jsonify({
                '_id': str(contacto['_id']),
                'nombre': contacto['nombre'],
                'telefono': contacto['telefono'],
                'email': contacto['email']
            })
        else:
            return jsonify({"error": "Contacto no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para obtener todos los contactos de un usuario logueado
@app.route('/contactos', methods=['GET'])
@jwt_required()
def obtener_contactos_usuario():
    try:
        # Obtener todos los contactos del usuario logueado
        contactos = list(db_contactos.find({"user_id": get_jwt_identity()}))

        # Convertir ObjectId a string para que sea serializable en JSON
        for contacto in contactos:
            serialize_doc(contacto)

        # Retornar los contactos en formato JSON
        return jsonify(contactos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Ruta para actualizar un contacto
@app.route('/contacto/<string:id>', methods=['PUT'])
@jwt_required()
def actualizar_contacto(id):
    contacto_existente = db_contactos.find_one({"_id": ObjectId(id), "user_id": get_jwt_identity()})
    if not contacto_existente:
        return jsonify({"error": "No se encontró el contacto o no tienes permiso para actualizarlo"}), 404

    updated_contacto = {
        "nombre": request.json['nombre'],
        "telefono": request.json['telefono'],
        "email": request.json['email']
    }
    result = db_contactos.update_one({"_id": ObjectId(id)}, {"$set": updated_contacto})
    if result.modified_count > 0:
        return jsonify({'msg': 'Contacto actualizado'})
    else:
        return jsonify({"error": "No se pudo actualizar el contacto o no se encontró"}), 404

# Ruta para eliminar un contacto
@app.route('/contacto/<string:id>', methods=['DELETE'])
@jwt_required()
def eliminar_contacto(id):
    result = db_contactos.delete_one({"_id": ObjectId(id)})
    if result.deleted_count > 0:
        return jsonify({'msg': 'Contacto eliminado'})
    else:
        return jsonify({"error": "Contacto no encontrado"}), 404

# Exportación de contactos en formato JSON
@app.route('/contactos/export/json', methods=['GET'])
@jwt_required()
def export_contactos_json():      
    try:
        # Obtener los contactos del usuario logueado
        contactos = list(db_contactos.find({"user_id": get_jwt_identity()}))
        if not contactos:
            return jsonify({"message": "No tienes contactos para exportar"}), 204

        # Convertir ObjectId a string para que sea serializable en JSON
        for contacto in contactos:
            serialize_doc(contacto)
        return jsonify(contactos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Exportación de contactos en formato CSV
@app.route('/contactos/export/csv', methods=['GET'])
@jwt_required()
def export_contactos_csv():
    try:
        # Obtener los contactos del usuario logueado
        contactos = list(db_contactos.find({"user_id": get_jwt_identity()}))
        if not contactos:
            return jsonify({"message": "No tienes contactos para exportar"}), 204
        
        # Crear el archivo CSV en memoria
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Nombre', 'Teléfono', 'Email'])  # Encabezados

        for contacto in contactos:
            writer.writerow([str(contacto['_id']), contacto['nombre'], contacto['telefono'], contacto['email']])
        
        output.seek(0)
        
        # Retornar el archivo CSV
        return Response(output, mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=contactos.csv"})
    except Exception as e:
        return jsonify({"message": "No hay contactos para exportar"}), 204

#________________________________________________________________________________________________________________________
#                                                   ARRANQUE DE APLICACIÓN  
if __name__ == '__main__':
    app.run(debug=True)