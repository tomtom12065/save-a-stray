# models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import DateTime

# Initialize SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'  # Explicit table name for consistency

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=False, nullable=False)
    password = db.Column(db.String(240), unique=False, nullable=False)
    salt = db.Column(db.String(120), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False)
    username = db.Column(db.String(250) ,unique=False, nullable=False)
    profilepic= db.Column(db.String(250), unique = False ,nullable = True)
    # Relationship connecting User to their cats, with back_populates for bidirectionality
    cats = db.relationship('Cat', back_populates='owner', lazy='select', cascade="all, delete-orphan")

    # Relationships for sent and received messages using back_populates for clarity
    sent_messages = db.relationship(
        'ChatMessage',
        foreign_keys='ChatMessage.sender_id',
        back_populates='sender',
        lazy='select',
        cascade="all, delete-orphan"
    )
    received_messages = db.relationship(
        'ChatMessage',
        foreign_keys='ChatMessage.recipient_id',
        back_populates='recipient',
        lazy='select',
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "cats": [cat.serialize() for cat in self.cats],
            "is_active": self.is_active,
            "username":self.username,
            "profilepic":self.profilepic,
        }
# 
class Cat(db.Model):
    __tablename__ = 'cats'  # Explicit table name for clarity

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(50), nullable=False)
#    change this to a float at some point
    age = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    image_urls = db.Column(db.Text(), nullable=True)
    description = db.Column(db.String(1000),unique=False,nullable = True)

    # Foreign key linking each cat to a specific user (owner)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationship back to User model
    owner = db.relationship('User', back_populates='cats', lazy="select")

    def __repr__(self):
        return f'<Cat {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "breed": self.breed,
            "age": self.age,
            "price": self.price,
            "image_urls": self.image_urls,
            "user_id": self.user_id,  # Foreign key reference
            "description":self.description,

            "owner": {
                "id": self.owner.id,
                "email": self.owner.email,
                "username": self.owner.username
            } if self.owner else None  # Include owner details if available
        }





class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'  # Explicit table name

    # Primary key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys for sender and recipient, linked to User model
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    read = db.Column(db.Boolean, default=False)  # Indicates if the message has been read

    # Message content and timestamp
    text = db.Column(db.String, nullable=False)
    timestamp = db.Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships to User model using back_populates for bidirectionality
    sender = db.relationship(
        'User',
        foreign_keys=[sender_id],
        back_populates='sent_messages',
        lazy='select'
    )
    recipient = db.relationship(
        'User',
        foreign_keys=[recipient_id],
        back_populates='received_messages',
        lazy='select'
    )

    def __init__(self, sender_id, recipient_id, text, read):
        self.sender_id = sender_id
        self.recipient_id = recipient_id
        self.text = text
        self.read = read

    def __repr__(self):
        return f'<ChatMessage from {self.sender_id} to {self.recipient_id} at {self.timestamp}>'

    def serialize(self):
        """Serialize the message to a dictionary format, including sender and recipient usernames."""
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'sender': self.sender.username if self.sender else None,  # Include sender's username
            'recipient': self.recipient.username if self.recipient else None,  # Include recipient's username
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),  # Convert to ISO format string
            'read': self.read  # Include the read status
        }



class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True)
    cat_id = db.Column(db.Integer, db.ForeignKey('cats.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    applicant_name = db.Column(db.String(120), nullable=False)
    contact_info = db.Column(db.String(255), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # e.g., pending, approved, rejected
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    cat = db.relationship('Cat', backref='applications', lazy=True)
    user = db.relationship('User', backref='applications', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "cat_id": self.cat_id,
            "applicant_name": self.applicant_name,
            "contact_info": self.contact_info,
            "reason": self.reason,
            "status": self.status,
            "created_at": self.created_at,
            "user_id": self.user_id,
            # If desired, you can include related data from cat and user:
            # "cat": self.cat.serialize() if self.cat else None,
            # "user": self.user.serialize() if self.user else None
        }
