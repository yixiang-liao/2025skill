from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# 檢查實際計算出來的路徑
env_path = os.path.join(os.path.dirname(__file__), "../../.env")
print("ENV FILE PATH:", env_path)

# 指定 .env 檔案的絕對路徑或相對路徑
load_dotenv(env_path)

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    VERIFICATION_CODE_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    EMAIL_SENDER: str

    class Config:
        env_file = env_path

settings = Settings()

# print("DATABASE_URL from env:", os.environ.get("DATABASE_URL"))
# print("SECRET_KEY from env:", os.environ.get("SECRET_KEY"))
