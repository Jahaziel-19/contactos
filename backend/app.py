from flask import Flask, request, jsonify, redirect, url_for
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.config.from_object(Config)
mongo = PyMongo(app)
CORS(app)

# contactos de la base de datos
db_contactos = mongo.db.contactos

# Ruta principal para mostrar la lista de contactos
@app.route('/')
def index():
    return 'Hello world'

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