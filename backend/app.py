from flask import Flask, request, jsonify, redirect, url_for, session
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from config import Config
from dotenv import load_dotenv
import os
import bcrypt

app = Flask(__name__)
app.config.from_object(Config)
mongo = PyMongo(app)
CORS(app)

# contactos de la base de datos
db_contactos = mongo.db.contactos
db_users = mongo.db.users

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


######### API USERS ######### 
# Ruta para el registro de usuarios
@app.route('/register', methods=['POST'])
def register():
    username = request.json['username']
    phone_number = request.json['phone_number']
    email = request.json['email']
    password = request.json['password'].encode('utf-8')  # Codificar el password
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())  # Hashear el password

    # Verificar si el usuario ya existe
    if db_users.find_one({"username": username}):
        return jsonify({"error": "El usuario ya existe"}), 400

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
    return jsonify({"authenticated": False}), 401



######### API CONTACTOS ######### 
# Ruta para agregar un contacto
@app.route('/contactos', methods=['POST'])
def agregar_contacto():
    try:
        id = db_contactos.insert_one({
            'nombre': request.json['nombre'],
            'telefono': request.json['telefono'],
            'email': request.json['email']
        })
        return jsonify({"id": str(id.inserted_id)}), 201  # Respuesta con el ID del nuevo contacto
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Manejo de errores

# Ruta para consultar un contacto
@app.route('/contacto/<string:id>', methods=['GET'])
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

# Ruta para actualizar un contacto
@app.route('/contacto/<string:id>', methods=['PUT'])
def actualizar_contacto(id):
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
def eliminar_contacto(id):
    result = db_contactos.delete_one({"_id": ObjectId(id)})
    if result.deleted_count > 0:
        return jsonify({'msg': 'Contacto eliminado'})
    else:
        return jsonify({"error": "Contacto no encontrado"}), 404

if __name__ == '__main__':
    app.run(debug=True)