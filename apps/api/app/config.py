from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_url: str = "postgresql://voom:voom@postgres:5432/voom"
    redis_url: str = "redis://redis:6379/0"
    market_data_mode: str = "demo"
    mt5_login: str = ""
    mt5_server: str = ""
    interactive_brokers_host: str = "127.0.0.1"
    interactive_brokers_port: int = 7497
    binance_base_url: str = "https://api.binance.com"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
