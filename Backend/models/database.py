from flask_pymongo import PyMongo
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)

# Global mongo instance
mongo = None

def init_db(app):
    """Initialize database connection"""
    global mongo
    try:
        mongo = PyMongo(app)
        logger.info("Database connection initialized successfully")
        
        # Create indexes for better performance
        create_indexes()
        
        return mongo
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        mongo.db.users.create_index("email", unique=True)
        mongo.db.users.create_index("created_at")
        
        # Transactions collection indexes
        mongo.db.transactions.create_index([("user_id", 1), ("date", -1)])
        mongo.db.transactions.create_index("category")
        mongo.db.transactions.create_index("type")
        
        # Budget collection indexes
        mongo.db.budgets.create_index([("user_id", 1), ("category", 1)], unique=True)
        mongo.db.budgets.create_index("period")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_db():
    """Get database instance"""
    return mongo.db if mongo else None