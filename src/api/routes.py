# routes.py
import os
from flask import request, jsonify, Blueprint 
from api.models import db, Cat, User, ChatMessage,Application
from api.send_email import send_email
from api.utils import APIException
from werkzeug.security import generate_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    create_refresh_token,
)
import secrets
import hashlib
import logging
import cloudinary.uploader
import cloudinary
from datetime import timedelta
import stripe
from flask_cors import CORS






#completely overall the routes to deal with the new models
#try it all in postman
#make sure to get jwt token(taken care o by layout)gives the sender id
#need to get the recipient id from the creator 
#use cat template to put message button
#use that cat response to get userid and thats how i get recipient id

#
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

api = Blueprint("api", __name__)
CORS(api)







stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
# ---------------------------------------------
# GET Routes
# ---------------------------------------------

@api.route("/hello", methods=["GET"])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend."}), 200

@api.route('/user', methods=['GET'])
@jwt_required()
def get_user_data():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if user:
            # Serialize the user data and return it
            return jsonify(user.serialize()), 200
        else:
            # If the user is not found, return a 404 error
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        # Handle any server errors
        return jsonify({"error": "An error occurred while retrieving user data", "details": str(e)}), 500
    
@api.route("/cats", methods=["GET"])
def get_cats():
    try:
        cats = Cat.query.all()
        if not cats:
            return jsonify({"message": "No cats found", "cats": []}), 200
        cats_serialized = [cat.serialize() for cat in cats]
        return jsonify({"cats": cats_serialized}), 200
    except Exception as e:
        print("Error in get_cats route:", str(e))
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@api.route('/get-applications',methods=["GET"])
@jwt_required()
def get_applications():
    current_user_id = get_jwt_identity()
    try:
        user_cats = Cat.query.filter_by(user_id=current_user_id).all()
        cats_ids = [cat.id for cat in user_cats]

        applications= Application.query.filter(Application.cat_id.in_(cats_ids)).all()

        results={}
        for cat in user_cats:
            cat_applications= [app.serialize() for app in applications if app.cat_id == cat.id]
            if cat_applications:
                results[cat.id]= {
                    "cat": cat.serialize(),
                    "applications": cat_applications

                }

        return jsonify(results), 200
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500



@api.route('/applications/sent', methods=['GET'])
@jwt_required()
def get_sent_applications():
    user_id = get_jwt_identity()  # Get the authenticated user's ID
    sent_applications = Application.query.filter_by(user_id=user_id).all()

    if not sent_applications:
        return jsonify({'message': 'No sent applications found'}), 404

    serialized_applications = [application.serialize() for application in sent_applications]
    return jsonify(serialized_applications), 200












