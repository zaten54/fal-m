from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import asyncio
import random
import bcrypt
import jwt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import schedule
import time
import threading


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="✨ falım API ✨", description="🔮 Mistik AI ile fal okuma uygulaması 🌙")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 1440))

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')

# Security
security = HTTPBearer()

# User Authentication Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    hashed_password: str
    is_verified: bool = False
    verification_token: Optional[str] = None
    terms_accepted: bool = False
    terms_accepted_at: Optional[datetime] = None
    favorite_zodiac_sign: Optional[str] = None  # Favorite zodiac for daily horoscope
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    accept_terms: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    is_verified: bool
    terms_accepted: bool
    favorite_zodiac_sign: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class VerifyEmail(BaseModel):
    token: str

# Email Service Classes
class EmailService:
    def __init__(self):
        self.api_key = SENDGRID_API_KEY
        self.sender_email = SENDER_EMAIL
        if not self.api_key or not self.sender_email:
            raise ValueError("SendGrid API key or sender email not configured")
    
    async def send_verification_email(self, recipient_email: str, verification_token: str):
        """Email doğrulama maili gönder"""
        try:
            verification_url = f"http://localhost:3000/verify-email?token={verification_token}"
            
            subject = "✨ falım ✨ - Email Adresinizi Doğrulayın"
            
            html_content = f"""
            <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #AF52DE; font-size: 32px; margin: 0; text-shadow: 0 0 10px rgba(175, 82, 222, 0.3);">🔮 ✨ falım ✨ 🔮</h1>
                        <p style="color: #6B7280; font-size: 16px; margin: 10px 0;">🌙 Mistik dünyaya hoş geldiniz ⭐</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #AF52DE, #007AFF); padding: 30px; border-radius: 16px; color: white; text-align: center; margin-bottom: 30px;">
                        <h2 style="margin: 0 0 15px 0; font-size: 24px;">Email Adresinizi Doğrulayın</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <a href="{verification_url}" 
                           style="display: inline-block; background: #007AFF; color: white; text-decoration: none; padding: 15px 30px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                            Email Adresimi Doğrula
                        </a>
                    </div>
                    
                    <div style="background: #F9FAFB; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                            <strong>Not:</strong> Bu link güvenlik nedeniyle 24 saat sonra geçersiz hale gelecektir.
                        </p>
                    </div>
                    
                    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
                        <p>Bu email ✨ falım ✨ tarafından gönderilmiştir.</p>
                        <p>Link çalışmıyorsa şu adresi kopyalayın: {verification_url}</p>
                    </div>
                </body>
            </html>
            """
            
            message = Mail(
                from_email=self.sender_email,
                to_emails=recipient_email,
                subject=subject,
                html_content=html_content
            )
            
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            return response.status_code == 202
            
        except Exception as e:
            logging.error(f"Email sending error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Email gönderme hatası: {str(e)}")

# Authentication Service
class AuthService:
    def __init__(self):
        self.email_service = EmailService()
    
    def hash_password(self, password: str) -> str:
        """Parolayı hash'le"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Parola doğrula"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def create_access_token(self, data: dict) -> str:
        """JWT token oluştur"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    def verify_token(self, token: str) -> dict:
        """JWT token doğrula"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token süresi dolmuş")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Geçersiz token")
    
    def generate_verification_token(self) -> str:
        """Email doğrulama token'ı oluştur"""
        return str(uuid.uuid4())

# Initialize services
auth_service = AuthService()

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Mevcut kullanıcıyı al"""
    try:
        token = credentials.credentials
        payload = auth_service.verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Geçersiz token")
        
        # Kullanıcıyı veritabanından al
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        
        return User(**user)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Kimlik doğrulama hatası")

# Optional authentication dependency
async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Opsiyonel kullanıcı (token yoksa None döner)"""
    try:
        return await get_current_user(credentials)
    except:
        return None


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Coffee Reading Models
class CoffeeReadingCreate(BaseModel):
    image_base64: str
    session_id: Optional[str] = None

class CoffeeReadingResponse(BaseModel):
    id: str
    session_id: str
    symbols_found: List[str]
    interpretation: str
    timestamp: datetime
    confidence_score: Optional[float] = None

class CoffeeReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_base64: str
    symbols_found: List[str] = []
    interpretation: str
    confidence_score: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Tarot Models
class TarotCard(BaseModel):
    id: int
    name: str
    name_tr: str
    suit: str  # major_arcana, cups, wands, swords, pentacles
    meaning_upright: str
    meaning_reversed: str
    description: str
    image_url: str

class TarotReadingCreate(BaseModel):
    spread_type: str = "three_card"  # three_card, celtic_cross
    session_id: Optional[str] = None

class TarotReadingResponse(BaseModel):
    id: str
    session_id: str
    spread_type: str
    cards_drawn: List[dict]  # [{"card": TarotCard, "position": str, "reversed": bool}]
    interpretation: str
    timestamp: datetime

class TarotReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    spread_type: str
    cards_drawn: List[dict] = []
    interpretation: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Palm Reading Models
class PalmReadingCreate(BaseModel):
    image_base64: str
    hand_type: str = "right"  # right, left
    session_id: Optional[str] = None

class PalmReadingResponse(BaseModel):
    id: str
    session_id: str
    hand_type: str
    lines_found: List[str]
    interpretation: str
    timestamp: datetime
    confidence_score: Optional[float] = None

class PalmReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_base64: str
    hand_type: str
    lines_found: List[str] = []
    interpretation: str
    confidence_score: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Astrology Models
class AstrologyReadingCreate(BaseModel):
    birth_date: str  # YYYY-MM-DD format
    birth_time: str  # HH:MM format
    birth_place: str
    session_id: Optional[str] = None

class AstrologyReadingResponse(BaseModel):
    id: str
    session_id: str
    birth_date: str
    birth_time: str
    birth_place: str
    zodiac_sign: str
    planets: dict
    birth_chart: dict
    interpretation: str
    timestamp: datetime

class AstrologyReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    birth_date: str
    birth_time: str
    birth_place: str
    zodiac_sign: str
    planets: dict = {}
    birth_chart: dict = {}
    interpretation: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Daily Horoscope Models
class DailyHoroscopeCreate(BaseModel):
    zodiac_sign: str
    date: str  # YYYY-MM-DD format
    content: str
    language: str = "tr"

class DailyHoroscopeResponse(BaseModel):
    id: str
    zodiac_sign: str
    date: str
    content: str
    language: str
    timestamp: datetime

