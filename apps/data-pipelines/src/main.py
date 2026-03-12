import os
import datetime
from fastapi import FastAPI, BackgroundTasks
import financeindia
import pandas as pd
from sqlalchemy import create_engine, text
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Artha Data Pipelines")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
engine = create_engine(DATABASE_URL)

def ingest_market_data():
    try:
        logger.info("Starting market data ingestion...")
        client = financeindia.FinanceClient()
        
        # Get yesterday's date for bhavcopy (usually NSE data is updated late)
        target_date = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        
        logger.info(f"Fetching bhavcopy for {target_date}")
        bhav_data = client.bhav_copy_equities(target_date)
        
        if bhav_data:
            df = pd.DataFrame(bhav_data)
            df.to_sql("equity_bhavcopy", engine, if_exists="replace", index=False)
            logger.info(f"Successfully ingested {len(df)} records for {target_date}")
        else:
            logger.warning(f"No data returned from financeindia for {target_date}")
            
    except Exception as e:
        logger.error(f"Error during ingestion: {e}")

@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/ingest")
def trigger_ingest(background_tasks: BackgroundTasks):
    background_tasks.add_task(ingest_market_data)
    return {"message": "Ingestion triggered in background"}

if __name__ == "__main__":
    import uvicorn
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--ingest":
        ingest_market_data()
    else:
        port = int(os.getenv("PIPELINE_PORT", 8000))
        uvicorn.run(app, host="0.0.0.0", port=port)
