from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API Keys
    gemini_api_key: str = ""
    github_access_token: str | None = None
    
    # Security
    jwt_secret_key: str = "default_unsafe_secret_please_change"
    
    # Optional settings
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

# Global settings instance
settings = Settings()
