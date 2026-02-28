from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import logs, analysis, mitre

app = FastAPI(title="CyberRAG API", version="1.0")

# Configure CORS - this is the correct way
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(logs.router, prefix="/api/v1/logs")
app.include_router(analysis.router, prefix="/api/v1/analysis")
app.include_router(mitre.router, prefix="/api/v1/mitre")

@app.get("/")
def root():
    return {"message": "CyberRAG SOC Backend Running 🚀"}