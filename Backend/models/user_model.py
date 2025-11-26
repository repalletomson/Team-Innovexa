from bson import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import get_db
import logging

logger = logging.getLogger(__name__)

class User:
    """User model for database operations"""
    
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.users if self.db else None
    
    def create_user(self, user_data):
        """Create a new user"""
        try:
            # Hash password
            user_data['password'] = generate_password_hash(user_data['password'])
            user_data['created_at'] = datetime.utcnow()
            user_data['updated_at'] = datetime.utcnow()
            
            # Insert user
            result = self.collection.insert_one(user_data)
            
            # Return user without password
            user = self.get_user_by_id(result.inserted_id)
            return user
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    def get_user_by_email(self, email):
        """Get user by email"""
        try:
            user = self.collection.find_one({"email": email})
            if user:
                user['_id'] = str(user['_id'])
                # Remove password from response
                user.pop('password', None)
            return user
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            user = self.collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user['_id'] = str(user['_id'])
                # Remove password from response
                user.pop('password', None)
            return user
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    def verify_password(self, email, password):
        """Verify user password"""
        try:
            user = self.collection.find_one({"email": email})
            if user and check_password_hash(user['password'], password):
                user['_id'] = str(user['_id'])
                # Remove password from response
                user.pop('password', None)
                return user
            return None
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return None
    
    def update_user(self, user_id, update_data):
        """Update user information"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return self.get_user_by_id(user_id)
            return None
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None
    
    def delete_user(self, user_id):
        """Delete user"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return False