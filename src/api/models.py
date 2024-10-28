from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'  # Explicit table name for consistency

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean(), nullable=False)
    
    # Relationship connecting User to their cats, with back_populates for bidirectionality
    cats = db.relationship('Cat', back_populates='owner', lazy='subquery')
    
    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "cats": [cat.serialize() for cat in self.cats],  # Serializing associated cats
        }


class Cat(db.Model):
    __tablename__ = 'catTable'  # Explicit table name for clarity

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(50), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    price = db.Column(db.Float, nullable=True)
    
    # Foreign key linking each cat to a specific user (owner)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationship back to User model
    owner = db.relationship('User', back_populates='cats')

    def __repr__(self):
        return f'<Cat {self.name} owned by User {self.user_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "breed": self.breed,
            "age": self.age,
            "price": self.price,
            "owner_id": self.user_id
        }
