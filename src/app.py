# app.py

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS  # Import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager

app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)  # Enable CORS for the app
jwt = JWTManager(app) 
# Database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Setup admin and commands
setup_admin(app)
setup_commands(app)

# Add API routes with a prefix
app.register_blueprint(api, url_prefix='/api')

# Handle errors as JSON
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Serve the sitemap and static files
@app.route('/')
def sitemap():
    return generate_sitemap(app)

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    return send_from_directory('public', path)

# Start the server
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
