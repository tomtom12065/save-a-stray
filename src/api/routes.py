import os
import logging
import secrets
import hashlib
import stripe
import cloudinary.uploader
import cloudinary
from datetime import timedelta
from flask import request, jsonify, Blueprint
from flask_cors import CORS
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    create_refresh_token,
)
from api.models import db, Cat, User, ChatMessage, Application
from api.send_email import send_email
from api.utils import APIException


# -----------------------
# Cloudinary & Stripe Config
# -----------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

api = Blueprint("api", __name__)
CORS(api)

# -----------------------
# Helper Functions
# -----------------------
def generate_salt():
    return secrets.token_hex(16)

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode()).hexdigest()


############################
# GET Routes
############################

@api.route("/hello", methods=["GET"])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend."}), 200


@api.route('/user', methods=['GET'])
@jwt_required()
def get_user_data():
    """
    GET /user
    Retrieve the current user's data based on the JWT identity.
    """
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if user:
            return jsonify(user.serialize()), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": "An error occurred while retrieving user data", "details": str(e)}), 500


@api.route("/cats", methods=["GET"])
def get_cats():
    """
    GET /cats
    Retrieve all cats.
    """
    try:
        cats = Cat.query.all()
        if not cats:
            return jsonify({"message": "No cats found", "cats": []}), 200
        cats_serialized = [cat.serialize() for cat in cats]
        return jsonify({"cats": cats_serialized}), 200
    except Exception as e:
        print("Error in get_cats route:", str(e))
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@api.route('/get-applications', methods=["GET"])
@jwt_required()
def get_applications():
    """
    GET /get-applications
    Retrieve applications for all cats owned by the current user.
    """
    current_user_id = get_jwt_identity()
    try:
        user_cats = Cat.query.filter_by(user_id=current_user_id).all()
        cats_ids = [cat.id for cat in user_cats]

        applications = Application.query.filter(Application.cat_id.in_(cats_ids)).all()

        results = {}
        for cat in user_cats:
            cat_applications = [app.serialize() for app in applications if app.cat_id == cat.id]
            if cat_applications:
                results[cat.id] = {
                    "cat": cat.serialize(),
                    "applications": cat_applications
                }

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @api.route('/applications/sent', methods=['GET'])
# @jwt_required()
# def get_sent_applications():
#     """
#     GET /applications/sent
#     Retrieve all applications the current user has sent to adopt a cat.
#     """
#     user_id = get_jwt_identity()
#     sent_applications = Application.query.filter_by(user_id=user_id).all()

#     if not sent_applications:
#         return jsonify({'message': 'No sent applications found'}), 404

#     serialized_applications = [application.serialize() for application in sent_applications]
#     return jsonify(serialized_applications), 200


@api.route('/applications/sent', methods=['GET'])
@jwt_required()
def get_sent_applications():
    """
    GET /applications/sent
    Retrieve all applications the current user has sent to adopt a cat.
    """
    try : 
        user_id = get_jwt_identity()
        applications = db.session.query(Application, Cat)\
            .join(Cat, Application.cat_id == Cat.id)\
            .filter(Application.user_id == user_id)\
            .all()
        if not applications:
            return jsonify([]), 200
        
        serialized_applications = []
        for app, cat in applications:
            app_data = app.serialize()
            app_data["cat_name"] = cat.name
            app_data["cat_breed"] = cat.breed
            app_data["cat_age"] = cat.age
            serialized_applications.append(app_data)
        return jsonify(serialized_applications), 200
    
    except Exception as e: 
        return jsonify({
            "error": str(e)
        }), 500
    
    




