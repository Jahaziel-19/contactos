import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/contactos_db')
    SECRET_KEY = os.getenv('SECRET_KEY')