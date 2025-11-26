from flask import Blueprint, request, jsonify
from models.user_model import User
from utils.response_handler import success_response, error_response
from utils.validators import validate_user_data, validate_login_data
from utils.jwt_handler import generate_token
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)
user_model = User()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input data
        validation_error = validate_user_data(data)
        if validation_error:
            return error_response(validation_error, 400)
        
        # Check if user already exists
        existing_user = user_model.get_user_by_email(data['email'])
        if existing_user:
            return error_response("User with this email already exists", 409)
        
        # Create user
        user = user_model.create_user(data)
        
        if user:
            # Generate JWT token
            token = generate_token(user['_id'])
            
            return success_response(
                message="User registered successfully",
                data={
                    "user": user,
                    "token": token
                }
            )
        else:
            return error_response("Failed to create user", 500)
            
    except Exception as e:
        logger.error(f"Error in register: {e}")
        return error_response("Internal server error", 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate input data
        validation_error = validate_login_data(data)
        if validation_error:
            return error_response(validation_error, 400)
        
        # Verify user credentials
        user = user_model.verify_password(data['email'], data['password'])
        
        if user:
            # Generate JWT token
            token = generate_token(user['_id'])
            
            return success_response(
                message="Login successful",
                data={
                    "user": user,
                    "token": token
                }
            )
        else:
            return error_response("Invalid email or password", 401)
            
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return error_response("Internal server error", 500)

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile (requires authentication)"""
    try:
        # This would typically use the @token_required decorator
        # For now, we'll implement basic token validation here
        
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return error_response("Authorization token required", 401)
        
        token = auth_header.split(' ')[1]
        
        # Validate token and get user (simplified for template)
        from utils.jwt_handler import decode_token
        payload = decode_token(token)
        
        if not payload:
            return error_response("Invalid or expired token", 401)
        
        user = user_model.get_user_by_id(payload['user_id'])
        
        if user:
            return success_response(
                message="Profile retrieved successfully",
                data=user
            )
        else:
            return error_response("User not found", 404)
            
    except Exception as e:
        logger.error(f"Error in get_profile: {e}")
        return error_response("Internal server error", 500)

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile (requires authentication)"""
    try:
        # Basic token validation (use @token_required in production)
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return error_response("Authorization token required", 401)
        
        token = auth_header.split(' ')[1]
        
        from utils.jwt_handler import decode_token
        payload = decode_token(token)
        
        if not payload:
            return error_response("Invalid or expired token", 401)
        
        data = request.get_json()
        
        # Remove sensitive fields that shouldn't be updated via this endpoint
        data.pop('password', None)
        data.pop('email', None)  # Email changes might need separate verification
        
        # Update user
        updated_user = user_model.update_user(payload['user_id'], data)
        
        if updated_user:
            return success_response(
                message="Profile updated successfully",
                data=updated_user
            )
        else:
            return error_response("Failed to update profile", 500)
            
    except Exception as e:
        logger.error(f"Error in update_profile: {e}")
        return error_response("Internal server error", 500)