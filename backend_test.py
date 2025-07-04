#!/usr/bin/env python3
import requests
import json
import sys
import time
from datetime import datetime

# Base URL from frontend/.env
BASE_URL = "https://14474219-8812-4969-a84b-eaf6bc7cd8e8.preview.emergentagent.com/api"

def test_root_endpoint():
    """Test the root endpoint GET /api/"""
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "message" in response.json(), "Response does not contain 'message' field"
        assert response.json()["message"] == "Hello World", f"Expected 'Hello World', got {response.json()['message']}"
        
        print("✅ Root endpoint test passed")
        return True
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
        return False

def test_get_status_checks():
    """Test GET /api/status endpoint"""
    print("\n=== Testing GET Status Checks ===")
    try:
        response = requests.get(f"{BASE_URL}/status")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert isinstance(response.json(), list), "Response is not a list"
        
        # Check structure of each status check
        for status_check in response.json():
            assert "id" in status_check, "Status check missing 'id' field"
            assert "client_name" in status_check, "Status check missing 'client_name' field"
            assert "timestamp" in status_check, "Status check missing 'timestamp' field"
        
        print("✅ GET status checks test passed")
        return True
    except Exception as e:
        print(f"❌ GET status checks test failed: {str(e)}")
        return False

def test_create_status_check():
    """Test POST /api/status endpoint"""
    print("\n=== Testing POST Status Check ===")
    try:
        # Generate a unique client name using timestamp
        client_name = f"test_client_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        payload = {"client_name": client_name}
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(
            f"{BASE_URL}/status", 
            data=json.dumps(payload),
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "id" in response.json(), "Response missing 'id' field"
        assert "client_name" in response.json(), "Response missing 'client_name' field"
        assert "timestamp" in response.json(), "Response missing 'timestamp' field"
        assert response.json()["client_name"] == client_name, f"Expected client_name '{client_name}', got '{response.json()['client_name']}'"
        
        # Verify the status check was saved to MongoDB by retrieving it
        get_response = requests.get(f"{BASE_URL}/status")
        found = False
        for status_check in get_response.json():
            if status_check["client_name"] == client_name:
                found = True
                break
        
        assert found, f"Created status check with client_name '{client_name}' not found in database"
        
        print("✅ POST status check test passed")
        return True
    except Exception as e:
        print(f"❌ POST status check test failed: {str(e)}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n=== Testing CORS Configuration ===")
    try:
        # Test preflight request
        headers = {
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
        
        response = requests.options(f"{BASE_URL}/status", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        assert "access-control-allow-origin" in response.headers, "Response missing 'Access-Control-Allow-Origin' header"
        assert response.headers["access-control-allow-origin"] == "*", f"Expected 'Access-Control-Allow-Origin' to be '*', got '{response.headers['access-control-allow-origin']}'"
        
        print("✅ CORS configuration test passed")
        return True
    except Exception as e:
        print(f"❌ CORS configuration test failed: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n=== Testing Error Handling ===")
    try:
        # Test invalid endpoint
        response = requests.get(f"{BASE_URL}/nonexistent")
        print(f"Invalid endpoint - Status Code: {response.status_code}")
        assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
        
        # Test invalid request body
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            f"{BASE_URL}/status", 
            data=json.dumps({"invalid_field": "value"}),
            headers=headers
        )
        print(f"Invalid request body - Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code in [400, 422], f"Expected status code 400 or 422, got {response.status_code}"
        
        print("✅ Error handling test passed")
        return True
    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result"""
    print("\n=== TransFlow Nexus Backend API Tests ===")
    print(f"Testing API at: {BASE_URL}")
    
    test_results = {
        "Root Endpoint": test_root_endpoint(),
        "GET Status Checks": test_get_status_checks(),
        "POST Status Check": test_create_status_check(),
        "CORS Configuration": test_cors_configuration(),
        "Error Handling": test_error_handling()
    }
    
    print("\n=== Test Summary ===")
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! The backend API is working correctly.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())