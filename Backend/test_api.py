#!/usr/bin/env python3
"""
API Testing Script
Quick script to test the Flask backend APIs
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER = {
    "email": "tt0234240@gmail.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
}

class APITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.headers = {"Content-Type": "application/json"}
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("🏥 Testing health check...")
        try:
            response = requests.get(f"{self.base_url}/")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False
    
    def test_register(self):
        """Test user registration"""
        print("\n👤 Testing user registration...")
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                headers=self.headers,
                data=json.dumps(TEST_USER)
            )
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get('success'):
                self.token = result['data']['token']
                self.headers['Authorization'] = f"Bearer {self.token}"
                print("✅ Registration successful")
                return True
            else:
                print("❌ Registration failed")
                return False
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return False
    
    def test_login(self):
        """Test user login"""
        print("\n🔐 Testing user login...")
        try:
            login_data = {
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                headers=self.headers,
                data=json.dumps(login_data)
            )
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get('success'):
                self.token = result['data']['token']
                self.headers['Authorization'] = f"Bearer {self.token}"
                print("✅ Login successful")
                return True
            else:
                print("❌ Login failed")
                return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def test_create_transaction(self):
        """Test transaction creation"""
        print("\n💰 Testing transaction creation...")
        try:
            transaction_data = {
                "title": "Test Grocery Shopping",
                "amount": 85.50,
                "type": "expense",
                "category": "Food",
                "description": "Weekly groceries for testing",
                "date": datetime.now().isoformat()
            }
            response = requests.post(
                f"{self.base_url}/api/transactions/",
                headers=self.headers,
                data=json.dumps(transaction_data)
            )
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get('success'):
                print("✅ Transaction creation successful")
                return result['data']['_id']
            else:
                print("❌ Transaction creation failed")
                return None
        except Exception as e:
            print(f"❌ Transaction creation error: {e}")
            return None
    
    def test_get_transactions(self):
        """Test getting transactions"""
        print("\n📋 Testing get transactions...")
        try:
            response = requests.get(
                f"{self.base_url}/api/transactions/?page=1&limit=10",
                headers=self.headers
            )
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get('success'):
                print("✅ Get transactions successful")
                return True
            else:
                print("❌ Get transactions failed")
                return False
        except Exception as e:
            print(f"❌ Get transactions error: {e}")
            return False
    
    def test_create_budget(self):
        """Test budget creation"""
        print("\n📊 Testing budget creation...")
        try:
            budget_data = {
                "category": "Food",
                "amount": 800,
                "period": "monthly"
            }
            response = requests.post(
                f"{self.base_url}/api/budget/",
                headers=self.headers,
                data=json.dumps(budget_data)
            )
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get('success'):
                print("✅ Budget creation successful")
                return result['data']['_id']
            else:
                print("❌ Budget creation failed")
                return None
        except Exception as e:
            print(f"❌ Budget creation error: {e}")
            return None
    
    def test_ml_insights(self):
        """Test ML financial insights"""
        print("\n🤖 Testing ML financial insights...")
        try:
            response = requests.get(
                f"{self.base_url}/api/ml/financial-insights",
                headers=self.headers
            )
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get('success'):
                print("✅ ML insights successful")
                return True
            else:
                print("❌ ML insights failed")
                return False
        except Exception as e:
            print(f"❌ ML insights error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting API Tests...\n")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_register),
            ("User Login", self.test_login),
            ("Create Transaction", self.test_create_transaction),
            ("Get Transactions", self.test_get_transactions),
            ("Create Budget", self.test_create_budget),
            ("ML Insights", self.test_ml_insights),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {e}")
                results.append((test_name, False))
        
        # Print summary
        print("\n" + "="*50)
        print("📊 TEST SUMMARY")
        print("="*50)
        
        passed = 0
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
            if result:
                passed += 1
        
        print(f"\nTotal: {len(results)} tests")
        print(f"Passed: {passed}")
        print(f"Failed: {len(results) - passed}")
        print(f"Success Rate: {(passed/len(results)*100):.1f}%")

if __name__ == "__main__":
    tester = APITester(BASE_URL)
    tester.run_all_tests()