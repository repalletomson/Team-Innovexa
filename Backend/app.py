from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson import ObjectId
import os
from datetime import datetime
import logging

# Import custom modules
from config import Config
from models.database import init_db
from routes.auth_routes import auth_bp
from routes.transaction_routes import transaction_bp
from routes.budget_routes import budget_bp
from routes.ml_routes import ml_bp
from utils.response_handler import success_response, error_response

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app)

# Initialize database
mongo = init_db(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(transaction_bp, url_prefix='/api/transactions')
app.register_blueprint(budget_bp, url_prefix='/api/budget')
app.register_blueprint(ml_bp, url_prefix='/api/ml')

@app.route('/')
def home():
    """Health check endpoint"""
    return success_response(
        message="Finance App Backend API is running!",
        data={
            "version": "1.0.0",
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.route('/api/health')
def health_check():
    """Detailed health check with database connectivity"""
    try:
        # Test database connection
        mongo.db.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
        logger.error(f"Database connection error: {e}")
    
    return success_response(
        message="Health check completed",
        data={
            "api_status": "running",
            "database_status": db_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.errorhandler(404)
def not_found(error):
    return error_response("Endpoint not found", 404)

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return error_response("Internal server error", 500)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)