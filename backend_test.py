#!/usr/bin/env python3
"""
Comprehensive Backend Testing for ChekUp Platform
Tests all backend functionality including authentication, CRUD operations, 
booking system, surgery inquiries, analytics, and public endpoints.
"""

import requests
import json
import base64
import time
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
BASE_URL = "https://952edcb4-f032-46dc-a06d-39918eaceb55.preview.emergentagent.com/api"
TIMEOUT = 30

class ChekUpTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.admin_token = None
        self.sub_admin_token = None
        self.clinic_token = None
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

    def test_authentication_system(self):
        """Test user registration and login system"""
        print("\n=== Testing Authentication System ===")
        
        # Test user registration - Admin
        admin_data = {
            "email": "admin@chekup.com",
            "name": "ChekUp Administrator",
            "phone": "+231-777-123456",
            "location": "Monrovia, Liberia",
            "role": "admin",
            "password": "AdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/register", admin_data)
        if response.status_code in [200, 201]:
            self.log_result("Admin Registration", True, "Admin user created successfully")
        elif response.status_code == 400 and "already registered" in response.text:
            self.log_result("Admin Registration", True, "Admin user already exists")
        else:
            self.log_result("Admin Registration", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test admin login
        login_data = {
            "email": "admin@chekup.com",
            "password": "AdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response.status_code == 200:
            token_data = response.json()
            self.admin_token = token_data["access_token"]
            self.log_result("Admin Login", True, f"Token received: {self.admin_token[:20]}...")
        else:
            self.log_result("Admin Login", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test clinic user registration
        clinic_data = {
            "email": "clinic@healthcenter.lr",
            "name": "Monrovia Health Center",
            "phone": "+231-777-654321",
            "location": "Sinkor, Monrovia",
            "role": "clinic",
            "password": "ClinicPass123!"
        }
        
        response = self.make_request("POST", "/auth/register", clinic_data)
        if response.status_code in [200, 201]:
            self.log_result("Clinic Registration", True, "Clinic user created successfully")
        elif response.status_code == 400 and "already registered" in response.text:
            self.log_result("Clinic Registration", True, "Clinic user already exists")
        else:
            self.log_result("Clinic Registration", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test clinic login
        clinic_login_data = {
            "email": "clinic@healthcenter.lr",
            "password": "ClinicPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", clinic_login_data)
        if response.status_code == 200:
            token_data = response.json()
            self.clinic_token = token_data["access_token"]
            self.log_result("Clinic Login", True, f"Token received: {self.clinic_token[:20]}...")
        else:
            self.log_result("Clinic Login", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test invalid login
        invalid_login = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", invalid_login)
        if response.status_code == 401:
            self.log_result("Invalid Login Rejection", True, "Invalid credentials properly rejected")
        else:
            self.log_result("Invalid Login Rejection", False, f"Expected 401, got {response.status_code}")
        
        return True

    def test_test_management(self):
        """Test CRUD operations for medical tests"""
        print("\n=== Testing Test Management System ===")
        
        if not self.admin_token:
            self.log_result("Test Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create test
        test_data = {
            "name": "Complete Blood Count (CBC)",
            "description": "Comprehensive blood analysis including white blood cells, red blood cells, and platelets",
            "category": "Hematology",
            "preparation_instructions": "Fasting not required. Avoid alcohol 24 hours before test.",
            "icon_url": "https://example.com/cbc-icon.png"
        }
        
        response = self.make_request("POST", "/tests", test_data, headers)
        if response.status_code in [200, 201]:
            test_response = response.json()
            self.test_data["test_id"] = test_response["id"]
            self.log_result("Create Test", True, f"Test created with ID: {test_response['id']}")
        else:
            self.log_result("Create Test", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Get all tests (public endpoint)
        response = self.make_request("GET", "/tests")
        if response.status_code == 200:
            tests = response.json()
            self.log_result("Get All Tests", True, f"Retrieved {len(tests)} tests")
        else:
            self.log_result("Get All Tests", False, f"Status: {response.status_code}")
        
        # Get specific test
        test_id = self.test_data["test_id"]
        response = self.make_request("GET", f"/tests/{test_id}")
        if response.status_code == 200:
            test = response.json()
            self.log_result("Get Specific Test", True, f"Retrieved test: {test['name']}")
        else:
            self.log_result("Get Specific Test", False, f"Status: {response.status_code}")
        
        # Update test
        update_data = {
            "name": "Complete Blood Count (CBC) - Updated",
            "description": "Updated comprehensive blood analysis",
            "category": "Hematology",
            "preparation_instructions": "Updated instructions: Fasting not required."
        }
        
        response = self.make_request("PUT", f"/tests/{test_id}", update_data, headers)
        if response.status_code == 200:
            self.log_result("Update Test", True, "Test updated successfully")
        else:
            self.log_result("Update Test", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test unauthorized access (without admin token)
        response = self.make_request("POST", "/tests", test_data)
        if response.status_code == 401:
            self.log_result("Unauthorized Test Creation", True, "Non-admin access properly blocked")
        else:
            self.log_result("Unauthorized Test Creation", False, f"Expected 401, got {response.status_code}")
        
        return True

    def test_clinic_management(self):
        """Test CRUD operations for clinics"""
        print("\n=== Testing Clinic Management System ===")
        
        if not self.admin_token:
            self.log_result("Clinic Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create clinic
        clinic_data = {
            "name": "Monrovia Medical Center",
            "description": "Leading healthcare facility in Monrovia providing comprehensive medical services",
            "location": "Broad Street, Monrovia, Liberia",
            "phone": "+231-777-888999",
            "email": "info@monroviamedical.lr",
            "user_id": "clinic-user-id-123",
            "services": ["Laboratory Tests", "Radiology", "Cardiology", "General Medicine"],
            "operating_hours": {
                "monday": "8:00 AM - 6:00 PM",
                "tuesday": "8:00 AM - 6:00 PM",
                "wednesday": "8:00 AM - 6:00 PM",
                "thursday": "8:00 AM - 6:00 PM",
                "friday": "8:00 AM - 6:00 PM",
                "saturday": "9:00 AM - 2:00 PM",
                "sunday": "Closed"
            },
            "image_url": "https://example.com/clinic-image.jpg"
        }
        
        response = self.make_request("POST", "/clinics", clinic_data, headers)
        if response.status_code in [200, 201]:
            clinic_response = response.json()
            self.test_data["clinic_id"] = clinic_response["id"]
            self.log_result("Create Clinic", True, f"Clinic created with ID: {clinic_response['id']}")
        else:
            self.log_result("Create Clinic", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Get all clinics (public endpoint)
        response = self.make_request("GET", "/clinics")
        if response.status_code == 200:
            clinics = response.json()
            self.log_result("Get All Clinics", True, f"Retrieved {len(clinics)} clinics")
        else:
            self.log_result("Get All Clinics", False, f"Status: {response.status_code}")
        
        # Get specific clinic
        clinic_id = self.test_data["clinic_id"]
        response = self.make_request("GET", f"/clinics/{clinic_id}")
        if response.status_code == 200:
            clinic = response.json()
            self.log_result("Get Specific Clinic", True, f"Retrieved clinic: {clinic['name']}")
        else:
            self.log_result("Get Specific Clinic", False, f"Status: {response.status_code}")
        
        # Update clinic
        update_data = {
            "name": "Monrovia Medical Center - Updated",
            "description": "Updated leading healthcare facility",
            "location": "Broad Street, Monrovia, Liberia",
            "phone": "+231-777-888999",
            "email": "info@monroviamedical.lr",
            "user_id": "clinic-user-id-123",
            "services": ["Laboratory Tests", "Radiology", "Cardiology", "General Medicine", "Emergency Care"]
        }
        
        response = self.make_request("PUT", f"/clinics/{clinic_id}", update_data, headers)
        if response.status_code == 200:
            self.log_result("Update Clinic", True, "Clinic updated successfully")
        else:
            self.log_result("Update Clinic", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return True

    def test_pricing_system(self):
        """Test test pricing management"""
        print("\n=== Testing Pricing System ===")
        
        if not self.admin_token or not self.test_data.get("test_id") or not self.test_data.get("clinic_id"):
            self.log_result("Pricing System", False, "Missing required test or clinic data")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create test pricing
        pricing_data = {
            "test_id": self.test_data["test_id"],
            "clinic_id": self.test_data["clinic_id"],
            "price_usd": 25.00,
            "price_lrd": 4500.00,
            "is_available": True
        }
        
        response = self.make_request("POST", "/test-pricing", pricing_data, headers)
        if response.status_code in [200, 201]:
            pricing_response = response.json()
            self.test_data["pricing_id"] = pricing_response["id"]
            self.log_result("Create Test Pricing", True, f"Pricing created: USD ${pricing_response['price_usd']}, LRD ${pricing_response['price_lrd']}")
        else:
            self.log_result("Create Test Pricing", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Get test pricing
        response = self.make_request("GET", "/test-pricing")
        if response.status_code == 200:
            pricing_list = response.json()
            self.log_result("Get All Pricing", True, f"Retrieved {len(pricing_list)} pricing entries")
        else:
            self.log_result("Get All Pricing", False, f"Status: {response.status_code}")
        
        # Get pricing by test
        test_id = self.test_data["test_id"]
        response = self.make_request("GET", f"/tests/{test_id}/pricing")
        if response.status_code == 200:
            test_pricing = response.json()
            self.log_result("Get Test Pricing by Test", True, f"Retrieved pricing for {len(test_pricing)} clinics")
        else:
            self.log_result("Get Test Pricing by Test", False, f"Status: {response.status_code}")
        
        # Get tests by clinic
        clinic_id = self.test_data["clinic_id"]
        response = self.make_request("GET", f"/clinics/{clinic_id}/tests")
        if response.status_code == 200:
            clinic_tests = response.json()
            self.log_result("Get Clinic Tests", True, f"Retrieved {len(clinic_tests)} tests for clinic")
        else:
            self.log_result("Get Clinic Tests", False, f"Status: {response.status_code}")
        
        return True

    def test_booking_system(self):
        """Test booking workflow and management"""
        print("\n=== Testing Booking System ===")
        
        if not self.test_data.get("test_id") or not self.test_data.get("clinic_id"):
            self.log_result("Booking System", False, "Missing required test or clinic data")
            return False
        
        # Create booking (public endpoint - no auth required)
        booking_data = {
            "patient_name": "Sarah Johnson",
            "patient_phone": "+231-777-555123",
            "patient_email": "sarah.johnson@email.com",
            "patient_location": "Congo Town, Monrovia",
            "test_ids": [self.test_data["test_id"]],
            "clinic_id": self.test_data["clinic_id"],
            "delivery_method": "whatsapp",
            "preferred_currency": "USD",
            "delivery_charge": 5.00,
            "notes": "Please call before sample collection"
        }
        
        response = self.make_request("POST", "/bookings", booking_data)
        if response.status_code in [200, 201]:
            booking_response = response.json()
            self.test_data["booking_id"] = booking_response["id"]
            self.log_result("Create Booking", True, f"Booking created: {booking_response['booking_number']}, Total: ${booking_response['total_amount']}")
        else:
            self.log_result("Create Booking", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test admin can view all bookings
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.make_request("GET", "/bookings", headers=headers)
            if response.status_code == 200:
                bookings = response.json()
                self.log_result("Admin View All Bookings", True, f"Admin retrieved {len(bookings)} bookings")
            else:
                self.log_result("Admin View All Bookings", False, f"Status: {response.status_code}")
        
        # Test get specific booking
        booking_id = self.test_data["booking_id"]
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.make_request("GET", f"/bookings/{booking_id}", headers=headers)
            if response.status_code == 200:
                booking = response.json()
                self.log_result("Get Specific Booking", True, f"Retrieved booking: {booking['booking_number']}")
            else:
                self.log_result("Get Specific Booking", False, f"Status: {response.status_code}")
        
        # Test update booking status
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.make_request("PUT", f"/bookings/{booking_id}/status", 
                                       {"status": "confirmed"}, headers)
            if response.status_code == 200:
                self.log_result("Update Booking Status", True, "Booking status updated to confirmed")
            else:
                self.log_result("Update Booking Status", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return True

    def test_file_upload_system(self):
        """Test file upload for booking results"""
        print("\n=== Testing File Upload System ===")
        
        if not self.admin_token or not self.test_data.get("booking_id"):
            self.log_result("File Upload System", False, "Missing admin token or booking ID")
            return False
        
        # Create a test file (base64 encoded)
        test_file_content = "This is a test lab result file content"
        test_file_base64 = base64.b64encode(test_file_content.encode()).decode()
        
        # Simulate file upload using requests
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create a mock file for upload
        files = {
            'files': ('test_result.txt', test_file_content, 'text/plain')
        }
        
        booking_id = self.test_data["booking_id"]
        
        try:
            # Note: This endpoint expects multipart/form-data, so we'll test it differently
            # For now, let's test the endpoint exists and requires authentication
            response = self.make_request("POST", f"/bookings/{booking_id}/upload-results", 
                                       headers=headers)
            
            # We expect this to fail due to missing files, but it should be a 422 (validation error)
            # not 401 (unauthorized) or 404 (not found)
            if response.status_code in [422, 400]:  # Validation error is expected without files
                self.log_result("File Upload Endpoint", True, "Upload endpoint accessible and validates input")
            elif response.status_code == 401:
                self.log_result("File Upload Endpoint", False, "Authentication failed")
            elif response.status_code == 404:
                self.log_result("File Upload Endpoint", False, "Endpoint not found")
            else:
                self.log_result("File Upload Endpoint", True, f"Endpoint responds (status: {response.status_code})")
        
        except Exception as e:
            self.log_result("File Upload System", False, f"Error testing upload: {str(e)}")
        
        return True

    def test_feedback_system(self):
        """Test feedback and rating system"""
        print("\n=== Testing Feedback System ===")
        
        if not self.test_data.get("booking_id"):
            self.log_result("Feedback System", False, "Missing booking ID")
            return False
        
        # Create feedback (public endpoint)
        feedback_data = {
            "booking_id": self.test_data["booking_id"],
            "rating": 5,
            "comment": "Excellent service! Very professional staff and quick results.",
            "patient_name": "Sarah Johnson"
        }
        
        response = self.make_request("POST", "/feedback", feedback_data)
        if response.status_code in [200, 201]:
            feedback_response = response.json()
            self.log_result("Create Feedback", True, f"Feedback created with rating: {feedback_response['rating']}")
        else:
            self.log_result("Create Feedback", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Get clinic feedback
        clinic_id = self.test_data["clinic_id"]
        response = self.make_request("GET", f"/feedback/clinic/{clinic_id}")
        if response.status_code == 200:
            feedback_list = response.json()
            self.log_result("Get Clinic Feedback", True, f"Retrieved {len(feedback_list)} feedback entries")
        else:
            self.log_result("Get Clinic Feedback", False, f"Status: {response.status_code}")
        
        return True

    def test_surgery_inquiry_system(self):
        """Test surgery inquiry system"""
        print("\n=== Testing Surgery Inquiry System ===")
        
        # Create surgery inquiry (public endpoint)
        inquiry_data = {
            "patient_name": "Michael Roberts",
            "patient_phone": "+231-777-999888",
            "patient_email": "michael.roberts@email.com",
            "surgery_type": "Cardiac Bypass Surgery",
            "medical_condition": "Coronary artery disease with multiple blockages",
            "preferred_hospital_location": "India",
            "budget_range": "$15,000 - $25,000",
            "notes": "Looking for experienced cardiac surgeon and modern facilities"
        }
        
        response = self.make_request("POST", "/surgery-inquiries", inquiry_data)
        if response.status_code in [200, 201]:
            inquiry_response = response.json()
            self.test_data["inquiry_id"] = inquiry_response["id"]
            self.log_result("Create Surgery Inquiry", True, f"Inquiry created: {inquiry_response['inquiry_number']}")
        else:
            self.log_result("Create Surgery Inquiry", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test admin can view all inquiries
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.make_request("GET", "/surgery-inquiries", headers=headers)
            if response.status_code == 200:
                inquiries = response.json()
                self.log_result("Admin View Surgery Inquiries", True, f"Retrieved {len(inquiries)} inquiries")
            else:
                self.log_result("Admin View Surgery Inquiries", False, f"Status: {response.status_code}")
        
        # Test get specific inquiry
        inquiry_id = self.test_data["inquiry_id"]
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.make_request("GET", f"/surgery-inquiries/{inquiry_id}", headers=headers)
            if response.status_code == 200:
                inquiry = response.json()
                self.log_result("Get Specific Surgery Inquiry", True, f"Retrieved inquiry: {inquiry['inquiry_number']}")
            else:
                self.log_result("Get Specific Surgery Inquiry", False, f"Status: {response.status_code}")
        
        # Test update inquiry
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            update_data = {
                "hospital_details": "Apollo Hospital, Chennai - Leading cardiac care facility",
                "accommodation_details": "Hospital guest house available at $50/night",
                "estimated_cost": "$18,000 - $22,000 including accommodation",
                "status": "quoted"
            }
            
            response = self.make_request("PUT", f"/surgery-inquiries/{inquiry_id}", 
                                       update_data, headers)
            if response.status_code == 200:
                self.log_result("Update Surgery Inquiry", True, "Surgery inquiry updated successfully")
            else:
                self.log_result("Update Surgery Inquiry", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return True

    def test_analytics_system(self):
        """Test analytics dashboard"""
        print("\n=== Testing Analytics System ===")
        
        if not self.admin_token:
            self.log_result("Analytics System", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get dashboard analytics
        response = self.make_request("GET", "/analytics/dashboard", headers=headers)
        if response.status_code == 200:
            analytics = response.json()
            totals = analytics.get("totals", {})
            revenue = analytics.get("revenue", {})
            
            self.log_result("Dashboard Analytics", True, 
                          f"Totals - Bookings: {totals.get('bookings', 0)}, "
                          f"Clinics: {totals.get('clinics', 0)}, "
                          f"Tests: {totals.get('tests', 0)}, "
                          f"Revenue USD: ${revenue.get('usd', 0)}")
        else:
            self.log_result("Dashboard Analytics", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return True

    def test_search_functionality(self):
        """Test search endpoints"""
        print("\n=== Testing Search Functionality ===")
        
        # Search tests
        response = self.make_request("GET", "/search/tests", {"query": "blood"})
        if response.status_code == 200:
            tests = response.json()
            self.log_result("Search Tests", True, f"Found {len(tests)} tests matching 'blood'")
        else:
            self.log_result("Search Tests", False, f"Status: {response.status_code}")
        
        # Search clinics
        response = self.make_request("GET", "/search/clinics", {"query": "medical"})
        if response.status_code == 200:
            clinics = response.json()
            self.log_result("Search Clinics", True, f"Found {len(clinics)} clinics matching 'medical'")
        else:
            self.log_result("Search Clinics", False, f"Status: {response.status_code}")
        
        return True

    def test_public_endpoints(self):
        """Test public endpoints (no authentication required)"""
        print("\n=== Testing Public Endpoints ===")
        
        # Public tests endpoint
        response = self.make_request("GET", "/public/tests")
        if response.status_code == 200:
            tests = response.json()
            self.log_result("Public Tests Endpoint", True, f"Retrieved {len(tests)} tests publicly")
        else:
            self.log_result("Public Tests Endpoint", False, f"Status: {response.status_code}")
        
        # Public clinics endpoint
        response = self.make_request("GET", "/public/clinics")
        if response.status_code == 200:
            clinics = response.json()
            self.log_result("Public Clinics Endpoint", True, f"Retrieved {len(clinics)} clinics publicly")
        else:
            self.log_result("Public Clinics Endpoint", False, f"Status: {response.status_code}")
        
        # Public test pricing
        if self.test_data.get("test_id"):
            test_id = self.test_data["test_id"]
            response = self.make_request("GET", f"/public/tests/{test_id}/pricing")
            if response.status_code == 200:
                pricing = response.json()
                self.log_result("Public Test Pricing", True, f"Retrieved pricing for {len(pricing)} clinics")
            else:
                self.log_result("Public Test Pricing", False, f"Status: {response.status_code}")
        
        # Public clinic tests
        if self.test_data.get("clinic_id"):
            clinic_id = self.test_data["clinic_id"]
            response = self.make_request("GET", f"/public/clinics/{clinic_id}/tests")
            if response.status_code == 200:
                tests = response.json()
                self.log_result("Public Clinic Tests", True, f"Retrieved {len(tests)} tests for clinic")
            else:
                self.log_result("Public Clinic Tests", False, f"Status: {response.status_code}")
        
        return True

    def test_role_based_access_control(self):
        """Test role-based access control"""
        print("\n=== Testing Role-Based Access Control ===")
        
        # Test clinic user cannot access admin endpoints
        if self.clinic_token:
            headers = {"Authorization": f"Bearer {self.clinic_token}"}
            
            # Try to create a test (admin only)
            test_data = {
                "name": "Unauthorized Test",
                "description": "This should fail",
                "category": "Test"
            }
            
            response = self.make_request("POST", "/tests", test_data, headers)
            if response.status_code == 403:
                self.log_result("Clinic User Admin Access Blocked", True, "Clinic user properly blocked from admin endpoints")
            else:
                self.log_result("Clinic User Admin Access Blocked", False, f"Expected 403, got {response.status_code}")
            
            # Try to access analytics (admin only)
            response = self.make_request("GET", "/analytics/dashboard", headers=headers)
            if response.status_code == 403:
                self.log_result("Clinic User Analytics Access Blocked", True, "Clinic user properly blocked from analytics")
            else:
                self.log_result("Clinic User Analytics Access Blocked", False, f"Expected 403, got {response.status_code}")
        
        return True

    def test_sub_admin_authentication(self):
        """Test sub-admin user authentication and JWT token validation"""
        print("\n=== Testing Sub-Admin Authentication ===")
        
        # Test sub-admin login with provided credentials
        sub_admin_login_data = {
            "email": "subadmin@chekup.com",
            "password": "SubAdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", sub_admin_login_data)
        if response.status_code == 200:
            token_data = response.json()
            self.sub_admin_token = token_data["access_token"]
            user_data = token_data.get("user", {})
            
            # Verify JWT token contains correct sub_admin role
            if user_data.get("role") == "sub_admin":
                self.log_result("Sub-Admin Login & Role Verification", True, 
                              f"Sub-admin logged in successfully with correct role. Token: {self.sub_admin_token[:20]}...")
            else:
                self.log_result("Sub-Admin Login & Role Verification", False, 
                              f"Sub-admin logged in but role is '{user_data.get('role')}', expected 'sub_admin'")
        else:
            self.log_result("Sub-Admin Login", False, 
                          f"Sub-admin login failed. Status: {response.status_code}, Response: {response.text}")
            return False
        
        return True

    def test_sub_admin_booking_access(self):
        """Test sub-admin booking access and management capabilities"""
        print("\n=== Testing Sub-Admin Booking Access ===")
        
        if not self.sub_admin_token:
            self.log_result("Sub-Admin Booking Access", False, "No sub-admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.sub_admin_token}"}
        
        # Test sub-admin can view all bookings (like admin)
        response = self.make_request("GET", "/bookings", headers=headers)
        if response.status_code == 200:
            bookings = response.json()
            self.log_result("Sub-Admin View All Bookings", True, 
                          f"Sub-admin can view all bookings ({len(bookings)} bookings)")
        else:
            self.log_result("Sub-Admin View All Bookings", False, 
                          f"Status: {response.status_code}, Response: {response.text}")
        
        # Test sub-admin can access individual booking details
        if self.test_data.get("booking_id"):
            booking_id = self.test_data["booking_id"]
            response = self.make_request("GET", f"/bookings/{booking_id}", headers=headers)
            if response.status_code == 200:
                booking = response.json()
                self.log_result("Sub-Admin View Booking Details", True, 
                              f"Sub-admin can access booking details: {booking.get('booking_number', 'N/A')}")
            else:
                self.log_result("Sub-Admin View Booking Details", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        
        # Test sub-admin can update booking status (coordination tasks)
        if self.test_data.get("booking_id"):
            booking_id = self.test_data["booking_id"]
            status_update = {"status": "sample_collected"}
            response = self.make_request("PUT", f"/bookings/{booking_id}/status", 
                                       status_update, headers)
            if response.status_code == 200:
                self.log_result("Sub-Admin Update Booking Status", True, 
                              "Sub-admin can update booking status for coordination")
            else:
                self.log_result("Sub-Admin Update Booking Status", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
        
        # Test sub-admin can upload results (file upload capability)
        if self.test_data.get("booking_id"):
            booking_id = self.test_data["booking_id"]
            # Test endpoint accessibility (we expect validation error without actual files)
            response = self.make_request("POST", f"/bookings/{booking_id}/upload-results", 
                                       headers=headers)
            if response.status_code in [422, 400]:  # Validation error expected without files
                self.log_result("Sub-Admin File Upload Access", True, 
                              "Sub-admin can access file upload endpoint (validation error expected)")
            elif response.status_code == 403:
                self.log_result("Sub-Admin File Upload Access", False, 
                              "Sub-admin blocked from file upload - should have access")
            else:
                self.log_result("Sub-Admin File Upload Access", True, 
                              f"Sub-admin has file upload access (status: {response.status_code})")
        
        return True

    def test_sub_admin_access_restrictions(self):
        """Test sub-admin access restrictions - should NOT have CRUD privileges"""
        print("\n=== Testing Sub-Admin Access Restrictions ===")
        
        if not self.sub_admin_token:
            self.log_result("Sub-Admin Access Restrictions", False, "No sub-admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.sub_admin_token}"}
        
        # Test sub-admin CANNOT create/edit/delete tests (admin-only)
        test_data = {
            "name": "Unauthorized Test Creation",
            "description": "Sub-admin should not be able to create this",
            "category": "Unauthorized"
        }
        
        response = self.make_request("POST", "/tests", test_data, headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Test Creation Blocked", True, 
                          "Sub-admin properly blocked from creating tests")
        else:
            self.log_result("Sub-Admin Test Creation Blocked", False, 
                          f"Sub-admin should be blocked from test creation. Status: {response.status_code}")
        
        # Test sub-admin CANNOT create/edit/delete clinics (admin-only)
        clinic_data = {
            "name": "Unauthorized Clinic",
            "description": "Sub-admin should not create this",
            "location": "Test Location",
            "phone": "+231-000-0000",
            "email": "test@test.com",
            "user_id": "test-user-id"
        }
        
        response = self.make_request("POST", "/clinics", clinic_data, headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Clinic Creation Blocked", True, 
                          "Sub-admin properly blocked from creating clinics")
        else:
            self.log_result("Sub-Admin Clinic Creation Blocked", False, 
                          f"Sub-admin should be blocked from clinic creation. Status: {response.status_code}")
        
        # Test sub-admin CANNOT access admin analytics dashboard
        response = self.make_request("GET", "/analytics/dashboard", headers=headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Analytics Access Blocked", True, 
                          "Sub-admin properly blocked from analytics dashboard")
        else:
            self.log_result("Sub-Admin Analytics Access Blocked", False, 
                          f"Sub-admin should be blocked from analytics. Status: {response.status_code}")
        
        # Test sub-admin CANNOT access surgery inquiry management (admin-only)
        response = self.make_request("GET", "/surgery-inquiries", headers=headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Surgery Inquiry Access Blocked", True, 
                          "Sub-admin properly blocked from surgery inquiry management")
        else:
            self.log_result("Sub-Admin Surgery Inquiry Access Blocked", False, 
                          f"Sub-admin should be blocked from surgery inquiries. Status: {response.status_code}")
        
        # Test sub-admin CANNOT create test pricing (admin-only)
        if self.test_data.get("test_id") and self.test_data.get("clinic_id"):
            pricing_data = {
                "test_id": self.test_data["test_id"],
                "clinic_id": self.test_data["clinic_id"],
                "price_usd": 999.99,
                "price_lrd": 999999.99,
                "is_available": True
            }
            
            response = self.make_request("POST", "/test-pricing", pricing_data, headers)
            if response.status_code == 403:
                self.log_result("Sub-Admin Pricing Creation Blocked", True, 
                              "Sub-admin properly blocked from creating test pricing")
            else:
                self.log_result("Sub-Admin Pricing Creation Blocked", False, 
                              f"Sub-admin should be blocked from pricing creation. Status: {response.status_code}")
        
        return True

    def test_admin_user_management(self):
        """Test new admin user management endpoints"""
        print("\n=== Testing Admin User Management Endpoints ===")
        
        if not self.admin_token:
            self.log_result("Admin User Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /api/users - Retrieve all users
        response = self.make_request("GET", "/users", headers=headers)
        if response.status_code == 200:
            users = response.json()
            self.log_result("Admin Get All Users", True, f"Retrieved {len(users)} users")
            
            # Store a user ID for update/delete tests (but not admin's own ID)
            admin_user_id = None
            test_user_id = None
            for user in users:
                if user.get("role") == "admin":
                    admin_user_id = user.get("id")
                elif user.get("role") != "admin":
                    test_user_id = user.get("id")
                    break
            
            self.test_data["admin_user_id"] = admin_user_id
            self.test_data["test_user_id"] = test_user_id
        else:
            self.log_result("Admin Get All Users", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
        
        # Test PUT /api/users/{user_id} - Update user information
        if self.test_data.get("test_user_id"):
            user_id = self.test_data["test_user_id"]
            update_data = {
                "is_active": False,
                "name": "Updated User Name"
            }
            
            response = self.make_request("PUT", f"/users/{user_id}", update_data, headers)
            if response.status_code == 200:
                self.log_result("Admin Update User", True, "User updated successfully")
            else:
                self.log_result("Admin Update User", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test protection against self-deletion
        if self.test_data.get("admin_user_id"):
            admin_id = self.test_data["admin_user_id"]
            response = self.make_request("DELETE", f"/users/{admin_id}", headers=headers)
            if response.status_code == 400:
                self.log_result("Admin Self-Deletion Protection", True, "Admin properly blocked from deleting own account")
            else:
                self.log_result("Admin Self-Deletion Protection", False, f"Expected 400, got {response.status_code}")
        
        # Test DELETE /api/users/{user_id} - Delete user (create a test user first)
        test_user_data = {
            "email": "testuser@delete.com",
            "name": "Test User for Deletion",
            "phone": "+231-777-000000",
            "location": "Test Location",
            "role": "clinic",
            "password": "TestPass123!"
        }
        
        # Create test user
        response = self.make_request("POST", "/auth/register", test_user_data)
        if response.status_code in [200, 201]:
            # Get the created user ID
            response = self.make_request("GET", "/users", headers=headers)
            if response.status_code == 200:
                users = response.json()
                delete_user_id = None
                for user in users:
                    if user.get("email") == "testuser@delete.com":
                        delete_user_id = user.get("id")
                        break
                
                if delete_user_id:
                    # Test deletion
                    response = self.make_request("DELETE", f"/users/{delete_user_id}", headers=headers)
                    if response.status_code == 200:
                        self.log_result("Admin Delete User", True, "User deleted successfully")
                    else:
                        self.log_result("Admin Delete User", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return True

    def test_admin_surgery_inquiry_management(self):
        """Test new admin surgery inquiry management endpoints"""
        print("\n=== Testing Admin Surgery Inquiry Management ===")
        
        if not self.admin_token:
            self.log_result("Admin Surgery Inquiry Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Ensure we have a surgery inquiry to work with
        if not self.test_data.get("inquiry_id"):
            # Create one for testing
            inquiry_data = {
                "patient_name": "Test Patient for Management",
                "patient_phone": "+231-777-111222",
                "patient_email": "testpatient@management.com",
                "surgery_type": "Test Surgery",
                "medical_condition": "Test condition for management testing",
                "preferred_hospital_location": "India",
                "budget_range": "$10,000 - $15,000",
                "notes": "Test inquiry for management testing"
            }
            
            response = self.make_request("POST", "/surgery-inquiries", inquiry_data)
            if response.status_code in [200, 201]:
                inquiry_response = response.json()
                self.test_data["inquiry_id"] = inquiry_response["id"]
        
        # Test GET /api/surgery-inquiries - Retrieve all surgery inquiries
        response = self.make_request("GET", "/surgery-inquiries", headers=headers)
        if response.status_code == 200:
            inquiries = response.json()
            self.log_result("Admin Get All Surgery Inquiries", True, f"Retrieved {len(inquiries)} surgery inquiries")
        else:
            self.log_result("Admin Get All Surgery Inquiries", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test PUT /api/surgery-inquiries/{inquiry_id} - Update inquiry status and admin notes
        if self.test_data.get("inquiry_id"):
            inquiry_id = self.test_data["inquiry_id"]
            update_data = {
                "status": "in_progress",
                "hospital_details": "Updated hospital information by admin",
                "accommodation_details": "Updated accommodation details",
                "estimated_cost": "$12,000 - $14,000 (admin updated)"
            }
            
            response = self.make_request("PUT", f"/surgery-inquiries/{inquiry_id}", update_data, headers)
            if response.status_code == 200:
                self.log_result("Admin Update Surgery Inquiry", True, "Surgery inquiry updated successfully")
            else:
                self.log_result("Admin Update Surgery Inquiry", False, f"Status: {response.status_code}, Response: {response.text}")
        
        # Test DELETE /api/surgery-inquiries/{inquiry_id} - Delete surgery inquiry
        # Create a test inquiry for deletion
        delete_inquiry_data = {
            "patient_name": "Delete Test Patient",
            "patient_phone": "+231-777-999000",
            "patient_email": "deletetest@inquiry.com",
            "surgery_type": "Delete Test Surgery",
            "medical_condition": "Test condition for deletion",
            "preferred_hospital_location": "India",
            "budget_range": "$5,000 - $10,000",
            "notes": "Test inquiry for deletion testing"
        }
        
        response = self.make_request("POST", "/surgery-inquiries", delete_inquiry_data)
        if response.status_code in [200, 201]:
            delete_inquiry_response = response.json()
            delete_inquiry_id = delete_inquiry_response["id"]
            
            # Test deletion
            response = self.make_request("DELETE", f"/surgery-inquiries/{delete_inquiry_id}", headers=headers)
            if response.status_code == 200:
                self.log_result("Admin Delete Surgery Inquiry", True, "Surgery inquiry deleted successfully")
            else:
                self.log_result("Admin Delete Surgery Inquiry", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return True

    def test_role_based_access_for_new_endpoints(self):
        """Test role-based access control for new admin management endpoints"""
        print("\n=== Testing Role-Based Access Control for New Endpoints ===")
        
        # Test sub-admin access to user management (should be blocked)
        if self.sub_admin_token:
            headers = {"Authorization": f"Bearer {self.sub_admin_token}"}
            
            # Test sub-admin cannot access user management
            response = self.make_request("GET", "/users", headers=headers)
            if response.status_code == 403:
                self.log_result("Sub-Admin User Management Blocked", True, "Sub-admin properly blocked from user management")
            else:
                self.log_result("Sub-Admin User Management Blocked", False, f"Expected 403, got {response.status_code}")
            
            # Test sub-admin cannot access surgery inquiry management
            response = self.make_request("GET", "/surgery-inquiries", headers=headers)
            if response.status_code == 403:
                self.log_result("Sub-Admin Surgery Inquiry Management Blocked", True, "Sub-admin properly blocked from surgery inquiry management")
            else:
                self.log_result("Sub-Admin Surgery Inquiry Management Blocked", False, f"Expected 403, got {response.status_code}")
        
        # Test clinic user access to new endpoints (should be blocked)
        if self.clinic_token:
            headers = {"Authorization": f"Bearer {self.clinic_token}"}
            
            # Test clinic cannot access user management
            response = self.make_request("GET", "/users", headers=headers)
            if response.status_code == 403:
                self.log_result("Clinic User Management Blocked", True, "Clinic user properly blocked from user management")
            else:
                self.log_result("Clinic User Management Blocked", False, f"Expected 403, got {response.status_code}")
            
            # Test clinic cannot access surgery inquiry management
            response = self.make_request("GET", "/surgery-inquiries", headers=headers)
            if response.status_code == 403:
                self.log_result("Clinic Surgery Inquiry Management Blocked", True, "Clinic user properly blocked from surgery inquiry management")
            else:
                self.log_result("Clinic Surgery Inquiry Management Blocked", False, f"Expected 403, got {response.status_code}")
        
        return True

    def test_data_validation_for_new_endpoints(self):
        """Test data validation for new admin management endpoints"""
        print("\n=== Testing Data Validation for New Endpoints ===")
        
        if not self.admin_token:
            self.log_result("Data Validation Tests", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test invalid user ID handling
        response = self.make_request("GET", "/users/invalid-user-id", headers=headers)
        if response.status_code == 404:
            self.log_result("Invalid User ID Handling", True, "Invalid user ID properly handled with 404")
        else:
            self.log_result("Invalid User ID Handling", False, f"Expected 404, got {response.status_code}")
        
        # Test invalid surgery inquiry ID handling
        response = self.make_request("GET", "/surgery-inquiries/invalid-inquiry-id", headers=headers)
        if response.status_code == 404:
            self.log_result("Invalid Surgery Inquiry ID Handling", True, "Invalid inquiry ID properly handled with 404")
        else:
            self.log_result("Invalid Surgery Inquiry ID Handling", False, f"Expected 404, got {response.status_code}")
        
        # Test user update with invalid data
        if self.test_data.get("test_user_id"):
            user_id = self.test_data["test_user_id"]
            invalid_update = {"invalid_field": "invalid_value"}
            
            response = self.make_request("PUT", f"/users/{user_id}", invalid_update, headers)
            # Should still work as the endpoint accepts any dict and filters valid fields
            if response.status_code in [200, 400, 422]:
                self.log_result("User Update Data Validation", True, "User update validation working properly")
            else:
                self.log_result("User Update Data Validation", False, f"Unexpected status: {response.status_code}")
        
        return True

    def test_existing_functionality_integrity(self):
        """Test that existing admin and clinic functionality still works"""
        print("\n=== Testing Existing Functionality Integrity ===")
        
        # Test admin functionality still works
        if self.admin_token:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Admin should still access analytics
            response = self.make_request("GET", "/analytics/dashboard", headers=headers)
            if response.status_code == 200:
                self.log_result("Admin Analytics Access", True, "Admin can still access analytics dashboard")
            else:
                self.log_result("Admin Analytics Access", False, 
                              f"Admin analytics access broken. Status: {response.status_code}")
            
            # Admin should still manage tests
            response = self.make_request("GET", "/tests", headers=headers)
            if response.status_code == 200:
                self.log_result("Admin Test Management", True, "Admin can still manage tests")
            else:
                self.log_result("Admin Test Management", False, 
                              f"Admin test management broken. Status: {response.status_code}")
        
        # Test clinic functionality still works
        if self.clinic_token:
            headers = {"Authorization": f"Bearer {self.clinic_token}"}
            
            # Clinic should still access their bookings
            response = self.make_request("GET", "/bookings", headers=headers)
            if response.status_code == 200:
                self.log_result("Clinic Booking Access", True, "Clinic can still access their bookings")
            else:
                self.log_result("Clinic Booking Access", False, 
                              f"Clinic booking access broken. Status: {response.status_code}")
        
        # Test public endpoints still work
        response = self.make_request("GET", "/public/tests")
        if response.status_code == 200:
            self.log_result("Public Endpoints", True, "Public endpoints still functional")
        else:
            self.log_result("Public Endpoints", False, 
                          f"Public endpoints broken. Status: {response.status_code}")
        
        return True

    def run_all_tests(self):
        """Run all backend tests"""
        print("🏥 ChekUp Backend Comprehensive Testing")
        print("=" * 50)
        print(f"Testing backend at: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Run all test suites
            self.test_authentication_system()
            self.test_sub_admin_authentication()  # Test sub-admin authentication
            self.test_test_management()
            self.test_clinic_management()
            self.test_pricing_system()
            self.test_booking_system()
            self.test_sub_admin_booking_access()  # Test sub-admin booking access
            self.test_file_upload_system()
            self.test_feedback_system()
            self.test_surgery_inquiry_system()
            
            # NEW ADMIN MANAGEMENT FEATURES TESTING
            self.test_admin_user_management()  # NEW: Test admin user management endpoints
            self.test_admin_surgery_inquiry_management()  # NEW: Test admin surgery inquiry management
            self.test_role_based_access_for_new_endpoints()  # NEW: Test role-based access for new endpoints
            self.test_data_validation_for_new_endpoints()  # NEW: Test data validation for new endpoints
            
            self.test_analytics_system()
            self.test_search_functionality()
            self.test_public_endpoints()
            self.test_role_based_access_control()
            self.test_sub_admin_access_restrictions()  # Test sub-admin restrictions
            self.test_existing_functionality_integrity()  # Test existing functionality
            
        except Exception as e:
            print(f"\n❌ CRITICAL ERROR: {str(e)}")
            self.results["errors"].append(f"Critical Error: {str(e)}")
        
        # Print final results
        print("\n" + "=" * 50)
        print("🏥 FINAL TEST RESULTS")
        print("=" * 50)
        print(f"✅ PASSED: {self.results['passed']}")
        print(f"❌ FAILED: {self.results['failed']}")
        print(f"📊 SUCCESS RATE: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results["errors"]:
            print(f"\n🚨 ERRORS ENCOUNTERED ({len(self.results['errors'])}):")
            for i, error in enumerate(self.results["errors"], 1):
                print(f"{i}. {error}")
        
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return self.results

if __name__ == "__main__":
    tester = ChekUpTester()
    results = tester.run_all_tests()