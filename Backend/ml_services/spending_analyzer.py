import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from models.transaction_model import Transaction
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class SpendingAnalyzer:
    """ML service for analyzing spending patterns and providing insights"""
    
    def __init__(self):
        self.transaction_model = Transaction()
    
    def analyze_user_spending(self, user_id, period='monthly', include_trends=True):
        """Analyze user's spending patterns"""
        try:
            # Get user transactions
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=1000
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return None
            
            df = pd.DataFrame(transactions_result['transactions'])
            df['date'] = pd.to_datetime(df['date'])
            
            analysis = {}
            
            # Category breakdown
            analysis['category_breakdown'] = self._analyze_categories(df)
            
            # Spending trends
            if include_trends:
                analysis['spending_trends'] = self._analyze_trends(df, period)
            
            # Spending patterns
            analysis['spending_patterns'] = self._analyze_patterns(df)
            
            # Insights and recommendations
            analysis['insights'] = self._generate_insights(df)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing spending: {e}")
            return None
    
    def _analyze_categories(self, df):
        """Analyze spending by categories"""
        try:
            expenses_df = df[df['type'] == 'expense'].copy()
            
            if len(expenses_df) == 0:
                return {}
            
            category_stats = expenses_df.groupby('category').agg({
                'amount': ['sum', 'count', 'mean', 'std']
            }).round(2)
            
            category_stats.columns = ['total_spent', 'transaction_count', 'avg_amount', 'std_amount']
            category_stats = category_stats.fillna(0)
            
            # Calculate percentages
            total_spending = category_stats['total_spent'].sum()
            category_stats['percentage'] = (category_stats['total_spent'] / total_spending * 100).round(2)
            
            # Convert to dictionary
            result = {}
            for category in category_stats.index:
                result[category] = {
                    'total_spent': float(category_stats.loc[category, 'total_spent']),
                    'transaction_count': int(category_stats.loc[category, 'transaction_count']),
                    'avg_amount': float(category_stats.loc[category, 'avg_amount']),
                    'percentage': float(category_stats.loc[category, 'percentage'])
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing categories: {e}")
            return {}
    
    def _analyze_trends(self, df, period):
        """Analyze spending trends over time"""
        try:
            expenses_df = df[df['type'] == 'expense'].copy()
            
            if len(expenses_df) == 0:
                return {}
            
            # Group by period
            if period == 'weekly':
                expenses_df['period'] = expenses_df['date'].dt.to_period('W')
            elif period == 'monthly':
                expenses_df['period'] = expenses_df['date'].dt.to_period('M')
            elif period == 'yearly':
                expenses_df['period'] = expenses_df['date'].dt.to_period('Y')
            
            trend_data = expenses_df.groupby('period').agg({
                'amount': ['sum', 'count', 'mean']
            }).round(2)
            
            trend_data.columns = ['total_spent', 'transaction_count', 'avg_amount']
            
            # Calculate trend direction
            if len(trend_data) >= 2:
                recent_avg = trend_data['total_spent'].tail(3).mean()
                older_avg = trend_data['total_spent'].head(3).mean()
                trend_direction = 'increasing' if recent_avg > older_avg else 'decreasing'
                trend_percentage = abs((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
            else:
                trend_direction = 'stable'
                trend_percentage = 0
            
            # Convert periods to strings for JSON serialization
            trend_dict = {}
            for period_key in trend_data.index:
                trend_dict[str(period_key)] = {
                    'total_spent': float(trend_data.loc[period_key, 'total_spent']),
                    'transaction_count': int(trend_data.loc[period_key, 'transaction_count']),
                    'avg_amount': float(trend_data.loc[period_key, 'avg_amount'])
                }
            
            return {
                'trend_data': trend_dict,
                'trend_direction': trend_direction,
                'trend_percentage': round(trend_percentage, 2)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return {}
    
    def _analyze_patterns(self, df):
        """Analyze spending patterns"""
        try:
            expenses_df = df[df['type'] == 'expense'].copy()
            
            if len(expenses_df) == 0:
                return {}
            
            patterns = {}
            
            # Day of week patterns
            expenses_df['day_of_week'] = expenses_df['date'].dt.day_name()
            day_patterns = expenses_df.groupby('day_of_week')['amount'].sum().to_dict()
            patterns['day_of_week'] = {k: float(v) for k, v in day_patterns.items()}
            
            # Time of month patterns
            expenses_df['day_of_month'] = expenses_df['date'].dt.day
            
            # Group days into periods
            def get_month_period(day):
                if day <= 10:
                    return 'early_month'
                elif day <= 20:
                    return 'mid_month'
                else:
                    return 'late_month'
            
            expenses_df['month_period'] = expenses_df['day_of_month'].apply(get_month_period)
            month_patterns = expenses_df.groupby('month_period')['amount'].sum().to_dict()
            patterns['month_period'] = {k: float(v) for k, v in month_patterns.items()}
            
            # Transaction size patterns
            def categorize_amount(amount):
                if amount < 25:
                    return 'small'
                elif amount < 100:
                    return 'medium'
                elif amount < 500:
                    return 'large'
                else:
                    return 'very_large'
            
            expenses_df['amount_category'] = expenses_df['amount'].apply(categorize_amount)
            amount_patterns = expenses_df.groupby('amount_category')['amount'].count().to_dict()
            patterns['transaction_sizes'] = {k: int(v) for k, v in amount_patterns.items()}
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing patterns: {e}")
            return {}
    
    def _generate_insights(self, df):
        """Generate spending insights and recommendations"""
        try:
            insights = []
            
            expenses_df = df[df['type'] == 'expense'].copy()
            income_df = df[df['type'] == 'income'].copy()
            
            if len(expenses_df) == 0:
                return insights
            
            # Top spending category
            top_category = expenses_df.groupby('category')['amount'].sum().idxmax()
            top_category_amount = expenses_df.groupby('category')['amount'].sum().max()
            total_expenses = expenses_df['amount'].sum()
            top_category_percentage = (top_category_amount / total_expenses * 100)
            
            insights.append({
                'type': 'top_category',
                'message': f"Your highest spending category is {top_category}, accounting for {top_category_percentage:.1f}% of your expenses.",
                'category': top_category,
                'amount': float(top_category_amount),
                'percentage': float(top_category_percentage)
            })
            
            # Income vs Expenses
            if len(income_df) > 0:
                total_income = income_df['amount'].sum()
                savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
                
                if savings_rate > 20:
                    insights.append({
                        'type': 'savings_rate',
                        'message': f"Great job! You're saving {savings_rate:.1f}% of your income.",
                        'savings_rate': float(savings_rate),
                        'status': 'good'
                    })
                elif savings_rate > 0:
                    insights.append({
                        'type': 'savings_rate',
                        'message': f"You're saving {savings_rate:.1f}% of your income. Consider increasing to 20% or more.",
                        'savings_rate': float(savings_rate),
                        'status': 'moderate'
                    })
                else:
                    insights.append({
                        'type': 'savings_rate',
                        'message': "You're spending more than you earn. Consider reviewing your expenses.",
                        'savings_rate': float(savings_rate),
                        'status': 'warning'
                    })
            
            # Frequent small transactions
            small_transactions = expenses_df[expenses_df['amount'] < 25]
            if len(small_transactions) > len(expenses_df) * 0.3:
                small_total = small_transactions['amount'].sum()
                insights.append({
                    'type': 'small_transactions',
                    'message': f"You have many small transactions totaling ${small_total:.2f}. Consider tracking these more carefully.",
                    'count': len(small_transactions),
                    'total_amount': float(small_total)
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return []
    
    def predict_transaction_category(self, description, amount, merchant='', user_id=None):
        """Predict transaction category based on description and amount"""
        try:
            # Simple rule-based categorization (can be enhanced with ML)
            description_lower = description.lower()
            merchant_lower = merchant.lower()
            
            # Food & Dining
            food_keywords = ['restaurant', 'cafe', 'coffee', 'food', 'grocery', 'supermarket', 'pizza', 'burger']
            if any(keyword in description_lower or keyword in merchant_lower for keyword in food_keywords):
                return {'category': 'Food', 'confidence': 0.8}
            
            # Transportation
            transport_keywords = ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'toll']
            if any(keyword in description_lower or keyword in merchant_lower for keyword in transport_keywords):
                return {'category': 'Transportation', 'confidence': 0.8}
            
            # Entertainment
            entertainment_keywords = ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater']
            if any(keyword in description_lower or keyword in merchant_lower for keyword in entertainment_keywords):
                return {'category': 'Entertainment', 'confidence': 0.8}
            
            # Utilities
            utility_keywords = ['electric', 'water', 'internet', 'phone', 'utility', 'bill']
            if any(keyword in description_lower or keyword in merchant_lower for keyword in utility_keywords):
                return {'category': 'Utilities', 'confidence': 0.8}
            
            # Healthcare
            health_keywords = ['hospital', 'doctor', 'pharmacy', 'medical', 'health', 'clinic']
            if any(keyword in description_lower or keyword in merchant_lower for keyword in health_keywords):
                return {'category': 'Healthcare', 'confidence': 0.8}
            
            # Shopping
            shopping_keywords = ['amazon', 'store', 'shop', 'mall', 'retail', 'clothing', 'electronics']
            if any(keyword in description_lower or keyword in merchant_lower for keyword in shopping_keywords):
                return {'category': 'Shopping', 'confidence': 0.7}
            
            # Default to Other with low confidence
            return {'category': 'Other', 'confidence': 0.3}
            
        except Exception as e:
            logger.error(f"Error predicting category: {e}")
            return {'category': 'Other', 'confidence': 0.1}