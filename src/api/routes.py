# routes.py

from flask import request, jsonify, Blueprint
from api.models import db, Cat, User
from api.utils import APIException
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token ,jwt_required, get_jwt_identity
import secrets
import hashlib

api = Blueprint('api', __name__)

@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend."
    }
    return jsonify(response_body), 200

# DELETE a cat by ID
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

# POST a new cat
@api.route('/add-cat', methods=['POST'])
@jwt_required()  # Requires a valid JWT token for access
def add_cat():
    data = request.get_json()
    name = data.get("name")
    breed = data.get("breed")
    age = data.get("age")
    price = data.get("price")

    # Check for required fields
    if not all([name, breed, age, price]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Optionally, link the cat to the authenticated user
    current_user_id = get_jwt_identity()  # Get user ID from the token
    new_cat = Cat(name=name, breed=breed, age=age, price=price, user_id=current_user_id)

    try:
        db.session.add(new_cat)
        db.session.commit()
        return jsonify({"message": "Cat added", "cat": new_cat.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# GET all cats
@api.route('/cats', methods=['GET'])
def get_cats():
    cats = Cat.query.all()
    cats_serialized = [cat.serialize() for cat in cats]
    return jsonify({"cats": cats_serialized}), 200

# Helper functions for password hashing with salt
def generate_salt():
    return secrets.token_hex(16)

def hash_password(password, salt):
    salted = password + salt
    return hashlib.sha256(salted.encode()).hexdigest()

# User registration
@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    salt = generate_salt()
    hashed_password = hash_password(password, salt)

    # Check if the user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    # Create a new user
    new_user = User(email=email, password=hashed_password, is_active=True, salt=salt)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"success": True, "message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# User login
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Verify user
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    
    hashed_attempt = hash_password(password, user.salt)
    if hashed_attempt != user.password:
        return jsonify({"error": "Invalid password"}), 401

    # Generate JWT access token
    access_token = create_access_token(identity=user.id)
    return jsonify(user=user.serialize(), token=access_token), 200
