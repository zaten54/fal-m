from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import asyncio
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Fal Uygulaması API", description="AI destekli fal okuma uygulaması")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


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

# Initialize services
coffee_service = CoffeeAnalysisService()
tarot_service = TarotAnalysisService()
palm_service = PalmAnalysisService()
astrology_service = AstrologyAnalysisService()

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Fal Uygulaması API - Hoş Geldiniz"}

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
async def create_coffee_reading(reading_data: CoffeeReadingCreate):
    """Kahve falı okuma oluştur"""
    try:
        # Session ID oluştur eğer yoksa
        session_id = reading_data.session_id or str(uuid.uuid4())
        
        # AI analizi yap
        analysis = await coffee_service.analyze_coffee_grounds(
            reading_data.image_base64, 
            session_id
        )
        
        # Reading objesi oluştur
        coffee_reading = CoffeeReading(
            session_id=session_id,
            image_base64=reading_data.image_base64,
            symbols_found=analysis["symbols_found"],
            interpretation=analysis["interpretation"],
            confidence_score=analysis["confidence_score"]
        )
        
        # MongoDB'ye kaydet
        await db.coffee_readings.insert_one(coffee_reading.dict())
        
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
async def get_coffee_readings(session_id: str):
    """Belirli bir session'a ait kahve falı okumalarını getir"""
    try:
        readings = await db.coffee_readings.find(
            {"session_id": session_id}
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
async def get_coffee_reading(session_id: str, reading_id: str):
    """Belirli bir kahve falı okumasını getir"""
    try:
        reading = await db.coffee_readings.find_one({
            "id": reading_id,
            "session_id": session_id
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
async def create_tarot_reading(reading_data: TarotReadingCreate):
    """Yeni tarot okuma oluştur"""
    try:
        # Session ID oluştur eğer yoksa
        session_id = reading_data.session_id or str(uuid.uuid4())
        
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
        
        # MongoDB'ye kaydet
        await db.tarot_readings.insert_one(tarot_reading.dict())
        
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
async def get_tarot_readings(session_id: str):
    """Belirli bir session'a ait tarot okumalarını getir"""
    try:
        readings = await db.tarot_readings.find(
            {"session_id": session_id}
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
async def get_tarot_reading(session_id: str, reading_id: str):
    """Belirli bir tarot okumasını getir"""
    try:
        reading = await db.tarot_readings.find_one({
            "id": reading_id,
            "session_id": session_id
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
async def create_palm_reading(reading_data: PalmReadingCreate):
    """Yeni el falı okuma oluştur"""
    try:
        # Session ID oluştur eğer yoksa
        session_id = reading_data.session_id or str(uuid.uuid4())
        
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
        
        # MongoDB'ye kaydet
        await db.palm_readings.insert_one(palm_reading.dict())
        
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
async def get_palm_readings(session_id: str):
    """Belirli bir session'a ait el falı okumalarını getir"""
    try:
        readings = await db.palm_readings.find(
            {"session_id": session_id}
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
async def create_astrology_reading(reading_data: AstrologyReadingCreate):
    """Yeni astroloji okuma oluştur"""
    try:
        # Session ID oluştur eğer yoksa
        session_id = reading_data.session_id or str(uuid.uuid4())
        
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
        
        # MongoDB'ye kaydet
        await db.astrology_readings.insert_one(astrology_reading.dict())
        
        # Response oluştur
        return AstrologyReadingResponse(
            id=astrology_reading.id,
            session_id=astrology_reading.session_id,
            birth_date=astrology_reading.birth_date,
            birth_time=astrology_reading.birth_time,
            birth_place=astrology_reading.birth_place,
            zodiac_sign=astrology_reading.zodiac_sign,
            planets=astrology_reading.planets,
            interpretation=astrology_reading.interpretation,
            timestamp=astrology_reading.timestamp
        )
        
    except Exception as e:
        logging.error(f"Astrology reading creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Astroloji okuma hatası: {str(e)}")

@api_router.get("/astrology-reading/{session_id}", response_model=List[AstrologyReadingResponse])
async def get_astrology_readings(session_id: str):
    """Belirli bir session'a ait astroloji okumalarını getir"""
    try:
        readings = await db.astrology_readings.find(
            {"session_id": session_id}
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
                "astrology": True
            }
        }
    }

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
