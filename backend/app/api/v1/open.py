from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.teamsdaata import Team
from app.db.models.votedata import VoteStatistic
import random
import os

router = APIRouter()

# 公開圖片網址
def poster_url(team):
    if team.assets and team.assets[0].poster_img_path:
        return f"/img/poster_img/{os.path.basename(team.assets[0].poster_img_path)}"
    return ""

def product_url(team):
    if team.assets and team.assets[0].product_img_path:
        return f"/img/product/{os.path.basename(team.assets[0].product_img_path)}"
    return ""

# ✅ 單一團隊詳細資料
@router.get("/open/team/{team_id}")
def get_team_detail(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="找不到隊伍")

    # 查詢票數統計（可能為 None）
    vote_stat = db.query(VoteStatistic).filter(VoteStatistic.team_id == team_id).first()
    vote_count = vote_stat.vote_count if vote_stat else 0

    return {
        "id": team.id,
        "project_title": team.project_title,
        "team_name": team.team_name,
        "theme_category": team.theme_category,
        "project_abstract": team.project_abstract,
        "members": [f"{m.department} {m.name}" for m in team.members],
        "instructors": [f"{i.affiliated_department} {i.name}" for i in team.instructors],
        "poster_img": poster_url(team),
        "product_img": product_url(team),
        "vote_count": vote_count  # ✅ 加入票數
    }


# ✅ 1. 隨機排序所有隊伍（附 team_id）
@router.get("/open/random")
def get_random_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    teams = [t for t in teams if t.assets and t.assets[0].poster_img_path]
    random.shuffle(teams)

    return [
        {
            "team_id": team.id,
            "poster_img": poster_url(team),
            "project_title": team.project_title,
            "team_name": team.team_name,
            "project_abstract": team.project_abstract
        }
        for team in teams
    ]

# ✅ 2. 各領域查詢（附 team_id）
@router.get("/open/theme")
def get_teams_by_theme(code: str = Query(...), db: Session = Depends(get_db)):
    theme_map = {
        "all": None,
        "me": "機電運輸領域",
        "it": "資通訊領域",
        "design": "服務文創領域"
    }

    if code not in theme_map:
        raise HTTPException(status_code=400, detail="未知的主題代號")

    query = db.query(Team)
    if theme_map[code]:
        query = query.filter(Team.theme_category == theme_map[code])

    teams = query.all()
    result = []
    for team in teams:
        if team.assets and team.assets[0].poster_img_path:
            vote_stat = db.query(VoteStatistic).filter(VoteStatistic.team_id == team.id).first()
            vote_count = vote_stat.vote_count if vote_stat else 0
            result.append({
                "team_id": team.id,
                "poster_img": poster_url(team),
                "theme_category": team.theme_category,
                "project_title": team.project_title,
                "team_name": team.team_name,
                "vote_count": vote_count  # ✅ 加入票數
            })
    return result

@router.get("/ranking")
def get_vote_ranking(db: Session = Depends(get_db)):
    ranking = (
        db.query(VoteStatistic, Team)
        .join(Team, VoteStatistic.team_id == Team.id)
        .order_by(VoteStatistic.vote_count.desc())
        .all()
    )

    result = []
    current_rank = 0
    last_vote_count = None
    same_rank_count = 0  # 計算同票數的項目數

    for idx, (stat, team) in enumerate(ranking):
        if stat.vote_count != last_vote_count:
            # 如果票數不同，更新 rank 為目前項目數 + 1
            current_rank = idx + 1
            last_vote_count = stat.vote_count

        result.append({
            "rank": current_rank,
            "team_id": team.id,
            "team_name": team.team_name,
            "project_title": team.project_title,
            "vote_count": stat.vote_count
        })

    return result
