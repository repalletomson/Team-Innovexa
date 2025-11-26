import jwt
from datetime import datetime, timedelta
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def generate_token(user_id):
    """Generate JWT token for user"""
    try:
        payload = {
            'user_id': str(user_id),
            'exp': datetime.utcnow() + timedelta(hours=24),  # Token expires in 24 hours
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
        
        return token
        
    except Exception as e:
        logger.error(f"Error generating token: {e}")
        return None

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
        return None

def refresh_token(token):
    """Refresh JWT token if it's close to expiry"""
    try:
        payload = decode_token(token)
        if not payload:
            return None
        
        # Check if token expires within next hour
        exp_time = datetime.fromtimestamp(payload['exp'])
        if exp_time - datetime.utcnow() < timedelta(hours=1):
            # Generate new token
            return generate_token(payload['user_id'])
        
        return token  # Return original token if not close to expiry
        
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        return None