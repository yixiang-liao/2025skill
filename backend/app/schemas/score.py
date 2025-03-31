from pydantic import BaseModel, Field

class ScoreCreate(BaseModel):
    team_id: int
    technical: int = Field(ge=0, le=100)
    innovation: int = Field(ge=0, le=100)
    value_creation: int = Field(ge=0, le=100)
    design: int = Field(ge=0, le=100)

class ScoreResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    technical: int
    innovation: int
    value_creation: int
    design: int
    total_score: float  # ✅ 加上總分欄位

    class Config:
        orm_mode = True

class ScoreUpdate(BaseModel):
    technical: int = Field(ge=0, le=100)
    innovation: int = Field(ge=0, le=100)
    value_creation: int = Field(ge=0, le=100)
    design: int = Field(ge=0, le=100)