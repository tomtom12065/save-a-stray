# routes.py

from flask import request, jsonify, Blueprint 
from api.models import db, Cat, User
from api.utils import APIException
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,create_refresh_token
import secrets
import hashlib

api = Blueprint('api', __name__)

# CORS-friendly hello route
@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend."}), 200

# DELETE a cat by ID
# potentially check if user has necessary token 
@api.route('/delete-cat/<int:cat_id>', methods=['DELETE'])
@jwt_required()
def delete_cat(cat_id):
    # Get the current user ID from the JWT token
    current_user_id = get_jwt_identity()

    # Fetch the cat from the database
    cat = Cat.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404

    # Check if the current user is the owner of the cat
    if cat.user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You do not own this cat"}), 403

    # Delete the cat if the user is the owner
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
    name, breed, age, price = data.get("name"), data.get("breed"), data.get("age"), data.get("price")

    # Check for required fields
    if not all([name, breed, age, price]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Link the cat to the authenticated user
    current_user_id = get_jwt_identity()
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
    return hashlib.sha256((password + salt).encode()).hexdigest()

# User registration

@api.route('/register', methods=['POST'])
def register_user():
    # Log that the endpoint was hit
    print("Backend - /register endpoint hit")

    # Parse incoming JSON data
    data = request.get_json()
    print("Backend - Received Data:", data)
    print("Type of received data:", type(data))  # Should log "<class 'dict'>"

    email, password, username = data.get("email"), data.get("password"), data.get("username")

    # Check required fields
    if not all([email, password, username]):
        print("Backend - Missing required fields")
        return jsonify({"error": "Email, password, and username are required"}), 400

    # Check if the user already exists
    if User.query.filter_by(email=email).first():
        print("Backend - User already exists with email:", email)
        return jsonify({"error": "User already exists"}), 409

    # Generate salt and hash the password
    salt = generate_salt()
    hashed_password = hash_password(password, salt)
    new_user = User(username=username, email=email, password=hashed_password, is_active=True, salt=salt)

    try:
        # Save the new user to the database
        db.session.add(new_user)
        db.session.commit()
        print("Backend - New user created:", new_user)

        # Serialize user data for response
        user_data = new_user.serialize()
        print("Backend - Serialized User Data to send:", user_data)

        # Send response with serialized user data
        return jsonify({"success": True, "message": "User registered successfully", "user": user_data}), 201
    except Exception as e:
        db.session.rollback()
        print("Backend - Error during registration:", str(e))
        return jsonify({"error": str(e)}), 500



# User login
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Verify user existence
    user = User.query.filter_by(email=email).first()
    if not user:
        print("User not found for email:", email)
        return jsonify({"error": "Invalid email or password"}), 401

    # Verify the password using your hashing function
    hashed_attempt = hash_password(password, user.salt)
    if hashed_attempt != user.password:
        print("Password mismatch for user:", email)
        return jsonify({"error": "Invalid password"}), 401

    # Create access and refresh tokens
    access_token = create_access_token(identity=user.id, additional_claims={"role": user.username})
    refresh_token = create_refresh_token(identity=user.id)

    # Include the serialized user data in the response
    return jsonify({
        "user": user.serialize(),
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200

