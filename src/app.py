"""
This module takes care of starting the API Server, Loading the DB, and Adding the endpoints
"""
import os
from werkzeug.middleware.proxy_fix import ProxyFix
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import timedelta
import cloudinary
import cloudinary.uploader as uploader

# Set environment and static file directory
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__, template_folder='api/templates')
app.secret_key = os.environ.get('FLASK_APP_KEY', 'fallback_secret_key')
app.url_map.strict_slashes = False

# Enable CORS for the specified frontend origin
CORS(app, resources={r"/*": {"origins": "https://save-a-stray-1.onrender.com"}})
#Flask Login page proxyfix
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# File upload configuration
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['CLOUDINARY_URL'] = os.environ.get("CLOUDINARY_URL")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Initialize JWT
jwt = JWTManager(app)

# Setup admin and commands
setup_admin(app)
setup_commands(app)

# Register API blueprint
app.register_blueprint(api, url_prefix='/api')

# Error handler
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Sitemap endpoint
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# Static file serving
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # Avoid cache memory
    return response

# Form submission endpoint
@app.route('/submit', methods=['POST'])
def submit():
    # Retrieve form data
    first_name = request.form['first_name']
    last_name = request.form['last_name']
    email = request.form['email']
    phone_number = request.form['phone_number']
    vin_number = request.form['vin_number']
    license_plate = request.form['license_plate']
    text_area = request.form['text_area']

    # Process the form data here

    # Return confirmation
    return jsonify({'message': 'Form submitted successfully'})

# Run the server
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=ENV == "development")