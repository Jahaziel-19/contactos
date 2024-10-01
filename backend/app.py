#________________________________________________________________________________________________________________________
#                                                   FLASK   
from flask import Flask, request, jsonify, redirect, url_for, session, Response
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

import os
import csv
import re
import bcrypt

from io import StringIO
from config import Config
from dotenv import load_dotenv


app = Flask(__name__) # Declaración de la app de flask
app.config.from_object(Config) # Obtener las configuraciones del proyecto

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}}) # Especifica la recepcion única de peticiones del puerto 5173 con React


# Configuración de la base de datos con Mongo (pymongo)
mongo = PyMongo(app)
db_users = mongo.db.users # usuarios de la base de datos
db_contactos = mongo.db.contactos # contactos de la base de datos



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


app.config.update(
    SESSION_COOKIE_HTTPONLY=False,  # Permitir que JS acceda a las cookies si es necesario
    SESSION_COOKIE_SAMESITE="None", # Permitir cookies cross-site
    SESSION_COOKIE_SECURE=False  # Para pruebas locales
)


#________________________________________________________________________________________________________________________
#
#                                                   API USERS   
#________________________________________________________________________________________________________________________

# Ruta para el registro de usuarios
@app.route('/register', methods=['POST'])
def register():
    username = request.json['username']
    phone_number = request.json['phone_number']
    email = request.json['email']
    password = request.json['password'].encode('utf-8')  # Codificar el password
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())  # Hashear el password

    # Verificar si el usuario ya existe
    if db_users.find_one({"phone_number": phone_number}):
        return jsonify({"error": "Ya existe un usuario con ese número"}), 400

    # Crear nuevo usuario
    db_users.insert_one({
        "username": username,
        "phone_number":phone_number,
        "email":email,
        "password": hashed_password
    })
    return jsonify({"message": "Usuario registrado exitosamente"}), 201

# Ruta para el inicio de sesión
@app.route('/login', methods=['POST'])
def login():
    phone_number = request.json['phone_number']
    password = request.json['password'].encode('utf-8')

    user = db_users.find_one({"phone_number": phone_number})
    if user and bcrypt.checkpw(password, user['password']):
        user_obj = User(str(user['_id']))  # Crear objeto User
        login_user(user_obj)  # Iniciar sesión
        return jsonify({"message": "Inicio de sesión exitoso"}), 200
    return jsonify({"error": "Credenciales inválidas"}), 401

# Ruta para cerrar sesión
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()  # Cerrar sesión
    return jsonify({"message": "Cierre de sesión exitoso"}), 200

# Ruta para verificar si el usuario está autenticado
@app.route('/auth/check', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({"authenticated": True}), 200
    else
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
        if 'password' in update_data:
            update_data['password'] = bcrypt.hashpw(update_data['password'].encode('utf-8'), bcrypt.gensalt())

        result = db_users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        if result.matched_count > 0:
            return jsonify({"message": "Usuario actualizado exitosamente"}), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except:
        return jsonify({"error": "ID de usuario inválido"}), 400

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

# Ruta para consultar un contacto
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

# Ruta para actualizar un contacto
@app.route('/contacto/<string:id>', methods=['PUT'])
@login_required
def actualizar_contacto(id):
    if not current_user.id:
        return jsonify({"Error":"Inicia sesión para que puedas registrar tus contactos"})
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