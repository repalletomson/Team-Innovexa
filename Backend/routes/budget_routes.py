from flask import Blueprint, request, jsonify
from models.budget_model import Budget
from utils.response_handler import success_response, error_response
from utils.validators import validate_budget_data
from utils.auth_decorator import token_required
import logging

logger = logging.getLogger(__name__)

budget_bp = Blueprint('budget', __name__)
budget_model = Budget()

@budget_bp.route('/', methods=['POST'])
@token_required
def create_budget(current_user):
    """Create a new budget"""
    try:
        data = request.get_json()
        
        # Validate required fields
        validation_error = validate_budget_data(data)
        if validation_error:
            return error_response(validation_error, 400)
        
        # Add user_id to budget data
        data['user_id'] = current_user['_id']
        
        # Create budget
        budget = budget_model.create_budget(data)
        
        if budget:
            return success_response(
                message="Budget created successfully",
                data=budget
            )
        else:
            return error_response("Failed to create budget", 500)
            
    except Exception as e:
        logger.error(f"Error in create_budget: {e}")
        return error_response("Internal server error", 500)

@budget_bp.route('/', methods=['GET'])
@token_required
def get_budgets(current_user):
    """Get user budgets"""
    try:
        period = request.args.get('period', 'monthly')
        
        budgets = budget_model.get_user_budgets(current_user['_id'], period)
        
        if budgets is not None:
            return success_response(
                message="Budgets retrieved successfully",
                data=budgets
            )
        else:
            return error_response("Failed to retrieve budgets", 500)
            
    except Exception as e:
        logger.error(f"Error in get_budgets: {e}")
        return error_response("Internal server error", 500)

@budget_bp.route('/<budget_id>', methods=['PUT'])
@token_required
def update_budget(current_user, budget_id):
    """Update budget"""
    try:
        data = request.get_json()
        
        # Get existing budget
        existing_budget = budget_model.get_budget_by_id(budget_id)
        if not existing_budget:
            return error_response("Budget not found", 404)
        
        # Check ownership
        if existing_budget['user_id'] != current_user['_id']:
            return error_response("Unauthorized access", 403)
        
        # Validate update data
        validation_error = validate_budget_data(data, is_update=True)
        if validation_error:
            return error_response(validation_error, 400)
        
        # Update budget
        updated_budget = budget_model.update_budget(budget_id, data)
        
        if updated_budget:
            return success_response(
                message="Budget updated successfully",
                data=updated_budget
            )
        else:
            return error_response("Failed to update budget", 500)
            
    except Exception as e:
        logger.error(f"Error in update_budget: {e}")
        return error_response("Internal server error", 500)

@budget_bp.route('/<budget_id>', methods=['DELETE'])
@token_required
def delete_budget(current_user, budget_id):
    """Delete budget"""
    try:
        # Get existing budget
        existing_budget = budget_model.get_budget_by_id(budget_id)
        if not existing_budget:
            return error_response("Budget not found", 404)
        
        # Check ownership
        if existing_budget['user_id'] != current_user['_id']:
            return error_response("Unauthorized access", 403)
        
        # Delete budget
        success = budget_model.delete_budget(budget_id)
        
        if success:
            return success_response(
                message="Budget deleted successfully"
            )
        else:
            return error_response("Failed to delete budget", 500)
            
    except Exception as e:
        logger.error(f"Error in delete_budget: {e}")
        return error_response("Internal server error", 500)

@budget_bp.route('/analysis', methods=['GET'])
@token_required
def get_budget_analysis(current_user):
    """Get budget analysis with spending vs budget comparison"""
    try:
        period = request.args.get('period', 'monthly')
        
        analysis = budget_model.get_budget_analysis(current_user['_id'], period)
        
        if analysis is not None:
            return success_response(
                message="Budget analysis retrieved successfully",
                data=analysis
            )
        else:
            return error_response("Failed to retrieve budget analysis", 500)
            
    except Exception as e:
        logger.error(f"Error in get_budget_analysis: {e}")
        return error_response("Internal server error", 500)