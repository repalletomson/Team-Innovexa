import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from models.transaction_model import Transaction
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os
import logging

logger = logging.getLogger(__name__)

class ExpensePredictor:
    """ML service for predicting future expenses"""
    
    def __init__(self):
        self.transaction_model = Transaction()
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = 'ml_models/expense_predictor.pkl'
        self.scaler_path = 'ml_models/expense_scaler.pkl'
        
        # Load pre-trained model if exists
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model and scaler"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                logger.info("Expense prediction model loaded successfully")
            else:
                logger.info("No pre-trained expense model found, will train on first use")
        except Exception as e:
            logger.error(f"Error loading expense model: {e}")
    
    def save_model(self):
        """Save trained model and scaler"""
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            logger.info("Expense prediction model saved successfully")
        except Exception as e:
            logger.error(f"Error saving expense model: {e}")
    
    def prepare_features(self, transactions_df):
        """Prepare features for ML model"""
        try:
            # Convert date to datetime if it's not already
            transactions_df['date'] = pd.to_datetime(transactions_df['date'])
            
            # Extract time-based features
            transactions_df['month'] = transactions_df['date'].dt.month
            transactions_df['day_of_week'] = transactions_df['date'].dt.dayofweek
            transactions_df['day_of_month'] = transactions_df['date'].dt.day
            
            # Group by month and category for aggregation
            monthly_data = transactions_df.groupby([
                transactions_df['date'].dt.to_period('M'), 'category'
            ]).agg({
                'amount': ['sum', 'count', 'mean'],
                'month': 'first',
                'day_of_week': 'mean'
            }).reset_index()
            
            # Flatten column names
            monthly_data.columns = ['period', 'category', 'total_amount', 'transaction_count', 
                                  'avg_amount', 'month', 'avg_day_of_week']
            
            return monthly_data
            
        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            return None
    
    def train_model(self, user_id):
        """Train expense prediction model for user"""
        try:
            # Get user's transaction history
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=1000
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return False
            
            # Convert to DataFrame
            df = pd.DataFrame(transactions_result['transactions'])
            
            # Filter only expenses
            expenses_df = df[df['type'] == 'expense'].copy()
            
            if len(expenses_df) < 10:  # Need minimum data for training
                logger.warning("Insufficient data for training expense model")
                return False
            
            # Prepare features
            features_df = self.prepare_features(expenses_df)
            
            if features_df is None or len(features_df) < 3:
                return False
            
            # Prepare training data
            X = features_df[['month', 'avg_day_of_week', 'transaction_count']].values
            y = features_df['total_amount'].values
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model = LinearRegression()
            self.model.fit(X_scaled, y)
            
            # Save model
            self.save_model()
            
            logger.info(f"Expense prediction model trained for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error training expense model: {e}")
            return False
    
    def predict_user_expenses(self, user_id, months_ahead=3, category=None):
        """Predict future expenses for user"""
        try:
            # Train model if not available
            if self.model is None:
                if not self.train_model(user_id):
                    return self._get_fallback_predictions(user_id, months_ahead, category)
            
            # Get historical data for baseline
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=500
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return None
            
            df = pd.DataFrame(transactions_result['transactions'])
            expenses_df = df[df['type'] == 'expense'].copy()
            
            if category:
                expenses_df = expenses_df[expenses_df['category'] == category]
            
            # Calculate historical averages
            historical_avg = expenses_df['amount'].mean() if len(expenses_df) > 0 else 0
            
            # Generate predictions for future months
            predictions = []
            current_date = datetime.now()
            
            for i in range(1, months_ahead + 1):
                future_date = current_date + timedelta(days=30 * i)
                
                # Prepare features for prediction
                features = np.array([[
                    future_date.month,
                    future_date.weekday(),
                    len(expenses_df) / max(1, len(expenses_df.groupby(
                        pd.to_datetime(expenses_df['date']).dt.to_period('M')
                    )))  # avg transactions per month
                ]])
                
                # Scale features and predict
                if self.model and hasattr(self.scaler, 'transform'):
                    features_scaled = self.scaler.transform(features)
                    predicted_amount = self.model.predict(features_scaled)[0]
                else:
                    predicted_amount = historical_avg
                
                predictions.append({
                    'month': future_date.strftime('%Y-%m'),
                    'predicted_amount': max(0, predicted_amount),
                    'category': category or 'all',
                    'confidence': 0.75  # Simplified confidence score
                })
            
            return {
                'predictions': predictions,
                'historical_average': historical_avg,
                'model_accuracy': 0.75,  # Simplified accuracy score
                'data_points_used': len(expenses_df)
            }
            
        except Exception as e:
            logger.error(f"Error predicting expenses: {e}")
            return self._get_fallback_predictions(user_id, months_ahead, category)
    
    def _get_fallback_predictions(self, user_id, months_ahead, category):
        """Fallback predictions based on historical averages"""
        try:
            transactions_result = self.transaction_model.get_user_transactions(
                user_id, page=1, limit=200
            )
            
            if not transactions_result or not transactions_result['transactions']:
                return None
            
            df = pd.DataFrame(transactions_result['transactions'])
            expenses_df = df[df['type'] == 'expense'].copy()
            
            if category:
                expenses_df = expenses_df[expenses_df['category'] == category]
            
            if len(expenses_df) == 0:
                return None
            
            # Calculate simple average
            avg_amount = expenses_df['amount'].mean()
            
            predictions = []
            current_date = datetime.now()
            
            for i in range(1, months_ahead + 1):
                future_date = current_date + timedelta(days=30 * i)
                predictions.append({
                    'month': future_date.strftime('%Y-%m'),
                    'predicted_amount': avg_amount,
                    'category': category or 'all',
                    'confidence': 0.5
                })
            
            return {
                'predictions': predictions,
                'historical_average': avg_amount,
                'model_accuracy': 0.5,
                'data_points_used': len(expenses_df),
                'note': 'Predictions based on historical averages'
            }
            
        except Exception as e:
            logger.error(f"Error in fallback predictions: {e}")
            return None