@api.route("/get_messages", methods=["GET"])
@jwt_required()
def get_messages():
    """
    GET /get_messages
    Retrieve all chat messages where the user is either the sender or the recipient.
    """
    user_id = get_jwt_identity()
    try:
        messages = ChatMessage.query.filter(
            (ChatMessage.sender_id == user_id) | (ChatMessage.recipient_id == user_id)
        ).order_by(ChatMessage.timestamp.desc()).all()

        return jsonify([message.serialize() for message in messages]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/get_single_message", methods=["GET"])
@jwt_required()
def get_single_message():
    """
    GET /get_single_message?recipient_id=<ID>
    Retrieve conversation messages between current user (sender) and a recipient.
    """
    recipient_id = request.args.get("recipient_id")
    sender_id = get_jwt_identity()

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


@api.route("/user-cats", methods=["GET"])
@jwt_required()
def get_self_cats():
    """
    GET /user-cats
    Retrieve all cats owned by the current user.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        cats = user.cats
        return jsonify([cat.serialize() for cat in cats]), 200
    except Exception as e:
        print(f"Error in get_self_cats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@api.route('/cat/<int:cat_id>', methods=['GET'])
def get_single_cat(cat_id):
    """
    GET /cat/<cat_id>
    Retrieve a single cat by its ID.
    """
    cat = Cat.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404
    return jsonify({"cat": cat.serialize()}), 200


############################
# POST Routes
############################

@api.route('/register', methods=['POST'])
def register_user():
    """
    POST /register
    Register a new user and return tokens.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    username = data.get("username")
    profilepic = data.get("profilepic")  # optional

    if not all([email, password, username]):
        return jsonify({"error": "Email, password, and username are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    salt = generate_salt()
    hashed_password = hash_password(password, salt)

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
    """
    POST /login
    Login user with username/password, return tokens if valid.
    """
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

    return jsonify({
        "user": user.serialize(),
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200


@api.route('/payout', methods=['POST'])
@jwt_required()
def create_payout():
    """
    POST /payout
    Create a payout (transfer) to the cat owner's Stripe account.
    """
    try:
        data = request.get_json()
        amount = data['amount']  # Amount in cents
        owner_stripe_account = data['stripe_account_id']  # Cat owner's Stripe account ID

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
    """
    POST /send-confirmation-email
    Send a confirmation email after the user has paid for the cat adoption.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        application_id = data.get('application_id')

        application = Application.query.get(application_id)
        if not application:
            return jsonify({"error": "Application not found"}), 404

        cat = Cat.query.get(application.cat_id)
        if not cat:
            return jsonify({"error": "Cat not found"}), 404

        if application.user_id != int(user_id):
            return jsonify({"error": "Unauthorized"}), 403

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

        email_sent = send_email(application.contact_info, body, subject)
        if not email_sent:
            return jsonify({"error": "Failed to send confirmation email"}), 500

        return jsonify({"message": "Confirmation email sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/applications', methods=['POST'])
@jwt_required()
def create_application():
    """
    POST /applications
    Create a new adoption application for a cat.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        required_fields = ['cat_id', 'applicant_name', 'contact_info', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        new_application = Application(
            cat_id=data['cat_id'],
            applicant_name=data['applicant_name'],
            contact_info=data['contact_info'],
            reason=data['reason'],
            status='pending',
            user_id=user_id
        )
        db.session.add(new_application)
        db.session.commit()

        return jsonify({"message": "Application submitted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/upload_profile_picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    """
    POST /upload_profile_picture
    Upload a new profile picture to Cloudinary and update the user's image_url.
    """
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        file_to_upload = request.files.get('file')
        if not file_to_upload:
            return jsonify({"error": "No file uploaded"}), 400

        upload_result = cloudinary.uploader.upload(file_to_upload)
        user.image_url = upload_result['secure_url']
        db.session.commit()

        return jsonify({"message": "Profile picture updated successfully", "url": user.image_url}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route("/upload_image", methods=["POST"])
def upload_image():
    """
    POST /upload_image
    Upload one or more images to Cloudinary and return their URLs.
    """
    try:
        files_to_upload = request.files.getlist("image")
        upload_urls = []

        for file_to_upload in files_to_upload:
            upload_result = cloudinary.uploader.upload(file_to_upload)
            upload_urls.append(upload_result["secure_url"])

        return jsonify({"success": True, "urls": upload_urls}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/create_conversation', methods=['POST'])
@jwt_required()
def create_conversation():
    """
    POST /create_conversation
    Create a new conversation (placeholder message) between the current user and a recipient.
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    recipient_id = data.get('recipient_id')

    if not recipient_id:
        return jsonify({"error": "Recipient ID is required"}), 400

    existing_conversation = ChatMessage.query.filter_by(sender_id=user_id, recipient_id=recipient_id).first()
    if not existing_conversation:
        new_message = ChatMessage(sender_id=user_id, recipient_id=recipient_id, text="", read=False)
        db.session.add(new_message)
        db.session.commit()

    return jsonify({"message": "Conversation created successfully"}), 201


@api.route("/mark_as_read", methods=["POST"])
def mark_as_read():
    """
    POST /mark_as_read
    Mark all messages in a conversation (sender->recipient) as read.
    """
    data = request.get_json()
    recipient_id = data.get("recipient_id")
    sender_id = data.get("sender_id")

    if not recipient_id or not sender_id:
        return jsonify({"error": "Missing required fields"}), 400

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
@jwt_required()
def send_message():
    """
    POST /send_message
    Send a chat message to a specified recipient (requires JWT).
    """
    data = request.get_json()
    print("Received data:", data)

    sender_id = get_jwt_identity()
    recipient_id = data.get("recipient_id")
    text = data.get("text")

    if not recipient_id or not text:
        return jsonify({"error": "Missing required fields: recipient_id and text are required"}), 400

    try:
        new_message = ChatMessage(sender_id=sender_id, recipient_id=recipient_id, text=text, read=False)
        db.session.add(new_message)
        db.session.commit()

        return jsonify({
            "message": "Message sent successfully",
            "data": new_message.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/request_reset', methods=['POST'])
def request_reset():
    """
    POST /request_reset
    Send a password reset link to the provided email if it exists in our system.
    """
    try:
        email = request.json.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()
        if user:
            token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
            reset_link = f"{os.getenv('FRONTEND_URL')}/reset-Password?token={token}"
            email_sent = send_email(
                email,
                f"Click here to reset your password:\n{reset_link}",
                "Password Recovery"
            )
            if email_sent:
                return jsonify({
                    "message": "If your email is in our system, you will receive a password reset link."
                }), 200
            return jsonify({"error": "Failed to send email"}), 500

        return jsonify({
            "message": "If your email is in our system, you will receive a password reset link."
        }), 200
    except Exception as e:
        logging.error(f"Error in request_reset: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@api.route("/add-cat", methods=["POST"])
@jwt_required()
def add_cat():
    """
    POST /add-cat
    Create a new cat listing and associate it with the logged-in user.
    """
    data = request.get_json()
    user_id = get_jwt_identity()

    name = data.get("name")
    breed = data.get("breed")
    age = data.get("age")
    price = data.get("price", 0.0)
    image_urls = data.get("image_urls")
    description = data.get("description")

    if not (name and breed and age and image_urls and description):
        return jsonify({"error": "Missing required fields"}), 400

    # If image_urls is an array, convert it to a JSON string
    if isinstance(image_urls, list):
        import json
        image_urls_str = json.dumps(image_urls)
    else:
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
    """
    POST /create-payment-intent
    Create a Stripe PaymentIntent to allow the user to pay for the cat adoption.
    """
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        intent = stripe.PaymentIntent.create(
            amount=data['amount'],  # amount in cents
            currency='usd',
            metadata={'integration_check': 'accept_a_payment'},
        )
        return jsonify({'clientSecret': intent['client_secret']})
    except Exception as e:
        return jsonify(error=str(e)), 403


############################
# PUT Routes
############################
######################################the roblem is here
@api.route("/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(application_id):
    """
    PUT /applications/<application_id>/status
    Update the status of an adoption application to approved or rejected.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    application = Application.query.get(application_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    cat = Cat.query.get(application.cat_id)
    if not cat:
        return jsonify({"error": "Cat not found"}), 404

    if cat.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    if new_status == "approved":
        existing_approved = Application.query.filter_by(cat_id=application.cat_id, status="approved").first()
        if existing_approved and existing_approved.id != application.id:
            return jsonify({"error": "This cat already has an approved application"}), 400

        payment_link = generate_payment_link(cat.price, application.user_id, application.id)
        if not payment_link:
            return jsonify({"error": "Failed to create payment link"}), 500
        email_sent = send_payment_email(application.contact_info, payment_link, cat.name)
        if not email_sent:
            return jsonify({"error": "Failed to send payment notification email"}), 500

    application.status = new_status
    db.session.commit()

    return jsonify({
        "message": f"Application status updated to {new_status}",
        "application": application.serialize(),
    }), 200


def generate_payment_link(amount, user_id, application_id):
    """
    Helper function to generate a Stripe payment link for a cat adoption.
    """
    try:
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={"application_id": application_id, "user_id": user_id},
        )
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return f"{frontend_url}/payment?clientSecret={intent['client_secret']}&appId={application_id}"
    except Exception as e:
        print(f"Error generating payment link: {str(e)}")
        return None


def send_payment_email(recipient, payment_link, cat_name):
    """
    Helper function to send a payment notification email.
    """
    subject = "Your Cat Adoption Application Has Been Approved!"
    body = f"""
    Congratulations! Your application to adopt {cat_name} has been approved.

    Please complete the adoption process by making a payment at the following link:
    {payment_link}

    Thank you for helping us save a stray!
    """
    return send_email(recipient, body, subject)


@api.route('/update_user', methods=['PUT'])
@jwt_required()
def update_user():
    """
    PUT /update_user
    Update the current user's email or username.
    """
    user_id = get_jwt_identity()
    data = request.json
    username = data.get('username')
    email = data.get('email')

    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.username = username
    user.email = email
    db.session.commit()

    return jsonify({"message": "User updated successfully", "user": user.serialize()}), 200


@api.route("/reset-password", methods=["PUT"])
@jwt_required()
def reset_password():
    """
    PUT /reset-password
    Update the current user's password with a new password.
    """
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


############################
# DELETE Routes
############################

@api.route("/delete-cat/<int:cat_id>", methods=["DELETE"])
@jwt_required()
def delete_cat(cat_id):
    """
    DELETE /delete-cat/<cat_id>
    Delete a cat if the current user owns it.
    """
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
