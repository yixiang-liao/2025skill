from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List , Dict

from app.schemas.score import ScoreCreate, ScoreUpdate, ScoreResponse
from app.core.deps import get_current_user , get_user_id_from_token , get_admin_user
from app.db.session import SessionLocal, get_db
from app.db.models.user import User
from app.services import score_service
from fastapi.responses import StreamingResponse
import io
import openpyxl
from datetime import datetime
from urllib.parse import quote

router = APIRouter()
    
@router.post("/scores/score", response_model=ScoreResponse)
def submit_score(
    score_in: ScoreCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    # 從 token 中取得 user_id 後，再查一次角色
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "reviewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只有評審可以提交評分"
        )

    # ✅ 呼叫 service 建立評分
    try:
        return score_service.create_score(db, score_in, user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ✅ 更新評分
@router.put("/scores/{score_id}", response_model=ScoreResponse)
def update_score(
    score_id: int,
    score_in: ScoreUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "reviewer":
        raise HTTPException(status_code=403, detail="Only reviewers can update scores.")

    try:
        return score_service.update_score(db, score_id, score_in, user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ✅ 查詢目前登入者的所有評分
@router.get("/scores/by-user/me", response_model=List[ScoreResponse])
def get_my_scores(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_user_id_from_token)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ["admin", "reviewer"]:
        raise HTTPException(status_code=403, detail="Permission denied.")
    
    return score_service.get_scores_by_user(db, user.id)

@router.get("/scores/team-ranking", response_model=List[Dict])
def get_team_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access team rankings.")

    return score_service.get_team_score_ranking(db)


@router.get("/scores/reviewer-all")
def get_all_reviewer_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # ✅ 僅限 admin 存取
):
    return score_service.get_all_reviewer_scores(db)

@router.get("/scores/reviewer-export")
def export_all_reviewer_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # 僅限 admin
):
    data = score_service.get_all_reviewer_scores_excel(db)

    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # 移除預設工作表

    for reviewer in data:
        ws = wb.create_sheet(title=str(reviewer["reviewer_name"])[:31])  # Excel 名稱最多 31 字

        # 表頭
        headers = [
            "隊伍 ID",
            "隊伍名稱",
            "專題名稱",
            "技術",
            "創新",
            "設計",
            "創造價值",
            "總分"
        ]
        ws.append(headers)

        for score in reviewer["scores"]:
            ws.append([
                score["team_id"],
                score["team_name"],
                score["project_title"],
                score["technical"],
                score["innovation"],
                score["design"],
                score["value_creation"],
                round(score["total_score"], 2)
            ])

    # 轉為記憶體檔案
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"評審評分報表_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    encoded_filename = quote(filename)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=review_scores.xlsx; filename*=UTF-8''{encoded_filename}"
        }
    )