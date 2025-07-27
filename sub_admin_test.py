#!/usr/bin/env python3
"""
Sub-Admin Functionality Testing for ChekUp Platform
Tests specifically for Sub-Admin role functionality as requested in the review.
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://0890244b-bfed-479c-8063-7074a7d2a140.preview.emergentagent.com/api"
TIMEOUT = 30

class SubAdminTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.admin_token = None
        self.sub_admin_token = None
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

    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> requests.Response:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=default_headers, params=data)
            elif method.upper() == "POST":
                response = self.session.post(url, headers=default_headers, json=data if data else {})
            elif method.upper() == "PUT":
                response = self.session.put(url, headers=default_headers, json=data if data else {})
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=default_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def setup_admin_user(self):
        """Setup admin user for testing"""
        print("\n=== Setting up Admin User ===")
        
        # Login as admin
        login_data = {
            "email": "admin@chekup.com",
            "password": "AdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response.status_code == 200:
            token_data = response.json()
            self.admin_token = token_data["access_token"]
            self.log_result("Admin Login Setup", True, "Admin token obtained")
            return True
        else:
            self.log_result("Admin Login Setup", False, f"Status: {response.status_code}")
            return False

    def test_sub_admin_role_support(self):
        """Test if backend supports sub_admin role"""
        print("\n=== Testing Sub-Admin Role Support ===")
        
        if not self.admin_token:
            self.log_result("Sub-Admin Role Support", False, "No admin token available")
            return False
        
        # Try to create a sub_admin user
        sub_admin_data = {
            "email": "subadmin@chekup.com",
            "name": "ChekUp Sub Administrator",
            "phone": "+231-777-123457",
            "location": "Monrovia, Liberia",
            "role": "sub_admin",  # This role doesn't exist in backend
            "password": "SubAdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/register", sub_admin_data)
        if response.status_code in [200, 201]:
            self.log_result("Sub-Admin User Creation", True, "Sub-Admin user created successfully")
            
            # Try to login as sub_admin
            login_data = {
                "email": "subadmin@chekup.com",
                "password": "SubAdminPass123!"
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            if response.status_code == 200:
                token_data = response.json()
                self.sub_admin_token = token_data["access_token"]
                user_data = token_data.get("user", {})
                actual_role = user_data.get("role")
                
                if actual_role == "sub_admin":
                    self.log_result("Sub-Admin Login", True, f"Sub-Admin logged in with role: {actual_role}")
                else:
                    self.log_result("Sub-Admin Login", False, f"Expected role 'sub_admin', got '{actual_role}'")
            else:
                self.log_result("Sub-Admin Login", False, f"Status: {response.status_code}")
        else:
            # Check if it's a validation error due to invalid role
            if response.status_code == 422:
                error_detail = response.json().get("detail", [])
                role_error = any("role" in str(error).lower() for error in error_detail if isinstance(error, dict))
                if role_error:
                    self.log_result("Sub-Admin Role Support", False, "CRITICAL: sub_admin role not supported in backend UserRole enum")
                else:
                    self.log_result("Sub-Admin User Creation", False, f"Validation error: {response.text}")
            else:
                self.log_result("Sub-Admin User Creation", False, f"Status: {response.status_code}, Response: {response.text}")
        
        return self.sub_admin_token is not None

    def test_sub_admin_booking_access(self):
        """Test Sub-Admin access to booking endpoints"""
        print("\n=== Testing Sub-Admin Booking Access ===")
        
        if not self.sub_admin_token:
            self.log_result("Sub-Admin Booking Access", False, "No sub_admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.sub_admin_token}"}
        
        # Test read access to bookings
        response = self.make_request("GET", "/bookings", headers=headers)
        if response.status_code == 200:
            bookings = response.json()
            self.log_result("Sub-Admin View Bookings", True, f"Sub-Admin can view {len(bookings)} bookings")
        else:
            self.log_result("Sub-Admin View Bookings", False, f"Status: {response.status_code}")
        
        # Test booking assignment (if booking exists)
        # This would require a specific endpoint for assignment
        response = self.make_request("GET", "/bookings", headers=headers)
        if response.status_code == 200:
            bookings = response.json()
            if bookings:
                booking_id = bookings[0]["id"]
                # Test status update (limited coordination tasks)
                status_data = {"status": "sample_collected"}
                response = self.make_request("PUT", f"/bookings/{booking_id}/status", status_data, headers)
                if response.status_code == 200:
                    self.log_result("Sub-Admin Update Booking Status", True, "Sub-Admin can update booking status")
                else:
                    self.log_result("Sub-Admin Update Booking Status", False, f"Status: {response.status_code}")
        
        return True

    def test_sub_admin_restricted_access(self):
        """Test that Sub-Admin cannot access admin-only operations"""
        print("\n=== Testing Sub-Admin Access Restrictions ===")
        
        if not self.sub_admin_token:
            self.log_result("Sub-Admin Access Restrictions", False, "No sub_admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.sub_admin_token}"}
        
        # Test that Sub-Admin cannot create tests (admin-only)
        test_data = {
            "name": "Unauthorized Test Creation",
            "description": "This should fail for sub_admin",
            "category": "Test"
        }
        
        response = self.make_request("POST", "/tests", test_data, headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Test Creation Blocked", True, "Sub-Admin properly blocked from creating tests")
        else:
            self.log_result("Sub-Admin Test Creation Blocked", False, f"Expected 403, got {response.status_code}")
        
        # Test that Sub-Admin cannot create clinics (admin-only)
        clinic_data = {
            "name": "Unauthorized Clinic",
            "description": "This should fail",
            "location": "Test Location",
            "phone": "+231-777-000000",
            "email": "test@test.com",
            "user_id": "test-user-id"
        }
        
        response = self.make_request("POST", "/clinics", clinic_data, headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Clinic Creation Blocked", True, "Sub-Admin properly blocked from creating clinics")
        else:
            self.log_result("Sub-Admin Clinic Creation Blocked", False, f"Expected 403, got {response.status_code}")
        
        # Test that Sub-Admin cannot access analytics (admin-only)
        response = self.make_request("GET", "/analytics/dashboard", headers)
        if response.status_code == 403:
            self.log_result("Sub-Admin Analytics Access Blocked", True, "Sub-Admin properly blocked from analytics")
        else:
            self.log_result("Sub-Admin Analytics Access Blocked", False, f"Expected 403, got {response.status_code}")
        
        return True

    def test_lab_technician_role(self):
        """Test lab_technician role as alternative to sub_admin"""
        print("\n=== Testing Lab Technician Role (Alternative to Sub-Admin) ===")
        
        # Try to create a lab_technician user (this role exists in backend)
        lab_tech_data = {
            "email": "labtech@chekup.com",
            "name": "Lab Technician",
            "phone": "+231-777-123458",
            "location": "Monrovia, Liberia",
            "role": "lab_technician",
            "password": "LabTechPass123!"
        }
        
        response = self.make_request("POST", "/auth/register", lab_tech_data)
        if response.status_code in [200, 201]:
            self.log_result("Lab Technician User Creation", True, "Lab Technician user created successfully")
        elif response.status_code == 400 and "already registered" in response.text:
            self.log_result("Lab Technician User Creation", True, "Lab Technician user already exists")
        else:
            self.log_result("Lab Technician User Creation", False, f"Status: {response.status_code}")
            return False
        
        # Try to login as lab_technician
        login_data = {
            "email": "labtech@chekup.com",
            "password": "LabTechPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response.status_code == 200:
            token_data = response.json()
            lab_tech_token = token_data["access_token"]
            user_data = token_data.get("user", {})
            actual_role = user_data.get("role")
            
            if actual_role == "lab_technician":
                self.log_result("Lab Technician Login", True, f"Lab Technician logged in with role: {actual_role}")
                
                # Test lab technician access to bookings
                headers = {"Authorization": f"Bearer {lab_tech_token}"}
                response = self.make_request("GET", "/bookings", headers=headers)
                if response.status_code == 200:
                    bookings = response.json()
                    self.log_result("Lab Technician View Bookings", True, f"Lab Technician can view {len(bookings)} bookings")
                else:
                    self.log_result("Lab Technician View Bookings", False, f"Status: {response.status_code}")
                
            else:
                self.log_result("Lab Technician Login", False, f"Expected role 'lab_technician', got '{actual_role}'")
        else:
            self.log_result("Lab Technician Login", False, f"Status: {response.status_code}")
        
        return True

    def run_sub_admin_tests(self):
        """Run all Sub-Admin specific tests"""
        print("🔐 ChekUp Sub-Admin Functionality Testing")
        print("=" * 50)
        print(f"Testing backend at: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Setup
            if not self.setup_admin_user():
                print("❌ CRITICAL: Cannot proceed without admin access")
                return self.results
            
            # Run Sub-Admin specific tests
            self.test_sub_admin_role_support()
            self.test_sub_admin_booking_access()
            self.test_sub_admin_restricted_access()
            self.test_lab_technician_role()
            
        except Exception as e:
            print(f"\n❌ CRITICAL ERROR: {str(e)}")
            self.results["errors"].append(f"Critical Error: {str(e)}")
        
        # Print final results
        print("\n" + "=" * 50)
        print("🔐 SUB-ADMIN TEST RESULTS")
        print("=" * 50)
        print(f"✅ PASSED: {self.results['passed']}")
        print(f"❌ FAILED: {self.results['failed']}")
        
        if self.results['passed'] + self.results['failed'] > 0:
            success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100)
            print(f"📊 SUCCESS RATE: {success_rate:.1f}%")
        
        if self.results["errors"]:
            print(f"\n🚨 ERRORS ENCOUNTERED ({len(self.results['errors'])}):")
            for i, error in enumerate(self.results["errors"], 1):
                print(f"{i}. {error}")
        
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return self.results

if __name__ == "__main__":
    tester = SubAdminTester()
    results = tester.run_sub_admin_tests()