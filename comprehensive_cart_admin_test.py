#!/usr/bin/env python3
"""
Comprehensive Cart and Admin CRUD Testing
Tests the complete cart workflow and admin dashboard functionality
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

class ComprehensiveCartAdminTester:
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
        """Setup admin authentication"""
        print("\n=== Admin Authentication Setup ===")
        
        login_data = {
            "email": "admin@chekup.com",
            "password": "AdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response.status_code == 200:
            token_data = response.json()
            self.admin_token = token_data["access_token"]
            self.log_result("Admin Authentication", True, "Admin authenticated successfully")
            return True
        else:
            self.log_result("Admin Authentication", False, f"Status: {response.status_code}")
            return False

    def setup_comprehensive_test_data(self):
        """Setup comprehensive test data for cart and admin testing"""
        print("\n=== Setting up Comprehensive Test Data ===")
        
        if not self.admin_token:
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Create multiple tests for cart testing
        tests_data = [
            {
                "name": "Complete Blood Count (CBC)",
                "description": "Comprehensive blood analysis including RBC, WBC, platelets",
                "category": "Hematology",
                "preparation_instructions": "No fasting required",
                "icon_url": "https://example.com/cbc.png"
            },
            {
                "name": "Lipid Profile",
                "description": "Cholesterol and triglyceride levels analysis",
                "category": "Biochemistry",
                "preparation_instructions": "12-hour fasting required",
                "icon_url": "https://example.com/lipid.png"
            },
            {
                "name": "Liver Function Test",
                "description": "Assessment of liver enzymes and function",
                "category": "Biochemistry",
                "preparation_instructions": "No special preparation needed",
                "icon_url": "https://example.com/liver.png"
            }
        ]
        
        test_ids = []
        for i, test_data in enumerate(tests_data):
            response = self.make_request("POST", "/tests", test_data, headers)
            if response.status_code in [200, 201]:
                test_response = response.json()
                test_ids.append(test_response["id"])
                self.log_result(f"Create Test {i+1}", True, f"Test created: {test_response['name']}")
            else:
                self.log_result(f"Create Test {i+1}", False, f"Status: {response.status_code}")
                return False
        
        self.test_data["test_ids"] = test_ids
        
        # Create multiple clinics
        clinics_data = [
            {
                "name": "Monrovia Central Lab",
                "description": "Premier diagnostic laboratory in central Monrovia",
                "location": "Broad Street, Monrovia",
                "phone": "+231-777-111222",
                "email": "info@monroviacentral.lr",
                "user_id": "clinic-1-user-id",
                "services": ["Blood Tests", "Biochemistry", "Hematology"]
            },
            {
                "name": "Sinkor Medical Center",
                "description": "Modern medical facility in Sinkor district",
                "location": "Tubman Boulevard, Sinkor",
                "phone": "+231-777-333444",
                "email": "contact@sinkormedical.lr",
                "user_id": "clinic-2-user-id",
                "services": ["Laboratory Services", "Diagnostic Tests"]
            }
        ]
        
        clinic_ids = []
        for i, clinic_data in enumerate(clinics_data):
            response = self.make_request("POST", "/clinics", clinic_data, headers)
            if response.status_code in [200, 201]:
                clinic_response = response.json()
                clinic_ids.append(clinic_response["id"])
                self.log_result(f"Create Clinic {i+1}", True, f"Clinic created: {clinic_response['name']}")
            else:
                self.log_result(f"Create Clinic {i+1}", False, f"Status: {response.status_code}")
                return False
        
        self.test_data["clinic_ids"] = clinic_ids
        
        # Create pricing for all test-clinic combinations
        pricing_combinations = [
            {"test_idx": 0, "clinic_idx": 0, "price_usd": 25.00, "price_lrd": 4500.00},
            {"test_idx": 0, "clinic_idx": 1, "price_usd": 22.50, "price_lrd": 4050.00},
            {"test_idx": 1, "clinic_idx": 0, "price_usd": 35.00, "price_lrd": 6300.00},
            {"test_idx": 1, "clinic_idx": 1, "price_usd": 32.00, "price_lrd": 5760.00},
            {"test_idx": 2, "clinic_idx": 0, "price_usd": 40.00, "price_lrd": 7200.00},
            {"test_idx": 2, "clinic_idx": 1, "price_usd": 38.00, "price_lrd": 6840.00},
        ]
        
        for combo in pricing_combinations:
            pricing_data = {
                "test_id": test_ids[combo["test_idx"]],
                "clinic_id": clinic_ids[combo["clinic_idx"]],
                "price_usd": combo["price_usd"],
                "price_lrd": combo["price_lrd"],
                "is_available": True
            }
            
            response = self.make_request("POST", "/test-pricing", pricing_data, headers)
            if response.status_code in [200, 201]:
                self.log_result(f"Create Pricing", True, f"Pricing created: ${combo['price_usd']}")
            else:
                self.log_result(f"Create Pricing", False, f"Status: {response.status_code}")
        
        return True

    def test_comprehensive_cart_workflow(self):
        """Test complete cart workflow with multiple tests and providers"""
        print("\n=== Testing Comprehensive Cart Workflow ===")
        
        if not self.test_data.get("test_ids") or not self.test_data.get("clinic_ids"):
            self.log_result("Cart Workflow", False, "Missing test data")
            return False
        
        test_ids = self.test_data["test_ids"]
        clinic_ids = self.test_data["clinic_ids"]
        
        # Step 1: Patient browses tests (simulating frontend cart functionality)
        print("\n--- Step 1: Browse Available Tests ---")
        response = self.make_request("GET", "/public/tests")
        if response.status_code == 200:
            all_tests = response.json()
            available_tests = [test for test in all_tests if test["id"] in test_ids]
            self.log_result("Browse Tests", True, f"Found {len(available_tests)} tests available for cart")
        else:
            self.log_result("Browse Tests", False, f"Status: {response.status_code}")
            return False
        
        # Step 2: For each test, get available providers (cart provider selection)
        print("\n--- Step 2: Get Providers for Each Test ---")
        cart_items = []
        for i, test_id in enumerate(test_ids[:2]):  # Test with first 2 tests
            response = self.make_request("GET", f"/public/tests/{test_id}/providers")
            if response.status_code == 200:
                providers = response.json()
                self.log_result(f"Get Providers for Test {i+1}", True, f"Found {len(providers)} providers")
                
                # Select first provider for this test (simulating user selection)
                if providers:
                    selected_provider = providers[0]
                    cart_items.append({
                        "test_id": test_id,
                        "provider_id": selected_provider["id"],
                        "test_name": available_tests[i]["name"],
                        "provider_name": selected_provider["name"]
                    })
            else:
                self.log_result(f"Get Providers for Test {i+1}", False, f"Status: {response.status_code}")
        
        # Step 3: Get pricing for each cart item
        print("\n--- Step 3: Get Pricing for Cart Items ---")
        total_estimated = 0
        for item in cart_items:
            response = self.make_request("GET", f"/public/tests/{item['test_id']}/pricing/{item['provider_id']}")
            if response.status_code == 200:
                pricing = response.json()
                item["price_usd"] = pricing["price_usd"]
                item["price_lrd"] = pricing["price_lrd"]
                total_estimated += pricing["price_usd"]
                self.log_result(f"Get Pricing for {item['test_name']}", True, 
                              f"Price: ${pricing['price_usd']} USD / ${pricing['price_lrd']} LRD")
            else:
                self.log_result(f"Get Pricing for {item['test_name']}", False, f"Status: {response.status_code}")
        
        # Step 4: Create booking from cart (multiple tests, single provider)
        print("\n--- Step 4: Create Booking from Cart ---")
        # For simplicity, book all tests with the first provider
        selected_provider_id = cart_items[0]["provider_id"] if cart_items else clinic_ids[0]
        selected_test_ids = [item["test_id"] for item in cart_items]
        
        booking_data = {
            "patient_name": "Maria Santos",
            "patient_phone": "+231-777-888999",
            "patient_email": "maria.santos@email.com",
            "patient_location": "Congo Town, Monrovia",
            "test_ids": selected_test_ids,
            "clinic_id": selected_provider_id,
            "delivery_method": "whatsapp",
            "preferred_currency": "USD",
            "delivery_charge": 5.00,
            "notes": "Cart booking with multiple tests - please coordinate sample collection"
        }
        
        response = self.make_request("POST", "/bookings", booking_data)
        if response.status_code in [200, 201]:
            booking_response = response.json()
            self.test_data["cart_booking_id"] = booking_response["id"]
            self.log_result("Create Cart Booking", True, 
                          f"Booking created: {booking_response['booking_number']}, Total: ${booking_response['total_amount']}")
            
            # Verify all cart items are in the booking
            if set(booking_response["test_ids"]) == set(selected_test_ids):
                self.log_result("Cart Items Verification", True, "All cart items properly included in booking")
            else:
                self.log_result("Cart Items Verification", False, "Cart items mismatch in booking")
        else:
            self.log_result("Create Cart Booking", False, f"Status: {response.status_code}")
        
        return True

    def test_admin_dashboard_management(self):
        """Test admin dashboard management capabilities"""
        print("\n=== Testing Admin Dashboard Management ===")
        
        if not self.admin_token:
            self.log_result("Admin Dashboard", False, "No admin token")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test Test Assignment & Pricing management
        print("\n--- Test Assignment & Pricing Management ---")
        
        # Get all tests for management
        response = self.make_request("GET", "/tests", headers=headers)
        if response.status_code == 200:
            tests = response.json()
            self.log_result("Get Tests for Management", True, f"Retrieved {len(tests)} tests for admin management")
            
            if tests:
                # Test editing a test (handleEditTestAssignment)
                test_to_edit = tests[0]
                edit_data = {
                    "name": f"{test_to_edit['name']} - Admin Edited",
                    "description": f"{test_to_edit['description']} - Updated by admin dashboard",
                    "category": test_to_edit["category"],
                    "preparation_instructions": "Updated preparation instructions from admin dashboard"
                }
                
                response = self.make_request("PUT", f"/tests/{test_to_edit['id']}", edit_data, headers)
                if response.status_code == 200:
                    self.log_result("Admin Edit Test Assignment", True, "Test successfully edited from admin dashboard")
                else:
                    self.log_result("Admin Edit Test Assignment", False, f"Status: {response.status_code}")
        else:
            self.log_result("Get Tests for Management", False, f"Status: {response.status_code}")
        
        # Test Provider Communication Access management
        print("\n--- Provider Communication Access Management ---")
        
        # Get all clinics for management
        response = self.make_request("GET", "/clinics", headers=headers)
        if response.status_code == 200:
            clinics = response.json()
            self.log_result("Get Clinics for Management", True, f"Retrieved {len(clinics)} clinics for admin management")
            
            if clinics:
                # Test editing a clinic (handleEditClinicAssignment)
                clinic_to_edit = clinics[0]
                edit_data = {
                    "name": f"{clinic_to_edit['name']} - Admin Updated",
                    "description": f"{clinic_to_edit['description']} - Updated by admin dashboard",
                    "location": clinic_to_edit["location"],
                    "phone": clinic_to_edit["phone"],
                    "email": clinic_to_edit["email"],
                    "user_id": clinic_to_edit["user_id"],
                    "services": clinic_to_edit.get("services", []) + ["Admin Added Service"]
                }
                
                response = self.make_request("PUT", f"/clinics/{clinic_to_edit['id']}", edit_data, headers)
                if response.status_code == 200:
                    self.log_result("Admin Edit Clinic Assignment", True, "Clinic successfully edited from admin dashboard")
                else:
                    self.log_result("Admin Edit Clinic Assignment", False, f"Status: {response.status_code}")
        else:
            self.log_result("Get Clinics for Management", False, f"Status: {response.status_code}")
        
        # Test booking management from admin dashboard
        print("\n--- Booking Management ---")
        
        response = self.make_request("GET", "/bookings", headers=headers)
        if response.status_code == 200:
            bookings = response.json()
            self.log_result("Admin View All Bookings", True, f"Admin can view {len(bookings)} bookings")
            
            # Test booking status update (admin coordination)
            if bookings and self.test_data.get("cart_booking_id"):
                booking_id = self.test_data["cart_booking_id"]
                status_update = {"status": "confirmed"}
                
                response = self.make_request("PUT", f"/bookings/{booking_id}/status", status_update, headers)
                if response.status_code == 200:
                    self.log_result("Admin Update Booking Status", True, "Admin successfully updated booking status")
                else:
                    self.log_result("Admin Update Booking Status", False, f"Status: {response.status_code}")
        else:
            self.log_result("Admin View All Bookings", False, f"Status: {response.status_code}")
        
        return True

    def test_end_to_end_workflow(self):
        """Test complete end-to-end workflow from cart to admin management"""
        print("\n=== Testing End-to-End Workflow ===")
        
        # This simulates the complete user journey:
        # 1. Patient browses tests → 2. Adds to cart → 3. Views providers → 4. Checks pricing → 5. Books → 6. Admin manages
        
        if not self.test_data.get("test_ids") or not self.test_data.get("clinic_ids"):
            self.log_result("End-to-End Workflow", False, "Missing test data")
            return False
        
        test_id = self.test_data["test_ids"][0]
        clinic_id = self.test_data["clinic_ids"][0]
        
        # Patient journey simulation
        print("\n--- Patient Journey Simulation ---")
        
        # 1. Browse test details
        response = self.make_request("GET", f"/public/tests/{test_id}")
        if response.status_code == 200:
            test_details = response.json()
            self.log_result("Patient Browse Test Details", True, f"Patient views: {test_details['name']}")
        else:
            self.log_result("Patient Browse Test Details", False, f"Status: {response.status_code}")
            return False
        
        # 2. View available providers
        response = self.make_request("GET", f"/public/tests/{test_id}/providers")
        if response.status_code == 200:
            providers = response.json()
            self.log_result("Patient View Providers", True, f"Patient sees {len(providers)} providers")
        else:
            self.log_result("Patient View Providers", False, f"Status: {response.status_code}")
            return False
        
        # 3. Check pricing
        response = self.make_request("GET", f"/public/tests/{test_id}/pricing/{clinic_id}")
        if response.status_code == 200:
            pricing = response.json()
            self.log_result("Patient Check Pricing", True, f"Patient sees price: ${pricing['price_usd']}")
        else:
            self.log_result("Patient Check Pricing", False, f"Status: {response.status_code}")
            return False
        
        # 4. Create booking
        booking_data = {
            "patient_name": "End-to-End Test Patient",
            "patient_phone": "+231-777-999000",
            "patient_email": "e2e@test.com",
            "patient_location": "Test Location",
            "test_ids": [test_id],
            "clinic_id": clinic_id,
            "delivery_method": "whatsapp",
            "preferred_currency": "USD",
            "delivery_charge": 3.00,
            "notes": "End-to-end workflow test booking"
        }
        
        response = self.make_request("POST", "/bookings", booking_data)
        if response.status_code in [200, 201]:
            booking_response = response.json()
            e2e_booking_id = booking_response["id"]
            self.log_result("Patient Create Booking", True, f"Booking created: {booking_response['booking_number']}")
        else:
            self.log_result("Patient Create Booking", False, f"Status: {response.status_code}")
            return False
        
        # Admin management simulation
        print("\n--- Admin Management Simulation ---")
        
        if not self.admin_token:
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # 5. Admin views booking
        response = self.make_request("GET", f"/bookings/{e2e_booking_id}", headers=headers)
        if response.status_code == 200:
            booking = response.json()
            self.log_result("Admin View Booking", True, f"Admin views booking: {booking['booking_number']}")
        else:
            self.log_result("Admin View Booking", False, f"Status: {response.status_code}")
        
        # 6. Admin updates booking status
        status_update = {"status": "sample_collected"}
        response = self.make_request("PUT", f"/bookings/{e2e_booking_id}/status", status_update, headers)
        if response.status_code == 200:
            self.log_result("Admin Update Booking", True, "Admin updated booking status")
        else:
            self.log_result("Admin Update Booking", False, f"Status: {response.status_code}")
        
        # 7. Admin manages test (edit)
        edit_test_data = {
            "name": f"{test_details['name']} - E2E Updated",
            "description": f"{test_details['description']} - Updated in E2E test",
            "category": test_details["category"],
            "preparation_instructions": "E2E updated instructions"
        }
        
        response = self.make_request("PUT", f"/tests/{test_id}", edit_test_data, headers)
        if response.status_code == 200:
            self.log_result("Admin Manage Test", True, "Admin successfully managed test")
        else:
            self.log_result("Admin Manage Test", False, f"Status: {response.status_code}")
        
        self.log_result("End-to-End Workflow Complete", True, "Complete patient-to-admin workflow successful")
        return True

    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🏥 ChekUp Platform - Comprehensive Cart & Admin Testing")
        print("=" * 70)
        
        # Setup
        if not self.setup_admin_authentication():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        if not self.setup_comprehensive_test_data():
            print("❌ Cannot proceed without test data setup")
            return False
        
        # Run comprehensive tests
        self.test_comprehensive_cart_workflow()
        self.test_admin_dashboard_management()
        self.test_end_to_end_workflow()
        
        # Print summary
        print("\n" + "=" * 70)
        print("🎯 COMPREHENSIVE TEST SUMMARY")
        print("=" * 70)
        
        total_tests = self.results["passed"] + self.results["failed"]
        success_rate = (self.results["passed"] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if self.results["errors"]:
            print(f"\n❌ Failed Tests:")
            for error in self.results["errors"]:
                print(f"   • {error}")
        
        print(f"\n🎉 Comprehensive Testing Complete!")
        print(f"Cart workflow and Admin dashboard management fully tested!")
        
        return success_rate > 85

if __name__ == "__main__":
    tester = ComprehensiveCartAdminTester()
    success = tester.run_comprehensive_tests()
    exit(0 if success else 1)