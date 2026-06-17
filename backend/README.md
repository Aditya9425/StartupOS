# StartupOS Backend
FastAPI application.

## Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
