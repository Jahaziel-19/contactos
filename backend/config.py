import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI') #jahazielvazquez19 R5gZt2530hJQFjXh
    SECRET_KEY = os.getenv('SECRET_KEY')