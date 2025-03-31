from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base  # 假設你已經定義好 Base

class Voter(Base):
    __tablename__ = "voters"

    user_id = Column(String, primary_key=True)
    mail = Column(String, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=True)
    status = Column(String, default="registered")  # 新增欄位
    created_at = Column(DateTime, default=datetime.utcnow)

    verification_codes = relationship("VerificationCode", back_populates="voter", cascade="all, delete-orphan")
    vote = relationship("Vote", back_populates="voter", uselist=False, cascade="all, delete-orphan")  # 一人只能投一次

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("voters.user_id"), nullable=False)
    code = Column(String, nullable=False)
    salt = Column(String, nullable=False)  # 加入 salt 欄位
    created_at = Column(DateTime, default=datetime.utcnow)

    voter = relationship("Voter", back_populates="verification_codes")

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("voters.user_id"), nullable=False, unique=True)
    vote1 = Column(Integer, ForeignKey("teams.id"), nullable=False)
    vote2 = Column(Integer, ForeignKey("teams.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    voter = relationship("Voter", back_populates="vote")
    team1 = relationship("Team", foreign_keys=[vote1])
    team2 = relationship("Team", foreign_keys=[vote2])

class VoteStatistic(Base):
    __tablename__ = "vote_statistics"

    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
    vote_count = Column(Integer, default=0)

    team = relationship("Team", backref="vote_statistic", uselist=False)

class VoteConfig(Base):
    __tablename__ = "vote_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)