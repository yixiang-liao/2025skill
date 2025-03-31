from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.teamsdaata import Team, TeamMember, Instructor, TeamAsset
from app.db.models.votedata import VoteStatistic
from app.schemas.user import TokenData
from app.core.deps import get_current_user, get_admin_user

router = APIRouter()


@router.get("/teams/summary")
def get_team_summaries(
    db: Session = Depends(get_db),
):
    teams = db.query(Team).all()

    result = []
    for team in teams:
        asset = team.assets[0] if team.assets else None
        result.append({
            "id": team.id,
            "team_name": team.team_name,
            "theme_category": team.theme_category,
            "project_title": team.project_title,
            "pdf_url": (
                f"/img/poster_pdf/{asset.poster_pdf_path.split('/')[-1]}"
                if asset and asset.poster_pdf_path else ""
            ),
            "png_url": (
                f"/img/poster_img/{asset.poster_img_path.split('/')[-1]}"
                if asset and asset.poster_img_path else ""
            ),
            "img_url": (
                f"/img/product/{asset.product_img_path.split('/')[-1]}"
                if asset and asset.product_img_path else ""
            )
        })
    return result


@router.get("/teams/members")
def get_team_members(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)  # ✅ user/admin 可用
):
    teams = (
        db.query(Team)
        .outerjoin(TeamMember, Team.id == TeamMember.team_id)
        .outerjoin(Instructor, Team.id == Instructor.team_id)
        .all()
    )

    result = []

    for team in teams:
        leader = next((m for m in team.members if m.is_leader), None)
        members = [m for m in team.members if not m.is_leader][:3]
        instructors = team.instructors[:2]

        result.append({
            "team_id": team.id,
            "team_name": team.team_name,
            "leader": f"{leader.department} {leader.name}" if leader else "",
            "member_1": f"{members[0].department} {members[0].name}" if len(members) > 0 else "",
            "member_2": f"{members[1].department} {members[1].name}" if len(members) > 1 else "",
            "member_3": f"{members[2].department} {members[2].name}" if len(members) > 2 else "",
            "instructor_1": f"{instructors[0].affiliated_department} {instructors[0].name}" if len(instructors) > 0 else "",
            "instructor_2": f"{instructors[1].affiliated_department} {instructors[1].name}" if len(instructors) > 1 else "",
        })

    return result


@router.delete("/teams/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(get_admin_user)  # ✅ 限定只有 admin 可用
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="找不到隊伍")
    db.query(VoteStatistic).filter(VoteStatistic.team_id == team_id).delete()
    db.delete(team)
    db.commit()
    return {"message": f"已刪除 team_id={team_id} 所有相關資料"}
