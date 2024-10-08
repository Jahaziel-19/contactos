#________________________________________________________________________________________________________________________
#                                                   FLASK   
from flask import Flask, request, jsonify, redirect, url_for, session, Response
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS, cross_origin
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask import session
from flask_session import Session

import os
import csv
import re
import bcrypt

from io import StringIO
from config import Config
from dotenv import load_dotenv


app = Flask(__name__) # Declaración de la app de flask
app.config.from_object(Config) # Obtener las configuraciones del proyecto

CORS(app, origins='*') #, supports_credentials=True , resources={r"/*": {"origins": ["http://127.0.0.1:5173", "http://localhost:5173"], "allow_headers":"*"}}
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


Session(app)

# Configuración de Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Modelo de usuario
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# Cargar usuario
@login_manager.user_loader
def load_user(user_id):
    user = db_users.find_one({"_id": ObjectId(user_id)})
    if user:
        return User(user_id)
    return None


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
    phone_number = request.json['phone_number']
    password = request.json['password'].encode('utf-8')
    
    if not phone_number.isdigit():
        return jsonify({"error": "El número de teléfono debe contener solo dígitos"}), 400
    
    user = db_users.find_one({"phone_number": phone_number})
    if user and bcrypt.checkpw(password, user['password']):
        user_obj = User(str(user['_id']))  # Crear objeto User
        login_user(user_obj, remember=True)  # Iniciar sesión con remember para que dure más allá de la sesión
        print(f'Authenticated: {current_user.is_authenticated}')
        print(f"Inicio de sesión exitoso: {user['username']}")
        return jsonify({"message": "Inicio de sesión exitoso", "user": {"id": str(user['_id']), "username": user['username'], "email": user['email']}}), 200
    return jsonify({"error": "Credenciales inválidas"}), 401


# Ruta para cerrar sesión
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()  # Cerrar sesión
    return jsonify({"message": "Cierre de sesión exitoso"}), 200

@app.route('/auth/check', methods=['GET'])
@cross_origin(supports_credentials=True)
def check_auth():
    print(f"Usuario actual: {current_user}")
    if current_user.is_authenticated:
        return jsonify({"authenticated": True}), 200
    else:
        return jsonify({"authenticated": False}), 401

# Ruta para obtener un usuario por ID
@app.route('/users/<user_id>', methods=['GET'])
@login_required
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
@login_required
def update_user(user_id):
    try:
        update_data = request.json

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
@login_required
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
@login_required
def agregar_contacto():
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})

    try:
        id = db_contactos.insert_one({
            'nombre': request.json['nombre'],
            'telefono': request.json['telefono'],
            'email': request.json['email'],
            'user_id': current_user.id  # Relaciona el contacto con el usuario logueado
        })
        return jsonify({"id": str(id.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para buscar contactos por nombre, teléfono o correo electrónico
@app.route('/contactos/buscar/<parametro>', methods=['GET'])
@login_required
def buscar_contacto(parametro):
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
    try:
        # Crear el filtro inicial para asegurarse de que solo se busque en los contactos del usuario logueado
        filtro = {"user_id": current_user.id}

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
            contacto['_id'] = str(contacto['_id'])

        return jsonify(contactos), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para consultar un contacto por ID
@app.route('/contacto/<string:id>', methods=['GET'])
@login_required
def obtener_contacto(id):
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
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
@login_required
def obtener_contactos_usuario():
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas ver tus contactos"}), 401

    try:
        # Obtener todos los contactos del usuario logueado
        contactos = list(db_contactos.find({"user_id": current_user.id}))

        # Convertir ObjectId a string para que sea serializable en JSON
        for contacto in contactos:
            contacto['_id'] = str(contacto['_id'])

        # Retornar los contactos en formato JSON
        return jsonify(contactos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Ruta para actualizar un contacto
@app.route('/contacto/<string:id>', methods=['PUT'])
@login_required
def actualizar_contacto(id):
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
    
    contacto_existente = db_contactos.find_one({"_id": ObjectId(id), "user_id": current_user.id})
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
@login_required
def eliminar_contacto(id):
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
    result = db_contactos.delete_one({"_id": ObjectId(id)})
    if result.deleted_count > 0:
        return jsonify({'msg': 'Contacto eliminado'})
    else:
        return jsonify({"error": "Contacto no encontrado"}), 404

# Exportación de contactos en formato JSON
@app.route('/contactos/export/json', methods=['GET'])
@login_required
def export_contactos_json():
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
    try:
        # Obtener los contactos del usuario logueado
        contactos = list(db_contactos.find({"user_id": current_user.id}))
        if not contactos:
            return jsonify({"message": "No tienes contactos para exportar"}), 204

        # Convertir ObjectId a string para que sea serializable en JSON
        for contacto in contactos:
            contacto['_id'] = str(contacto['_id'])
        return jsonify(contactos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Exportación de contactos en formato CSV
@app.route('/contactos/export/csv', methods=['GET'])
@login_required
def export_contactos_csv():
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
    try:
        # Obtener los contactos del usuario logueado
        contactos = list(db_contactos.find({"user_id": current_user.id}))
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
        return jsonify({"error": str(e)}), 500

#________________________________________________________________________________________________________________________
#                                                   ARRANQUE DE APLICACIÓN  
if __name__ == '__main__':
    app.run(debug=True)