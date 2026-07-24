from fastapi import FastAPI

from app.market import router as market_router

app = FastAPI(
    title="Voom AI Sniper API",
    description="Backend API for the Voom AI Sniper platform.",
    version="0.1.0",
)
app.include_router(market_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "api"}
