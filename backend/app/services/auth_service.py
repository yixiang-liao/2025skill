# 📦 import
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.security import get_password_hash
from sqlalchemy.exc import IntegrityError

# ✅ 內容
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def generate_tokens(user: User):
    data = {"sub": user.username, "role": user.role , "user_id": user.id}
    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data)
    }

def register_user(db: Session, username: str, password: str, role: str = "user"):
    hashed_pw = get_password_hash(password)
    user = User(username=username, hashed_password=hashed_pw, role=role)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        return None
