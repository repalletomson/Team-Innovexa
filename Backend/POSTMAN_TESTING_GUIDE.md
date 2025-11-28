# 📮 Postman Testing Guide for Finance App Backend

## 🚀 Setup

### 1. Base URL
```
http://localhost:5000
```

### 2. Environment Variables (Optional but Recommended)
Create a Postman Environment with:
- `base_url`: `http://localhost:5000`
- `jwt_token`: (will be set automatically after login)

---

## 🧪 API Testing Flow

### Step 1: Health Check
**Method:** `GET`  
**URL:** `{{base_url}}/`

**Expected Response:**
```json
{
    "success": true,
    "message": "Finance App Backend API is running!",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": "2025-11-27T09:10:00.000000"
    }
}
```

---

### Step 2: User Registration
**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "email": "john.doe@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "user": {
            "_id": "507f1f77bcf86cd799439011",
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "created_at": "2025-11-27T09:10:00.000000",
            "updated_at": "2025-11-27T09:10:00.000000"
        },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

**⚡ Postman Script (Tests tab):**
```javascript
// Save JWT token to environment
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("jwt_token", response.data.token);
        console.log("JWT token saved to environment");
    }
}
```

---

### Step 3: User Login
**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Expected Response:** Same as registration

**⚡ Postman Script (Tests tab):**
```javascript
// Save JWT token to environment
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("jwt_token", response.data.token);
        console.log("JWT token saved to environment");
    }
}
```

---

### Step 4: Get User Profile (Protected)
**Method:** `GET`  
**URL:** `{{base_url}}/api/auth/profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Profile retrieved successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "_id": "507f1f77bcf86cd799439011",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2025-11-27T09:10:00.000000",
        "updated_at": "2025-11-27T09:10:00.000000"
    }
}
```

---

### Step 5: Create Transaction
**Method:** `POST`  
**URL:** `{{base_url}}/api/transactions/`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "title": "Grocery Shopping",
    "amount": 85.50,
    "type": "expense",
    "category": "Food",
    "description": "Weekly groceries at Walmart",
    "date": "2025-11-27"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Transaction created successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "_id": "507f1f77bcf86cd799439012",
        "user_id": "507f1f77bcf86cd799439011",
        "title": "Grocery Shopping",
        "amount": 85.50,
        "type": "expense",
        "category": "Food",
        "description": "Weekly groceries at Walmart",
        "date": "2025-11-27T00:00:00.000000",
        "created_at": "2025-11-27T09:10:00.000000",
        "updated_at": "2025-11-27T09:10:00.000000"
    }
}
```

---

### Step 6: Get Transactions
**Method:** `GET`  
**URL:** `{{base_url}}/api/transactions/?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Query Parameters:**
- `page`: 1
- `limit`: 10
- `type`: expense (optional)
- `category`: Food (optional)
- `search`: grocery (optional)

**Expected Response:**
```json
{
    "success": true,
    "message": "Transactions retrieved successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "transactions": [
            {
                "_id": "507f1f77bcf86cd799439012",
                "user_id": "507f1f77bcf86cd799439011",
                "title": "Grocery Shopping",
                "amount": 85.50,
                "type": "expense",
                "category": "Food",
                "description": "Weekly groceries at Walmart",
                "date": "2025-11-27T00:00:00.000000",
                "created_at": "2025-11-27T09:10:00.000000",
                "updated_at": "2025-11-27T09:10:00.000000"
            }
        ],
        "total_count": 1,
        "page": 1,
        "limit": 10,
        "total_pages": 1
    }
}
```

---

