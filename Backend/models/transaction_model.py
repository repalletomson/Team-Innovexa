from bson import ObjectId
from datetime import datetime
from models.database import get_db
import logging

logger = logging.getLogger(__name__)

class Transaction:
    """Transaction model for database operations"""
    
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.transactions if self.db else None
    
    def create_transaction(self, transaction_data):
        """Create a new transaction"""
        try:
            transaction_data['created_at'] = datetime.utcnow()
            transaction_data['updated_at'] = datetime.utcnow()
            
            # Convert date string to datetime if needed
            if isinstance(transaction_data.get('date'), str):
                transaction_data['date'] = datetime.fromisoformat(transaction_data['date'])
            
            result = self.collection.insert_one(transaction_data)
            
            # Return created transaction
            return self.get_transaction_by_id(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error creating transaction: {e}")
            return None
    
    def get_transaction_by_id(self, transaction_id):
        """Get transaction by ID"""
        try:
            transaction = self.collection.find_one({"_id": ObjectId(transaction_id)})
            if transaction:
                transaction['_id'] = str(transaction['_id'])
                transaction['user_id'] = str(transaction['user_id'])
            return transaction
        except Exception as e:
            logger.error(f"Error getting transaction by ID: {e}")
            return None
    
    def get_user_transactions(self, user_id, page=1, limit=20, filters=None):
        """Get user transactions with pagination and filters"""
        try:
            query = {"user_id": ObjectId(user_id)}
            
            # Apply filters
            if filters:
                if filters.get('type'):
                    query['type'] = filters['type']
                if filters.get('category'):
                    query['category'] = filters['category']
                if filters.get('start_date') and filters.get('end_date'):
                    query['date'] = {
                        '$gte': datetime.fromisoformat(filters['start_date']),
                        '$lte': datetime.fromisoformat(filters['end_date'])
                    }
                if filters.get('search'):
                    query['$or'] = [
                        {'title': {'$regex': filters['search'], '$options': 'i'}},
                        {'description': {'$regex': filters['search'], '$options': 'i'}}
                    ]
            
            # Calculate skip value
            skip = (page - 1) * limit
            
            # Get transactions with pagination
            transactions = list(
                self.collection.find(query)
                .sort('date', -1)
                .skip(skip)
                .limit(limit)
            )
            
            # Convert ObjectIds to strings
            for transaction in transactions:
                transaction['_id'] = str(transaction['_id'])
                transaction['user_id'] = str(transaction['user_id'])
            
            # Get total count for pagination
            total_count = self.collection.count_documents(query)
            
            return {
                'transactions': transactions,
                'total_count': total_count,
                'page': page,
                'limit': limit,
                'total_pages': (total_count + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error(f"Error getting user transactions: {e}")
            return None
    
    def update_transaction(self, transaction_id, update_data):
        """Update transaction"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            # Convert date string to datetime if needed
            if isinstance(update_data.get('date'), str):
                update_data['date'] = datetime.fromisoformat(update_data['date'])
            
            result = self.collection.update_one(
                {"_id": ObjectId(transaction_id)},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return self.get_transaction_by_id(transaction_id)
            return None
            
        except Exception as e:
            logger.error(f"Error updating transaction: {e}")
            return None
    
    def delete_transaction(self, transaction_id):
        """Delete transaction"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(transaction_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting transaction: {e}")
            return False
    
    def get_user_statistics(self, user_id, start_date=None, end_date=None):
        """Get user transaction statistics"""
        try:
            match_query = {"user_id": ObjectId(user_id)}
            
            if start_date and end_date:
                match_query['date'] = {
                    '$gte': datetime.fromisoformat(start_date),
                    '$lte': datetime.fromisoformat(end_date)
                }
            
            pipeline = [
                {"$match": match_query},
                {
                    "$group": {
                        "_id": "$type",
                        "total_amount": {"$sum": "$amount"},
                        "count": {"$sum": 1}
                    }
                }
            ]
            
            results = list(self.collection.aggregate(pipeline))
            
            # Format results
            stats = {
                'income': {'total': 0, 'count': 0},
                'expense': {'total': 0, 'count': 0}
            }
            
            for result in results:
                transaction_type = result['_id']
                if transaction_type in stats:
                    stats[transaction_type] = {
                        'total': result['total_amount'],
                        'count': result['count']
                    }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting user statistics: {e}")
            return None