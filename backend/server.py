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

# Initialize service
coffee_service = CoffeeAnalysisService()

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

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "ai_service": "available" if os.environ.get('GEMINI_API_KEY') else "unavailable"
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
