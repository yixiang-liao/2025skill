from sqlalchemy import Column, Integer, String, Boolean, LargeBinary, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base  # 假設你已經定義好 Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")

    scores = relationship("Score", back_populates="user", cascade="all, delete-orphan")