@api.route("/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(application_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    new_status = data.get("status")

    # Validate the status input
    if new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    # Fetch the application and related cat
    application = Application.query.get(application_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    cat = Cat.query.get(application.cat_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404

    # Verify the logged-in user owns the cat
    if cat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    # Prevent multiple approvals for the same cat
    if new_status == "approved":
        existing_approved = Application.query.filter_by(cat_id=application.cat_id, status="approved").first()
        if existing_approved and existing_approved.id != application.id:
            return jsonify({"error": "This cat already has an approved application"}), 400

        # Generate payment link
        payment_link = generate_payment_link(cat.price, application.user_id, application.id)

        # Send notification email
        email_sent = send_payment_email(application.contact_info, payment_link, cat.name)
        if not email_sent:
            return jsonify({"error": "Failed to send payment notification email"}), 500

    # Update the application status
    application.status = new_status
    db.session.commit()

    return jsonify({
        "message": f"Application status updated to {new_status}",
        "application": application.serialize(),
    }), 200


def generate_payment_link(amount, user_id, application_id):
    try:
        # Set the Stripe secret key from the environment variable
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

        # Create a PaymentIntent with the provided amount and metadata
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={"application_id": application_id, "user_id": user_id},
        )

        # Use FRONTEND_URL to construct the payment link
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return f"{frontend_url}/payment?clientSecret={intent['client_secret']}&appId={application_id}"
    except Exception as e:
        print(f"Error generating payment link: {str(e)}")
        return None
    


def send_payment_email(recipient, payment_link, cat_name):
    subject = "Your Cat Adoption Application Has Been Approved!"
    body = f"""
    Congratulations! Your application to adopt {cat_name} has been approved.

    Please complete the adoption process by making a payment at the following link:
    {payment_link}

    Thank you for helping us save a stray!
    """
    return send_email(recipient, body, subject)

@api.route('/payout', methods=['POST'])
@jwt_required()
def create_payout():
    try:
        data = request.get_json()
        amount = data['amount']  # Amount in cents
        owner_stripe_account = data['stripe_account_id']  # Cat owner's Stripe account ID

        # Create a transfer to the owner's connected account
        transfer = stripe.Transfer.create(
            amount=amount,
            currency="usd",
            destination=owner_stripe_account,
        )

        return jsonify({"success": True, "transfer_id": transfer.id}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@api.route('/send-confirmation-email', methods=['POST'])
@jwt_required()
def send_confirmation_email():
    try:
        # Get the logged-in user
        user_id = get_jwt_identity()

        # Parse the JSON payload
        data = request.get_json()
        application_id = data.get('application_id')

        # Fetch the application and cat details
        application = Application.query.get(application_id)
        if not application:
            return jsonify({"error": "Application not found"}), 404

        cat = Cat.query.get(application.cat_id)
        if not cat:
            return jsonify({"error": "Cat not found"}), 404

        # Ensure the user is the one who paid for the adoption
        if application.user_id != int(user_id):
            return jsonify({"error": "Unauthorized"}), 403

        # Prepare email content
        subject = f"Adoption Confirmation for {cat.name}"
        body = f"""
        Thank you for completing the payment for {cat.name}!

        We are thrilled to confirm your adoption request. Our team will contact you shortly with the next steps.
        
        Cat Details:
        - Name: {cat.name}
        - Breed: {cat.breed}
        - Age: {cat.age} years
        
        Thank you for helping us save a stray!

        Best regards,
        Save a Stray Team
        """

        # Send the confirmation email
        email_sent = send_email(application.contact_info, body, subject)
        if not email_sent:
            return jsonify({"error": "Failed to send confirmation email"}), 500

        return jsonify({"message": "Confirmation email sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500









@api.route('/applications', methods=['POST'])
@jwt_required()  # Protect this route with JWT authentication
def create_application():
    try:
        # Get the current user's identity
        user_id = get_jwt_identity()

        # Parse the incoming JSON data
        data = request.get_json()

        # Validate the incoming data
        required_fields = ['cat_id', 'applicant_name', 'contact_info', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Create a new application instance
        new_application = Application(
            cat_id=data['cat_id'],
            applicant_name=data['applicant_name'],
            contact_info=data['contact_info'],
            reason=data['reason'],
            status='pending',  # Default status for new applications
            user_id=user_id  # Associate the application with the authenticated user
        )

        # Add to the database
        db.session.add(new_application)
        db.session.commit()

        return jsonify({"message": "Application submitted successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500











@api.route("/user-cats", methods=["GET"])
@jwt_required()
def get_self_cats():
    try:
       
        current_user_id = get_jwt_identity()
        # user = User.query.filter_by(id=current_user).first()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        cats = user.cats
        return jsonify([cat.serialize() for cat in cats]), 200
    except Exception as e:
        print(f"Error in get_self_cats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


# @api.route("/cat/<int:cat_id>", methods=["GET"])
# def get_single_cat(cat_id):
#     cat = Cat.query.get(cat_id)
#     if not cat:
#         return jsonify({"error": "Cat not found"}), 404
#     return jsonify({"cat": cat.serialize()}), 200


# @api.route("/api/user", methods=["GET"])
# @jwt_required()
# def get_user():
#     current_user_id = get_jwt_identity()
#     user = User.query.get(current_user_id)
#     if user:
#         return jsonify(user.serialize())
#     else:
#         return jsonify({"error": "User not found"}), 404


# ---------------------------------------------
# POST Routes
# ---------------------------------------------

@api.route('/upload_profile_picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        # Get the current user ID from the JWT token
        current_user_id = get_jwt_identity()

        # Fetch the user from the database
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the file from the request
        file_to_upload = request.files.get('file')
        if not file_to_upload:
            return jsonify({"error": "No file uploaded"}), 400

        # Upload the file to Cloudinary
        upload_result = cloudinary.uploader.upload(file_to_upload)

        # Update the user's image_url in the database
        user.image_url = upload_result['secure_url']
        db.session.commit()

        return jsonify({"message": "Profile picture updated successfully", "url": user.image_url}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500





@api.route("/upload_image", methods=["POST"])
def upload_image():
    try:
        # Loop through each uploaded file
        files_to_upload = request.files.getlist("image")
        upload_urls = []

        for file_to_upload in files_to_upload:
            upload_result = cloudinary.uploader.upload(file_to_upload)
            upload_urls.append(upload_result["secure_url"])

        return jsonify({"success": True, "urls": upload_urls}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500





# @api.route('/user/<int:user_id>', methods=['GET'])
# @jwt_required()
# def get_user_profile(user_id):
#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({"error": "User not found"}), 404
#     return jsonify(user.serialize())


# routes.py
# @api.route('/user', methods=['GET'])
# @jwt_required()
# def get_user():
#     try:
#         print("Route '/api/user' has been called.")
#         current_user_id = get_jwt_identity()
#         print(f"Current user ID from JWT: {current_user_id}")

#         user = User.query.get(current_user_id)
#         if user:
#             print(f"User found: {user}")
#             user_data = user.serialize()
#             print(f"Serialized user data: {user_data}")
#             return jsonify(user_data), 200
#         else:
#             print("User not found.")
#             return jsonify({"error": "User not found"}), 404
#     except Exception as e:
#         print(f"Error in get_user: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500



# Helper functions for password hashing with salt
def generate_salt():
    return secrets.token_hex(16)

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode()).hexdigest()

# User registration

@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    profilepic = data.get("profilepic")  # optional

    # Validate required fields
    if not all([email, password, username]):
        return jsonify({"error": "Email, password, and username are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    # Hash the password with salt
    salt = secrets.token_hex(16)
    hashed_password = hashlib.sha256((password + salt).encode()).hexdigest()

    # Create user
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        is_active=True,
        salt=salt,
        profilepic=profilepic
    )
    try:
        db.session.add(new_user)
        db.session.commit()

        # >>> CREATE TOKENS RIGHT AWAY <<<
        access_token = create_access_token(
            identity=str(new_user.id),
            additional_claims={"role": new_user.username}
        )
        refresh_token = create_refresh_token(identity=new_user.id)

        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": new_user.serialize(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500







@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username, password = data.get("username"), data.get("password")
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    hashed_attempt = hashlib.sha256((password + user.salt).encode()).hexdigest()
    if hashed_attempt != user.password:
        return jsonify({"error": "Invalid password"}), 401
    access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.username})

    refresh_token = create_refresh_token(identity=user.id)

    # Include the serialized user data in the response
    return jsonify({
        "user": user.serialize(),
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200



@api.route("/get_messages", methods=["GET"])
@jwt_required()
def get_messages():
    user_id = get_jwt_identity()  # Get the logged-in user's ID

    try:
        # Fetch all messages where the user is either the sender or recipient
        messages = ChatMessage.query.filter(
            (ChatMessage.sender_id == user_id) | (ChatMessage.recipient_id == user_id)
        ).order_by(ChatMessage.timestamp.desc()).all()

        # Serialize and return the messages
        return jsonify([message.serialize() for message in messages]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# @api.route("/get_all_messages", methods=["GET"])
# @jwt_required()
# def get_all_messages():
#     recipient_id = get_jwt_identity()  # Get the logged-in user's ID
#     messages = ChatMessage.query.filter_by(recipient_id=recipient_id).order_by(ChatMessage.timestamp.desc()).all()
#     return jsonify([message.serialize() for message in messages]), 200


@api.route("/get_single_message", methods=["GET"])
@jwt_required()
def get_single_message():
    recipient_id = request.args.get("recipient_id")
    sender_id = get_jwt_identity()  # Get the logged-in user's ID

    if not recipient_id:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        messages = ChatMessage.query.filter(
            ((ChatMessage.sender_id == sender_id) & (ChatMessage.recipient_id == recipient_id)) |
            ((ChatMessage.sender_id == recipient_id) & (ChatMessage.recipient_id == sender_id))
        ).order_by(ChatMessage.timestamp.asc()).all()

        return jsonify([message.serialize() for message in messages]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500





















@api.route('/update_user', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    data = request.json

    # Validate inputs
    username = data.get('username')
    email = data.get('email')

    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400

    # Find the user and update the information
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.username = username
    user.email = email
    db.session.commit()

    return jsonify({"message": "User updated successfully", "user": user.serialize()}), 200

@api.route('/create_conversation', methods=['POST'])
@jwt_required()
def create_conversation():
    data = request.get_json()
    user_id = get_jwt_identity()  # Logged-in user's ID
    recipient_id = data.get('recipient_id')

    if not recipient_id:
        return jsonify({"error": "Recipient ID is required"}), 400

    # Check if the conversation already exists
    existing_conversation = ChatMessage.query.filter_by(
        sender_id=user_id,
        recipient_id=recipient_id
    ).first()

    if not existing_conversation:
        # Create a placeholder message to establish the conversation
        new_message = ChatMessage(
            sender_id=user_id,
            recipient_id=recipient_id,
            text="",
            read=False
        )
        db.session.add(new_message)
        db.session.commit()

    return jsonify({"message": "Conversation created successfully"}), 201






@api.route("/mark_as_read", methods=["POST"])
def mark_as_read():
    data = request.get_json()
    recipient_id = data.get("recipient_id")
    sender_id = data.get("sender_id")

    if not recipient_id or not sender_id:
        return jsonify({"error": "Missing required fields"}), 400

    # Update read status for all messages in the conversation
    updated_count = ChatMessage.query.filter_by(
        sender_id=sender_id,
        recipient_id=recipient_id,
        read=False
    ).update({"read": True})
    db.session.commit()

    return jsonify({
        "message": "Messages marked as read",
        "updated_count": updated_count
    }), 200

@api.route("/send_message", methods=["POST"])
@jwt_required()  # Ensure the user is authenticated
def send_message():
    data = request.get_json()
    print("Received data:", data)  # Log received data for debugging

    # Get sender_id from the JWT token
    sender_id = get_jwt_identity()
    recipient_id = data.get("recipient_id")
    text = data.get("text")

    # Validate inputs
    if not recipient_id or not text:
        return jsonify({"error": "Missing required fields: recipient_id and text are required"}), 400

    try:
        # Create and save the new message
        new_message = ChatMessage(sender_id=sender_id, recipient_id=recipient_id, text=text, read=False)
        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            "message": "Message sent successfully",
            "data": new_message.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()  # Rollback in case of an error
        return jsonify({"error": str(e)}), 500


    



# GET a single cat by ID
@api.route('/cat/<int:cat_id>', methods=['GET'])
def get_single_cat(cat_id):
    cat = Cat.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404

    return jsonify({"cat": cat.serialize()}), 200



@api.route('/request_reset', methods=['POST'])
def request_reset():
    try:
        email = request.json.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400
        user = User.query.filter_by(email=email).first()
        if user:
            token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
            reset_link = f"{os.getenv('FRONTEND_URL')}/reset-Password?token={token}"
            email_sent = send_email(email, f"Click here to reset your password:\n{reset_link}", "Password Recovery")
            if email_sent:
                return jsonify({"message": "If your email is in our system, you will receive a password reset link."}), 200
            return jsonify({"error": "Failed to send email"}), 500
        return jsonify({"message": "If your email is in our system, you will receive a password reset link."}), 200
    except Exception as e:
        logging.error(f"Error in request_reset: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500



# ---------------------------------------------
# PUT Routes
# ---------------------------------------------

@api.route("/reset-password", methods=["PUT"])
@jwt_required()
def reset_password():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first_or_404()
    new_password = request.json.get("new_password")
    if not new_password:
        return jsonify({"error": "New password is required"}), 400
    user.password = hashlib.sha256((new_password + user.salt).encode()).hexdigest()
    try:
        db.session.commit()
        return jsonify({"message": "Password has been reset successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------
# DELETE Routes
# ---------------------------------------------

@api.route("/delete-cat/<int:cat_id>", methods=["DELETE"])
@jwt_required()
def delete_cat(cat_id):
    current_user_id = int(get_jwt_identity())
    cat = Cat.query.get(cat_id)

    print(cat.user_id)
    print(current_user_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404
    
    if cat.user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You do not own this cat"}), 403
    try:
        db.session.delete(cat)
        db.session.commit()
        return jsonify({"message": "Cat deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@api.route("/add-cat", methods=["POST"])
@jwt_required()
def add_cat():
    data = request.get_json()
    user_id = get_jwt_identity()

    # Get fields
    name = data.get("name")
    breed = data.get("breed")
    age = data.get("age")
    price = data.get("price", 0.0)
    image_urls = data.get("image_urls")  # This can be a list or a single string
    description = data.get("description")
    # Validate
    if not (name and breed and age and image_urls and description):
        return jsonify({"error": "Missing required fields"}), 400

    # If image_urls is an array, convert it to a string
    if isinstance(image_urls, list):
        # Option A: Comma-separated
        # image_urls_str = ",".join(image_urls)

        # Option B: JSON-encoded
        import json
        image_urls_str = json.dumps(image_urls)
    else:
        # It's already a string
        image_urls_str = image_urls

    try:
        new_cat = Cat(
            name=name,
            breed=breed,
            age=age,
            price=price,
            image_urls=image_urls_str,
            user_id=user_id,
            description=description
            
        )
        db.session.add(new_cat)
        db.session.commit()

        return jsonify({
            "message": "Cat added successfully",
            "cat": new_cat.serialize()
        }), 201

    except Exception as e:
        return jsonify({
            "error": "Failed to add cat",
            "details": str(e)
        }), 500







@api.route('/create-payment-intent', methods=['OPTIONS', 'POST'])
def create_payment_intent():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        intent = stripe.PaymentIntent.create(
            amount=data['amount'],  # amount in cents
            currency='usd',
            metadata={'integration_check': 'accept_a_payment'},
        )
        return jsonify({
            'clientSecret': intent['client_secret']
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

