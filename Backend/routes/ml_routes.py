from flask import Blueprint, request, jsonify
from utils.response_handler import success_response, error_response
from utils.auth_decorator import token_required
from ml_services.expense_predictor import ExpensePredictor
from ml_services.spending_analyzer import SpendingAnalyzer
from ml_services.budget_optimizer import BudgetOptimizer
import logging

logger = logging.getLogger(__name__)

ml_bp = Blueprint('ml', __name__)

# Initialize ML services
expense_predictor = ExpensePredictor()
spending_analyzer = SpendingAnalyzer()
budget_optimizer = BudgetOptimizer()

@ml_bp.route('/predict-expenses', methods=['POST'])
@token_required
def predict_expenses(current_user):
    """Predict future expenses based on historical data"""
    try:
        data = request.get_json()
        
        # Get prediction parameters
        months_ahead = data.get('months_ahead', 3)
        category = data.get('category', None)
        
        # Get user's transaction history for prediction
        predictions = expense_predictor.predict_user_expenses(
            user_id=current_user['_id'],
            months_ahead=months_ahead,
            category=category
        )
        
        if predictions:
            return success_response(
                message="Expense predictions generated successfully",
                data=predictions
            )
        else:
            return error_response("Failed to generate predictions", 500)
            
    except Exception as e:
        logger.error(f"Error in predict_expenses: {e}")
        return error_response("Internal server error", 500)

@ml_bp.route('/analyze-spending', methods=['POST'])
@token_required
def analyze_spending(current_user):
    """Analyze spending patterns and provide insights"""
    try:
        data = request.get_json()
        
        # Get analysis parameters
        period = data.get('period', 'monthly')  # monthly, weekly, yearly
        include_trends = data.get('include_trends', True)
        
        # Analyze user's spending patterns
        analysis = spending_analyzer.analyze_user_spending(
            user_id=current_user['_id'],
            period=period,
            include_trends=include_trends
        )
        
        if analysis:
            return success_response(
                message="Spending analysis completed successfully",
                data=analysis
            )
        else:
            return error_response("Failed to analyze spending", 500)
            
    except Exception as e:
        logger.error(f"Error in analyze_spending: {e}")
        return error_response("Internal server error", 500)

@ml_bp.route('/optimize-budget', methods=['POST'])
@token_required
def optimize_budget(current_user):
    """Optimize budget allocation based on spending patterns"""
    try:
        data = request.get_json()
        
        # Get optimization parameters
        target_savings = data.get('target_savings', 0.2)  # 20% savings goal
        priority_categories = data.get('priority_categories', [])
        
        # Optimize user's budget
        optimization = budget_optimizer.optimize_user_budget(
            user_id=current_user['_id'],
            target_savings=target_savings,
            priority_categories=priority_categories
        )
        
        if optimization:
            return success_response(
                message="Budget optimization completed successfully",
                data=optimization
            )
        else:
            return error_response("Failed to optimize budget", 500)
            
    except Exception as e:
        logger.error(f"Error in optimize_budget: {e}")
        return error_response("Internal server error", 500)

@ml_bp.route('/financial-insights', methods=['GET'])
@token_required
def get_financial_insights(current_user):
    """Get comprehensive financial insights using ML"""
    try:
        # Get insights parameters
        include_predictions = request.args.get('include_predictions', 'true').lower() == 'true'
        include_recommendations = request.args.get('include_recommendations', 'true').lower() == 'true'
        
        insights = {}
        
        # Get spending analysis
        spending_analysis = spending_analyzer.analyze_user_spending(
            user_id=current_user['_id'],
            period='monthly',
            include_trends=True
        )
        
        if spending_analysis:
            insights['spending_analysis'] = spending_analysis
        
        # Get expense predictions if requested
        if include_predictions:
            predictions = expense_predictor.predict_user_expenses(
                user_id=current_user['_id'],
                months_ahead=3
            )
            if predictions:
                insights['expense_predictions'] = predictions
        
        # Get budget recommendations if requested
        if include_recommendations:
            recommendations = budget_optimizer.get_budget_recommendations(
                user_id=current_user['_id']
            )
            if recommendations:
                insights['budget_recommendations'] = recommendations
        
        return success_response(
            message="Financial insights generated successfully",
            data=insights
        )
        
    except Exception as e:
        logger.error(f"Error in get_financial_insights: {e}")
        return error_response("Internal server error", 500)

@ml_bp.route('/categorize-transaction', methods=['POST'])
@token_required
def categorize_transaction(current_user):
    """Auto-categorize transaction using ML"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('description'):
            return error_response("Transaction description is required", 400)
        
        # Get transaction details
        description = data['description']
        amount = data.get('amount', 0)
        merchant = data.get('merchant', '')
        
        # Predict category
        predicted_category = spending_analyzer.predict_transaction_category(
            description=description,
            amount=amount,
            merchant=merchant,
            user_id=current_user['_id']
        )
        
        if predicted_category:
            return success_response(
                message="Transaction categorized successfully",
                data={
                    'predicted_category': predicted_category['category'],
                    'confidence': predicted_category['confidence'],
                    'suggestions': predicted_category.get('suggestions', [])
                }
            )
        else:
            return error_response("Failed to categorize transaction", 500)
            
    except Exception as e:
        logger.error(f"Error in categorize_transaction: {e}")
        return error_response("Internal server error", 500)