# models.py
from sqlalchemy import Column, Integer, String, Boolean, LargeBinary, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base  # 假設你已經定義好 Base

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_name = Column(String(255), nullable=False)      # 隊伍名稱
    project_title = Column(String(255), nullable=False)    # 專題名稱
    theme_category = Column(String(255))                   # 主題類別
    project_abstract = Column(Text)                        # 專題作品摘要（限500字以內）
    
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    instructors = relationship("Instructor", back_populates="team", cascade="all, delete-orphan")
    assets = relationship("TeamAsset", back_populates="team", cascade="all, delete-orphan")
    scores = relationship("Score", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    name = Column(String(255), nullable=False)             # 姓名
    student_id = Column(String(50))                          # 學號
    gender = Column(String(10))                              # 性別
    campus = Column(String(100))                             # 所在校區
    department = Column(String(100))                         # 系所
    class_ = Column(String(50))                              # 班級
    phone_number = Column(String(20))                        # 手機號碼
    email = Column(String(255))                              # Email
    is_leader = Column(Boolean, default=False)             # 是否為組長

    team = relationship("Team", back_populates="members")

class Instructor(Base):
    __tablename__ = "instructors"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    name = Column(String(255), nullable=False)             # 姓名
    gender = Column(String(10))                              # 性別
    affiliated_department = Column(String(100))            # 隸屬系所
    email = Column(String(255))                              # Email

    team = relationship("Team", back_populates="instructors")


class TeamAsset(Base):
    __tablename__ = "team_assets"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    poster_pdf_path = Column(String, nullable=True)
    poster_img_path = Column(String, nullable=True)
    product_img_path = Column(String, nullable=True)

    # 正確的關聯：每個 TeamAsset 都屬於一個 team
    team = relationship("Team", back_populates="assets")
