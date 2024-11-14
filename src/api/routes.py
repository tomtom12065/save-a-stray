# routes.py
import os
from flask import request, jsonify, Blueprint 
from api.models import db, Cat, User
from api.send_email import send_email
from api.utils import APIException
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,create_refresh_token
import secrets
import hashlib
import logging

import cloudinary.uploader
import cloudinary

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

from datetime import timedelta

api = Blueprint('api', __name__)

# CORS-friendly hello route
@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend."}), 200


# GET all cats
@api.route('/cats', methods=['GET'])
def get_cats():
    try:
        # Fetch all cats from the database
        cats = Cat.query.all()
        if not cats:
            return jsonify({"message": "No cats found", "cats": []}), 200

        # Serialize the cats
        cats_serialized = [cat.serialize() for cat in cats]
        return jsonify({"cats": cats_serialized}), 200
    except Exception as e:
        print("Error in get_cats route:", str(e))
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@api.route('/user-cats', methods=['GET'])
@jwt_required()
def get_self_cats():
    """Retrieve all cats for the authenticated user."""
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(email=current_user).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        cats = user.cats
        return jsonify([cat.serialize() for cat in cats]), 200
        
    except Exception as e:
        print(f"Error in get_self_cats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

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













###########################################################################################33
# def send_email(email, subject, token):
#     try:
#         # Define the reset link using the frontend URL
#         reset_link = f"{os.environ.get('FRONTEND_URL')}/request_reset?token={token}"
#         response = requests.post(
#             os.environ.get('MAILGUN_API_URL'),
#             auth=("api", os.environ.get('MAILGUN_API_KEY')),
#             data={
#                 "from": f"Support <support@{os.environ.get('MAILGUN_DOMAIN')}>",
#                 "to": [email],
#                 "subject": subject,
#                 "text": f"Click here to reset your password: {reset_link}",
#                 "html": f"<html><body><a href='{reset_link}'>Reset Password Link</a></body></html>"
#             }
#         )
# new send email without third party api
# def send_email(recipient, body, subject):
#     try:
#         with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT) as server:
#             server.login(MAIL_USERNAME, MAIL_PASSWORD)
#             smg = EmailMessage()
#             smg["Subject"] = subject
#             smg["From"] = MAIL_USERNAME
#             smg["To"] = recipient
#             smg.set_content(body)
#             server.send_message(smg)
#     except smtplib.SMTPException as e: 
#         #log the exception e
#         raise Exception(f"failed to send email: {str(e)}")

#         # Check if the email was sent successfully
#         if response.status_code != 200:
#             print(f"Email sending failed: {response.text}")
#             return False
#         return True
#     except Exception as error:
#         print(f"Error sending email: {error}")
#         return False



# Route to request a password reset
# @api.route('/request_reset', methods=['POST'])
# def request_reset():
#     email = request.json.get('email')
#     user = User.query.filter_by(email=email).first()

#     if user:
#         # Create a token with a 1-hour expiration time
#         token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
#         # email_sent = send_email(user.email, 'Password Reset Request', token)
#         email_value = f"click here to reset your password.\n{os.getenv('FRONTEND_URL')}/reset-Password?token={token}"
#         email_sent= send_email(email, email_value, "Password Recovery")
#         if email_sent:
#             return jsonify({'message': 'If your email is in our system, you will receive a password reset link.'}), 200
                    
#         else:
#             return jsonify({"error": "Failed to send email. Please try again later."}), 500

#     return jsonify({"message": "If your email is in our system, you will receive a password reset link."}), 200


@api.route('/request_reset', methods=['POST'])
def request_reset():
    try:
        print("Received request for password reset.")
        email = request.json.get('email')
        print(f"Email received: {email}")

        if not email:
            print("Email is missing in the request.")
            return jsonify({"error": "Email is required"}), 400
            
        # Attempt to find the user by email
        user = User.query.filter_by(email=email).first()
        print(f"User found: {user is not None}")

        if user:
            try:
                # Create a token with a 1-hour expiration time
                print("Creating token for password reset.")
                token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
                print(f"Token created: {token}")

                frontend_url = os.getenv('FRONTEND_URL')
                print(f"Frontend URL from environment: {frontend_url}")

                if not frontend_url:
                    print("FRONTEND_URL environment variable is missing.")
                    return jsonify({"error": "Server configuration error."}), 500
                
                reset_link = f"{frontend_url}/reset-Password?token={token}"
                print(f"Reset link created: {reset_link}")

                email_body = f"Click here to reset your password:\n{reset_link}"
                print(f"Email body created.")

                # Send the email and log the email details
                print(f"Attempting to send email to: {email}")
                email_sent = send_email(email, email_body, "Password Recovery")
                print(f"Email sent status: {email_sent}")

                if email_sent:
                    print("Email was sent successfully.")
                    return jsonify({
                        'message': 'If your email is in our system, you will receive a password reset link.'
                    }), 200
                else:
                    print("Failed to send email. Returning 500 error.")
                    return jsonify({
                        "error": "Failed to send email. Please try again later."
                    }), 500
            except Exception as e:
                print(f"Exception in password reset process: {str(e)}")
                logging.error(f"Error in password reset process: {str(e)}")
                return jsonify({
                    "error": "An error occurred during the password reset process."
                }), 500
                
        # Return the same message whether the user exists or not for security
        print("User not found or returning default message for security.")
        print("Returning success response to frontend.")
        return jsonify({
            "message": "If your email is in our system, you will receive a password reset link."
        }), 200
        
    except Exception as e:
        print(f"Unexpected exception in request_reset: {str(e)}")
        logging.error(f"Unexpected error in request_reset: {str(e)}")
        return jsonify({
            "error": "An unexpected error occurred. Please try again later."
        }), 500


# # Route to reset the password
@api.route('/reset-password', methods=['PUT'])
@jwt_required()
def reset_password():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first_or_404()
    new_password = request.json.get('new_password')

    if not new_password:
        return jsonify({"error": "New password is required."}), 400

    # Hash the new password using the existing hash_password function
    user.password = hash_password(new_password, user.salt)

    try:
        db.session.commit()
        return jsonify({'message': 'Password has been reset successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@api.route('/upload_image', methods=['POST'])
def upload_image():
    file_to_upload = request.files['file']

    try:
        # Perform a signed upload
        upload_result = cloudinary.uploader.upload(file_to_upload)
        return jsonify({
            "success": True,
            "url": upload_result['secure_url']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
