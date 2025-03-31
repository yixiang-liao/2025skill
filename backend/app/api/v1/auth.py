from fastapi import APIRouter, Depends, HTTPException, Query, status, Response, Request , Path
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, get_db
from app.db.models.user import User
from app.schemas.user import UserLogin , Token , TokenData
from app.services.auth_service import authenticate_user , generate_tokens
from app.core.deps import get_current_user, get_admin_user
from app.core.security import decode_token , create_access_token , get_password_hash, verify_password
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.schemas.user import UserCreate , UserChangePassword
from app.services.auth_service import register_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login", response_model=Token)
def login(form_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    tokens = generate_tokens(user)
    response.set_cookie(key="refresh_token", value=tokens["refresh_token"], httponly=True, max_age=60*60*24*7, path="/")
    return {"access_token": tokens["access_token"], "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
def refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    new_token = create_access_token({"sub": payload.get("sub"), "role": payload.get("role")})
    return {"access_token": new_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: TokenData = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

@router.get("/admin")
def admin_only(admin_user: TokenData = Depends(get_admin_user)):
    return {"msg": f"Hello admin {admin_user.username}"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"msg": "Logged out"}

@router.post("/admin/register")
def admin_register_user(
    form_data: UserCreate,
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(get_admin_user)  # ✅ 限定管理員才能操作
):
    allowed_roles = ["user", "admin", "reviewer"]
    if form_data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="不允許的角色")

    existing = db.query(User).filter(User.username == form_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="使用者名稱已被註冊")
    
    user = register_user(db, form_data.username, form_data.password, form_data.role)
    if not user:
        raise HTTPException(status_code=500, detail="註冊失敗")
    
    return {"msg": f"註冊成功：{form_data.username}（角色：{form_data.role}）"}

# 中文權限對應
ROLE_NAME_MAP = {
    "admin": "管理員",
    "user": "工作人員",
    "reviewer": "評審"
}

@router.get("/admin/users")
def list_users(db: Session = Depends(get_db), admin_user: TokenData = Depends(get_admin_user)):
    users = db.query(User).all()
    return [
        {
            "username": u.username,
            "role": u.role,
            "role_name": ROLE_NAME_MAP.get(u.role, "未知角色")
        }
        for u in users
    ]

@router.post("/change-password")
def change_password(
    data: UserChangePassword,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user.username).first()

    if not user or not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="舊密碼錯誤")

    user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"msg": "密碼更新成功"}

@router.delete("/admin/delete-user/{username}")
def delete_user(
    username: str = Path(..., description="欲刪除的使用者帳號"),
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(get_admin_user)  # ✅ 僅限 admin
):
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="使用者不存在")
    
    db.delete(user)
    db.commit()

    return {"msg": f"使用者 {username} 已刪除"}