from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from googleapiclient.discovery import build
import base64
from io import BytesIO
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
YOUTUBE_CHANNEL_ID = os.environ.get('YOUTUBE_CHANNEL_ID', '')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'Gopichand')

security = HTTPBearer()

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    uid: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSignup(BaseModel):
    uid: str
    password: str

class UserLogin(BaseModel):
    uid: str
    password: str

class TokenResponse(BaseModel):
    token: str
    uid: str
    is_admin: bool

class PlayerStatsCreate(BaseModel):
    name: str
    br_rank: str
    br_kda: float
    br_highest_kills: int
    br_wins: int
    cs_rank: str
    cs_kda: float
    cs_highest_kills: int
    cs_wins: int
    profile_picture: Optional[str] = None

class PlayerStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    uid: str
    name: str
    br_rank: str
    br_kda: float
    br_highest_kills: int
    br_wins: int
    cs_rank: str
    cs_kda: float
    cs_highest_kills: int
    cs_wins: int
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessage(BaseModel):
    name: str
    email: str
    message: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(uid: str) -> str:
    payload = {
        'uid': uid,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['uid']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(uid: str = Depends(get_current_user)) -> str:
    if uid != ADMIN_USERNAME:
        raise HTTPException(status_code=403, detail="Admin access required")
    return uid

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    existing = await db.users.find_one({'uid': user_data.uid}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="UID already exists")
    
    user = User(
        uid=user_data.uid,
        password_hash=hash_password(user_data.password)
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    token = create_token(user_data.uid)
    is_admin = user_data.uid == ADMIN_USERNAME
    return TokenResponse(token=token, uid=user_data.uid, is_admin=is_admin)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({'uid': login_data.uid}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(login_data.uid)
    is_admin = login_data.uid == ADMIN_USERNAME
    return TokenResponse(token=token, uid=login_data.uid, is_admin=is_admin)

@api_router.post("/stats", response_model=PlayerStats)
async def create_stats(stats_data: PlayerStatsCreate, uid: str = Depends(get_current_user)):
    existing = await db.player_stats.find_one({'uid': uid}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="You already have stats. Please edit instead.")
    
    stats = PlayerStats(uid=uid, **stats_data.model_dump())
    doc = stats.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.player_stats.insert_one(doc)
    return stats

@api_router.get("/stats", response_model=List[PlayerStats])
async def get_all_stats():
    stats_list = await db.player_stats.find({}, {'_id': 0}).to_list(1000)
    for stat in stats_list:
        if isinstance(stat.get('created_at'), str):
            stat['created_at'] = datetime.fromisoformat(stat['created_at'])
        if isinstance(stat.get('updated_at'), str):
            stat['updated_at'] = datetime.fromisoformat(stat['updated_at'])
    return stats_list

@api_router.get("/stats/{uid}", response_model=PlayerStats)
async def get_stats_by_uid(uid: str):
    stats = await db.player_stats.find_one({'uid': uid}, {'_id': 0})
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
    if isinstance(stats.get('created_at'), str):
        stats['created_at'] = datetime.fromisoformat(stats['created_at'])
    if isinstance(stats.get('updated_at'), str):
        stats['updated_at'] = datetime.fromisoformat(stats['updated_at'])
    return stats

@api_router.put("/stats", response_model=PlayerStats)
async def update_stats(stats_data: PlayerStatsCreate, uid: str = Depends(get_current_user)):
    existing = await db.player_stats.find_one({'uid': uid}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Stats not found. Please create first.")
    
    update_data = stats_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.player_stats.update_one({'uid': uid}, {'$set': update_data})
    
    updated = await db.player_stats.find_one({'uid': uid}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return PlayerStats(**updated)

@api_router.get("/leaderboard/br", response_model=List[PlayerStats])
async def get_br_leaderboard():
    stats_list = await db.player_stats.find({}, {'_id': 0}).sort('br_wins', -1).to_list(100)
    for stat in stats_list:
        if isinstance(stat.get('created_at'), str):
            stat['created_at'] = datetime.fromisoformat(stat['created_at'])
        if isinstance(stat.get('updated_at'), str):
            stat['updated_at'] = datetime.fromisoformat(stat['updated_at'])
    return stats_list

@api_router.get("/leaderboard/cs", response_model=List[PlayerStats])
async def get_cs_leaderboard():
    stats_list = await db.player_stats.find({}, {'_id': 0}).sort('cs_wins', -1).to_list(100)
    for stat in stats_list:
        if isinstance(stat.get('created_at'), str):
            stat['created_at'] = datetime.fromisoformat(stat['created_at'])
        if isinstance(stat.get('updated_at'), str):
            stat['updated_at'] = datetime.fromisoformat(stat['updated_at'])
    return stats_list

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), uid: str = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    image = Image.open(BytesIO(contents))
    image.thumbnail((500, 500))
    
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    image_url = f"data:image/png;base64,{image_base64}"
    
    return {"image_url": image_url}

@api_router.get("/youtube/videos")
async def get_youtube_videos():
    if not YOUTUBE_API_KEY or not YOUTUBE_CHANNEL_ID:
        return {"videos": []}
    
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY, cache_discovery=False)
        request = youtube.search().list(
            part='snippet',
            channelId=YOUTUBE_CHANNEL_ID,
            order='date',
            type='video',
            maxResults=6
        )
        response = request.execute()
        
        videos = []
        for item in response.get('items', []):
            videos.append({
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'thumbnail': item['snippet']['thumbnails']['high']['url'],
                'published_at': item['snippet']['publishedAt']
            })
        return {"videos": videos}
    except Exception as e:
        logging.error(f"YouTube API error: {e}")
        return {"videos": []}

@api_router.post("/contact")
async def submit_contact(message: ContactMessage):
    doc = message.model_dump()
    doc['created_at'] = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one(doc)
    return {"message": "Message received"}

@api_router.put("/admin/stats/{uid}", response_model=PlayerStats)
async def admin_update_stats(uid: str, stats_data: PlayerStatsCreate, admin_uid: str = Depends(get_admin_user)):
    existing = await db.player_stats.find_one({'uid': uid}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Stats not found")
    
    update_data = stats_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.player_stats.update_one({'uid': uid}, {'$set': update_data})
    
    updated = await db.player_stats.find_one({'uid': uid}, {'_id': 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return PlayerStats(**updated)

@api_router.delete("/admin/stats/{uid}")
async def admin_delete_stats(uid: str, admin_uid: str = Depends(get_admin_user)):
    result = await db.player_stats.delete_one({'uid': uid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stats not found")
    return {"message": "Stats deleted"}

@api_router.delete("/admin/user/{uid}")
async def admin_delete_user(uid: str, admin_uid: str = Depends(get_admin_user)):
    if uid == ADMIN_USERNAME:
        raise HTTPException(status_code=403, detail="Cannot delete admin user")
    
    await db.player_stats.delete_one({'uid': uid})
    result = await db.users.delete_one({'uid': uid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User and stats deleted"}

@api_router.get("/admin/users")
async def admin_get_users(admin_uid: str = Depends(get_admin_user)):
    users = await db.users.find({}, {'_id': 0, 'password_hash': 0}).to_list(1000)
    return {"users": users}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()