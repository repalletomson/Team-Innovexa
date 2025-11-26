import re
from datetime import datetime

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_user_data(data, is_update=False):
    """Validate user registration/update data"""
    errors = []
    
    if not is_update:
        # Required fields for registration
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                errors.append(f"{field} is required")
    
    # Email validation
    if data.get('email'):
        if not validate_email(data['email']):
            errors.append("Invalid email format")
    
    # Password validation
    if data.get('password'):
        if len(data['password']) < 6:
            errors.append("Password must be at least 6 characters long")
    
    # Name validation
    if data.get('first_name'):
        if len(data['first_name'].strip()) < 2:
            errors.append("First name must be at least 2 characters long")
    
    if data.get('last_name'):
        if len(data['last_name'].strip()) < 2:
            errors.append("Last name must be at least 2 characters long")
    
    return "; ".join(errors) if errors else None

def validate_login_data(data):
    """Validate login data"""
    errors = []
    
    if not data.get('email'):
        errors.append("Email is required")
    elif not validate_email(data['email']):
        errors.append("Invalid email format")
    
    if not data.get('password'):
        errors.append("Password is required")
    
    return "; ".join(errors) if errors else None

def validate_transaction_data(data, is_update=False):
    """Validate transaction data"""
    errors = []
    
    if not is_update:
        # Required fields for creation
        required_fields = ['title', 'amount', 'type', 'category']
        for field in required_fields:
            if not data.get(field):
                errors.append(f"{field} is required")
    
    # Amount validation
    if data.get('amount') is not None:
        try:
            amount = float(data['amount'])
            if amount <= 0:
                errors.append("Amount must be greater than 0")
        except (ValueError, TypeError):
            errors.append("Amount must be a valid number")
    
    # Type validation
    if data.get('type'):
        valid_types = ['income', 'expense']
        if data['type'] not in valid_types:
            errors.append(f"Type must be one of: {', '.join(valid_types)}")
    
    # Category validation
    if data.get('category'):
        valid_categories = [
            'Food', 'Transportation', 'Entertainment', 'Utilities', 
            'Healthcare', 'Shopping', 'Income', 'Other'
        ]
        if data['category'] not in valid_categories:
            errors.append(f"Category must be one of: {', '.join(valid_categories)}")
    
    # Date validation
    if data.get('date'):
        try:
            if isinstance(data['date'], str):
                datetime.fromisoformat(data['date'])
        except ValueError:
            errors.append("Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    return "; ".join(errors) if errors else None

def validate_budget_data(data, is_update=False):
    """Validate budget data"""
    errors = []
    
    if not is_update:
        # Required fields for creation
        required_fields = ['category', 'amount', 'period']
        for field in required_fields:
            if not data.get(field):
                errors.append(f"{field} is required")
    
    # Amount validation
    if data.get('amount') is not None:
        try:
            amount = float(data['amount'])
            if amount <= 0:
                errors.append("Budget amount must be greater than 0")
        except (ValueError, TypeError):
            errors.append("Budget amount must be a valid number")
    
    # Period validation
    if data.get('period'):
        valid_periods = ['weekly', 'monthly', 'yearly']
        if data['period'] not in valid_periods:
            errors.append(f"Period must be one of: {', '.join(valid_periods)}")
    
    # Category validation
    if data.get('category'):
        valid_categories = [
            'Food', 'Transportation', 'Entertainment', 'Utilities', 
            'Healthcare', 'Shopping', 'Other'
        ]
        if data['category'] not in valid_categories:
            errors.append(f"Category must be one of: {', '.join(valid_categories)}")
    
    return "; ".join(errors) if errors else None