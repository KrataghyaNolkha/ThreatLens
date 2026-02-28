# config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    NVD_API_KEY = os.getenv("NVD_API_KEY")
    VT_API_KEY = os.getenv("VT_API_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    OPENCAGE_API_KEY = os.getenv("OPENCAGE_API_KEY")  # Add this line

settings = Settings()