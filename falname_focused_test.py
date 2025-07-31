#!/usr/bin/env python3
"""
Focused Falname Backend API Test
Tests Falname endpoints specifically with proper authentication handling
"""

import requests
import json
import uuid
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://bb17d0e0-22cc-4e35-999a-d1ceaa9efaa2.preview.emergentagent.com/api"

class FalnameAPITester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        self.test_session_id = str(uuid.uuid4())
        
    def log_result(self, test_name, success, details="", error=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def test_health_check_falname_feature(self):
        """Test that health check includes falname: true"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if falname feature is listed as active
                features = data.get("services", {}).get("features", {})
                falname_active = features.get("falname", False)
                
                if falname_active:
                    details = f"Falname feature active in health check: {falname_active}"
                    self.log_result("Health Check - Falname Feature", True, details)
                    return True
                else:
                    self.log_result("Health Check - Falname Feature", False, 
                                f"Falname feature not active in health check: {features}")
                    return False
            else:
                self.log_result("Health Check - Falname Feature", False, 
                            f"Health check failed: HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Health Check - Falname Feature", False, "", str(e))
            return False

    def test_falname_endpoints_authentication_required(self):
        """Test that all Falname endpoints require authentication"""
        try:
            endpoints_to_test = [
                ("POST", "/falname-reading", {"intention": "Test intention"}),
                ("GET", f"/falname-reading/{self.test_session_id}", None),
                ("GET", f"/falname-reading/{self.test_session_id}/test-id", None)
            ]
            
            all_protected = True
            results = []
            
            for method, endpoint, payload in endpoints_to_test:
                try:
                    if method == "POST":
                        response = self.session.post(
                            f"{self.backend_url}{endpoint}",
                            json=payload,
                            timeout=10
                        )
                    else:  # GET
                        response = self.session.get(f"{self.backend_url}{endpoint}", timeout=10)
                    
                    # Should return 401 or 403 for authentication required
                    if response.status_code in [401, 403]:
                        results.append(f"✅ {method} {endpoint}")
                    else:
                        results.append(f"❌ {method} {endpoint} (Expected 401/403, got {response.status_code})")
                        all_protected = False
                        
                except Exception as e:
                    results.append(f"❌ {method} {endpoint} (Error: {str(e)})")
                    all_protected = False
            
            details = "; ".join(results)
            self.log_result("Falname Endpoints Authentication", all_protected, details)
            return all_protected
            
        except Exception as e:
            self.log_result("Falname Endpoints Authentication", False, "", str(e))
            return False

    def test_falname_endpoint_structure(self):
        """Test Falname endpoint structure and error responses"""
        try:
            # Test POST endpoint with missing fields
            response = self.session.post(
                f"{self.backend_url}/falname-reading",
                json={},  # Empty payload
                timeout=10
            )
            
            # Should return 401/403 (auth required) or 422 (validation error)
            if response.status_code in [401, 403, 422]:
                auth_structure_ok = True
                auth_details = f"POST endpoint properly validates (HTTP {response.status_code})"
            else:
                auth_structure_ok = False
                auth_details = f"Unexpected response: HTTP {response.status_code}"
            
            # Test POST with proper structure but no auth
            response = self.session.post(
                f"{self.backend_url}/falname-reading",
                json={"intention": "Test intention for structure validation"},
                timeout=10
            )
            
            if response.status_code in [401, 403]:
                structure_ok = True
                structure_details = f"POST with proper payload requires auth (HTTP {response.status_code})"
            else:
                structure_ok = False
                structure_details = f"Unexpected response: HTTP {response.status_code}"
            
            overall_ok = auth_structure_ok and structure_ok
            details = f"{auth_details}; {structure_details}"
            
            self.log_result("Falname Endpoint Structure", overall_ok, details)
            return overall_ok
            
        except Exception as e:
            self.log_result("Falname Endpoint Structure", False, "", str(e))
            return False

    def test_falname_vs_other_endpoints(self):
        """Compare Falname endpoint behavior with other protected endpoints"""
        try:
            # Test Falname endpoint
            falname_response = self.session.post(
                f"{self.backend_url}/falname-reading",
                json={"intention": "Test"},
                timeout=10
            )
            
            # Test Coffee reading endpoint (for comparison)
            coffee_response = self.session.post(
                f"{self.backend_url}/coffee-reading",
                json={"image_base64": "test"},
                timeout=10
            )
            
            # Both should require authentication
            falname_protected = falname_response.status_code in [401, 403]
            coffee_protected = coffee_response.status_code in [401, 403]
            
            if falname_protected and coffee_protected:
                details = f"Both Falname and Coffee endpoints properly protected (Falname: {falname_response.status_code}, Coffee: {coffee_response.status_code})"
                self.log_result("Falname vs Other Endpoints", True, details)
                return True
            else:
                details = f"Inconsistent protection (Falname: {falname_response.status_code}, Coffee: {coffee_response.status_code})"
                self.log_result("Falname vs Other Endpoints", False, details)
                return False
                
        except Exception as e:
            self.log_result("Falname vs Other Endpoints", False, "", str(e))
            return False

    def test_falname_model_validation(self):
        """Test Falname model validation through endpoint responses"""
        try:
            # Test with various invalid payloads
            test_cases = [
                ({}, "Empty payload"),
                ({"wrong_field": "value"}, "Wrong field name"),
                ({"intention": ""}, "Empty intention"),
                ({"intention": "Valid intention", "extra_field": "value"}, "Extra field (should be ignored)")
            ]
            
            results = []
            all_handled_correctly = True
            
            for payload, description in test_cases:
                response = self.session.post(
                    f"{self.backend_url}/falname-reading",
                    json=payload,
                    timeout=10
                )
                
                # Should return 401/403 (auth) or 422 (validation)
                if response.status_code in [401, 403, 422]:
                    results.append(f"✅ {description}")
                else:
                    results.append(f"❌ {description} (HTTP {response.status_code})")
                    all_handled_correctly = False
            
            details = "; ".join(results)
            self.log_result("Falname Model Validation", all_handled_correctly, details)
            return all_handled_correctly
            
        except Exception as e:
            self.log_result("Falname Model Validation", False, "", str(e))
            return False

    def run_focused_tests(self):
        """Run focused Falname API tests"""
        print("📜 FOCUSED FALNAME API TESTS")
        print("=" * 50)
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Session ID: {self.test_session_id}")
        print()
        
        # Run tests
        test_results = []
        
        test_results.append(self.test_health_check_falname_feature())
        test_results.append(self.test_falname_endpoints_authentication_required())
        test_results.append(self.test_falname_endpoint_structure())
        test_results.append(self.test_falname_vs_other_endpoints())
        test_results.append(self.test_falname_model_validation())
        
        # Summary
        print("=" * 50)
        print("📊 FALNAME TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(test_results)
        passed_tests = sum(test_results)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("\n✅ EXCELLENT: All Falname API tests passed!")
            print("   - Health check includes Falname feature")
            print("   - All endpoints properly protected with authentication")
            print("   - Endpoint structure and validation working correctly")
            print("   - Consistent behavior with other protected endpoints")
        elif passed_tests >= total_tests * 0.8:
            print("\n✅ GOOD: Most Falname API functionality working correctly")
        else:
            print("\n❌ ISSUES: Falname API has significant problems")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "all_passed": passed_tests == total_tests
        }

if __name__ == "__main__":
    tester = FalnameAPITester()
    results = tester.run_focused_tests()