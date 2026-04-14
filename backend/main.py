from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routes.auth import router as auth_router
from routes.predict import router as predict_router, warmup_ev_models
from routes.predict_truck import router as truck_router, warmup_truck_models
from routes.chatbot import router as chatbot_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    ev_status = warmup_ev_models()
    truck_status = warmup_truck_models()
    if not ev_status["loaded"]:
        print(f"[Startup][EV] Model warmup failed: {ev_status['error']}")
    if not truck_status["loaded"]:
        print(f"[Startup][Truck] Model warmup failed: {truck_status['error']}")

    yield


app = FastAPI(title="ML One API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://auto-sense-five.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(truck_router)
app.include_router(chatbot_router)


@app.get("/")
async def root():
    return {"message": "ML One API is running"}


@app.get("/health/models")
async def model_health():
    return {
        "ev": warmup_ev_models(),
        "truck": warmup_truck_models(),
    }