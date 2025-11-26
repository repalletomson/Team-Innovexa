#!/usr/bin/env python3
"""
Quick Setup Script for Finance App Backend
Run this to set up the backend quickly for hackathons
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def setup_virtual_environment():
    """Set up Python virtual environment"""
    if not os.path.exists('venv'):
        return run_command('python -m venv venv', 'Creating virtual environment')
    else:
        print("✅ Virtual environment already exists")
        return True

def install_dependencies():
    """Install Python dependencies"""
    # Determine the correct pip command based on OS
    if os.name == 'nt':  # Windows
        pip_cmd = 'venv\\Scripts\\pip'
    else:  # Unix/Linux/macOS
        pip_cmd = 'venv/bin/pip'
    
    return run_command(f'{pip_cmd} install -r requirements.txt', 'Installing dependencies')

def setup_environment_file():
    """Set up environment configuration"""
    if not os.path.exists('.env'):
        if os.path.exists('.env.example'):
            run_command('cp .env.example .env', 'Creating environment file')
            print("📝 Please edit .env file with your configuration")
            return True
        else:
            print("❌ .env.example file not found")
            return False
    else:
        print("✅ Environment file already exists")
        return True

def create_directories():
    """Create necessary directories"""
    directories = ['ml_models', 'uploads', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✅ Created necessary directories")
    return True

def check_mongodb():
    """Check if MongoDB is accessible"""
    try:
        import pymongo
        client = pymongo.MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
        client.server_info()
        print("✅ MongoDB connection successful")
        return True
    except Exception as e:
        print(f"⚠️  MongoDB not accessible: {e}")
        print("💡 You can:")
        print("   - Install MongoDB locally")
        print("   - Use MongoDB Atlas (cloud)")
        print("   - Update MONGO_URI in .env file")
        return False

def main():
    """Main setup function"""
    print("🚀 Finance App Backend Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Setup steps
    steps = [
        ("Virtual Environment", setup_virtual_environment),
        ("Dependencies", install_dependencies),
        ("Environment File", setup_environment_file),
        ("Directories", create_directories),
        ("MongoDB Connection", check_mongodb),
    ]
    
    success_count = 0
    for step_name, step_func in steps:
        if step_func():
            success_count += 1
        print()
    
    # Summary
    print("=" * 40)
    print("📊 Setup Summary")
    print("=" * 40)
    print(f"Completed: {success_count}/{len(steps)} steps")
    
    if success_count == len(steps):
        print("🎉 Setup completed successfully!")
        print("\n🚀 Next steps:")
        print("1. Edit .env file with your configuration")
        print("2. Run: python run.py")
        print("3. Test API: python test_api.py")
    else:
        print("⚠️  Setup completed with some issues")
        print("Please resolve the issues above before running the application")
    
    print("\n📚 Documentation: README.md")
    print("🔧 Configuration: .env")
    print("🧪 Testing: test_api.py")

if __name__ == "__main__":
    main()