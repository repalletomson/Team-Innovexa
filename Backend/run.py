#!/usr/bin/env python3
"""
Flask Application Runner
Run this file to start the Flask development server
"""

import os
from app import app

if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Get configuration from environment
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting Finance App Backend on {host}:{port}")
    print(f"📊 Debug mode: {debug}")
    print(f"🗄️  Database: {os.environ.get('MONGO_URI', 'mongodb://localhost:27017/financeapp')}")
    
    app.run(host=host, port=port, debug=debug)