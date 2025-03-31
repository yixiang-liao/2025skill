from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from typing import List, Dict
from app.schemas.score import ScoreCreate, ScoreUpdate
from app.db.models.Score import Score
from app.db.models.user import User
from app.db.models.teamsdaata import Team
import openpyxl
from openpyxl.styles import Alignment
import io

def create_score(db: Session, score_data: ScoreCreate, user_id: int):
    total = (
        score_data.technical * 0.25 +
        score_data.innovation * 0.25 +
        score_data.value_creation * 0.25 +
        score_data.design * 0.25
    )
    score = Score(
        team_id=score_data.team_id,
        user_id=user_id,
        technical=score_data.technical,
        innovation=score_data.innovation,
        value_creation=score_data.value_creation,
        design=score_data.design,
        total_score=round(total, 5)
    )
    db.add(score)
    try:
        db.commit()
        db.refresh(score)
        return score
    except IntegrityError:
        db.rollback()
        raise ValueError("You have already rated this team.")

def update_score(db: Session, score_id: int, score_data: ScoreUpdate, user_id: int):
    score = db.query(Score).filter(Score.id == score_id, Score.user_id == user_id).first()
    if not score:
        raise ValueError("Score not found or permission denied.")
    score.technical = score_data.technical
    score.innovation = score_data.innovation
    score.value_creation = score_data.value_creation
    score.design = score_data.design
    score.total_score = round(
        score.technical * 0.25 +
        score.innovation * 0.25 +
        score.value_creation * 0.25 +
        score.design * 0.25,
        5
    )
    db.commit()
    db.refresh(score)
    return score

def get_scores_by_user(db: Session, user_id: int) -> List[Score]:
    return db.query(Score).filter(Score.user_id == user_id).all()

def get_team_score_ranking(db: Session) -> List[Dict]:
    teams = db.query(Team).order_by(Team.id).all()

    team_scores = (
        db.query(
            Score.team_id,
            func.avg(Score.technical).label("technical_avg"),
            func.avg(Score.innovation).label("innovation_avg"),
            func.avg(Score.value_creation).label("value_creation_avg"),
            func.avg(Score.design).label("design_avg"),
        )
        .group_by(Score.team_id)
        .all()
    )

    score_map = {score.team_id: score for score in team_scores}

    enriched = []
    for team in teams:
        scores = score_map.get(team.id)

        technical = round(scores.technical_avg or 0, 5) if scores else 0
        innovation = round(scores.innovation_avg or 0, 5) if scores else 0
        value_creation = round(scores.value_creation_avg or 0, 5) if scores else 0
        design = round(scores.design_avg or 0, 5) if scores else 0

        total_score = round(
            (technical + innovation + value_creation + design) * 0.25, 5
        )

        enriched.append({
            "team_id": team.id,
            "team_name": team.team_name,
            "project_title": team.project_title,
            "technical_avg": technical,
            "innovation_avg": innovation,
            "value_creation_avg": value_creation,
            "design_avg": design,
            "total_score": total_score
        })

    # 排名依照 total_score 排序，同分同名次
    enriched_sorted = sorted(enriched, key=lambda x: x["total_score"], reverse=True)

    current_rank = 1
    last_score = None
    for idx, item in enumerate(enriched_sorted):
        if last_score is not None and item["total_score"] == last_score:
            item["rank"] = current_rank
        else:
            current_rank = idx + 1
            item["rank"] = current_rank
            last_score = item["total_score"]

    # 最後回傳時依照 team_id 排序
    enriched_final = sorted(enriched_sorted, key=lambda x: x["team_id"])

    return enriched_final

def get_all_reviewer_scores(db: Session):
    rows = (
        db.query(
            User.id.label("reviewer_id"),
            User.username.label("reviewer_name"),
            Team.id.label("team_id"),
            Team.team_name,
            Team.project_title,
            Score.technical,
            Score.innovation,
            Score.value_creation,
            Score.design,
            Score.total_score,
        )
        .join(Score, Score.user_id == User.id)
        .join(Team, Team.id == Score.team_id)
        .filter(User.role == "reviewer")
        .order_by(User.id, Team.id)
        .all()
    )

    # 🔄 用 reviewer_id 分組
    grouped = {}
    for r in rows:
        if r.reviewer_id not in grouped:
            grouped[r.reviewer_id] = {
                "reviewer_id": r.reviewer_id,
                "reviewer_name": r.reviewer_name,
                "scores": []
            }

        grouped[r.reviewer_id]["scores"].append({
            "team_id": r.team_id,
            "team_name": r.team_name,
            "project_title": r.project_title,
            "technical": r.technical,
            "innovation": r.innovation,
            "value_creation": r.value_creation,
            "design": r.design,
            "total_score": round(r.total_score or 0, 2)
        })

    return list(grouped.values())

def get_all_reviewer_scores_excel(db: Session) -> List[Dict]:
    # 所有評審、隊伍、評分
    reviewers = db.query(User).filter(User.role == "reviewer").all()
    teams = db.query(Team).all()
    scores = (
        db.query(Score)
        .join(User, Score.user_id == User.id)
        .filter(User.role == "reviewer")
        .all()
    )

    # 快速查表：{ reviewer_id: { team_id: Score } }
    score_map = {}
    for s in scores:
        score_map.setdefault(s.user_id, {})[s.team_id] = s

    # 整理回傳格式
    result = []
    for reviewer in reviewers:
        reviewer_scores = []
        for team in teams:
            score = score_map.get(reviewer.id, {}).get(team.id)
            if score:
                reviewer_scores.append({
                    "team_id": team.id,
                    "team_name": team.team_name,
                    "project_title": team.project_title,
                    "technical": score.technical,
                    "innovation": score.innovation,
                    "value_creation": score.value_creation,
                    "design": score.design,
                    "total_score": round(score.total_score or 0, 2)
                })
            else:
                reviewer_scores.append({
                    "team_id": team.id,
                    "team_name": team.team_name,
                    "project_title": team.project_title,
                    "technical": "尚未評分",
                    "innovation": "尚未評分",
                    "value_creation": "尚未評分",
                    "design": "尚未評分",
                    "total_score": 0
                })

        result.append({
            "reviewer_id": reviewer.id,
            "reviewer_name": reviewer.username,
            "scores": reviewer_scores
        })

    return result
