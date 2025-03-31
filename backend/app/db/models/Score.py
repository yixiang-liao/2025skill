from sqlalchemy import Column, Integer, ForeignKey, Float, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base  # 假設你已經定義好 Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    technical = Column(Integer, CheckConstraint("technical BETWEEN 0 AND 100"))
    innovation = Column(Integer, CheckConstraint("innovation BETWEEN 0 AND 100"))
    value_creation = Column(Integer, CheckConstraint("value_creation BETWEEN 0 AND 100"))
    design = Column(Integer, CheckConstraint("design BETWEEN 0 AND 100"))

    total_score = Column(Float)

    # 關聯
    team = relationship("Team", back_populates="scores")
    user = relationship("User", back_populates="scores")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="uq_team_user_score"),
    )
