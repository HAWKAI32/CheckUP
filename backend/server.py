from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
from enum import Enum
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="ChekUp API", description="Lab Test & Medical Booking Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    SUB_ADMIN = "sub_admin"
    CLINIC = "clinic"
    LAB_TECHNICIAN = "lab_technician"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SAMPLE_COLLECTED = "sample_collected"
    RESULTS_READY = "results_ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class DeliveryMethod(str, Enum):
    WHATSAPP = "whatsapp"
    IN_PERSON = "in_person"

class Currency(str, Enum):
    USD = "USD"
    LRD = "LRD"

class Language(str, Enum):
    EN = "en"
    FR = "fr"

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str
    location: str
    role: UserRole
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TestBase(BaseModel):
    name: str
    description: str
    icon_url: Optional[str] = None
    category: str
    preparation_instructions: Optional[str] = None

class TestCreate(TestBase):
    pass

class Test(TestBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ClinicBase(BaseModel):
    name: str
    description: str
    location: str
    phone: str
    email: EmailStr
    image_url: Optional[str] = None
    services: List[str] = []
    operating_hours: Dict[str, str] = {}

class ClinicCreate(ClinicBase):
    user_id: str

class Clinic(ClinicBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TestPricingBase(BaseModel):
    test_id: str
    clinic_id: str
    price_usd: float
    price_lrd: float
    is_available: bool = True

class TestPricingCreate(TestPricingBase):
    pass

class TestPricing(TestPricingBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BookingBase(BaseModel):
    patient_name: str
    patient_phone: str
    patient_email: Optional[EmailStr] = None
    patient_location: str
    test_ids: List[str]
    clinic_id: str
    delivery_method: DeliveryMethod
    preferred_currency: Currency = Currency.USD
    delivery_charge: float = 0.0
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_number: str = Field(default_factory=lambda: f"CHK-{uuid.uuid4().hex[:8].upper()}")
    status: BookingStatus = BookingStatus.PENDING
    total_amount: float = 0.0
    assigned_to: Optional[str] = None
    result_files: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FeedbackBase(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    patient_name: str

class FeedbackCreate(FeedbackBase):
    pass

class Feedback(FeedbackBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SurgeryInquiryBase(BaseModel):
    patient_name: str
    patient_phone: str
    patient_email: Optional[EmailStr] = None
    surgery_type: str
    medical_condition: str
    preferred_hospital_location: str = "India"
    budget_range: str
    notes: Optional[str] = None

class SurgeryInquiryCreate(SurgeryInquiryBase):
    pass

class SurgeryInquiry(SurgeryInquiryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inquiry_number: str = Field(default_factory=lambda: f"SRG-{uuid.uuid4().hex[:8].upper()}")
    status: str = "pending"
    hospital_details: Optional[str] = None
    accommodation_details: Optional[str] = None
    estimated_cost: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Auth endpoints
@api_router.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict.pop('password')
    user_obj = User(**user_dict)
    
    # Store in database
    user_with_password = user_obj.dict()
    user_with_password['password'] = hashed_password
    await db.users.insert_one(user_with_password)
    
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['id']}, expires_delta=access_token_expires
    )
    
    user_obj = User(**user)
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

# Test management endpoints
@api_router.post("/tests", response_model=Test)
async def create_test(test_data: TestCreate, current_user: User = Depends(get_admin_user)):
    test_obj = Test(**test_data.dict())
    await db.tests.insert_one(test_obj.dict())
    return test_obj

@api_router.get("/tests", response_model=List[Test])
async def get_tests():
    tests = await db.tests.find().to_list(1000)
    return [Test(**test) for test in tests]

@api_router.get("/tests/{test_id}", response_model=Test)
async def get_test(test_id: str):
    test = await db.tests.find_one({"id": test_id})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return Test(**test)

@api_router.put("/tests/{test_id}", response_model=Test)
async def update_test(test_id: str, test_data: TestCreate, current_user: User = Depends(get_admin_user)):
    update_data = test_data.dict()
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.tests.update_one({"id": test_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    
    updated_test = await db.tests.find_one({"id": test_id})
    return Test(**updated_test)

@api_router.delete("/tests/{test_id}")
async def delete_test(test_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.tests.delete_one({"id": test_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test deleted successfully"}

# Clinic management endpoints
@api_router.post("/clinics", response_model=Clinic)
async def create_clinic(clinic_data: ClinicCreate, current_user: User = Depends(get_admin_user)):
    clinic_obj = Clinic(**clinic_data.dict())
    await db.clinics.insert_one(clinic_obj.dict())
    return clinic_obj

@api_router.get("/clinics", response_model=List[Clinic])
async def get_clinics():
    clinics = await db.clinics.find().to_list(1000)
    return [Clinic(**clinic) for clinic in clinics]

@api_router.get("/clinics/{clinic_id}", response_model=Clinic)
async def get_clinic(clinic_id: str):
    clinic = await db.clinics.find_one({"id": clinic_id})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return Clinic(**clinic)

@api_router.put("/clinics/{clinic_id}", response_model=Clinic)
async def update_clinic(clinic_id: str, clinic_data: ClinicCreate, current_user: User = Depends(get_admin_user)):
    update_data = clinic_data.dict()
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.clinics.update_one({"id": clinic_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Clinic not found")
    
    updated_clinic = await db.clinics.find_one({"id": clinic_id})
    return Clinic(**updated_clinic)

@api_router.delete("/clinics/{clinic_id}")
async def delete_clinic(clinic_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.clinics.delete_one({"id": clinic_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return {"message": "Clinic deleted successfully"}

# Test pricing endpoints
@api_router.post("/test-pricing", response_model=TestPricing)
async def create_test_pricing(pricing_data: TestPricingCreate, current_user: User = Depends(get_admin_user)):
    # Check if pricing already exists
    existing_pricing = await db.test_pricing.find_one({
        "test_id": pricing_data.test_id,
        "clinic_id": pricing_data.clinic_id
    })
    if existing_pricing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pricing for this test and clinic already exists"
        )
    
    pricing_obj = TestPricing(**pricing_data.dict())
    await db.test_pricing.insert_one(pricing_obj.dict())
    return pricing_obj

@api_router.get("/test-pricing")
async def get_test_pricing(test_id: str = None, clinic_id: str = None):
    query = {}
    if test_id:
        query["test_id"] = test_id
    if clinic_id:
        query["clinic_id"] = clinic_id
    
    pricing = await db.test_pricing.find(query).to_list(1000)
    return [TestPricing(**price) for price in pricing]

@api_router.get("/tests/{test_id}/pricing")
async def get_test_pricing_by_test(test_id: str):
    # Get test details
    test = await db.tests.find_one({"id": test_id})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get pricing for this test
    pricing = await db.test_pricing.find({"test_id": test_id, "is_available": True}).to_list(1000)
    
    # Get clinic details for each pricing
    result = []
    for price in pricing:
        clinic = await db.clinics.find_one({"id": price["clinic_id"]})
        if clinic:
            result.append({
                "test": Test(**test),
                "clinic": Clinic(**clinic),
                "pricing": TestPricing(**price)
            })
    
    return result

@api_router.get("/clinics/{clinic_id}/tests")
async def get_clinic_tests(clinic_id: str):
    # Get clinic details
    clinic = await db.clinics.find_one({"id": clinic_id})
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    
    # Get tests offered by this clinic
    pricing = await db.test_pricing.find({"clinic_id": clinic_id, "is_available": True}).to_list(1000)
    
    # Get test details for each pricing
    result = []
    for price in pricing:
        test = await db.tests.find_one({"id": price["test_id"]})
        if test:
            result.append({
                "test": Test(**test),
                "clinic": Clinic(**clinic),
                "pricing": TestPricing(**price)
            })
    
    return result

# Booking endpoints
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate):
    # Calculate total amount
    total_amount = 0.0
    currency_field = "price_usd" if booking_data.preferred_currency == Currency.USD else "price_lrd"
    
    for test_id in booking_data.test_ids:
        pricing = await db.test_pricing.find_one({
            "test_id": test_id,
            "clinic_id": booking_data.clinic_id,
            "is_available": True
        })
        if pricing:
            total_amount += pricing[currency_field]
    
    total_amount += booking_data.delivery_charge
    
    # Create booking
    booking_obj = Booking(**booking_data.dict())
    booking_obj.total_amount = total_amount
    
    await db.bookings.insert_one(booking_obj.dict())
    return booking_obj

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: User = Depends(get_current_user)):
    if current_user.role in [UserRole.ADMIN, UserRole.SUB_ADMIN]:
        bookings = await db.bookings.find().to_list(1000)
    else:
        # Clinic users can only see bookings assigned to their clinic
        clinic = await db.clinics.find_one({"user_id": current_user.id})
        if not clinic:
            return []
        bookings = await db.bookings.find({"clinic_id": clinic["id"]}).to_list(1000)
    
    return [Booking(**booking) for booking in bookings]

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, current_user: User = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.SUB_ADMIN]:
        clinic = await db.clinics.find_one({"user_id": current_user.id})
        if not clinic or booking["clinic_id"] != clinic["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return Booking(**booking)

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str, 
    status_data: dict,
    current_user: User = Depends(get_current_user)
):
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.SUB_ADMIN]:
        clinic = await db.clinics.find_one({"user_id": current_user.id})
        if not clinic or booking["clinic_id"] != clinic["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    
    status = status_data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    result = await db.bookings.update_one(
        {"id": booking_id}, 
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking status updated successfully"}

@api_router.post("/bookings/{booking_id}/upload-results")
async def upload_results(
    booking_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.SUB_ADMIN]:
        clinic = await db.clinics.find_one({"user_id": current_user.id})
        if not clinic or booking["clinic_id"] != clinic["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Process uploaded files (convert to base64 for storage)
    result_files = []
    for file in files:
        content = await file.read()
        base64_content = base64.b64encode(content).decode('utf-8')
        result_files.append({
            "filename": file.filename,
            "content_type": file.content_type,
            "data": base64_content
        })
    
    # Update booking with result files
    result = await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "result_files": result_files,
                "status": BookingStatus.RESULTS_READY,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Results uploaded successfully", "files_count": len(result_files)}

# Feedback endpoints
@api_router.post("/feedback", response_model=Feedback)
async def create_feedback(feedback_data: FeedbackCreate):
    # Verify booking exists
    booking = await db.bookings.find_one({"id": feedback_data.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    feedback_obj = Feedback(**feedback_data.dict())
    await db.feedback.insert_one(feedback_obj.dict())
    
    # Update clinic rating
    clinic_id = booking["clinic_id"]
    await update_clinic_rating(clinic_id)
    
    return feedback_obj

async def update_clinic_rating(clinic_id: str):
    # Get all feedback for this clinic's bookings
    bookings = await db.bookings.find({"clinic_id": clinic_id}).to_list(1000)
    booking_ids = [booking["id"] for booking in bookings]
    
    feedback_list = await db.feedback.find({"booking_id": {"$in": booking_ids}}).to_list(1000)
    
    if feedback_list:
        avg_rating = sum(feedback["rating"] for feedback in feedback_list) / len(feedback_list)
        total_reviews = len(feedback_list)
        
        await db.clinics.update_one(
            {"id": clinic_id},
            {"$set": {"rating": round(avg_rating, 1), "total_reviews": total_reviews}}
        )

@api_router.get("/feedback/clinic/{clinic_id}")
async def get_clinic_feedback(clinic_id: str):
    # Get all bookings for this clinic
    bookings = await db.bookings.find({"clinic_id": clinic_id}).to_list(1000)
    booking_ids = [booking["id"] for booking in bookings]
    
    feedback_list = await db.feedback.find({"booking_id": {"$in": booking_ids}}).to_list(1000)
    return [Feedback(**feedback) for feedback in feedback_list]

# Surgery inquiry endpoints
@api_router.post("/surgery-inquiries", response_model=SurgeryInquiry)
async def create_surgery_inquiry(inquiry_data: SurgeryInquiryCreate):
    inquiry_obj = SurgeryInquiry(**inquiry_data.dict())
    await db.surgery_inquiries.insert_one(inquiry_obj.dict())
    return inquiry_obj

@api_router.get("/surgery-inquiries", response_model=List[SurgeryInquiry])
async def get_surgery_inquiries(current_user: User = Depends(get_admin_user)):
    inquiries = await db.surgery_inquiries.find().to_list(1000)
    return [SurgeryInquiry(**inquiry) for inquiry in inquiries]

@api_router.get("/surgery-inquiries/{inquiry_id}", response_model=SurgeryInquiry)
async def get_surgery_inquiry(inquiry_id: str, current_user: User = Depends(get_admin_user)):
    inquiry = await db.surgery_inquiries.find_one({"id": inquiry_id})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Surgery inquiry not found")
    return SurgeryInquiry(**inquiry)

@api_router.put("/surgery-inquiries/{inquiry_id}")
async def update_surgery_inquiry(
    inquiry_id: str,
    hospital_details: Optional[str] = None,
    accommodation_details: Optional[str] = None,
    estimated_cost: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_admin_user)
):
    update_data = {"updated_at": datetime.utcnow()}
    
    if hospital_details is not None:
        update_data["hospital_details"] = hospital_details
    if accommodation_details is not None:
        update_data["accommodation_details"] = accommodation_details
    if estimated_cost is not None:
        update_data["estimated_cost"] = estimated_cost
    if status is not None:
        update_data["status"] = status
    
    result = await db.surgery_inquiries.update_one(
        {"id": inquiry_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Surgery inquiry not found")
    
    return {"message": "Surgery inquiry updated successfully"}

# Analytics endpoints
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: User = Depends(get_admin_user)):
    # Get counts
    total_bookings = await db.bookings.count_documents({})
    total_clinics = await db.clinics.count_documents({})
    total_tests = await db.tests.count_documents({})
    total_surgery_inquiries = await db.surgery_inquiries.count_documents({})
    
    # Get revenue (sum of completed bookings)
    completed_bookings = await db.bookings.find({"status": BookingStatus.COMPLETED}).to_list(1000)
    total_revenue_usd = sum(booking["total_amount"] for booking in completed_bookings 
                           if booking.get("preferred_currency") == Currency.USD)
    total_revenue_lrd = sum(booking["total_amount"] for booking in completed_bookings 
                           if booking.get("preferred_currency") == Currency.LRD)
    
    # Get recent bookings
    recent_bookings = await db.bookings.find().sort("created_at", -1).limit(5).to_list(5)
    
    # Get top clinics by booking count
    pipeline = [
        {"$group": {"_id": "$clinic_id", "booking_count": {"$sum": 1}}},
        {"$sort": {"booking_count": -1}},
        {"$limit": 5}
    ]
    top_clinics_data = await db.bookings.aggregate(pipeline).to_list(5)
    
    top_clinics = []
    for clinic_data in top_clinics_data:
        clinic = await db.clinics.find_one({"id": clinic_data["_id"]})
        if clinic:
            top_clinics.append({
                "clinic": Clinic(**clinic),
                "booking_count": clinic_data["booking_count"]
            })
    
    return {
        "totals": {
            "bookings": total_bookings,
            "clinics": total_clinics,
            "tests": total_tests,
            "surgery_inquiries": total_surgery_inquiries
        },
        "revenue": {
            "usd": total_revenue_usd,
            "lrd": total_revenue_lrd
        },
        "recent_bookings": [Booking(**booking) for booking in recent_bookings],
        "top_clinics": top_clinics
    }

# Search endpoints
@api_router.get("/search/tests")
async def search_tests(query: str):
    tests = await db.tests.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"category": {"$regex": query, "$options": "i"}}
        ]
    }).to_list(100)
    
    return [Test(**test) for test in tests]

@api_router.get("/search/clinics")
async def search_clinics(query: str):
    clinics = await db.clinics.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"location": {"$regex": query, "$options": "i"}},
            {"services": {"$regex": query, "$options": "i"}}
        ]
    }).to_list(100)
    
    return [Clinic(**clinic) for clinic in clinics]

# Public endpoints for patients (no authentication required)
@api_router.get("/public/tests", response_model=List[Test])
async def get_public_tests():
    tests = await db.tests.find().to_list(1000)
    return [Test(**test) for test in tests]

@api_router.get("/public/clinics", response_model=List[Clinic])
async def get_public_clinics():
    clinics = await db.clinics.find().to_list(1000)
    return [Clinic(**clinic) for clinic in clinics]

@api_router.get("/public/tests/{test_id}/pricing")
async def get_public_test_pricing(test_id: str):
    return await get_test_pricing_by_test(test_id)

@api_router.get("/public/clinics/{clinic_id}/tests")
async def get_public_clinic_tests(clinic_id: str):
    return await get_clinic_tests(clinic_id)

# User Management endpoints (Admin only)
@api_router.get("/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_admin_user)):
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: dict, current_user: User = Depends(get_admin_user)):
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User updated successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_admin_user)):
    # Don't allow deletion of current admin
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# Surgery Inquiry Management endpoints
@api_router.get("/surgery-inquiries", response_model=List[SurgeryInquiry])
async def get_surgery_inquiries(current_user: User = Depends(get_admin_user)):
    inquiries = await db.surgery_inquiries.find().to_list(1000)
    return [SurgeryInquiry(**inquiry) for inquiry in inquiries]

@api_router.put("/surgery-inquiries/{inquiry_id}")
async def update_surgery_inquiry(inquiry_id: str, update_data: dict, current_user: User = Depends(get_admin_user)):
    update_data['updated_at'] = datetime.utcnow()
    
    result = await db.surgery_inquiries.update_one({"id": inquiry_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Surgery inquiry not found")
    
    return {"message": "Surgery inquiry updated successfully"}

@api_router.delete("/surgery-inquiries/{inquiry_id}")
async def delete_surgery_inquiry(inquiry_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.surgery_inquiries.delete_one({"id": inquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Surgery inquiry not found")
    
    return {"message": "Surgery inquiry deleted successfully"}

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
    """Initialize default users on startup"""
    try:
        # Check if sub-admin user exists
        existing_subadmin = await db.users.find_one({"email": "subadmin@chekup.com"})
        if not existing_subadmin:
            # Create default sub-admin user
            hashed_password = pwd_context.hash("SubAdminPass123!")
            subadmin_user = {
                "id": str(uuid.uuid4()),
                "name": "ChekUp Sub Administrator",
                "email": "subadmin@chekup.com",
                "phone": "+231-777-123456",
                "location": "Monrovia, Liberia",
                "role": UserRole.SUB_ADMIN.value,
                "password": hashed_password,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.users.insert_one(subadmin_user)
            logger.info("Created default sub-admin user: subadmin@chekup.com")
        else:
            logger.info("Sub-admin user already exists")
            
    except Exception as e:
        logger.error(f"Error creating default sub-admin user: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()