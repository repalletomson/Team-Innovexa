from functools import wraps
from flask import request, jsonify, current_app
from utils.jwt_handler import decode_token
from models.user_model import User
import logging

logger = logging.getLogger(__name__)

def token_required(f):
    """Decorator to require valid JWT token for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authorization token is required',
                'status_code': 401
            }), 401
        
        try:
            # Decode token
            payload = decode_token(token)
            if not payload:
                return jsonify({
                    'success': False,
                    'message': 'Invalid or expired token',
                    'status_code': 401
                }), 401
            
            # Get user from database
            user_model = User()
            current_user = user_model.get_user_by_id(payload['user_id'])
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User not found',
                    'status_code': 401
                }), 401
            
            # Add current_user to function arguments
            return f(current_user, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error in token validation: {e}")
            return jsonify({
                'success': False,
                'message': 'Token validation failed',
                'status_code': 401
            }), 401
    
    return decorated

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # First check for valid token
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authorization token is required',
                'status_code': 401
            }), 401
        
        try:
            payload = decode_token(token)
            if not payload:
                return jsonify({
                    'success': False,
                    'message': 'Invalid or expired token',
                    'status_code': 401
                }), 401
            
            user_model = User()
            current_user = user_model.get_user_by_id(payload['user_id'])
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'User not found',
                    'status_code': 401
                }), 401
            
            # Check admin privileges
            if not current_user.get('is_admin', False):
                return jsonify({
                    'success': False,
                    'message': 'Admin privileges required',
                    'status_code': 403
                }), 403
            
            return f(current_user, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error in admin validation: {e}")
            return jsonify({
                'success': False,
                'message': 'Authorization failed',
                'status_code': 401
            }), 401
    
    return decorated