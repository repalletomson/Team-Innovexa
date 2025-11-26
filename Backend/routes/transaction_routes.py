from flask import Blueprint, request, jsonify
from models.transaction_model import Transaction
from utils.response_handler import success_response, error_response
from utils.validators import validate_transaction_data
from utils.auth_decorator import token_required
import logging

logger = logging.getLogger(__name__)

transaction_bp = Blueprint('transactions', __name__)
transaction_model = Transaction()

@transaction_bp.route('/', methods=['POST'])
@token_required
def create_transaction(current_user):
    """Create a new transaction"""
    try:
        data = request.get_json()
        
        # Validate required fields
        validation_error = validate_transaction_data(data)
        if validation_error:
            return error_response(validation_error, 400)
        
        # Add user_id to transaction data
        data['user_id'] = current_user['_id']
        
        # Create transaction
        transaction = transaction_model.create_transaction(data)
        
        if transaction:
            return success_response(
                message="Transaction created successfully",
                data=transaction
            )
        else:
            return error_response("Failed to create transaction", 500)
            
    except Exception as e:
        logger.error(f"Error in create_transaction: {e}")
        return error_response("Internal server error", 500)

@transaction_bp.route('/', methods=['GET'])
@token_required
def get_transactions(current_user):
    """Get user transactions with pagination and filters"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 per page
        
        # Get filters
        filters = {}
        if request.args.get('type'):
            filters['type'] = request.args.get('type')
        if request.args.get('category'):
            filters['category'] = request.args.get('category')
        if request.args.get('start_date'):
            filters['start_date'] = request.args.get('start_date')
        if request.args.get('end_date'):
            filters['end_date'] = request.args.get('end_date')
        if request.args.get('search'):
            filters['search'] = request.args.get('search')
        
        # Get transactions
        result = transaction_model.get_user_transactions(
            current_user['_id'], page, limit, filters
        )
        
        if result:
            return success_response(
                message="Transactions retrieved successfully",
                data=result
            )
        else:
            return error_response("Failed to retrieve transactions", 500)
            
    except Exception as e:
        logger.error(f"Error in get_transactions: {e}")
        return error_response("Internal server error", 500)

@transaction_bp.route('/<transaction_id>', methods=['GET'])
@token_required
def get_transaction(current_user, transaction_id):
    """Get specific transaction"""
    try:
        transaction = transaction_model.get_transaction_by_id(transaction_id)
        
        if not transaction:
            return error_response("Transaction not found", 404)
        
        # Check if transaction belongs to current user
        if transaction['user_id'] != current_user['_id']:
            return error_response("Unauthorized access", 403)
        
        return success_response(
            message="Transaction retrieved successfully",
            data=transaction
        )
        
    except Exception as e:
        logger.error(f"Error in get_transaction: {e}")
        return error_response("Internal server error", 500)

@transaction_bp.route('/<transaction_id>', methods=['PUT'])
@token_required
def update_transaction(current_user, transaction_id):
    """Update transaction"""
    try:
        data = request.get_json()
        
        # Get existing transaction
        existing_transaction = transaction_model.get_transaction_by_id(transaction_id)
        if not existing_transaction:
            return error_response("Transaction not found", 404)
        
        # Check ownership
        if existing_transaction['user_id'] != current_user['_id']:
            return error_response("Unauthorized access", 403)
        
        # Validate update data
        validation_error = validate_transaction_data(data, is_update=True)
        if validation_error:
            return error_response(validation_error, 400)
        
        # Update transaction
        updated_transaction = transaction_model.update_transaction(transaction_id, data)
        
        if updated_transaction:
            return success_response(
                message="Transaction updated successfully",
                data=updated_transaction
            )
        else:
            return error_response("Failed to update transaction", 500)
            
    except Exception as e:
        logger.error(f"Error in update_transaction: {e}")
        return error_response("Internal server error", 500)

@transaction_bp.route('/<transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, transaction_id):
    """Delete transaction"""
    try:
        # Get existing transaction
        existing_transaction = transaction_model.get_transaction_by_id(transaction_id)
        if not existing_transaction:
            return error_response("Transaction not found", 404)
        
        # Check ownership
        if existing_transaction['user_id'] != current_user['_id']:
            return error_response("Unauthorized access", 403)
        
        # Delete transaction
        success = transaction_model.delete_transaction(transaction_id)
        
        if success:
            return success_response(
                message="Transaction deleted successfully"
            )
        else:
            return error_response("Failed to delete transaction", 500)
            
    except Exception as e:
        logger.error(f"Error in delete_transaction: {e}")
        return error_response("Internal server error", 500)

@transaction_bp.route('/statistics', methods=['GET'])
@token_required
def get_statistics(current_user):
    """Get user transaction statistics"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        stats = transaction_model.get_user_statistics(
            current_user['_id'], start_date, end_date
        )
        
        if stats is not None:
            return success_response(
                message="Statistics retrieved successfully",
                data=stats
            )
        else:
            return error_response("Failed to retrieve statistics", 500)
            
    except Exception as e:
        logger.error(f"Error in get_statistics: {e}")
        return error_response("Internal server error", 500)