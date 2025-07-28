#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for MysticLens Application
Tests all backend endpoints including new authentication system
"""

import requests
import json
import base64
import uuid
from datetime import datetime
import time
import os
from io import BytesIO
from PIL import Image
import random
import string

# Get backend URL from environment
BACKEND_URL = "https://6c821355-5472-40cc-b89c-2c3ef6ee838c.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        self.test_session_id = str(uuid.uuid4())
        self.test_results = []
        
        # Authentication data
        self.test_user_email = f"test_{uuid.uuid4().hex[:8]}@mysticlens.com"
        self.test_user_password = "TestPassword123!"
        self.access_token = None
        self.user_data = None
        
    def log_test(self, test_name, success, details="", error=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": str(error) if error else None,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if error:
            print(f"   Error: {error}")
        print()

    def create_test_image_base64(self):
        """Create a simple test image and convert to base64"""
        try:
            # Create a simple coffee cup-like image
            img = Image.new('RGB', (200, 200), color='white')
            
            # Add some simple shapes that could represent coffee grounds
            from PIL import ImageDraw
            draw = ImageDraw.Draw(img)
            
            # Draw coffee cup outline
            draw.ellipse([50, 50, 150, 150], outline='brown', width=3)
            draw.ellipse([60, 60, 140, 140], outline='brown', width=2)
            
            # Add some random shapes inside (coffee grounds)
            draw.ellipse([70, 70, 80, 80], fill='brown')
            draw.ellipse([90, 85, 100, 95], fill='brown')
            draw.ellipse([110, 75, 120, 85], fill='brown')
            draw.rectangle([75, 100, 85, 110], fill='brown')
            draw.ellipse([100, 105, 110, 115], fill='brown')
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_data = buffer.getvalue()
            base64_string = base64.b64encode(img_data).decode('utf-8')
            
            return base64_string
            
        except Exception as e:
            # Fallback: create a minimal base64 image
            # This is a 1x1 pixel PNG image
            minimal_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            return minimal_png

    def test_coffee_reading_creation(self):
        """Test POST /api/coffee-reading endpoint"""
        try:
            # Create test image
            test_image_base64 = self.create_test_image_base64()
            
            payload = {
                "image_base64": test_image_base64,
                "session_id": self.test_session_id
            }
            
            response = self.session.post(
                f"{self.backend_url}/coffee-reading",
                json=payload,
                timeout=30  # Longer timeout for AI processing
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required response fields
                required_fields = ["id", "session_id", "symbols_found", "interpretation", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Coffee Reading Creation", False, 
                                f"Missing response fields: {missing_fields}", None)
                    return False, None
                
                # Verify session_id matches
                if data["session_id"] != self.test_session_id:
                    self.log_test("Coffee Reading Creation", False, 
                                "Session ID mismatch", None)
                    return False, None
                
                # Check if AI analysis worked
                symbols = data.get("symbols_found", [])
                interpretation = data.get("interpretation", "")
                
                if not symbols or not interpretation:
                    self.log_test("Coffee Reading Creation", False, 
                                "AI analysis failed - no symbols or interpretation", None)
                    return False, None
                
                details = f"ID: {data['id'][:8]}..., Symbols: {len(symbols)}, Interpretation length: {len(interpretation)}"
                self.log_test("Coffee Reading Creation", True, details)
                return True, data
                
            else:
                self.log_test("Coffee Reading Creation", False, 
                            f"HTTP {response.status_code}", response.text)
                return False, None
                
        except Exception as e:
            self.log_test("Coffee Reading Creation", False, "", e)
            return False, None

    def test_get_session_readings(self):
        """Test GET /api/coffee-reading/{session_id} endpoint"""
        try:
            response = self.session.get(
                f"{self.backend_url}/coffee-reading/{self.test_session_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Get Session Readings", False, 
                                "Response is not a list", None)
                    return False
                
                if len(data) == 0:
                    self.log_test("Get Session Readings", False, 
                                "No readings found for session", None)
                    return False
                
                # Check first reading structure
                first_reading = data[0]
                required_fields = ["id", "session_id", "symbols_found", "interpretation", "timestamp"]
                missing_fields = [field for field in required_fields if field not in first_reading]
                
                if missing_fields:
                    self.log_test("Get Session Readings", False, 
                                f"Missing fields in reading: {missing_fields}", None)
                    return False
                
                details = f"Found {len(data)} readings for session"
                self.log_test("Get Session Readings", True, details)
                return True
                
            else:
                self.log_test("Get Session Readings", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Session Readings", False, "", e)
            return False

    def test_get_individual_reading(self, reading_data):
        """Test GET /api/coffee-reading/{session_id}/{reading_id} endpoint"""
        if not reading_data:
            self.log_test("Get Individual Reading", False, 
                        "No reading data available for test", None)
            return False
            
        try:
            reading_id = reading_data["id"]
            response = self.session.get(
                f"{self.backend_url}/coffee-reading/{self.test_session_id}/{reading_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["id", "session_id", "symbols_found", "interpretation", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Get Individual Reading", False, 
                                f"Missing fields: {missing_fields}", None)
                    return False
                
                # Verify IDs match
                if data["id"] != reading_id or data["session_id"] != self.test_session_id:
                    self.log_test("Get Individual Reading", False, 
                                "ID mismatch in response", None)
                    return False
                
                details = f"Retrieved reading {reading_id[:8]}..."
                self.log_test("Get Individual Reading", True, details)
                return True
                
            else:
                self.log_test("Get Individual Reading", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Individual Reading", False, "", e)
            return False

    def test_gemini_integration(self, reading_data):
        """Test Gemini Vision API integration quality"""
        if not reading_data:
            self.log_test("Gemini Integration Quality", False, 
                        "No reading data available for test", None)
            return False
            
        try:
            symbols = reading_data.get("symbols_found", [])
            interpretation = reading_data.get("interpretation", "")
            confidence_score = reading_data.get("confidence_score")
            
            # Check if symbols are meaningful (not just fallback)
            fallback_symbols = ["Gizli mesajlar", "Belirsiz şekiller", "Enerji akışları"]
            has_meaningful_symbols = any(symbol not in fallback_symbols for symbol in symbols)
            
            # Check interpretation quality
            interpretation_quality = len(interpretation) > 100  # At least 100 characters
            
            # Check if Turkish coffee reading terms are present
            turkish_terms = ["fal", "kahve", "fincan", "telve", "şekil", "sembol", "yorum"]
            has_turkish_context = any(term in interpretation.lower() for term in turkish_terms)
            
            quality_score = sum([
                has_meaningful_symbols,
                interpretation_quality,
                has_turkish_context,
                confidence_score is not None
            ])
            
            if quality_score >= 3:
                details = f"Quality score: {quality_score}/4, Symbols: {len(symbols)}, Turkish context: {has_turkish_context}"
                self.log_test("Gemini Integration Quality", True, details)
                return True
            else:
                details = f"Quality score: {quality_score}/4 - Low quality AI response"
                self.log_test("Gemini Integration Quality", False, details, None)
                return False
                
        except Exception as e:
            self.log_test("Gemini Integration Quality", False, "", e)
            return False

    def test_mongodb_persistence(self):
        """Test MongoDB data persistence by creating and retrieving multiple readings"""
        try:
            # Create multiple readings
            readings_created = []
            for i in range(2):
                test_image_base64 = self.create_test_image_base64()
                payload = {
                    "image_base64": test_image_base64,
                    "session_id": self.test_session_id
                }
                
                response = self.session.post(
                    f"{self.backend_url}/coffee-reading",
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    readings_created.append(response.json())
                else:
                    self.log_test("MongoDB Persistence", False, 
                                f"Failed to create reading {i+1}", response.text)
                    return False
                
                time.sleep(1)  # Small delay between requests
            
            # Retrieve all readings for session
            response = self.session.get(
                f"{self.backend_url}/coffee-reading/{self.test_session_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                retrieved_readings = response.json()
                
                if len(retrieved_readings) >= len(readings_created):
                    details = f"Created {len(readings_created)} readings, retrieved {len(retrieved_readings)}"
                    self.log_test("MongoDB Persistence", True, details)
                    return True
                else:
                    self.log_test("MongoDB Persistence", False, 
                                f"Data loss: created {len(readings_created)}, retrieved {len(retrieved_readings)}", None)
                    return False
            else:
                self.log_test("MongoDB Persistence", False, 
                            f"Failed to retrieve readings: HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("MongoDB Persistence", False, "", e)
            return False

    def test_tarot_cards_endpoint(self):
        """Test GET /api/tarot-cards endpoint"""
        try:
            response = self.session.get(f"{self.backend_url}/tarot-cards", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Tarot Cards Endpoint", False, 
                                "Response is not a list", None)
                    return False
                
                if len(data) == 0:
                    self.log_test("Tarot Cards Endpoint", False, 
                                "No tarot cards found", None)
                    return False
                
                # Check first card structure
                first_card = data[0]
                required_fields = ["id", "name", "name_tr", "suit", "meaning_upright", "meaning_reversed"]
                missing_fields = [field for field in required_fields if field not in first_card]
                
                if missing_fields:
                    self.log_test("Tarot Cards Endpoint", False, 
                                f"Missing fields in card: {missing_fields}", None)
                    return False
                
                details = f"Found {len(data)} tarot cards"
                self.log_test("Tarot Cards Endpoint", True, details)
                return True
                
            else:
                self.log_test("Tarot Cards Endpoint", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Tarot Cards Endpoint", False, "", e)
            return False

    def test_tarot_reading_creation(self):
        """Test POST /api/tarot-reading endpoint"""
        try:
            payload = {
                "spread_type": "three_card",
                "session_id": self.test_session_id
            }
            
            response = self.session.post(
                f"{self.backend_url}/tarot-reading",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required response fields
                required_fields = ["id", "session_id", "spread_type", "cards_drawn", "interpretation", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Tarot Reading Creation", False, 
                                f"Missing response fields: {missing_fields}", None)
                    return False, None
                
                # Verify session_id matches
                if data["session_id"] != self.test_session_id:
                    self.log_test("Tarot Reading Creation", False, 
                                "Session ID mismatch", None)
                    return False, None
                
                # Check cards_drawn structure
                cards_drawn = data.get("cards_drawn", [])
                if len(cards_drawn) != 3:
                    self.log_test("Tarot Reading Creation", False, 
                                f"Expected 3 cards, got {len(cards_drawn)}", None)
                    return False, None
                
                # Check interpretation
                interpretation = data.get("interpretation", "")
                if not interpretation:
                    self.log_test("Tarot Reading Creation", False, 
                                "No interpretation provided", None)
                    return False, None
                
                details = f"ID: {data['id'][:8]}..., Cards: {len(cards_drawn)}, Interpretation length: {len(interpretation)}"
                self.log_test("Tarot Reading Creation", True, details)
                return True, data
                
            else:
                self.log_test("Tarot Reading Creation", False, 
                            f"HTTP {response.status_code}", response.text)
                return False, None
                
        except Exception as e:
            self.log_test("Tarot Reading Creation", False, "", e)
            return False, None

    def test_tarot_session_readings(self):
        """Test GET /api/tarot-reading/{session_id} endpoint"""
        try:
            response = self.session.get(
                f"{self.backend_url}/tarot-reading/{self.test_session_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Tarot Session Readings", False, 
                                "Response is not a list", None)
                    return False
                
                details = f"Found {len(data)} tarot readings for session"
                self.log_test("Tarot Session Readings", True, details)
                return True
                
            else:
                self.log_test("Tarot Session Readings", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Tarot Session Readings", False, "", e)
            return False

    def test_palm_reading_creation(self):
        """Test POST /api/palm-reading endpoint"""
        try:
            # Create test hand image
            test_image_base64 = self.create_test_image_base64()
            
            payload = {
                "image_base64": test_image_base64,
                "hand_type": "right",
                "session_id": self.test_session_id
            }
            
            response = self.session.post(
                f"{self.backend_url}/palm-reading",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required response fields
                required_fields = ["id", "session_id", "hand_type", "lines_found", "interpretation", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Palm Reading Creation", False, 
                                f"Missing response fields: {missing_fields}", None)
                    return False, None
                
                # Verify session_id matches
                if data["session_id"] != self.test_session_id:
                    self.log_test("Palm Reading Creation", False, 
                                "Session ID mismatch", None)
                    return False, None
                
                # Check hand_type
                if data["hand_type"] != "right":
                    self.log_test("Palm Reading Creation", False, 
                                "Hand type mismatch", None)
                    return False, None
                
                # Check lines and interpretation
                lines = data.get("lines_found", [])
                interpretation = data.get("interpretation", "")
                
                if not lines or not interpretation:
                    self.log_test("Palm Reading Creation", False, 
                                "AI analysis failed - no lines or interpretation", None)
                    return False, None
                
                details = f"ID: {data['id'][:8]}..., Lines: {len(lines)}, Interpretation length: {len(interpretation)}"
                self.log_test("Palm Reading Creation", True, details)
                return True, data
                
            else:
                self.log_test("Palm Reading Creation", False, 
                            f"HTTP {response.status_code}", response.text)
                return False, None
                
        except Exception as e:
            self.log_test("Palm Reading Creation", False, "", e)
            return False, None

    def test_palm_session_readings(self):
        """Test GET /api/palm-reading/{session_id} endpoint"""
        try:
            response = self.session.get(
                f"{self.backend_url}/palm-reading/{self.test_session_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Palm Session Readings", False, 
                                "Response is not a list", None)
                    return False
                
                details = f"Found {len(data)} palm readings for session"
                self.log_test("Palm Session Readings", True, details)
                return True
                
            else:
                self.log_test("Palm Session Readings", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Palm Session Readings", False, "", e)
            return False

    def test_astrology_reading_creation(self):
        """Test POST /api/astrology-reading endpoint"""
        try:
            payload = {
                "birth_date": "1990-05-15",
                "birth_time": "14:30",
                "birth_place": "Istanbul, Turkey",
                "session_id": self.test_session_id
            }
            
            response = self.session.post(
                f"{self.backend_url}/astrology-reading",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required response fields
                required_fields = ["id", "session_id", "birth_date", "birth_time", "birth_place", "zodiac_sign", "planets", "interpretation", "timestamp"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Astrology Reading Creation", False, 
                                f"Missing response fields: {missing_fields}", None)
                    return False, None
                
                # Verify session_id matches
                if data["session_id"] != self.test_session_id:
                    self.log_test("Astrology Reading Creation", False, 
                                "Session ID mismatch", None)
                    return False, None
                
                # Check zodiac sign calculation
                zodiac_sign = data.get("zodiac_sign")
                if zodiac_sign != "taurus":  # May 15 should be Taurus
                    self.log_test("Astrology Reading Creation", False, 
                                f"Incorrect zodiac calculation: expected 'taurus', got '{zodiac_sign}'", None)
                    return False, None
                
                # Check interpretation
                interpretation = data.get("interpretation", "")
                if not interpretation:
                    self.log_test("Astrology Reading Creation", False, 
                                "No interpretation provided", None)
                    return False, None
                
                details = f"ID: {data['id'][:8]}..., Zodiac: {zodiac_sign}, Interpretation length: {len(interpretation)}"
                self.log_test("Astrology Reading Creation", True, details)
                return True, data
                
            else:
                self.log_test("Astrology Reading Creation", False, 
                            f"HTTP {response.status_code}", response.text)
                return False, None
                
        except Exception as e:
            self.log_test("Astrology Reading Creation", False, "", e)
            return False, None

    def test_astrology_session_readings(self):
        """Test GET /api/astrology-reading/{session_id} endpoint"""
        try:
            response = self.session.get(
                f"{self.backend_url}/astrology-reading/{self.test_session_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_test("Astrology Session Readings", False, 
                                "Response is not a list", None)
                    return False
                
                details = f"Found {len(data)} astrology readings for session"
                self.log_test("Astrology Session Readings", True, details)
                return True
                
            else:
                self.log_test("Astrology Session Readings", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Astrology Session Readings", False, "", e)
            return False

    def test_zodiac_signs_endpoint(self):
        """Test GET /api/zodiac-signs endpoint"""
        try:
            response = self.session.get(f"{self.backend_url}/zodiac-signs", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, dict):
                    self.log_test("Zodiac Signs Endpoint", False, 
                                "Response is not a dictionary", None)
                    return False
                
                # Check for expected zodiac signs
                expected_signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", 
                                "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
                
                missing_signs = [sign for sign in expected_signs if sign not in data]
                if missing_signs:
                    self.log_test("Zodiac Signs Endpoint", False, 
                                f"Missing zodiac signs: {missing_signs}", None)
                    return False
                
                # Check structure of first sign
                first_sign_data = data["aries"]
                required_fields = ["name", "dates", "element", "ruling_planet"]
                missing_fields = [field for field in required_fields if field not in first_sign_data]
                
                if missing_fields:
                    self.log_test("Zodiac Signs Endpoint", False, 
                                f"Missing fields in zodiac data: {missing_fields}", None)
                    return False
                
                details = f"Found {len(data)} zodiac signs with complete data"
                self.log_test("Zodiac Signs Endpoint", True, details)
                return True
                
            else:
                self.log_test("Zodiac Signs Endpoint", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Zodiac Signs Endpoint", False, "", e)
            return False

    def test_updated_health_check(self):
        """Test updated health check with all 4 features"""
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["status", "timestamp", "services"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Updated Health Check", False, 
                                f"Missing fields: {missing_fields}", None)
                    return False
                
                # Check services status
                services = data.get("services", {})
                features = services.get("features", {})
                
                # Check all 4 features are present and active
                expected_features = ["coffee_reading", "tarot_reading", "palm_reading", "astrology"]
                missing_features = [feature for feature in expected_features if not features.get(feature)]
                
                if missing_features:
                    self.log_test("Updated Health Check", False, 
                                f"Inactive features: {missing_features}", None)
                    return False
                
                db_status = services.get("database")
                ai_status = services.get("ai_service")
                
                details = f"Status: {data['status']}, DB: {db_status}, AI: {ai_status}, Features: {len(expected_features)}/4 active"
                self.log_test("Updated Health Check", True, details)
                return True
            else:
                self.log_test("Updated Health Check", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Updated Health Check", False, "", e)
            return False

    def test_error_handling(self):
        """Test error handling scenarios"""
        try:
            # Test invalid session ID
            response = self.session.get(
                f"{self.backend_url}/coffee-reading/invalid-session-id",
                timeout=10
            )
            
            # Should return empty list or proper error, not crash
            if response.status_code in [200, 404]:
                self.log_test("Error Handling - Invalid Session", True, 
                            f"Handled gracefully with HTTP {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid Session", False, 
                            f"Unexpected status: {response.status_code}", response.text)
                return False
            
            # Test invalid reading ID
            response = self.session.get(
                f"{self.backend_url}/coffee-reading/{self.test_session_id}/invalid-reading-id",
                timeout=10
            )
            
            if response.status_code in [404, 422]:
                self.log_test("Error Handling - Invalid Reading ID", True, 
                            f"Handled gracefully with HTTP {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid Reading ID", False, 
                            f"Unexpected status: {response.status_code}", response.text)
                return False
            
            # Test malformed request
            response = self.session.post(
                f"{self.backend_url}/coffee-reading",
                json={"invalid": "data"},
                timeout=10
            )
            
            if response.status_code in [400, 422]:
                self.log_test("Error Handling - Malformed Request", True, 
                            f"Handled gracefully with HTTP {response.status_code}")
                return True
            else:
                self.log_test("Error Handling - Malformed Request", False, 
                            f"Unexpected status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Error Handling", False, "", e)
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🧪 Starting Comprehensive Backend API Tests")
        print(f"Backend URL: {self.backend_url}")
        print(f"Test Session ID: {self.test_session_id}")
        print("=" * 60)
        
        # Test 1: Updated Health Check (all 4 features)
        health_ok = self.test_updated_health_check()
        
        # COFFEE READING TESTS
        print("\n☕ COFFEE READING TESTS")
        print("-" * 30)
        creation_ok, reading_data = self.test_coffee_reading_creation()
        session_readings_ok = self.test_get_session_readings()
        individual_reading_ok = self.test_get_individual_reading(reading_data)
        gemini_ok = self.test_gemini_integration(reading_data)
        
        # TAROT READING TESTS
        print("\n🔮 TAROT READING TESTS")
        print("-" * 30)
        tarot_cards_ok = self.test_tarot_cards_endpoint()
        tarot_creation_ok, tarot_data = self.test_tarot_reading_creation()
        tarot_session_ok = self.test_tarot_session_readings()
        
        # PALM READING TESTS
        print("\n🤚 PALM READING TESTS")
        print("-" * 30)
        palm_creation_ok, palm_data = self.test_palm_reading_creation()
        palm_session_ok = self.test_palm_session_readings()
        
        # ASTROLOGY TESTS
        print("\n⭐ ASTROLOGY TESTS")
        print("-" * 30)
        zodiac_signs_ok = self.test_zodiac_signs_endpoint()
        astrology_creation_ok, astrology_data = self.test_astrology_reading_creation()
        astrology_session_ok = self.test_astrology_session_readings()
        
        # SYSTEM TESTS
        print("\n🔧 SYSTEM TESTS")
        print("-" * 30)
        mongodb_ok = self.test_mongodb_persistence()
        error_handling_ok = self.test_error_handling()
        
        # Summary
        print("=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"   {result['details']}")
            if result["error"]:
                print(f"   Error: {result['error']}")
        
        # Feature-based assessment
        print("\n🎯 FEATURE ASSESSMENT:")
        
        # Coffee Reading
        coffee_tests = [creation_ok, session_readings_ok, individual_reading_ok, gemini_ok]
        coffee_passed = sum(coffee_tests)
        print(f"☕ Coffee Reading: {coffee_passed}/4 tests passed")
        
        # Tarot Reading
        tarot_tests = [tarot_cards_ok, tarot_creation_ok, tarot_session_ok]
        tarot_passed = sum(tarot_tests)
        print(f"🔮 Tarot Reading: {tarot_passed}/3 tests passed")
        
        # Palm Reading
        palm_tests = [palm_creation_ok, palm_session_ok]
        palm_passed = sum(palm_tests)
        print(f"🤚 Palm Reading: {palm_passed}/2 tests passed")
        
        # Astrology
        astrology_tests = [zodiac_signs_ok, astrology_creation_ok, astrology_session_ok]
        astrology_passed = sum(astrology_tests)
        print(f"⭐ Astrology: {astrology_passed}/3 tests passed")
        
        # System
        system_tests = [health_ok, mongodb_ok, error_handling_ok]
        system_passed = sum(system_tests)
        print(f"🔧 System: {system_passed}/3 tests passed")
        
        # Overall critical functionality
        all_critical_tests = coffee_tests + tarot_tests + palm_tests + astrology_tests + [health_ok]
        critical_passed = sum(all_critical_tests)
        total_critical = len(all_critical_tests)
        
        print(f"\n🎯 OVERALL CRITICAL FUNCTIONALITY: {critical_passed}/{total_critical} tests passed")
        
        if critical_passed >= total_critical * 0.9:  # 90% or higher
            print("✅ Excellent! All major backend functionality is working!")
        elif critical_passed >= total_critical * 0.75:  # 75% or higher
            print("✅ Good! Most backend functionality works, minor issues detected")
        elif critical_passed >= total_critical * 0.5:  # 50% or higher
            print("⚠️  Moderate functionality, several issues need attention")
        else:
            print("❌ Critical functionality issues detected - major problems")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "critical_passed": critical_passed,
            "total_critical": total_critical,
            "overall_success": critical_passed >= total_critical * 0.75,
            "feature_results": {
                "coffee": {"passed": coffee_passed, "total": len(coffee_tests)},
                "tarot": {"passed": tarot_passed, "total": len(tarot_tests)},
                "palm": {"passed": palm_passed, "total": len(palm_tests)},
                "astrology": {"passed": astrology_passed, "total": len(astrology_tests)},
                "system": {"passed": system_passed, "total": len(system_tests)}
            },
            "test_results": self.test_results
        }

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()