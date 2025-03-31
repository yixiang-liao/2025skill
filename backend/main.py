from fastapi import FastAPI
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import test , excel , teamdata , upload_team_assets  , open ,voteapi , auth ,score

app = FastAPI()

origins = [
    "http://localhost:5173",  # ← 你的前端開發伺服器
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://192.168.28.131:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# 跨域設定（根據需求調整）
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    print(settings.API_V1_STR)
    return {"Hello": "World"}

# 靜態公開圖片資料夾
app.mount("/img", StaticFiles(directory="./img/"), name="img")

app.include_router(test.router, prefix=settings.API_V1_STR)
app.include_router(excel.router, prefix=settings.API_V1_STR,tags=["後台上傳隊伍Excel"])
app.include_router(teamdata.router, prefix=settings.API_V1_STR,tags=["後台隊伍資料"])
app.include_router(upload_team_assets.router, prefix=settings.API_V1_STR,tags=["後台上傳資料"])
app.include_router(open.router, prefix=settings.API_V1_STR,tags=["前台資料"])
app.include_router(voteapi.router, prefix=settings.API_V1_STR,tags=["投票"])
app.include_router(auth.router, prefix=settings.API_V1_STR,tags=["登入登出"])
app.include_router(score.router, prefix=settings.API_V1_STR,tags=["評分系統"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)