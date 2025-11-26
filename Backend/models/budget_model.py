from bson import ObjectId
from datetime import datetime, timedelta
from models.database import get_db
from models.transaction_model import Transaction
import logging

logger = logging.getLogger(__name__)

class Budget:
    """Budget model for database operations"""
    
    def __init__(self):
        self.db = get_db()
        self.collection = self.db.budgets if self.db else None
        self.transaction_model = Transaction()
    
    def create_budget(self, budget_data):
        """Create a new budget"""
        try:
            budget_data['created_at'] = datetime.utcnow()
            budget_data['updated_at'] = datetime.utcnow()
            
            result = self.collection.insert_one(budget_data)
            
            # Return created budget
            return self.get_budget_by_id(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error creating budget: {e}")
            return None
    
    def get_budget_by_id(self, budget_id):
        """Get budget by ID"""
        try:
            budget = self.collection.find_one({"_id": ObjectId(budget_id)})
            if budget:
                budget['_id'] = str(budget['_id'])
                budget['user_id'] = str(budget['user_id'])
            return budget
        except Exception as e:
            logger.error(f"Error getting budget by ID: {e}")
            return None
    
    def get_user_budgets(self, user_id, period='monthly'):
        """Get user budgets for a specific period"""
        try:
            query = {
                "user_id": ObjectId(user_id),
                "period": period
            }
            
            budgets = list(self.collection.find(query))
            
            # Convert ObjectIds to strings and add spending data
            for budget in budgets:
                budget['_id'] = str(budget['_id'])
                budget['user_id'] = str(budget['user_id'])
                
                # Get actual spending for this category
                spending_data = self._get_category_spending(
                    user_id, budget['category'], period
                )
                budget['spent'] = spending_data['total_spent']
                budget['remaining'] = budget['amount'] - spending_data['total_spent']
                budget['percentage_used'] = (spending_data['total_spent'] / budget['amount'] * 100) if budget['amount'] > 0 else 0
            
            return budgets
            
        except Exception as e:
            logger.error(f"Error getting user budgets: {e}")
            return None
    
    def update_budget(self, budget_id, update_data):
        """Update budget"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            result = self.collection.update_one(
                {"_id": ObjectId(budget_id)},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return self.get_budget_by_id(budget_id)
            return None
            
        except Exception as e:
            logger.error(f"Error updating budget: {e}")
            return None
    
    def delete_budget(self, budget_id):
        """Delete budget"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(budget_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting budget: {e}")
            return False
    
    def get_budget_analysis(self, user_id, period='monthly'):
        """Get comprehensive budget analysis"""
        try:
            budgets = self.get_user_budgets(user_id, period)
            
            if not budgets:
                return None
            
            analysis = {
                'budgets': budgets,
                'summary': {
                    'total_budgeted': sum(b['amount'] for b in budgets),
                    'total_spent': sum(b['spent'] for b in budgets),
                    'total_remaining': sum(b['remaining'] for b in budgets),
                    'categories_over_budget': len([b for b in budgets if b['spent'] > b['amount']]),
                    'categories_under_budget': len([b for b in budgets if b['spent'] <= b['amount']]),
                }
            }
            
            # Calculate overall budget performance
            if analysis['summary']['total_budgeted'] > 0:
                analysis['summary']['overall_percentage'] = (
                    analysis['summary']['total_spent'] / analysis['summary']['total_budgeted'] * 100
                )
            else:
                analysis['summary']['overall_percentage'] = 0
            
            # Add recommendations
            analysis['recommendations'] = self._generate_budget_recommendations(budgets)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error getting budget analysis: {e}")
            return None
    
    def _get_category_spending(self, user_id, category, period):
        """Get spending for a specific category and period"""
        try:
            # Calculate date range based on period
            end_date = datetime.utcnow()
            
            if period == 'weekly':
                start_date = end_date - timedelta(weeks=1)
            elif period == 'monthly':
                start_date = end_date - timedelta(days=30)
            elif period == 'yearly':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)  # Default to monthly
            
            # Get transactions for the category and period
            filters = {
                'category': category,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
            
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=1000, filters=filters
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return {'total_spent': 0, 'transaction_count': 0}
            
            # Calculate total spending (only expenses)
            expenses = [t for t in transactions_result['transactions'] if t['type'] == 'expense']
            total_spent = sum(t['amount'] for t in expenses)
            
            return {
                'total_spent': total_spent,
                'transaction_count': len(expenses)
            }
            
        except Exception as e:
            logger.error(f"Error getting category spending: {e}")
            return {'total_spent': 0, 'transaction_count': 0}
    
    def _generate_budget_recommendations(self, budgets):
        """Generate budget recommendations based on spending patterns"""
        try:
            recommendations = []
            
            # Check for over-budget categories
            over_budget = [b for b in budgets if b['spent'] > b['amount']]
            if over_budget:
                for budget in over_budget:
                    overage = budget['spent'] - budget['amount']
                    recommendations.append({
                        'type': 'over_budget',
                        'category': budget['category'],
                        'message': f"You've exceeded your {budget['category']} budget by ${overage:.2f}",
                        'severity': 'high' if overage > budget['amount'] * 0.2 else 'medium'
                    })
            
            # Check for categories with high usage
            high_usage = [b for b in budgets if b['percentage_used'] > 80 and b['percentage_used'] <= 100]
            if high_usage:
                for budget in high_usage:
                    recommendations.append({
                        'type': 'high_usage',
                        'category': budget['category'],
                        'message': f"You've used {budget['percentage_used']:.1f}% of your {budget['category']} budget",
                        'severity': 'medium'
                    })
            
            # Check for underutilized budgets
            underutilized = [b for b in budgets if b['percentage_used'] < 50]
            if underutilized:
                for budget in underutilized:
                    recommendations.append({
                        'type': 'underutilized',
                        'category': budget['category'],
                        'message': f"You've only used {budget['percentage_used']:.1f}% of your {budget['category']} budget. Consider reallocating funds.",
                        'severity': 'low'
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []