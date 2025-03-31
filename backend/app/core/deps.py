# 📦 import
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_token
from app.schemas.user import TokenData

# ✅ 內容
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="無效的 Token")
    return TokenData(username=payload.get("sub"), role=payload.get("role"))

def get_admin_user(user: TokenData = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="只有管理員可以存取")
    return user

def get_user_id_from_token(token: str = Depends(oauth2_scheme)) -> int:
    payload = decode_token(token)
    print("🔍 payload from token:", payload)
    if payload is None or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Token 無效或缺少 user_id")
    return payload["user_id"]