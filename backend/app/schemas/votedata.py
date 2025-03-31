# schemas/verify.py

from pydantic import BaseModel
from datetime import datetime

class VerifyRequest(BaseModel):
    user_id: str
    code: str

class VoteRequest(BaseModel):
    user_id: str
    username: str
    department: str
    vote1: int
    vote2: int

class CodeRequest(BaseModel):
    input_str: str

class VoteTimeSchema(BaseModel):
    start_time: datetime
    end_time: datetime