### Step 7: Create Budget
**Method:** `POST`  
**URL:** `{{base_url}}/api/budget/`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "category": "Food",
    "amount": 800,
    "period": "monthly"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Budget created successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "_id": "507f1f77bcf86cd799439013",
        "user_id": "507f1f77bcf86cd799439011",
        "category": "Food",
        "amount": 800,
        "period": "monthly",
        "created_at": "2025-11-27T09:10:00.000000",
        "updated_at": "2025-11-27T09:10:00.000000"
    }
}
```

---

### Step 8: Get Budget Analysis
**Method:** `GET`  
**URL:** `{{base_url}}/api/budget/analysis?period=monthly`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Budget analysis retrieved successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "budgets": [
            {
                "_id": "507f1f77bcf86cd799439013",
                "category": "Food",
                "amount": 800,
                "spent": 85.50,
                "remaining": 714.50,
                "percentage_used": 10.69
            }
        ],
        "summary": {
            "total_budgeted": 800,
            "total_spent": 85.50,
            "total_remaining": 714.50,
            "categories_over_budget": 0,
            "categories_under_budget": 1,
            "overall_percentage": 10.69
        }
    }
}
```

---

### Step 9: ML Financial Insights
**Method:** `GET`  
**URL:** `{{base_url}}/api/ml/financial-insights?include_predictions=true&include_recommendations=true`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Financial insights generated successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "spending_analysis": {
            "category_breakdown": {
                "Food": {
                    "total_spent": 85.50,
                    "transaction_count": 1,
                    "avg_amount": 85.50,
                    "percentage": 100.0
                }
            },
            "insights": [
                {
                    "type": "top_category",
                    "message": "Your highest spending category is Food, accounting for 100.0% of your expenses.",
                    "category": "Food",
                    "amount": 85.50,
                    "percentage": 100.0
                }
            ]
        }
    }
}
```

---

### Step 10: Predict Expenses
**Method:** `POST`  
**URL:** `{{base_url}}/api/ml/predict-expenses`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (JSON):**
```json
{
    "months_ahead": 3,
    "category": "Food"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Expense predictions generated successfully",
    "timestamp": "2025-11-27T09:10:00.000000",
    "status_code": 200,
    "data": {
        "predictions": [
            {
                "month": "2025-12",
                "predicted_amount": 85.50,
                "category": "Food",
                "confidence": 0.5
            },
            {
                "month": "2026-01",
                "predicted_amount": 85.50,
                "category": "Food",
                "confidence": 0.5
            },
            {
                "month": "2026-02",
                "predicted_amount": 85.50,
                "category": "Food",
                "confidence": 0.5
            }
        ],
        "historical_average": 85.50,
        "model_accuracy": 0.5,
        "data_points_used": 1
    }
}
```

---

## 🔧 Postman Collection Setup

### Create Environment Variables:
1. Click "Environments" in Postman
2. Create new environment "Finance App"
3. Add variables:
   - `base_url`: `http://localhost:5000`
   - `jwt_token`: (leave empty, will be set by scripts)

### Import Collection:
You can create a collection with all these requests and use the environment variables.

### Auto-Token Management:
Add this script to the "Tests" tab of login/register requests:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("jwt_token", response.data.token);
        console.log("JWT token saved to environment");
    }
}
```

---

## 🚨 Common Issues & Solutions

### 1. 401 Unauthorized
- **Issue:** Missing or invalid JWT token
- **Solution:** Ensure you're including `Authorization: Bearer {{jwt_token}}` header

### 2. 500 Internal Server Error
- **Issue:** Server error (usually database connection)
- **Solution:** Check if Flask server is running and MongoDB is connected

### 3. 400 Bad Request
- **Issue:** Invalid request data
- **Solution:** Check request body format and required fields

### 4. Token Expired
- **Issue:** JWT token expired (24 hours)
- **Solution:** Login again to get a new token

---

## 📋 Testing Checklist

- [ ] Health check works
- [ ] User registration works and returns JWT token
- [ ] User login works and returns JWT token
- [ ] Protected endpoints work with JWT token
- [ ] Transaction CRUD operations work
- [ ] Budget management works
- [ ] ML insights work
- [ ] Error handling works (try invalid data)

---

## 🎯 Pro Tips

1. **Use Environment Variables** for base URL and JWT token
2. **Save tokens automatically** using Postman scripts
3. **Test error cases** with invalid data
4. **Use Collections** to organize related requests
5. **Add Tests** to validate responses automatically
6. **Use Pre-request Scripts** for dynamic data generation

Happy Testing! 🚀