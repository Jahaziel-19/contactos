from flask import Flask, request, jsonify, redirect, url_for, render_template
from flask_wtf import CSRFProtect
from flask_pymongo import PyMongo, ObjectId
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
csrf = CSRFProtect(app)
mongo = PyMongo(app)


# contactos de la base de datos
db_contactos = mongo.db.contactos

# Ruta principal para mostrar la lista de contactos
@app.route('/')
def index():
    contactos = db_contactos.find()
    return render_template('index.html', contactos=contactos)

# Ruta para agregar un contacto
@app.route('/agregar_contacto', methods=['POST'])
def agregar_contacto():
    # Agregar contacto por json
    '''
    id = db_contactos.insert({
        'nombre':request.json['nombre'],
        'telefono':request.json['telefono'],
        'email':request.json['email']
    })
    '''

    # Agregar contacto desde formulario de frontend
    nuevo_contacto = {
        "nombre": request.form['nombre'],
        "telefono": request.form['telefono'],
        "email": request.form['email']
    }
    db_contactos.insert_one(nuevo_contacto)
    return redirect(url_for('index'))

# Ruta para consultar un contacto
'''
@app.route('/api/contactos/<string:id>', methods=['GET'])
def get_contacto(id):
    print(id)
    user = db_contactos.find_one({'_id': ObjectId(id)})

    print(user)
    return 'Recibido'
'''


# Ruta para editar un contacto
@app.route('/editar_contacto/<string:id>', methods=['GET', 'POST'])
def editar_contacto(id):
    contacto = db_contactos.find_one({'_id': ObjectId(id)})
    if request.method == 'POST':
        updated_contacto = {
            "nombre": request.form['nombre'],
            "telefono": request.form['telefono'],
            "email": request.form['email']
        }
        db_contactos.update_one({"_id": ObjectId(id)}, {"$set": updated_contacto})
        return redirect(url_for('index'))
    else:
        return render_template('edit.html', contacto=contacto)

# Ruta para eliminar un contacto
@app.route('/eliminar_contacto/<string:id>', methods=['POST'])
def eliminar_contacto(id):
    db_contactos.delete_one({"_id": ObjectId(id)})
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)