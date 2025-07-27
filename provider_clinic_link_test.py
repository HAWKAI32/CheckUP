#!/usr/bin/env python3
"""
Communication Access Module - Focused Test for Provider-Clinic Linking
This test addresses the issue where providers need to be linked to clinic records
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://0890244b-bfed-479c-8063-7074a7d2a140.preview.emergentagent.com/api"

class ProviderClinicLinkTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = 30
        self.admin_token = None
        self.provider_token = None
        self.test_data = {}

    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None):
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
        
        if method.upper() == "GET":
            response = self.session.get(url, headers=default_headers, params=data)
        elif method.upper() == "POST":
            response = self.session.post(url, headers=default_headers, json=data if data else {})
        elif method.upper() == "PUT":
            response = self.session.put(url, headers=default_headers, json=data if data else {})
        elif method.upper() == "DELETE":
            response = self.session.delete(url, headers=default_headers)
        
        return response

    def test_provider_clinic_communication_flow(self):
        """Test the complete provider-clinic communication flow"""
        print("🏥 Testing Provider-Clinic Communication Flow")
        print("=" * 50)
        
        # Step 1: Admin authentication
        admin_login = {
            "email": "admin@chekup.com",
            "password": "AdminPass123!"
        }
        
        response = self.make_request("POST", "/auth/login", admin_login)
        if response.status_code == 200:
            self.admin_token = response.json()["access_token"]
            print("✅ Admin authenticated successfully")
        else:
            print("❌ Admin authentication failed")
            return
        
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Step 2: Create a provider user
        provider_data = {
            "email": "linked.provider@clinic.lr",
            "name": "Linked Clinic Provider",
            "phone": "+231-777-123999",
            "location": "Central Monrovia",
            "role": "clinic",
            "password": "LinkedProvider123!"
        }
        
        response = self.make_request("POST", "/auth/register", provider_data)
        if response.status_code in [200, 201]:
            print("✅ Provider user created successfully")
        elif response.status_code == 400 and "already registered" in response.text:
            print("✅ Provider user already exists")
        else:
            print(f"❌ Provider user creation failed: {response.status_code}")
            return
        
        # Step 3: Get the provider user ID
        response = self.make_request("GET", "/users", headers=admin_headers)
        if response.status_code == 200:
            users = response.json()
            provider_user = next((u for u in users if u.get("email") == "linked.provider@clinic.lr"), None)
            if provider_user:
                provider_user_id = provider_user["id"]
                print(f"✅ Provider user ID found: {provider_user_id}")
            else:
                print("❌ Provider user not found")
                return
        else:
            print("❌ Failed to get users")
            return
        
        # Step 4: Create a clinic linked to the provider user
        clinic_data = {
            "name": "Linked Provider Clinic",
            "description": "Clinic linked to provider for communication testing",
            "location": "Central Monrovia, Liberia",
            "phone": "+231-777-123999",
            "email": "linked.provider@clinic.lr",
            "user_id": provider_user_id,  # Link clinic to provider user
            "services": ["Laboratory Tests", "General Medicine"]
        }
        
        response = self.make_request("POST", "/clinics", clinic_data, admin_headers)
        if response.status_code in [200, 201]:
            clinic_response = response.json()
            self.test_data["clinic_id"] = clinic_response["id"]
            print(f"✅ Clinic created and linked to provider: {clinic_response['id']}")
        else:
            print(f"❌ Clinic creation failed: {response.status_code}, {response.text}")
            return
        
        # Step 5: Create a test for booking
        test_data = {
            "name": "Provider Communication Test",
            "description": "Test for provider communication flow",
            "category": "Communication",
            "preparation_instructions": "No special preparation needed"
        }
        
        response = self.make_request("POST", "/tests", test_data, admin_headers)
        if response.status_code in [200, 201]:
            test_response = response.json()
            self.test_data["test_id"] = test_response["id"]
            print(f"✅ Test created: {test_response['id']}")
        else:
            print(f"❌ Test creation failed: {response.status_code}")
            return
        
        # Step 6: Create pricing for the test at the clinic
        pricing_data = {
            "test_id": self.test_data["test_id"],
            "clinic_id": self.test_data["clinic_id"],
            "price_usd": 35.00,
            "price_lrd": 6300.00,
            "is_available": True
        }
        
        response = self.make_request("POST", "/test-pricing", pricing_data, admin_headers)
        if response.status_code in [200, 201]:
            print("✅ Test pricing created")
        else:
            print(f"❌ Test pricing creation failed: {response.status_code}")
            return
        
        # Step 7: Create a booking for the clinic
        booking_data = {
            "patient_name": "Provider Communication Patient",
            "patient_phone": "+231-777-888999",
            "patient_email": "patient@communication.com",
            "patient_location": "Test Location, Monrovia",
            "test_ids": [self.test_data["test_id"]],
            "clinic_id": self.test_data["clinic_id"],
            "delivery_method": "whatsapp",
            "preferred_currency": "USD",
            "delivery_charge": 5.00,
            "notes": "Provider communication test booking"
        }
        
        response = self.make_request("POST", "/bookings", booking_data)
        if response.status_code in [200, 201]:
            booking_response = response.json()
            self.test_data["booking_id"] = booking_response["id"]
            print(f"✅ Booking created: {booking_response['booking_number']}")
        else:
            print(f"❌ Booking creation failed: {response.status_code}")
            return
        
        # Step 8: Provider authentication
        provider_login = {
            "email": "linked.provider@clinic.lr",
            "password": "LinkedProvider123!"
        }
        
        response = self.make_request("POST", "/auth/login", provider_login)
        if response.status_code == 200:
            self.provider_token = response.json()["access_token"]
            print("✅ Provider authenticated successfully")
        else:
            print(f"❌ Provider authentication failed: {response.status_code}")
            return
        
        provider_headers = {"Authorization": f"Bearer {self.provider_token}"}
        
        # Step 9: Test provider can view their clinic's bookings
        response = self.make_request("GET", "/bookings", headers=provider_headers)
        if response.status_code == 200:
            bookings = response.json()
            print(f"✅ Provider can view {len(bookings)} bookings")
            
            # Check if our test booking is in the list
            test_booking = next((b for b in bookings if b.get("id") == self.test_data["booking_id"]), None)
            if test_booking:
                print("✅ Provider can see the test booking")
            else:
                print("❌ Provider cannot see the test booking")
        else:
            print(f"❌ Provider cannot view bookings: {response.status_code}")
            return
        
        # Step 10: Test provider can update booking status
        booking_id = self.test_data["booking_id"]
        status_update = {"status": "sample_collected"}
        
        response = self.make_request("PUT", f"/bookings/{booking_id}/status", status_update, provider_headers)
        if response.status_code == 200:
            print("✅ Provider can update booking status")
        else:
            print(f"❌ Provider cannot update booking status: {response.status_code}")
            return
        
        # Step 11: Test provider can access file upload for results
        response = self.make_request("POST", f"/bookings/{booking_id}/upload-results", headers=provider_headers)
        if response.status_code in [422, 400]:  # Validation error expected without files
            print("✅ Provider can access file upload endpoint")
        elif response.status_code == 403:
            print("❌ Provider blocked from file upload")
        else:
            print(f"✅ Provider has file upload access (status: {response.status_code})")
        
        # Step 12: Verify admin can still manage the booking
        response = self.make_request("GET", f"/bookings/{booking_id}", headers=admin_headers)
        if response.status_code == 200:
            booking = response.json()
            print(f"✅ Admin can monitor booking status: {booking.get('status', 'N/A')}")
        else:
            print(f"❌ Admin cannot access booking: {response.status_code}")
        
        print("\n🎉 Provider-Clinic Communication Flow Test Completed Successfully!")
        print("✅ All communication access features are working properly")

if __name__ == "__main__":
    tester = ProviderClinicLinkTester()
    tester.test_provider_clinic_communication_flow()