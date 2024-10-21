"""
This module takes care of starting the API Server, Loading the DB, and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Cat
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the Google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

@api.route('/add-cat', methods=['POST'])  # Removed `/api` prefix
def add_cat():
    data = request.get_json() 
    name = data.get("name")
    breed = data.get("breed")
    age = data.get("age")
    price = data.get("price")

    if not all([name, breed, age, price]):
        return jsonify({'error': 'Missing required fields'}), 400    

    new_cat = Cat(name=name, breed=breed, age=age, price=price)

    try:
        db.session.add(new_cat)
        db.session.commit()
        return jsonify({"message": "Cat added", "cat": new_cat.serialize()}), 201
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500  # Return the error message

