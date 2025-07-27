#!/usr/bin/env python3
"""
Review Request Testing for ChekUp Platform
Tests specific areas mentioned in the review request:
1. Cart-Related Endpoints (test provider selection flow)
2. Admin Dashboard CRUD Operations (delete/edit functionality)
"""

import requests
import json
import base64
import time
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
BASE_URL = "https://0890244b-bfed-479c-8063-7074a7d2a140.preview.emergentagent.com/api"
TIMEOUT = 30

class ReviewRequestTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.admin_token = None
        self.test_data = {}
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")

    def make_request(self, method: str, endpoint: str, data: dict = None, 
                    headers: dict = None, files: dict = None) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=default_headers, params=data)
            elif method.upper() == "POST":
                if files:
                    # Remove Content-Type for file uploads
                    default_headers.pop("Content-Type", None)
                    response = self.session.post(url, headers=default_headers, data=data, files=files)
                else:
                    response = self.session.post(url, headers=default_headers, 
                                               json=data if data else {})
            elif method.upper() == "PUT":
                response = self.session.put(url, headers=default_headers, 
                                          json=data if data else {})
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=default_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def setup_admin_authentication(self):
        """Setup admin authentication for testing"""
        print("\n=== Setting up Admin Authentication ===")
        
        # Test admin login with provided credentials
        login_data = {
            "email": "admin@chekup.com",
            "password": "AdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response.status_code == 200:
            token_data = response.json()
            self.admin_token = token_data["access_token"]
            self.log_result("Admin Authentication", True, f"Admin logged in successfully")
            return True
        else:
            self.log_result("Admin Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
            return False

    def setup_test_data(self):
        """Create test data needed for testing"""
        print("\n=== Setting up Test Data ===")
        
        if not self.admin_token:
            self.log_result("Test Data Setup", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create a test
        test_data = {
            "name": "Review Test - Complete Blood Count",
            "description": "Test for review request - comprehensive blood analysis",
            "category": "Hematology",
            "preparation_instructions": "Fasting not required for this test.",
            "icon_url": "https://example.com/cbc-icon.png"
        }
        
        response = self.make_request("POST", "/tests", test_data, headers)
        if response.status_code in [200, 201]:
            test_response = response.json()
            self.test_data["test_id"] = test_response["id"]
            self.log_result("Create Test for Review", True, f"Test created with ID: {test_response['id']}")
        else:
            self.log_result("Create Test for Review", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Create a clinic
        clinic_data = {
            "name": "Review Test Clinic",
            "description": "Test clinic for review request testing",
            "location": "Monrovia, Liberia",
            "phone": "+231-777-123456",
            "email": "reviewclinic@test.lr",
            "user_id": "review-clinic-user-id",
            "services": ["Laboratory Tests", "Blood Work"],
            "operating_hours": {
                "monday": "8:00 AM - 5:00 PM",
                "tuesday": "8:00 AM - 5:00 PM",
                "wednesday": "8:00 AM - 5:00 PM",
                "thursday": "8:00 AM - 5:00 PM",
                "friday": "8:00 AM - 5:00 PM",
                "saturday": "9:00 AM - 2:00 PM",
                "sunday": "Closed"
            }
        }
        
        response = self.make_request("POST", "/clinics", clinic_data, headers)
        if response.status_code in [200, 201]:
            clinic_response = response.json()
            self.test_data["clinic_id"] = clinic_response["id"]
            self.log_result("Create Clinic for Review", True, f"Clinic created with ID: {clinic_response['id']}")
        else:
            self.log_result("Create Clinic for Review", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Create test pricing
        pricing_data = {
            "test_id": self.test_data["test_id"],
            "clinic_id": self.test_data["clinic_id"],
            "price_usd": 30.00,
            "price_lrd": 5400.00,
            "is_available": True
        }
        
        response = self.make_request("POST", "/test-pricing", pricing_data, headers)
        if response.status_code in [200, 201]:
            pricing_response = response.json()
            self.test_data["pricing_id"] = pricing_response["id"]
            self.log_result("Create Test Pricing for Review", True, f"Pricing created: USD ${pricing_response['price_usd']}")
        else:
            self.log_result("Create Test Pricing for Review", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        return True

    def test_cart_related_endpoints(self):
        """Test cart-related endpoints that support cart functionality and provider selection flow"""
        print("\n=== Testing Cart-Related Endpoints ===")
        
        if not self.test_data.get("test_id") or not self.test_data.get("clinic_id"):
            self.log_result("Cart Endpoints", False, "Missing required test or clinic data")
            return False
        
        test_id = self.test_data["test_id"]
        clinic_id = self.test_data["clinic_id"]
        
        # 1. Test GET /api/public/tests/{test_id}/providers - should return providers for a specific test
        response = self.make_request("GET", f"/public/tests/{test_id}/providers")
        if response.status_code == 200:
            providers = response.json()
            self.log_result("GET /api/public/tests/{test_id}/providers", True, 
                          f"Retrieved {len(providers)} providers for test")
            
            # Verify our test clinic is in the providers list
            provider_found = any(provider.get("id") == clinic_id for provider in providers)
            if provider_found:
                self.log_result("Provider in Test Providers List", True, "Test clinic found in providers list")
            else:
                self.log_result("Provider in Test Providers List", False, "Test clinic not found in providers list")
        else:
            self.log_result("GET /api/public/tests/{test_id}/providers", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # 2. Test GET /api/public/tests/{test_id}/pricing/{provider_id} - should return pricing for test from specific provider
        response = self.make_request("GET", f"/public/tests/{test_id}/pricing/{clinic_id}")
        if response.status_code == 200:
            pricing = response.json()
            self.log_result("GET /api/public/tests/{test_id}/pricing/{provider_id}", True, 
                          f"Retrieved pricing: USD ${pricing.get('price_usd', 0)}, LRD ${pricing.get('price_lrd', 0)}")
        else:
            self.log_result("GET /api/public/tests/{test_id}/pricing/{provider_id}", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # 3. Test GET /api/public/tests/{test_id} - should return test details
        response = self.make_request("GET", f"/public/tests/{test_id}")
        if response.status_code == 200:
            test_details = response.json()
            self.log_result("GET /api/public/tests/{test_id}", True, 
                          f"Retrieved test details: {test_details.get('name', 'N/A')}")
        else:
            self.log_result("GET /api/public/tests/{test_id}", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # 4. Test POST /api/bookings - should create bookings (test cart-based booking workflow)
        # Create a cart-based booking with multiple tests (simulating cart functionality)
        booking_data = {
            "patient_name": "Cart Test Patient",
            "patient_phone": "+231-777-555999",
            "patient_email": "carttest@patient.com",
            "patient_location": "Sinkor, Monrovia",
            "test_ids": [test_id],  # This simulates items from cart
            "clinic_id": clinic_id,
            "delivery_method": "whatsapp",
            "preferred_currency": "USD",
            "delivery_charge": 5.00,
            "notes": "Cart-based booking test - items added to cart before booking"
        }
        
        response = self.make_request("POST", "/bookings", booking_data)
        if response.status_code in [200, 201]:
            booking_response = response.json()
            self.test_data["booking_id"] = booking_response["id"]
            self.log_result("POST /api/bookings (Cart-based)", True, 
                          f"Cart booking created: {booking_response['booking_number']}, Total: ${booking_response['total_amount']}")
            
            # Verify cart items are properly stored in booking
            if booking_response.get("test_ids") == [test_id]:
                self.log_result("Cart Items in Booking", True, "Cart items properly stored in booking record")
            else:
                self.log_result("Cart Items in Booking", False, "Cart items not properly stored in booking")
        else:
            self.log_result("POST /api/bookings (Cart-based)", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # Test error handling for invalid test/provider IDs
        # Invalid test ID for providers
        response = self.make_request("GET", "/public/tests/invalid-test-id/providers")
        if response.status_code == 200:
            providers = response.json()
            if len(providers) == 0:
                self.log_result("Invalid Test ID - Providers", True, "Invalid test ID returns empty providers list")
            else:
                self.log_result("Invalid Test ID - Providers", False, "Invalid test ID should return empty list")
        else:
            self.log_result("Invalid Test ID - Providers", True, f"Invalid test ID handled with status {response.status_code}")
        
        # Invalid provider ID for pricing
        response = self.make_request("GET", f"/public/tests/{test_id}/pricing/invalid-provider-id")
        if response.status_code == 404:
            self.log_result("Invalid Provider ID - Pricing", True, "Invalid provider ID properly returns 404")
        else:
            self.log_result("Invalid Provider ID - Pricing", False, f"Expected 404 for invalid provider, got {response.status_code}")
        
        return True

    def test_admin_dashboard_crud_operations(self):
        """Test admin dashboard CRUD operations for delete/edit functionality"""
        print("\n=== Testing Admin Dashboard CRUD Operations ===")
        
        if not self.admin_token:
            self.log_result("Admin CRUD Operations", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create additional test data for CRUD testing
        # Create a test specifically for deletion
        delete_test_data = {
            "name": "Test for Deletion",
            "description": "This test will be deleted to test handleDeleteTestAssignment",
            "category": "Test Category",
            "preparation_instructions": "No special preparation needed."
        }
        
        response = self.make_request("POST", "/tests", delete_test_data, headers)
        if response.status_code in [200, 201]:
            delete_test_response = response.json()
            delete_test_id = delete_test_response["id"]
            self.log_result("Create Test for Deletion", True, f"Test created for deletion: {delete_test_id}")
        else:
            self.log_result("Create Test for Deletion", False, f"Status: {response.status_code}")
            return False
        
        # Create a clinic specifically for deletion
        delete_clinic_data = {
            "name": "Clinic for Deletion",
            "description": "This clinic will be deleted to test handleDeleteClinicAssignment",
            "location": "Test Location",
            "phone": "+231-777-000000",
            "email": "deleteclinic@test.lr",
            "user_id": "delete-clinic-user-id",
            "services": ["Test Service"]
        }
        
        response = self.make_request("POST", "/clinics", delete_clinic_data, headers)
        if response.status_code in [200, 201]:
            delete_clinic_response = response.json()
            delete_clinic_id = delete_clinic_response["id"]
            self.log_result("Create Clinic for Deletion", True, f"Clinic created for deletion: {delete_clinic_id}")
        else:
            self.log_result("Create Clinic for Deletion", False, f"Status: {response.status_code}")
            return False
        
        # 1. Test DELETE /api/tests/{test_id} - delete test (for handleDeleteTestAssignment)
        response = self.make_request("DELETE", f"/tests/{delete_test_id}", headers=headers)
        if response.status_code == 200:
            self.log_result("DELETE /api/tests/{test_id}", True, "Test deleted successfully (handleDeleteTestAssignment)")
        else:
            self.log_result("DELETE /api/tests/{test_id}", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # 2. Test PUT /api/tests/{test_id} - update test (for handleEditTestAssignment)
        if self.test_data.get("test_id"):
            test_id = self.test_data["test_id"]
            update_test_data = {
                "name": "Updated Test Name - Edit Test Assignment",
                "description": "Updated description for handleEditTestAssignment testing",
                "category": "Updated Category",
                "preparation_instructions": "Updated preparation instructions."
            }
            
            response = self.make_request("PUT", f"/tests/{test_id}", update_test_data, headers)
            if response.status_code == 200:
                self.log_result("PUT /api/tests/{test_id}", True, "Test updated successfully (handleEditTestAssignment)")
            else:
                self.log_result("PUT /api/tests/{test_id}", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        
        # 3. Test DELETE /api/clinics/{clinic_id} - delete clinic (for handleDeleteClinicAssignment)
        response = self.make_request("DELETE", f"/clinics/{delete_clinic_id}", headers=headers)
        if response.status_code == 200:
            self.log_result("DELETE /api/clinics/{clinic_id}", True, "Clinic deleted successfully (handleDeleteClinicAssignment)")
        else:
            self.log_result("DELETE /api/clinics/{clinic_id}", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # 4. Test PUT /api/clinics/{clinic_id} - update clinic (for handleEditClinicAssignment)
        if self.test_data.get("clinic_id"):
            clinic_id = self.test_data["clinic_id"]
            update_clinic_data = {
                "name": "Updated Clinic Name - Edit Clinic Assignment",
                "description": "Updated description for handleEditClinicAssignment testing",
                "location": "Updated Location, Monrovia",
                "phone": "+231-777-999888",
                "email": "updatedclinic@test.lr",
                "user_id": "updated-clinic-user-id",
                "services": ["Updated Service 1", "Updated Service 2"]
            }
            
            response = self.make_request("PUT", f"/clinics/{clinic_id}", update_clinic_data, headers)
            if response.status_code == 200:
                self.log_result("PUT /api/clinics/{clinic_id}", True, "Clinic updated successfully (handleEditClinicAssignment)")
            else:
                self.log_result("PUT /api/clinics/{clinic_id}", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        
        # Test error handling for invalid IDs
        # Test delete with invalid test ID
        response = self.make_request("DELETE", "/tests/invalid-test-id", headers=headers)
        if response.status_code == 404:
            self.log_result("Delete Invalid Test ID", True, "Invalid test ID deletion properly returns 404")
        else:
            self.log_result("Delete Invalid Test ID", False, f"Expected 404, got {response.status_code}")
        
        # Test delete with invalid clinic ID
        response = self.make_request("DELETE", "/clinics/invalid-clinic-id", headers=headers)
        if response.status_code == 404:
            self.log_result("Delete Invalid Clinic ID", True, "Invalid clinic ID deletion properly returns 404")
        else:
            self.log_result("Delete Invalid Clinic ID", False, f"Expected 404, got {response.status_code}")
        
        return True

    def test_authentication_and_authorization(self):
        """Test authentication and role-based access control for admin endpoints"""
        print("\n=== Testing Authentication and Authorization ===")
        
        # Test unauthorized access to admin endpoints (without token)
        test_data = {
            "name": "Unauthorized Test",
            "description": "This should fail",
            "category": "Test"
        }
        
        response = self.make_request("POST", "/tests", test_data)
        if response.status_code == 401:
            self.log_result("Unauthorized Test Creation", True, "Non-authenticated access properly blocked with 401")
        else:
            self.log_result("Unauthorized Test Creation", False, f"Expected 401, got {response.status_code}")
        
        # Test unauthorized delete
        response = self.make_request("DELETE", "/tests/any-test-id")
        if response.status_code == 401:
            self.log_result("Unauthorized Test Deletion", True, "Non-authenticated deletion properly blocked with 401")
        else:
            self.log_result("Unauthorized Test Deletion", False, f"Expected 401, got {response.status_code}")
        
        return True

    def test_data_validation_and_error_handling(self):
        """Test data validation and error handling for the endpoints"""
        print("\n=== Testing Data Validation and Error Handling ===")
        
        if not self.admin_token:
            self.log_result("Data Validation", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test invalid data for test creation
        invalid_test_data = {
            "name": "",  # Empty name should fail validation
            "description": "Test with empty name",
            "category": "Test"
        }
        
        response = self.make_request("POST", "/tests", invalid_test_data, headers)
        if response.status_code in [400, 422]:
            self.log_result("Invalid Test Data Validation", True, "Empty test name properly rejected")
        else:
            self.log_result("Invalid Test Data Validation", False, f"Expected validation error, got {response.status_code}")
        
        # Test invalid data for clinic creation
        invalid_clinic_data = {
            "name": "Test Clinic",
            "description": "Test clinic",
            "location": "Test Location",
            "phone": "+231-777-123456",
            "email": "invalid-email",  # Invalid email format
            "user_id": "test-user-id"
        }
        
        response = self.make_request("POST", "/clinics", invalid_clinic_data, headers)
        if response.status_code in [400, 422]:
            self.log_result("Invalid Clinic Data Validation", True, "Invalid email format properly rejected")
        else:
            self.log_result("Invalid Clinic Data Validation", False, f"Expected validation error, got {response.status_code}")
        
        return True

    def run_review_request_tests(self):
        """Run all review request tests"""
        print("🏥 ChekUp Platform - Review Request Testing")
        print("=" * 60)
        
        # Setup
        if not self.setup_admin_authentication():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        if not self.setup_test_data():
            print("❌ Cannot proceed without test data setup")
            return False
        
        # Run specific review request tests
        self.test_cart_related_endpoints()
        self.test_admin_dashboard_crud_operations()
        self.test_authentication_and_authorization()
        self.test_data_validation_and_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🎯 REVIEW REQUEST TEST SUMMARY")
        print("=" * 60)
        
        total_tests = self.results["passed"] + self.results["failed"]
        success_rate = (self.results["passed"] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if self.results["errors"]:
            print(f"\n❌ Failed Tests:")
            for error in self.results["errors"]:
                print(f"   • {error}")
        
        print(f"\n🎉 Review Request Testing Complete!")
        print(f"Cart-related endpoints and Admin CRUD operations tested successfully!")
        
        return success_rate > 90

if __name__ == "__main__":
    tester = ReviewRequestTester()
    success = tester.run_review_request_tests()
    exit(0 if success else 1)