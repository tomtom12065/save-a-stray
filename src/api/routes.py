# routes.py

from flask import request, jsonify, Blueprint
from api.models import db, Cat,User
from api.utils import APIException


api = Blueprint('api', __name__)

@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend."
    }
    return jsonify(response_body), 200
@api.route('/delete-cat/<int:cat_id>', methods=['DELETE'])
def delete_cat(cat_id):
    
    cat = Cat.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404

    try:
        db.session.delete(cat)
        db.session.commit()
        return jsonify({"message": "Cat deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@api.route('/add-cat', methods=['POST'])

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
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/cats', methods=['GET'])
def get_cats():
    cats = Cat.query.all()
    cats_serialized = [cat.serialize() for cat in cats]
    return jsonify({"cats": cats_serialized}), 200
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": new_user.serialize()}), 201