class DailyHoroscope(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    zodiac_sign: str
    date: str  # YYYY-MM-DD format
    content: str
    language: str = "tr"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# User Profile Update Models (for favorite zodiac)
class UserProfileUpdate(BaseModel):
    favorite_zodiac_sign: Optional[str] = None

# Falname Models
class FalnameReadingCreate(BaseModel):
    intention: str  # User's intention/wish
    session_id: Optional[str] = None

class FalnameReadingResponse(BaseModel):
    id: str
    session_id: str
    intention: str
    verse_or_poem: str  # Ayet veya şiir
    interpretation: str  # Yorum
    advice: str  # Tavsiye
    full_response: str  # Tam AI yanıtı
    timestamp: datetime

class FalnameReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    intention: str
    verse_or_poem: str
    interpretation: str
    advice: str
    full_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
# Tarot Deck Data (Major Arcana + Minor Arcana sample)
TAROT_DECK = [
    # Major Arcana
    {"id": 0, "name": "The Fool", "name_tr": "Deli", "suit": "major_arcana", "meaning_upright": "Yeni başlangıçlar, masumiyet, spontanlık", "meaning_reversed": "Dikkatsizlik, aptalca kararlar", "description": "Yeni bir yolculuğun başlangıcı", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 1, "name": "The Magician", "name_tr": "Büyücü", "suit": "major_arcana", "meaning_upright": "Güç, beceri, konsantrasyon", "meaning_reversed": "Manipülasyon, kötü niyet", "description": "İç gücü ve yaratıcılığı temsil eder", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 2, "name": "The High Priestess", "name_tr": "Yüksek Rahibe", "suit": "major_arcana", "meaning_upright": "Sezgi, gizem, bilinçaltı", "meaning_reversed": "Sırların açığa çıkması", "description": "İç bilgelik ve sezgileri temsil eder", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 3, "name": "The Empress", "name_tr": "İmparatoriçe", "suit": "major_arcana", "meaning_upright": "Bereket, annelik, yaratıcılık", "meaning_reversed": "Boşa harcama, aşırılık", "description": "Doğurganlık ve bolluk", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 4, "name": "The Emperor", "name_tr": "İmparator", "suit": "major_arcana", "meaning_upright": "Otorite, yapı, kontrol", "meaning_reversed": "Tiranlık, katılık", "description": "Güç ve liderlik", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 5, "name": "The Hierophant", "name_tr": "Papaz", "suit": "major_arcana", "meaning_upright": "Gelenek, eğitim, öğretmenlik", "meaning_reversed": "Dogma, uyumsuzluk", "description": "Spiritüel rehberlik", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 6, "name": "The Lovers", "name_tr": "Aşıklar", "suit": "major_arcana", "meaning_upright": "Aşk, uyum, ilişkiler", "meaning_reversed": "Uyumsuzluk, yanlış seçimler", "description": "Aşk ve bağlılık", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 7, "name": "The Chariot", "name_tr": "Savaş Arabası", "suit": "major_arcana", "meaning_upright": "Zafer, kararlılık, kontrol", "meaning_reversed": "Kontrol kaybı, yenilgi", "description": "İrade gücü ve zafer", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 8, "name": "Strength", "name_tr": "Güç", "suit": "major_arcana", "meaning_upright": "İç güç, cesaret, sabır", "meaning_reversed": "Zayıflık, şüphe", "description": "İç güç ve cesaret", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 9, "name": "The Hermit", "name_tr": "Ermiş", "suit": "major_arcana", "meaning_upright": "İç arayış, rehberlik, bilgelik", "meaning_reversed": "İzolasyon, yalnızlık", "description": "İç arayış ve bilgelik", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 10, "name": "Wheel of Fortune", "name_tr": "Kader Çarkı", "suit": "major_arcana", "meaning_upright": "Şans, kader, döngüler", "meaning_reversed": "Kötü şans, kontrol dışı olaylar", "description": "Kader ve değişim", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 11, "name": "Justice", "name_tr": "Adalet", "suit": "major_arcana", "meaning_upright": "Adalet, denge, hakikat", "meaning_reversed": "Adaletsizlik, dengesizlik", "description": "Adalet ve denge", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 12, "name": "The Hanged Man", "name_tr": "Asılan Adam", "suit": "major_arcana", "meaning_upright": "Fedakarlık, yeni bakış açısı", "meaning_reversed": "Direnç, eski kalıplar", "description": "Fedakarlık ve yeni perspektif", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 13, "name": "Death", "name_tr": "Ölüm", "suit": "major_arcana", "meaning_upright": "Dönüşüm, yenilenme, bitiş", "meaning_reversed": "Direnç, durağanlık", "description": "Dönüşüm ve yenilenme", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 14, "name": "Temperance", "name_tr": "Denge", "suit": "major_arcana", "meaning_upright": "Denge, sabır, uyum", "meaning_reversed": "Dengesizlik, aşırılık", "description": "Denge ve ölçülülük", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 15, "name": "The Devil", "name_tr": "Şeytan", "suit": "major_arcana", "meaning_upright": "Bağımlılık, kısıtlama, maddi dünya", "meaning_reversed": "Özgürleşme, farkındalık", "description": "Bağımlılık ve kısıtlamalar", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 16, "name": "The Tower", "name_tr": "Kule", "suit": "major_arcana", "meaning_upright": "Ani değişim, yıkım, aydınlanma", "meaning_reversed": "İç çöküş, kaçınma", "description": "Ani değişim ve yıkım", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 17, "name": "The Star", "name_tr": "Yıldız", "suit": "major_arcana", "meaning_upright": "Umut, ilham, rehberlik", "meaning_reversed": "Umutsuzluk, kayıp", "description": "Umut ve ilham", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 18, "name": "The Moon", "name_tr": "Ay", "suit": "major_arcana", "meaning_upright": "Sezgi, yanılsama, bilinçaltı", "meaning_reversed": "Açıklık, gerçeğin ortaya çıkması", "description": "Sezgi ve gizem", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
    {"id": 19, "name": "The Sun", "name_tr": "Güneş", "suit": "major_arcana", "meaning_upright": "Mutluluk, başarı, enerji", "meaning_reversed": "Geçici mutluluksuzluk", "description": "Mutluluk ve başarı", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 20, "name": "Judgement", "name_tr": "Mahkeme", "suit": "major_arcana", "meaning_upright": "Yargı, yeniden doğuş, af", "meaning_reversed": "Kendini yargılama, geçmişte takılı kalma", "description": "Yargı ve yeniden doğuş", "image_url": "https://images.unsplash.com/photo-1551292831-023188c04451?w=400"},
    {"id": 21, "name": "The World", "name_tr": "Dünya", "suit": "major_arcana", "meaning_upright": "Tamamlanma, başarı, büyük resim", "meaning_reversed": "Eksiklik, hedeflere ulaşamama", "description": "Tamamlanma ve başarı", "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"}
]

# Zodiac Signs Data
ZODIAC_SIGNS = {
    "aries": {"name": "Koç", "dates": "21 Mart - 19 Nisan", "element": "Ateş", "ruling_planet": "Mars"},
    "taurus": {"name": "Boğa", "dates": "20 Nisan - 20 Mayıs", "element": "Toprak", "ruling_planet": "Venüs"},
    "gemini": {"name": "İkizler", "dates": "21 Mayıs - 20 Haziran", "element": "Hava", "ruling_planet": "Merkür"},
    "cancer": {"name": "Yengeç", "dates": "21 Haziran - 22 Temmuz", "element": "Su", "ruling_planet": "Ay"},
    "leo": {"name": "Aslan", "dates": "23 Temmuz - 22 Ağustos", "element": "Ateş", "ruling_planet": "Güneş"},
    "virgo": {"name": "Başak", "dates": "23 Ağustos - 22 Eylül", "element": "Toprak", "ruling_planet": "Merkür"},
    "libra": {"name": "Terazi", "dates": "23 Eylül - 22 Ekim", "element": "Hava", "ruling_planet": "Venüs"},
    "scorpio": {"name": "Akrep", "dates": "23 Ekim - 21 Kasım", "element": "Su", "ruling_planet": "Plüton"},
    "sagittarius": {"name": "Yay", "dates": "22 Kasım - 21 Aralık", "element": "Ateş", "ruling_planet": "Jüpiter"},
    "capricorn": {"name": "Oğlak", "dates": "22 Aralık - 19 Ocak", "element": "Toprak", "ruling_planet": "Satürn"},
    "aquarius": {"name": "Kova", "dates": "20 Ocak - 18 Şubat", "element": "Hava", "ruling_planet": "Uranüs"},
    "pisces": {"name": "Balık", "dates": "19 Şubat - 20 Mart", "element": "Su", "ruling_planet": "Neptün"}
}


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Coffee Reading Models
class CoffeeReadingCreate(BaseModel):
    image_base64: str
    session_id: Optional[str] = None

class CoffeeReadingResponse(BaseModel):
    id: str
    session_id: str
    symbols_found: List[str]
    interpretation: str
    timestamp: datetime
    confidence_score: Optional[float] = None

class CoffeeReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_base64: str
    symbols_found: List[str] = []
    interpretation: str
    confidence_score: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# AI Analysis Service
class CoffeeAnalysisService:
    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if not self.gemini_api_key:
            raise ValueError("Gemini API key not found in environment variables")
    
    async def analyze_coffee_grounds(self, image_base64: str, session_id: str) -> dict:
        """Gemini Vision API kullanarak kahve telvesinanaliz et"""
        try:
            # LlmChat instance oluştur - Gemini için
            chat = LlmChat(
                api_key=self.gemini_api_key,
                session_id=session_id,
                system_message="""Sen deneyimli bir kahve falcısısın. Kahve fincanındaki telveler şekillerin ve desenlerin analiz ederek fal okuyorsun.

Kahve falı kuralları:
- Fincanın farklı bölgeleri farklı anlamlar taşır (kenar: gelecek, orta: şimdiki zaman, dip: geçmiş)
- Şekilleri tanımla: hayvanlar, nesneler, harfler, sayılar, doğal formlar
- Her şeklin pozitif ve yapıcı anlamlarını ver
- Türk kahve falı geleneğine uygun yorumla
- Mistik ama gerçekçi bir ton kullan

Çıktı formatı:
1. Gözlemlenen semboller/şekiller (liste halinde)
2. Genel yorum ve yorumlama (2-3 paragraf)
3. Öneriler ve tavsiyeler"""
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Resim içeriği oluştur
            image_content = ImageContent(image_base64=image_base64)
            
            # Mesaj gönder
            user_message = UserMessage(
                text="Bu kahve fincanındaki telveler analiz et ve detaylı bir fal yorumu yap. Şekilleri tanımla ve anlamlarını açıkla.",
                file_contents=[image_content]
            )
            
            # AI'dan cevap al
            response = await chat.send_message(user_message)
            
            # Response'u parse et
            symbols = self._extract_symbols(response)
            interpretation = response
            confidence_score = 0.85  # Placeholder confidence score
            
            return {
                "symbols_found": symbols,
                "interpretation": interpretation,
                "confidence_score": confidence_score
            }
            
        except Exception as e:
            logging.error(f"Coffee analysis error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"AI analizi sırasında hata oluştu: {str(e)}")
    
    def _extract_symbols(self, ai_response: str) -> List[str]:
        """AI cevabından sembolleri çıkar"""
        symbols = []
        lines = ai_response.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['sembol', 'şekil', 'görünüm', 'tanımlanan']):
                # Basit sembol çıkarma - geliştirilebilir
                if ':' in line:
                    symbol = line.split(':')[0].strip().replace('-', '').replace('*', '').strip()
                    if len(symbol) > 2 and len(symbol) < 50:
                        symbols.append(symbol)
        
        # Fallback symbols if none found
        if not symbols:
            symbols = ["Gizli mesajlar", "Belirsiz şekiller", "Enerji akışları"]
            
        return symbols[:10]  # Max 10 symbol

# Tarot Analysis Service
class TarotAnalysisService:
    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if not self.gemini_api_key:
            raise ValueError("Gemini API key not found in environment variables")
    
    async def interpret_tarot_spread(self, cards_drawn: List[dict], spread_type: str, session_id: str) -> str:
        """Tarot kartlarını yorumla"""
        try:
            # Cards bilgisini hazırla
            cards_info = ""
            positions = {
                "three_card": ["Geçmiş", "Şimdi", "Gelecek"]
            }
            
            for i, card_data in enumerate(cards_drawn):
                card = card_data["card"]
                position = positions[spread_type][i] if i < len(positions[spread_type]) else f"Pozisyon {i+1}"
                reversed = card_data["reversed"]
                
                cards_info += f"\n{position}: {card['name_tr']} ({card['name']})"
                cards_info += f"\nDurum: {'Ters' if reversed else 'Düz'}"
                cards_info += f"\nAnlamı: {card['meaning_reversed'] if reversed else card['meaning_upright']}"
                cards_info += f"\nAçıklama: {card['description']}\n"
            
            # LlmChat instance oluştur
            chat = LlmChat(
                api_key=self.gemini_api_key,
                session_id=session_id,
                system_message="""Sen deneyimli bir tarot okuyucususun. Çekilen kartları analiz ederek kapsamlı ve anlam dolu yorumlar yapıyorsun.

Tarot okuma kuralları:
- Her kartın pozisyondaki özel anlamını değerlendir
- Kartlar arasındaki bağlantıları ve hikayeyi oluştur
- Hem bireysel kart anlamlarını hem de genel mesajı ver
- Yapıcı ve yol gösterici tavsiyelerde bulun
- Mistik ama gerçekçi bir ton kullan
- Türk kültürüne uygun şekilde yorumla

Çıktı formatı:
1. Kart analizi (her kart için ayrı değerlendirme)
2. Genel mesaj ve hikaye
3. Pratik öneriler ve tavsiyeleri"""
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Mesaj gönder
            user_message = UserMessage(
                text=f"Bu tarot kartlarını {spread_type} yayılımı için yorumla:\n{cards_info}\n\nDetaylı bir tarot yorumu ve rehberlik yap."
            )
            
            # AI'dan cevap al
            response = await chat.send_message(user_message)
            return response
            
        except Exception as e:
            logging.error(f"Tarot analysis error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Tarot analizi sırasında hata oluştu: {str(e)}")

# Palm Analysis Service
class PalmAnalysisService:
    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if not self.gemini_api_key:
            raise ValueError("Gemini API key not found in environment variables")
    
    async def analyze_palm_lines(self, image_base64: str, hand_type: str, session_id: str) -> dict:
        """Gemini Vision API kullanarak el çizgilerini analiz et"""
        try:
            # LlmChat instance oluştur - Gemini için
            chat = LlmChat(
                api_key=self.gemini_api_key,
                session_id=session_id,
                system_message=f"""Sen deneyimli bir el falcısısın. {hand_type} el fotoğrafındaki çizgileri analiz ederek fal okuyorsun.

El falı kuralları:
- Ana çizgileri tanımla: yaşam çizgisi, kalp çizgisi, kafa çizgisi, kader çizgisi
- Her çizginin uzunluğu, derinliği, kesintileri analiz et
- El şekli ve parmak yapısını değerlendir
- Geleneksel palmistry bilgilerine uygun yorumla
- Pozitif ve yapıcı bir yaklaşım benimse

Çıktı formatı:
1. Tespit edilen çizgiler (liste halinde)
2. Her çizginin anlamı ve yorumu
3. Genel kişilik analizi
4. Gelecekle ilgili öngörüler"""
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Resim içeriği oluştur
            image_content = ImageContent(image_base64=image_base64)
            
            # Mesaj gönder
            user_message = UserMessage(
                text=f"Bu {hand_type} el fotoğrafındaki çizgileri analiz et ve detaylı bir el falı yorumu yap. Ana çizgileri tanımla ve anlamlarını açıkla.",
                file_contents=[image_content]
            )
            
            # AI'dan cevap al
            response = await chat.send_message(user_message)
            
            # Response'u parse et
            lines = self._extract_lines(response)
            interpretation = response
            confidence_score = 0.80  # Placeholder confidence score
            
            return {
                "lines_found": lines,
                "interpretation": interpretation,
                "confidence_score": confidence_score
            }
            
        except Exception as e:
            logging.error(f"Palm analysis error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"El falı analizi sırasında hata oluştu: {str(e)}")
    
    def _extract_lines(self, ai_response: str) -> List[str]:
        """AI cevabından çizgileri çıkar"""
        lines = []
        lines_keywords = ['yaşam çizgisi', 'kalp çizgisi', 'kafa çizgisi', 'kader çizgisi', 'başarı çizgisi']
        
        for keyword in lines_keywords:
            if keyword.lower() in ai_response.lower():
                lines.append(keyword.title())
        
        # Fallback lines if none found
        if not lines:
            lines = ["Yaşam Çizgisi", "Kalp Çizgisi", "Kafa Çizgisi"]
            
        return lines

# Astrology Analysis Service
class AstrologyAnalysisService:
    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if not self.gemini_api_key:
            raise ValueError("Gemini API key not found in environment variables")
    
    def calculate_zodiac_sign(self, birth_date: str) -> str:
        """Doğum tarihinden burç hesapla"""
        try:
            from datetime import datetime
            date_obj = datetime.strptime(birth_date, "%Y-%m-%d")
            day = date_obj.day
            month = date_obj.month
            
            if (month == 3 and day >= 21) or (month == 4 and day <= 19):
                return "aries"
            elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
                return "taurus"
            elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
                return "gemini"
            elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
                return "cancer"
            elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
                return "leo"
            elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
                return "virgo"
            elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
                return "libra"
            elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
                return "scorpio"
            elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
                return "sagittarius"
            elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
                return "capricorn"
            elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
                return "aquarius"
            else:  # Pisces
                return "pisces"
        except:
            return "unknown"
    
    def calculate_birth_chart(self, birth_date: str, birth_time: str, birth_place: str) -> dict:
        """Doğum haritası hesapla (basitleştirilmiş)"""
        import random
        from datetime import datetime
        
        try:
            date_obj = datetime.strptime(birth_date, "%Y-%m-%d")
            time_parts = birth_time.split(":")
            hour = int(time_parts[0])
            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
            
            # Basit hesaplamalar (gerçek astroloji hesaplamaları çok karmaşık)
            # Bu örnek amaçlı basitleştirilmiş versiyonudur
            
            # 12 astroloji evi
            houses = {}
            house_names = [
                "Kişilik", "Mal Varlığı", "İletişim", "Aile", "Yaratıcılık", "Sağlık",
                "İlişkiler", "Dönüşüm", "Felsefe", "Kariyer", "Dostluk", "Spiritüalite"
            ]
            
            for i in range(12):
                # Her ev için burç hesapla (basitleştirilmiş)
                house_sign_index = (date_obj.month + hour + i) % 12
                house_signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", 
                              "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
                
                houses[f"house_{i+1}"] = {
                    "name": house_names[i],
                    "sign": house_signs[house_sign_index],
                    "degree": (date_obj.day + minute + i * 30) % 360
                }
            
            # Gezegenler (basitleştirilmiş pozisyonlar)
            planets = {
                "sun": {
                    "sign": self.calculate_zodiac_sign(birth_date),
                    "degree": (date_obj.day * 12 + hour) % 360,
                    "house": ((date_obj.day + hour) % 12) + 1
                },
                "moon": {
                    "sign": house_signs[(date_obj.day + hour + 2) % 12],
                    "degree": (date_obj.day * 13 + minute) % 360,
                    "house": ((date_obj.day + hour + 2) % 12) + 1
                },
                "mercury": {
                    "sign": house_signs[(date_obj.month + hour) % 12],
                    "degree": (date_obj.month * 30 + hour * 15) % 360,
                    "house": ((date_obj.month + hour) % 12) + 1
                },
                "venus": {
                    "sign": house_signs[(date_obj.month + date_obj.day) % 12],
                    "degree": (date_obj.month * 25 + date_obj.day * 5) % 360,
                    "house": ((date_obj.month + date_obj.day) % 12) + 1
                },
                "mars": {
                    "sign": house_signs[(date_obj.day + minute) % 12],
                    "degree": (date_obj.day * 18 + minute * 6) % 360,
                    "house": ((date_obj.day + minute) % 12) + 1
                },
                "jupiter": {
                    "sign": house_signs[(date_obj.year % 12)],
                    "degree": (date_obj.year % 360),
                    "house": ((date_obj.year % 12)) + 1
                }
            }
            
            return {
                "houses": houses,
                "planets": planets,
                "ascendant": {
                    "sign": house_signs[(hour + minute // 60) % 12],
                    "degree": (hour * 15 + minute // 4) % 360
                },
                "midheaven": {
                    "sign": house_signs[(hour + 6) % 12],
                    "degree": (hour * 15 + 90) % 360
                }
            }
            
        except Exception as e:
            logging.error(f"Birth chart calculation error: {e}")
            return {}
    
    async def generate_astrology_reading(self, birth_info: dict, session_id: str) -> str:
        """Astroloji okuma oluştur"""
        try:
            zodiac_sign = birth_info["zodiac_sign"]
            zodiac_info = ZODIAC_SIGNS.get(zodiac_sign, {})
            birth_chart = birth_info.get("birth_chart", {})
            
            # LlmChat instance oluştur
            chat = LlmChat(
                api_key=self.gemini_api_key,
                session_id=session_id,
                system_message="""Sen deneyimli bir astrologsun. Doğum bilgileri ve doğum haritası verilen kişi için kapsamlı astroloji yorumu yapıyorsun.

Astroloji kuralları:
- Burç özelliklerini detaylı analiz et
- Doğum saati ve yerinin etkilerini değerlendir
- Gezegen konumlarının kişilik üzerindeki etkilerini açıkla
- Astroloji evlerinin anlamlarını değerlendir
- Yükseleni ve Orta Gökyüzü'nün etkilerini açıkla
- Gelecek dönemler için öngörülerde bulun
- Pozitif ve yol gösterici bir yaklaşım benimse

Çıktı formatı:
1. Ana burç analizi ve kişilik özellikleri
2. Yükselen burç ve etkisi
3. Gezegen konumları analizi
4. Güçlü yönler ve potansiyeller
5. Dikkat edilmesi gereken alanlar
6. Gelecek döneme dair öngörüler
7. Öneriler ve tavsiyeler"""
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Chart bilgilerini hazırla
            chart_info = ""
            if birth_chart.get("planets"):
                chart_info += "\nGezegen Konumları:\n"
                for planet, info in birth_chart["planets"].items():
                    planet_tr = {
                        "sun": "Güneş", "moon": "Ay", "mercury": "Merkür", 
                        "venus": "Venüs", "mars": "Mars", "jupiter": "Jüpiter"
                    }.get(planet, planet)
                    sign_name = ZODIAC_SIGNS.get(info["sign"], {}).get("name", info["sign"])
                    chart_info += f"- {planet_tr}: {sign_name} burcunda, {info['house']}. evde\n"
            
            if birth_chart.get("ascendant"):
                asc_sign = ZODIAC_SIGNS.get(birth_chart["ascendant"]["sign"], {}).get("name", "Bilinmiyor")
                chart_info += f"\nYükselen: {asc_sign}"
            
            # Mesaj gönder
            user_message = UserMessage(
                text=f"""Doğum bilgileri:
- Doğum Tarihi: {birth_info['birth_date']}
- Doğum Saati: {birth_info['birth_time']}
- Doğum Yeri: {birth_info['birth_place']}
- Ana Burç: {zodiac_info.get('name', 'Bilinmiyor')}
- Element: {zodiac_info.get('element', 'Bilinmiyor')}
- Yönetici Gezegen: {zodiac_info.get('ruling_planet', 'Bilinmiyor')}

{chart_info}

Bu kapsamlı doğum haritası bilgilerine göre detaylı astroloji yorumu ve kişilik analizi yap."""
            )
            
            # AI'dan cevap al
            response = await chat.send_message(user_message)
            return response
            
        except Exception as e:
            logging.error(f"Astrology analysis error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Astroloji analizi sırasında hata oluştu: {str(e)}")

    async def generate_daily_horoscope(self, zodiac_sign: str, date: str, language: str = "tr") -> str:
        """Günlük burç yorumu oluştur"""
        try:
            zodiac_info = ZODIAC_SIGNS.get(zodiac_sign, {})
            session_id = f"daily_horoscope_{zodiac_sign}_{date}"
            
            # Dil seçimini kontrol et
            language_prompts = {
                "tr": "Türkçe",
                "en": "İngilizce", 
                "de": "Almanca",
                "fr": "Fransızca",
                "es": "İspanyolca"
            }
            target_language = language_prompts.get(language, "Türkçe")
            
            # LlmChat instance oluştur
            chat = LlmChat(
                api_key=self.gemini_api_key,
                session_id=session_id,
                system_message=f"""Sen deneyimli bir astrologsun. {target_language} dilinde günlük burç yorumları yazıyorsun.

Günlük burç yorumu kuralları:
- Kısa bir paragraf (50-80 kelime) olmalı
- Pozitif ve motive edici olmalı
- Bugüne özel tavsiyeler içermeli
- Aşk, kariyer, sağlık konularından birini vurgula
- {target_language} dilinde doğal ve akıcı olmalı
- Genel geçer ifadeler kullanma, spesifik ol
- Umut verici ve ilham dolu bir ton kullan

Çıktı: Sadece burç yorumu paragrafını yaz, başlık veya ekstra açıklama ekleme."""
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Mesaj gönder
            user_message = UserMessage(
                text=f"{zodiac_info.get('name', zodiac_sign)} burcu için {date} tarihine özel günlük burç yorumu yaz. Element: {zodiac_info.get('element', '')}, Yöneten Gezegen: {zodiac_info.get('ruling_planet', '')}. Bugün için özel motivasyon ve rehberlik içeren bir yorum hazırla."
            )
            
            # AI'dan cevap al
            response = await chat.send_message(user_message)
            return response.strip()
            
        except Exception as e:
            logging.error(f"Daily horoscope generation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Günlük burç yorumu oluşturma hatası: {str(e)}")

    async def generate_all_daily_horoscopes(self, date: str, language: str = "tr") -> List[dict]:
        """Tüm burçlar için günlük yorumlar oluştur"""
        horoscopes = []
        
        for zodiac_key, zodiac_data in ZODIAC_SIGNS.items():
            try:
                content = await self.generate_daily_horoscope(zodiac_key, date, language)
                horoscope = {
                    "zodiac_sign": zodiac_key,
                    "date": date,
                    "content": content,
                    "language": language,
                    "zodiac_name": zodiac_data.get("name", zodiac_key)
                }
                horoscopes.append(horoscope)
                
                # Rate limiting için kısa bekleme
                await asyncio.sleep(1)
                
            except Exception as e:
                logging.error(f"Error generating horoscope for {zodiac_key}: {str(e)}")
                # Hata durumunda varsayılan mesaj
                horoscope = {
                    "zodiac_sign": zodiac_key,
                    "date": date,
                    "content": f"Bugün {zodiac_data.get('name', zodiac_key)} burcu için özel bir gün. Enerjinizi doğru kanalize edin.",
                    "language": language,
                    "zodiac_name": zodiac_data.get("name", zodiac_key)
                }
                horoscopes.append(horoscope)
        
        return horoscopes

# Initialize services
coffee_service = CoffeeAnalysisService()
tarot_service = TarotAnalysisService()
palm_service = PalmAnalysisService()
astrology_service = AstrologyAnalysisService()

# Authentication Endpoints
@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserRegister, background_tasks: BackgroundTasks):
    """Yeni kullanıcı kaydı"""
    try:
        # Sözleşme onayı kontrolü
        if not user_data.accept_terms:
            raise HTTPException(status_code=400, detail="Kullanıcı sözleşmesini kabul etmelisiniz")
        
        # Email kontrolü
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Bu email adresi zaten kayıtlı")
        
        # Parolayı hash'le
        hashed_password = auth_service.hash_password(user_data.password)
        
        # Doğrulama token'ı oluştur
        verification_token = auth_service.generate_verification_token()
        
        # Kullanıcı oluştur
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            verification_token=verification_token,
            terms_accepted=True,
            terms_accepted_at=datetime.utcnow()
        )
        
        # Veritabanına kaydet
        await db.users.insert_one(user.dict())
        
        # Doğrulama emaili gönder (background task)
        background_tasks.add_task(
            auth_service.email_service.send_verification_email,
            user_data.email,
            verification_token
        )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            is_verified=user.is_verified,
            terms_accepted=user.terms_accepted,
            created_at=user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"User registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kayıt hatası: {str(e)}")

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_data: UserLogin):
    """Kullanıcı girişi"""
    try:
        # Kullanıcıyı bul
        user = await db.users.find_one({"email": user_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Email veya parola hatalı")
        
        # Parolayı doğrula
        if not auth_service.verify_password(user_data.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Email veya parola hatalı")
        
        # Email doğrulanmış mı kontrol et
        if not user["is_verified"]:
            raise HTTPException(status_code=401, detail="Lütfen önce email adresinizi doğrulayın")
        
        # JWT token oluştur
        access_token = auth_service.create_access_token(
            data={"sub": user["id"], "email": user["email"]}
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                is_verified=user["is_verified"],
                terms_accepted=user.get("terms_accepted", False),
                created_at=user["created_at"]
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"User login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Giriş hatası: {str(e)}")

@api_router.post("/auth/verify-email")
async def verify_email(verify_data: VerifyEmail):
    """Email doğrulama"""
    try:
        # Token ile kullanıcıyı bul
        user = await db.users.find_one({"verification_token": verify_data.token})
        if not user:
            raise HTTPException(status_code=400, detail="Geçersiz doğrulama token'ı")
        
        # Kullanıcıyı doğrulanmış olarak işaretle
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "is_verified": True,
                    "verification_token": None,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Email adresiniz başarıyla doğrulandı"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Email verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email doğrulama hatası: {str(e)}")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Mevcut kullanıcı bilgilerini al"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        is_verified=current_user.is_verified,
        terms_accepted=current_user.terms_accepted,
        favorite_zodiac_sign=current_user.favorite_zodiac_sign,
        created_at=current_user.created_at
    )

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_user)):
    """Kullanıcı profilini güncelle (favori burç vb.)"""
    try:
        update_data = {}
        
        # Favori burç güncellemesi
        if profile_data.favorite_zodiac_sign:
            if profile_data.favorite_zodiac_sign not in ZODIAC_SIGNS:
                raise HTTPException(status_code=400, detail="Geçersiz burç seçimi")
            update_data["favorite_zodiac_sign"] = profile_data.favorite_zodiac_sign
        
        # Güncelleme var ise veritabanına kaydet
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": update_data}
            )
        
        # Güncellenmiş kullanıcıyı al
        updated_user = await db.users.find_one({"id": current_user.id})
        if not updated_user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        return UserResponse(
            id=updated_user["id"],
            email=updated_user["email"],
            is_verified=updated_user["is_verified"],
            terms_accepted=updated_user.get("terms_accepted", False),
            favorite_zodiac_sign=updated_user.get("favorite_zodiac_sign"),
            created_at=updated_user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil güncelleme hatası: {str(e)}")

@api_router.post("/auth/resend-verification")
async def resend_verification_email(user_data: UserLogin, background_tasks: BackgroundTasks):
    """Doğrulama emailini tekrar gönder"""
    try:
        # Kullanıcıyı bul
        user = await db.users.find_one({"email": user_data.email})
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        # Parolayı doğrula
        if not auth_service.verify_password(user_data.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Parola hatalı")
        
        # Zaten doğrulanmış mı kontrol et
        if user["is_verified"]:
            raise HTTPException(status_code=400, detail="Email adresi zaten doğrulanmış")
        
        # Yeni token oluştur
        new_verification_token = auth_service.generate_verification_token()
        
        # Token'ı güncelle
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "verification_token": new_verification_token,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Doğrulama emaili gönder (background task)
        background_tasks.add_task(
            auth_service.email_service.send_verification_email,
            user["email"],
            new_verification_token
        )
        
        return {"message": "Doğrulama emaili tekrar gönderildi"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Resend verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email tekrar gönderme hatası: {str(e)}")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "🔮 ✨ falım ✨ 🔮 - Mistik dünyaya hoş geldiniz"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Coffee Reading Endpoints
@api_router.post("/coffee-reading", response_model=CoffeeReadingResponse)
async def create_coffee_reading(reading_data: CoffeeReadingCreate, current_user: User = Depends(get_current_user)):
    """Kahve falı okuma oluştur - Sadece kayıtlı kullanıcılar"""
    try:
        # Session ID oluştur eğer yoksa (kullanıcı ID'si ile bağlantılı)
        session_id = reading_data.session_id or f"{current_user.id}_{uuid.uuid4()}"
        
        # AI analizi yap
        analysis = await coffee_service.analyze_coffee_grounds(
            reading_data.image_base64, 
            session_id
        )
        
        # Reading objesi oluştur (kullanıcı ID'si ile birlikte)
        coffee_reading = CoffeeReading(
            session_id=session_id,
            image_base64=reading_data.image_base64,
            symbols_found=analysis["symbols_found"],
            interpretation=analysis["interpretation"],
            confidence_score=analysis["confidence_score"]
        )
        
        # MongoDB'ye kaydet (kullanıcı ID'si de eklenir)
        reading_dict = coffee_reading.dict()
        reading_dict["user_id"] = current_user.id
        await db.coffee_readings.insert_one(reading_dict)
        
        # Response oluştur
        return CoffeeReadingResponse(
            id=coffee_reading.id,
            session_id=coffee_reading.session_id,
            symbols_found=coffee_reading.symbols_found,
            interpretation=coffee_reading.interpretation,
            timestamp=coffee_reading.timestamp,
            confidence_score=coffee_reading.confidence_score
        )
        
    except Exception as e:
        logging.error(f"Coffee reading creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kahve falı okuma hatası: {str(e)}")

@api_router.get("/coffee-reading/{session_id}", response_model=List[CoffeeReadingResponse])
async def get_coffee_readings(session_id: str, current_user: User = Depends(get_current_user)):
    """Belirli bir session'a ait kahve falı okumalarını getir - Sadece kullanıcının kendi okumalarını"""
    try:
        readings = await db.coffee_readings.find(
            {"session_id": session_id, "user_id": current_user.id}
        ).sort("timestamp", -1).to_list(100)
        
        return [
            CoffeeReadingResponse(
                id=reading["id"],
                session_id=reading["session_id"],
                symbols_found=reading["symbols_found"],
                interpretation=reading["interpretation"],
                timestamp=reading["timestamp"],
                confidence_score=reading.get("confidence_score")
            ) for reading in readings
        ]
        
    except Exception as e:
        logging.error(f"Get coffee readings error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kahve falı geçmişi getirme hatası: {str(e)}")

@api_router.get("/coffee-reading/{session_id}/{reading_id}", response_model=CoffeeReadingResponse)
async def get_coffee_reading(session_id: str, reading_id: str, current_user: User = Depends(get_current_user)):
    """Belirli bir kahve falı okumasını getir - Sadece kullanıcının kendi okumalarını"""
    try:
        reading = await db.coffee_readings.find_one({
            "id": reading_id,
            "session_id": session_id,
            "user_id": current_user.id
        })
        
        if not reading:
            raise HTTPException(status_code=404, detail="Kahve falı bulunamadı")
        
        return CoffeeReadingResponse(
            id=reading["id"],
            session_id=reading["session_id"],
            symbols_found=reading["symbols_found"],
            interpretation=reading["interpretation"],
            timestamp=reading["timestamp"],
            confidence_score=reading.get("confidence_score")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get coffee reading error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Kahve falı getirme hatası: {str(e)}")

# Tarot Reading Endpoints
@api_router.get("/tarot-cards", response_model=List[TarotCard])
async def get_tarot_cards():
    """Tüm tarot kartlarını getir"""
    try:
        return [TarotCard(**card) for card in TAROT_DECK]
    except Exception as e:
        logging.error(f"Get tarot cards error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tarot kartları getirme hatası: {str(e)}")

@api_router.post("/tarot-reading", response_model=TarotReadingResponse)
async def create_tarot_reading(reading_data: TarotReadingCreate, current_user: User = Depends(get_current_user)):
    """Yeni tarot okuma oluştur - Sadece kayıtlı kullanıcılar"""
    try:
        # Session ID oluştur eğer yoksa (kullanıcı ID'si ile bağlantılı)
        session_id = reading_data.session_id or f"{current_user.id}_{uuid.uuid4()}"
        
        # Kartları karıştır ve seç
        if reading_data.spread_type == "three_card":
            num_cards = 3
        else:
            num_cards = 3  # Default
        
        # Random kart seçimi
        selected_cards = random.sample(TAROT_DECK, num_cards)
        
        # Her kart için ters/düz durumu belirle
        cards_drawn = []
        for card in selected_cards:
            card_data = {
                "card": card,
                "position": f"position_{len(cards_drawn) + 1}",
                "reversed": random.choice([True, False])
            }
            cards_drawn.append(card_data)
        
        # AI yorumlama
        interpretation = await tarot_service.interpret_tarot_spread(
            cards_drawn, reading_data.spread_type, session_id
        )
        
        # Reading objesi oluştur
        tarot_reading = TarotReading(
            session_id=session_id,
            spread_type=reading_data.spread_type,
            cards_drawn=cards_drawn,
            interpretation=interpretation
        )
        
        # MongoDB'ye kaydet (kullanıcı ID'si de eklenir)
        reading_dict = tarot_reading.dict()
        reading_dict["user_id"] = current_user.id
        await db.tarot_readings.insert_one(reading_dict)
        
        # Response oluştur
        return TarotReadingResponse(
            id=tarot_reading.id,
            session_id=tarot_reading.session_id,
            spread_type=tarot_reading.spread_type,
            cards_drawn=tarot_reading.cards_drawn,
            interpretation=tarot_reading.interpretation,
            timestamp=tarot_reading.timestamp
        )
        
    except Exception as e:
        logging.error(f"Tarot reading creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tarot okuma hatası: {str(e)}")

@api_router.get("/tarot-reading/{session_id}", response_model=List[TarotReadingResponse])
async def get_tarot_readings(session_id: str, current_user: User = Depends(get_current_user)):
    """Belirli bir session'a ait tarot okumalarını getir - Sadece kullanıcının kendi okumalarını"""
    try:
        readings = await db.tarot_readings.find(
            {"session_id": session_id, "user_id": current_user.id}
        ).sort("timestamp", -1).to_list(100)
        
        return [
            TarotReadingResponse(
                id=reading["id"],
                session_id=reading["session_id"],
                spread_type=reading["spread_type"],
                cards_drawn=reading["cards_drawn"],
                interpretation=reading["interpretation"],
                timestamp=reading["timestamp"]
            ) for reading in readings
        ]
        
    except Exception as e:
        logging.error(f"Get tarot readings error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tarot geçmişi getirme hatası: {str(e)}")

@api_router.get("/tarot-reading/{session_id}/{reading_id}", response_model=TarotReadingResponse)
async def get_tarot_reading(session_id: str, reading_id: str, current_user: User = Depends(get_current_user)):
    """Belirli bir tarot okumasını getir - Sadece kullanıcının kendi okumalarını"""
    try:
        reading = await db.tarot_readings.find_one({
            "id": reading_id,
            "session_id": session_id,
            "user_id": current_user.id
        })
        
        if not reading:
            raise HTTPException(status_code=404, detail="Tarot okuma bulunamadı")
        
        return TarotReadingResponse(
            id=reading["id"],
            session_id=reading["session_id"],
            spread_type=reading["spread_type"],
            cards_drawn=reading["cards_drawn"],
            interpretation=reading["interpretation"],
            timestamp=reading["timestamp"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get tarot reading error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tarot okuma getirme hatası: {str(e)}")
# Palm Reading Endpoints
@api_router.post("/palm-reading", response_model=PalmReadingResponse)
async def create_palm_reading(reading_data: PalmReadingCreate, current_user: User = Depends(get_current_user)):
    """Yeni el falı okuma oluştur - Sadece kayıtlı kullanıcılar"""
    try:
        # Session ID oluştur eğer yoksa (kullanıcı ID'si ile bağlantılı)
        session_id = reading_data.session_id or f"{current_user.id}_{uuid.uuid4()}"
        
        # AI analizi yap
        analysis = await palm_service.analyze_palm_lines(
            reading_data.image_base64, 
            reading_data.hand_type,
            session_id
        )
        
        # Reading objesi oluştur
        palm_reading = PalmReading(
            session_id=session_id,
            image_base64=reading_data.image_base64,
            hand_type=reading_data.hand_type,
            lines_found=analysis["lines_found"],
            interpretation=analysis["interpretation"],
            confidence_score=analysis["confidence_score"]
        )
        
        # MongoDB'ye kaydet (kullanıcı ID'si de eklenir)
        reading_dict = palm_reading.dict()
        reading_dict["user_id"] = current_user.id
        await db.palm_readings.insert_one(reading_dict)
        
        # Response oluştur
        return PalmReadingResponse(
            id=palm_reading.id,
            session_id=palm_reading.session_id,
            hand_type=palm_reading.hand_type,
            lines_found=palm_reading.lines_found,
            interpretation=palm_reading.interpretation,
            timestamp=palm_reading.timestamp,
            confidence_score=palm_reading.confidence_score
        )
        
    except Exception as e:
        logging.error(f"Palm reading creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"El falı okuma hatası: {str(e)}")

@api_router.get("/palm-reading/{session_id}", response_model=List[PalmReadingResponse])
async def get_palm_readings(session_id: str, current_user: User = Depends(get_current_user)):
    """Belirli bir session'a ait el falı okumalarını getir - Sadece kullanıcının kendi okumalarını"""
    try:
        readings = await db.palm_readings.find(
            {"session_id": session_id, "user_id": current_user.id}
        ).sort("timestamp", -1).to_list(100)
        
        return [
            PalmReadingResponse(
                id=reading["id"],
                session_id=reading["session_id"],
                hand_type=reading["hand_type"],
                lines_found=reading["lines_found"],
                interpretation=reading["interpretation"],
                timestamp=reading["timestamp"],
                confidence_score=reading.get("confidence_score")
            ) for reading in readings
        ]
        
    except Exception as e:
        logging.error(f"Get palm readings error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"El falı geçmişi getirme hatası: {str(e)}")

# Astrology Reading Endpoints
@api_router.post("/astrology-reading", response_model=AstrologyReadingResponse)
async def create_astrology_reading(reading_data: AstrologyReadingCreate, current_user: User = Depends(get_current_user)):
    """Yeni astroloji okuma oluştur - Sadece kayıtlı kullanıcılar"""
    try:
        # Session ID oluştur eğer yoksa (kullanıcı ID'si ile bağlantılı)
        session_id = reading_data.session_id or f"{current_user.id}_{uuid.uuid4()}"
        
        # Burç hesapla
        zodiac_sign = astrology_service.calculate_zodiac_sign(reading_data.birth_date)
        
        # Doğum haritası hesapla
        birth_chart = astrology_service.calculate_birth_chart(
            reading_data.birth_date,
            reading_data.birth_time,
            reading_data.birth_place
        )
        
        # Gezegen bilgileri (doğum haritasından)
        planets = birth_chart.get("planets", {
            "sun": ZODIAC_SIGNS.get(zodiac_sign, {}).get("name", "Bilinmiyor"),
            "moon": "Yaklaşık hesaplama gerekli",
            "rising": "Doğum saati ile hesaplanır"
        })
        
        # Birth info hazırla
        birth_info = {
            "birth_date": reading_data.birth_date,
            "birth_time": reading_data.birth_time,
            "birth_place": reading_data.birth_place,
            "zodiac_sign": zodiac_sign,
            "birth_chart": birth_chart
        }
        
        # AI yorumlama
        interpretation = await astrology_service.generate_astrology_reading(birth_info, session_id)
        
        # Reading objesi oluştur
        astrology_reading = AstrologyReading(
            session_id=session_id,
            birth_date=reading_data.birth_date,
            birth_time=reading_data.birth_time,
            birth_place=reading_data.birth_place,
            zodiac_sign=zodiac_sign,
            planets=planets,
            birth_chart=birth_chart,
            interpretation=interpretation
        )
        
        # MongoDB'ye kaydet (kullanıcı ID'si de eklenir)
        reading_dict = astrology_reading.dict()
        reading_dict["user_id"] = current_user.id
        await db.astrology_readings.insert_one(reading_dict)
        
        # Response oluştur
        return AstrologyReadingResponse(
            id=astrology_reading.id,
            session_id=astrology_reading.session_id,
            birth_date=astrology_reading.birth_date,
            birth_time=astrology_reading.birth_time,
            birth_place=astrology_reading.birth_place,
            zodiac_sign=astrology_reading.zodiac_sign,
            planets=astrology_reading.planets,
            birth_chart=astrology_reading.birth_chart,
            interpretation=astrology_reading.interpretation,
            timestamp=astrology_reading.timestamp
        )
        
    except Exception as e:
        logging.error(f"Astrology reading creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Astroloji okuma hatası: {str(e)}")

@api_router.get("/astrology-reading/{session_id}", response_model=List[AstrologyReadingResponse])
async def get_astrology_readings(session_id: str, current_user: User = Depends(get_current_user)):
    """Belirli bir session'a ait astroloji okumalarını getir - Sadece kullanıcının kendi okumalarını"""
    try:
        readings = await db.astrology_readings.find(
            {"session_id": session_id, "user_id": current_user.id}
        ).sort("timestamp", -1).to_list(100)
        
        return [
            AstrologyReadingResponse(
                id=reading["id"],
                session_id=reading["session_id"],
                birth_date=reading["birth_date"],
                birth_time=reading["birth_time"],
                birth_place=reading["birth_place"],
                zodiac_sign=reading["zodiac_sign"],
                planets=reading["planets"],
                birth_chart=reading.get("birth_chart", {}),
                interpretation=reading["interpretation"],
                timestamp=reading["timestamp"]
            ) for reading in readings
        ]
        
    except Exception as e:
        logging.error(f"Get astrology readings error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Astroloji geçmişi getirme hatası: {str(e)}")

@api_router.get("/zodiac-signs")
async def get_zodiac_signs():
    """Tüm burç bilgilerini getir"""
    try:
        return ZODIAC_SIGNS
    except Exception as e:
        logging.error(f"Get zodiac signs error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Burç bilgileri getirme hatası: {str(e)}")

# Daily Horoscope Endpoints
@api_router.get("/daily-horoscope/today", response_model=List[DailyHoroscopeResponse])
async def get_today_horoscopes(language: str = "tr"):
    """Bugünün tüm burç yorumlarını getir"""
    try:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Bugünün yorumlarını veritabanından al
        horoscopes = await db.daily_horoscopes.find({
            "date": today,
            "language": language
        }).to_list(12)
        
        # Eğer bugünün yorumları yoksa oluştur
        if len(horoscopes) < 12:
            # Eksik olan burçların yorumlarını oluştur
            existing_signs = [h["zodiac_sign"] for h in horoscopes]
            missing_signs = [sign for sign in ZODIAC_SIGNS.keys() if sign not in existing_signs]
            
            if missing_signs:
                for zodiac_sign in missing_signs:
                    try:
                        content = await astrology_service.generate_daily_horoscope(zodiac_sign, today, language)
                        
                        # Veritabanına kaydet
                        horoscope = DailyHoroscope(
                            zodiac_sign=zodiac_sign,
                            date=today,
                            content=content,
                            language=language
                        )
                        await db.daily_horoscopes.insert_one(horoscope.dict())
                        horoscopes.append(horoscope.dict())
                        
                        # Rate limiting
                        await asyncio.sleep(0.5)
                        
                    except Exception as e:
                        logging.error(f"Error generating horoscope for {zodiac_sign}: {str(e)}")
        
        # Response oluştur
        return [
            DailyHoroscopeResponse(
                id=h["id"],
                zodiac_sign=h["zodiac_sign"],
                date=h["date"],
                content=h["content"],
                language=h["language"],
                timestamp=h["timestamp"]
            ) for h in horoscopes
        ]
        
    except Exception as e:
        logging.error(f"Get today horoscopes error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Günlük yorumları getirme hatası: {str(e)}")

@api_router.get("/daily-horoscope/{zodiac_sign}", response_model=DailyHoroscopeResponse)
async def get_horoscope_by_sign(zodiac_sign: str, date: Optional[str] = None, language: str = "tr"):
    """Belirli bir burç için günlük yorum getir"""
    try:
        # Burç kontrolü
        if zodiac_sign not in ZODIAC_SIGNS:
            raise HTTPException(status_code=404, detail="Geçersiz burç")
        
        # Tarih kontrolü (varsayılan bugün)
        target_date = date or datetime.utcnow().strftime("%Y-%m-%d")
        
        # Veritabanından al
        horoscope = await db.daily_horoscopes.find_one({
            "zodiac_sign": zodiac_sign,
            "date": target_date,
            "language": language
        })
        
        # Yoksa oluştur
        if not horoscope:
            content = await astrology_service.generate_daily_horoscope(zodiac_sign, target_date, language)
            
            horoscope_obj = DailyHoroscope(
                zodiac_sign=zodiac_sign,
                date=target_date,
                content=content,
                language=language
            )
            
            await db.daily_horoscopes.insert_one(horoscope_obj.dict())
            horoscope = horoscope_obj.dict()
        
        return DailyHoroscopeResponse(
            id=horoscope["id"],
            zodiac_sign=horoscope["zodiac_sign"],
            date=horoscope["date"],
            content=horoscope["content"],
            language=horoscope["language"],
            timestamp=horoscope["timestamp"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get horoscope by sign error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Burç yorumu getirme hatası: {str(e)}")

@api_router.get("/daily-horoscope/history/{zodiac_sign}", response_model=List[DailyHoroscopeResponse])
async def get_horoscope_history(zodiac_sign: str, language: str = "tr", limit: int = 30):
    """Belirli bir burç için geçmiş yorumları getir"""
    try:
        # Burç kontrolü
        if zodiac_sign not in ZODIAC_SIGNS:
            raise HTTPException(status_code=404, detail="Geçersiz burç")
        
        # Geçmiş yorumları al (en yeni önce)
        horoscopes = await db.daily_horoscopes.find({
            "zodiac_sign": zodiac_sign,
            "language": language
        }).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return [
            DailyHoroscopeResponse(
                id=h["id"],
                zodiac_sign=h["zodiac_sign"],
                date=h["date"],
                content=h["content"],
                language=h["language"],
                timestamp=h["timestamp"]
            ) for h in horoscopes
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get horoscope history error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Burç geçmişi getirme hatası: {str(e)}")

@api_router.post("/admin/generate-daily-horoscopes")
async def generate_daily_horoscopes_admin(date: Optional[str] = None, language: str = "tr"):
    """Admin: Tüm burçlar için günlük yorumlar oluştur (Manuel tetikleme)"""
    try:
        target_date = date or datetime.utcnow().strftime("%Y-%m-%d")
        
        # Mevcut yorumları kontrol et
        existing_count = await db.daily_horoscopes.count_documents({
            "date": target_date,
            "language": language
        })
        
        if existing_count >= 12:
            return {"message": f"{target_date} için {language} dilinde yorumlar zaten mevcut", "generated": 0}
        
        # Tüm yorumları oluştur
        horoscopes = await astrology_service.generate_all_daily_horoscopes(target_date, language)
        
        # Veritabanına kaydet
        saved_count = 0
        for horoscope_data in horoscopes:
            # Mevcut olup olmadığını kontrol et
            existing = await db.daily_horoscopes.find_one({
                "zodiac_sign": horoscope_data["zodiac_sign"],
                "date": horoscope_data["date"],
                "language": horoscope_data["language"]
            })
            
            if not existing:
                horoscope = DailyHoroscope(
                    zodiac_sign=horoscope_data["zodiac_sign"],
                    date=horoscope_data["date"],
                    content=horoscope_data["content"],
                    language=horoscope_data["language"]
                )
                
                await db.daily_horoscopes.insert_one(horoscope.dict())
                saved_count += 1
        
        return {
            "message": f"{target_date} için {saved_count} adet {language} dilinde yorum oluşturuldu",
            "generated": saved_count,
            "date": target_date,
            "language": language
        }
        
    except Exception as e:
        logging.error(f"Generate daily horoscopes error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Günlük yorumları oluşturma hatası: {str(e)}")

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "ai_service": "available" if os.environ.get('GEMINI_API_KEY') else "unavailable",
            "features": {
                "coffee_reading": True,
                "tarot_reading": True,
                "palm_reading": True,
                "astrology": True,
                "daily_horoscope": True
            }
        }
    }

# Daily Horoscope Scheduler Functions
class DailyHoroscopeScheduler:
    def __init__(self):
        self.astrology_service = AstrologyAnalysisService()
    
    async def generate_daily_horoscopes_task(self, languages: List[str] = ["tr", "en", "de", "fr", "es"]):
        """Günlük burç yorumlarını oluşturan scheduled task"""
        try:
            today = datetime.utcnow().strftime("%Y-%m-%d")
            logging.info(f"Starting daily horoscope generation for {today}")
            
            for language in languages:
                try:
                    # Mevcut yorumları kontrol et
                    existing_count = await db.daily_horoscopes.count_documents({
                        "date": today,
                        "language": language
                    })
                    
                    if existing_count >= 12:
                        logging.info(f"Daily horoscopes for {today} in {language} already exist")
                        continue
                    
                    # Eksik yorumları oluştur
                    existing_horoscopes = await db.daily_horoscopes.find({
                        "date": today,
                        "language": language
                    }).to_list(12)
                    
                    existing_signs = [h["zodiac_sign"] for h in existing_horoscopes]
                    missing_signs = [sign for sign in ZODIAC_SIGNS.keys() if sign not in existing_signs]
                    
                    generated_count = 0
                    for zodiac_sign in missing_signs:
                        try:
                            content = await self.astrology_service.generate_daily_horoscope(
                                zodiac_sign, today, language
                            )
                            
                            horoscope = DailyHoroscope(
                                zodiac_sign=zodiac_sign,
                                date=today,
                                content=content,
                                language=language
                            )
                            
                            await db.daily_horoscopes.insert_one(horoscope.dict())
                            generated_count += 1
                            
                            # Rate limiting
                            await asyncio.sleep(1)
                            
                        except Exception as e:
                            logging.error(f"Error generating horoscope for {zodiac_sign} in {language}: {str(e)}")
                    
                    logging.info(f"Generated {generated_count} horoscopes for {today} in {language}")
                    
                except Exception as e:
                    logging.error(f"Error generating horoscopes for language {language}: {str(e)}")
            
            logging.info(f"Daily horoscope generation completed for {today}")
            
        except Exception as e:
            logging.error(f"Daily horoscope generation error: {str(e)}")
    
    def run_scheduled_task(self):
        """Scheduled task'ı çalıştır (sync wrapper)"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self.generate_daily_horoscopes_task())
        finally:
            loop.close()
    
    def start_scheduler(self):
        """Scheduler'ı başlat"""
        # Her gün saat 06:00'da çalış
        schedule.every().day.at("06:00").do(self.run_scheduled_task)
        
        # İlk çalıştırmayı hemen yap (test için)
        # self.run_scheduled_task()
        
        def run_pending():
            while True:
                schedule.run_pending()
                time.sleep(60)  # Her dakika kontrol et
        
        # Background thread'de çalıştır
        scheduler_thread = threading.Thread(target=run_pending, daemon=True)
        scheduler_thread.start()
        
        logging.info("Daily horoscope scheduler started - runs every day at 06:00")

# Scheduler instance oluştur
horoscope_scheduler = DailyHoroscopeScheduler()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Uygulama başladığında çalışacak fonksiyonlar"""
    # Scheduler'ı başlat
    horoscope_scheduler.start_scheduler()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
