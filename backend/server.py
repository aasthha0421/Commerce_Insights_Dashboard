from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    segment: str  # premium, regular, budget
    avg_order_value: float
    total_orders: int
    retention_rate: float
    last_order_date: str
    city: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    order_value: float
    delivery_time_minutes: int
    status: str  # completed, cancelled
    order_date: str
    items: List[str]
    city: str

class CompetitorPrice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product: str
    our_price: float
    blinkit_price: float
    zepto_price: float
    bigbasket_price: float
    category: str

class CityAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    city: str
    tier: str  # tier-1, tier-2
    avg_delivery_cost: float
    monthly_demand: int
    smartphone_penetration: float
    feasibility_score: float
    margin_potential: float

class ProfitabilityScenario(BaseModel):
    discount_rate: float
    delivery_cost: float
    demand_multiplier: float

# Initialize sample data
@api_router.post("/initialize-data")
async def initialize_data():
    try:
        # Clear existing data
        await db.customers.delete_many({})
        await db.orders.delete_many({})
        await db.competitor_prices.delete_many({})
        await db.city_analysis.delete_many({})
        
        # Sample customers
        customers = [
            Customer(name="Rajesh Kumar", email="rajesh@example.com", segment="premium", avg_order_value=1850, total_orders=45, retention_rate=85, last_order_date="2025-01-15", city="Mumbai"),
            Customer(name="Priya Sharma", email="priya@example.com", segment="regular", avg_order_value=680, total_orders=22, retention_rate=62, last_order_date="2025-01-10", city="Delhi"),
            Customer(name="Amit Patel", email="amit@example.com", segment="premium", avg_order_value=2100, total_orders=38, retention_rate=78, last_order_date="2025-01-17", city="Bangalore"),
            Customer(name="Sneha Reddy", email="sneha@example.com", segment="budget", avg_order_value=420, total_orders=15, retention_rate=45, last_order_date="2024-12-20", city="Hyderabad"),
            Customer(name="Vikram Singh", email="vikram@example.com", segment="regular", avg_order_value=950, total_orders=30, retention_rate=70, last_order_date="2025-01-12", city="Mumbai"),
            Customer(name="Anjali Gupta", email="anjali@example.com", segment="premium", avg_order_value=1920, total_orders=52, retention_rate=88, last_order_date="2025-01-16", city="Delhi"),
            Customer(name="Rohit Mehta", email="rohit@example.com", segment="budget", avg_order_value=380, total_orders=12, retention_rate=40, last_order_date="2024-12-15", city="Pune"),
            Customer(name="Kavya Iyer", email="kavya@example.com", segment="regular", avg_order_value=850, total_orders=28, retention_rate=65, last_order_date="2025-01-14", city="Chennai"),
        ]
        
        # Sample orders
        orders = [
            Order(customer_id=customers[0].id, order_value=1850, delivery_time_minutes=12, status="completed", order_date="2025-01-15", items=["Milk", "Bread", "Eggs"], city="Mumbai"),
            Order(customer_id=customers[1].id, order_value=680, delivery_time_minutes=35, status="completed", order_date="2025-01-10", items=["Rice", "Dal"], city="Delhi"),
            Order(customer_id=customers[2].id, order_value=2100, delivery_time_minutes=10, status="completed", order_date="2025-01-17", items=["Fruits", "Vegetables", "Snacks"], city="Bangalore"),
            Order(customer_id=customers[3].id, order_value=420, delivery_time_minutes=45, status="cancelled", order_date="2024-12-20", items=["Chips"], city="Hyderabad"),
            Order(customer_id=customers[4].id, order_value=950, delivery_time_minutes=18, status="completed", order_date="2025-01-12", items=["Beverages", "Biscuits"], city="Mumbai"),
        ]
        
        # Competitor prices
        prices = [
            CompetitorPrice(product="Milk (1L)", our_price=62, blinkit_price=58, zepto_price=59, bigbasket_price=60, category="Dairy"),
            CompetitorPrice(product="Bread (400g)", our_price=42, blinkit_price=38, zepto_price=39, bigbasket_price=40, category="Bakery"),
            CompetitorPrice(product="Rice (5kg)", our_price=385, blinkit_price=370, zepto_price=375, bigbasket_price=380, category="Staples"),
            CompetitorPrice(product="Eggs (12 pcs)", our_price=95, blinkit_price=88, zepto_price=90, bigbasket_price=92, category="Dairy"),
            CompetitorPrice(product="Chips (100g)", our_price=25, blinkit_price=20, zepto_price=22, bigbasket_price=23, category="Snacks"),
            CompetitorPrice(product="Soft Drink (2L)", our_price=95, blinkit_price=85, zepto_price=88, bigbasket_price=90, category="Beverages"),
            CompetitorPrice(product="Detergent (1kg)", our_price=245, blinkit_price=235, zepto_price=240, bigbasket_price=242, category="Household"),
            CompetitorPrice(product="Cooking Oil (1L)", our_price=185, blinkit_price=175, zepto_price=178, bigbasket_price=180, category="Staples"),
        ]
        
        # City analysis
        cities = [
            CityAnalysis(city="Mumbai", tier="tier-1", avg_delivery_cost=45, monthly_demand=15000, smartphone_penetration=92, feasibility_score=88, margin_potential=12.5),
            CityAnalysis(city="Delhi", tier="tier-1", avg_delivery_cost=42, monthly_demand=14500, smartphone_penetration=90, feasibility_score=86, margin_potential=11.8),
            CityAnalysis(city="Bangalore", tier="tier-1", avg_delivery_cost=48, monthly_demand=13800, smartphone_penetration=94, feasibility_score=90, margin_potential=13.2),
            CityAnalysis(city="Indore", tier="tier-2", avg_delivery_cost=35, monthly_demand=4200, smartphone_penetration=68, feasibility_score=72, margin_potential=9.5),
            CityAnalysis(city="Bhopal", tier="tier-2", avg_delivery_cost=32, monthly_demand=3800, smartphone_penetration=65, feasibility_score=68, margin_potential=8.8),
            CityAnalysis(city="Coimbatore", tier="tier-2", avg_delivery_cost=38, monthly_demand=4500, smartphone_penetration=71, feasibility_score=75, margin_potential=10.2),
        ]
        
        # Insert data
        for customer in customers:
            await db.customers.insert_one(customer.model_dump())
        
        for order in orders:
            await db.orders.insert_one(order.model_dump())
        
        for price in prices:
            await db.competitor_prices.insert_one(price.model_dump())
        
        for city in cities:
            await db.city_analysis.insert_one(city.model_dump())
        
        return {"message": "Sample data initialized successfully", "customers": len(customers), "orders": len(orders)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get customer segments
@api_router.get("/customers")
async def get_customers():
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    return customers

@api_router.get("/customer-segments")
async def get_customer_segments():
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    
    segments = {"premium": [], "regular": [], "budget": []}
    for customer in customers:
        segments[customer["segment"]].append(customer)
    
    summary = {
        "premium": {
            "count": len(segments["premium"]),
            "avg_aov": sum(c["avg_order_value"] for c in segments["premium"]) / len(segments["premium"]) if segments["premium"] else 0,
            "avg_retention": sum(c["retention_rate"] for c in segments["premium"]) / len(segments["premium"]) if segments["premium"] else 0,
        },
        "regular": {
            "count": len(segments["regular"]),
            "avg_aov": sum(c["avg_order_value"] for c in segments["regular"]) / len(segments["regular"]) if segments["regular"] else 0,
            "avg_retention": sum(c["retention_rate"] for c in segments["regular"]) / len(segments["regular"]) if segments["regular"] else 0,
        },
        "budget": {
            "count": len(segments["budget"]),
            "avg_aov": sum(c["avg_order_value"] for c in segments["budget"]) / len(segments["budget"]) if segments["budget"] else 0,
            "avg_retention": sum(c["retention_rate"] for c in segments["budget"]) / len(segments["budget"]) if segments["budget"] else 0,
        },
    }
    
    return {"segments": segments, "summary": summary}

# Get competitor pricing
@api_router.get("/competitor-prices")
async def get_competitor_prices():
    prices = await db.competitor_prices.find({}, {"_id": 0}).to_list(1000)
    return prices

# Get city analysis
@api_router.get("/city-analysis")
async def get_city_analysis():
    cities = await db.city_analysis.find({}, {"_id": 0}).to_list(1000)
    return cities

# Get orders
@api_router.get("/orders")
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return orders

# Calculate profitability
@api_router.post("/profitability-scenario")
async def calculate_profitability(scenario: ProfitabilityScenario):
    base_revenue = 1000000  # Base monthly revenue
    base_orders = 10000
    base_aov = base_revenue / base_orders
    
    # Apply scenario
    new_orders = base_orders * scenario.demand_multiplier
    new_revenue = new_orders * base_aov
    
    # Costs
    delivery_costs = new_orders * scenario.delivery_cost
    discount_costs = new_revenue * (scenario.discount_rate / 100)
    fixed_costs = 150000  # Fixed monthly costs
    cogs = new_revenue * 0.65  # Cost of goods sold
    
    total_costs = delivery_costs + discount_costs + fixed_costs + cogs
    profit = new_revenue - total_costs
    margin = (profit / new_revenue) * 100 if new_revenue > 0 else 0
    
    return {
        "revenue": round(new_revenue, 2),
        "orders": round(new_orders, 0),
        "delivery_costs": round(delivery_costs, 2),
        "discount_costs": round(discount_costs, 2),
        "total_costs": round(total_costs, 2),
        "profit": round(profit, 2),
        "margin_percent": round(margin, 2)
    }

# Get retention analysis
@api_router.get("/retention-analysis")
async def get_retention_analysis():
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate churn drivers
    completed_orders = [o for o in orders if o["status"] == "completed"]
    avg_delivery_time = sum(o["delivery_time_minutes"] for o in completed_orders) / len(completed_orders) if completed_orders else 0
    
    # Segment by retention
    high_retention = [c for c in customers if c["retention_rate"] >= 75]
    medium_retention = [c for c in customers if 50 <= c["retention_rate"] < 75]
    low_retention = [c for c in customers if c["retention_rate"] < 50]
    
    return {
        "avg_delivery_time": round(avg_delivery_time, 2),
        "high_retention_count": len(high_retention),
        "medium_retention_count": len(medium_retention),
        "low_retention_count": len(low_retention),
        "retention_by_segment": {
            "premium": round(sum(c["retention_rate"] for c in customers if c["segment"] == "premium") / len([c for c in customers if c["segment"] == "premium"]), 2) if [c for c in customers if c["segment"] == "premium"] else 0,
            "regular": round(sum(c["retention_rate"] for c in customers if c["segment"] == "regular") / len([c for c in customers if c["segment"] == "regular"]), 2) if [c for c in customers if c["segment"] == "regular"] else 0,
            "budget": round(sum(c["retention_rate"] for c in customers if c["segment"] == "budget") / len([c for c in customers if c["segment"] == "budget"]), 2) if [c for c in customers if c["segment"] == "budget"] else 0,
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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