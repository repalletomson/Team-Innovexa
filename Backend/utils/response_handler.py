from flask import jsonify
from datetime import datetime

def success_response(message="Success", data=None, status_code=200):
    """Standard success response format"""
    response = {
        "success": True,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "status_code": status_code
    }
    
    if data is not None:
        response["data"] = data
    
    return jsonify(response), status_code

def error_response(message="Error occurred", status_code=400, error_code=None):
    """Standard error response format"""
    response = {
        "success": False,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "status_code": status_code
    }
    
    if error_code:
        response["error_code"] = error_code
    
    return jsonify(response), status_code

def paginated_response(data, page, limit, total_count, message="Data retrieved successfully"):
    """Standard paginated response format"""
    total_pages = (total_count + limit - 1) // limit
    
    response_data = {
        "items": data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }
    
    return success_response(message, response_data)