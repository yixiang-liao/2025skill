from fastapi import APIRouter, Depends, HTTPException ,UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, get_db
from app.db.models.votedata import Voter , VerificationCode , Vote , VoteStatistic , VoteConfig
from app.db.models.teamsdaata import Team
from app.schemas.votedata import VerifyRequest , VoteRequest , CodeRequest ,VoteTimeSchema
from datetime import datetime , timedelta
from app.services.VerificationCode_hash import secure_verification_code , verify_code , send_verification_email , normalize_user_id
from datetime import datetime
from sqlalchemy import desc
from app.core.deps import get_admin_user
from app.schemas.user import TokenData

router = APIRouter()

# ✅ 產生或取得驗證碼
@router.get("/status/{user_id}")
def get_user_status(user_id: str, db: Session = Depends(get_db)):
    user_id = normalize_user_id(user_id)
    voter = db.query(Voter).filter(Voter.user_id == user_id).first()
    config = db.query(VoteConfig).first()

    vote_start = config.start_time.isoformat() if config else None
    vote_end = config.end_time.isoformat() if config else None

    # 🆕 使用者未註冊
    if not voter:
        code_info = secure_verification_code(user_id)
        mail = f"{user_id}@nkust.edu.tw"
        voter = Voter(
            user_id=user_id,
            mail=mail,
            name="",
            status="registered"
        )
        code = VerificationCode(
            user_id=user_id,
            code=code_info["code"],
            salt=code_info["salt"]
        )
        db.add(voter)
        db.add(code)
        db.commit()

        send_verification_email(mail, code_info["code"])

        return {
            "status": "registered",
            "message": "帳號已建立並寄出驗證碼，請至 Email 查收",
            "send_to": mail,
            "vote_start": vote_start,
            "vote_end": vote_end
        }

    # ✅ 若已驗證或已投票
    if voter.status == "verified":
        return {"status": "verified", "message": "帳號已驗證", "vote_start": vote_start, "vote_end": vote_end}
    if voter.status == "voted":
        return {"status": "voted", "message": "您已完成投票", "vote_start": vote_start, "vote_end": vote_end}

    # ✅ 尚未驗證，處理驗證碼
    record = db.query(VerificationCode).filter(VerificationCode.user_id == user_id).first()

    # 驗證碼逾時（超過10分鐘）
    if record and datetime.utcnow() - record.created_at > timedelta(minutes=10):
        db.delete(record)
        code_info = secure_verification_code(user_id)
        new_code = VerificationCode(
            user_id=user_id,
            code=code_info["code"],
            salt=code_info["salt"]
        )
        db.add(new_code)
        db.commit()
        send_verification_email(voter.mail, code_info["code"])
        return {
            "status": voter.status,
            "message": "驗證碼已過期，已重新寄送至 Email",
            "send_to": voter.mail,
            "vote_start": vote_start,
            "vote_end": vote_end
        }

    # 沒有驗證紀錄 → 新建
    if not record:
        code_info = secure_verification_code(user_id)
        new_code = VerificationCode(
            user_id=user_id,
            code=code_info["code"],
            salt=code_info["salt"]
        )
        db.add(new_code)
        db.commit()
        send_verification_email(voter.mail, code_info["code"])
        return {
            "status": voter.status,
            "message": "驗證碼已寄送至 Email",
            "send_to": voter.mail,
            "vote_start": vote_start,
            "vote_end": vote_end
        }

    # 驗證碼仍有效
    return {
        "status": voter.status,
        "message": "驗證碼已發送，請於 10 分鐘內完成驗證",
        "vote_start": vote_start,
        "vote_end": vote_end
    }


# ✅ 驗證 OTP 驗證碼
@router.post("/verify")
def verify_otp(data: VerifyRequest, db: Session = Depends(get_db)):
    New_user_id = normalize_user_id(data.user_id)
    record = db.query(VerificationCode).filter(
        VerificationCode.user_id == New_user_id
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="驗證碼不存在")

    # 超過 10 分鐘 → 刪除並回應逾時
    if datetime.utcnow() - record.created_at > timedelta(minutes=10):
        db.delete(record)
        db.commit()
        return {"status": "驗證碼已逾時，請重新取得"}

    # 驗證失敗
    if not verify_code(New_user_id, data.code, record.salt):
        raise HTTPException(status_code=400, detail="驗證碼錯誤")

    # 成功 → 刪除驗證碼並更新狀態
    voter = db.query(Voter).filter(Voter.user_id == New_user_id).first()
    if voter:
        voter.status = "verified"
    db.delete(record)
    db.commit()
    return {"status": "OK"}


@router.post("/vote")
def submit_vote(data: VoteRequest, db: Session = Depends(get_db)):
    config = db.query(VoteConfig).first()

    now = datetime.utcnow()
    if now < config.start_time:
        raise HTTPException(status_code=403, detail="投票尚未開始")
    if now > config.end_time:
        raise HTTPException(status_code=403, detail="投票已結束")
    
    new_user_id = normalize_user_id(data.user_id)

    # 確保使用者已註冊
    voter = db.query(Voter).filter(Voter.user_id == new_user_id).first()
    if not voter:
        raise HTTPException(status_code=400, detail="使用者不存在")

    # 檢查是否已經投票
    existing = db.query(Vote).filter(Vote.user_id == new_user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="使用者已投票")

    # 確保已驗證
    if voter.status != "verified":
        raise HTTPException(status_code=400, detail="使用者尚未完成驗證")

    # ✅ 更新使用者姓名與科系
    voter.name = data.username
    voter.department = data.department

    # 儲存投票紀錄
    new_vote = Vote(
        user_id=new_user_id,
        vote1=data.vote1,
        vote2=data.vote2
    )
    db.add(new_vote)

    # 更新 voter 狀態
    voter.status = "voted"

    # ✅ 更新 vote_statistics 表
    if data.vote1 == data.vote2:
        # 同一隊 → 加 2 票
        stat = db.query(VoteStatistic).filter(VoteStatistic.team_id == data.vote1).first()
        if stat:
            stat.vote_count += 2
        else:
            db.add(VoteStatistic(team_id=data.vote1, vote_count=2))
    else:
        # 不同隊 → 各加 1 票
        for team_id in [data.vote1, data.vote2]:
            stat = db.query(VoteStatistic).filter(VoteStatistic.team_id == team_id).first()
            if stat:
                stat.vote_count += 1
            else:
                db.add(VoteStatistic(team_id=team_id, vote_count=1))

    db.commit()
    db.refresh(new_vote)

    return {"status": "投票成功"}

@router.get("/vote/config", response_model=VoteTimeSchema)
def get_vote_time(db: Session = Depends(get_db)):
    config = db.query(VoteConfig).first()
    if not config:
        raise HTTPException(status_code=404, detail="尚未設定投票期間")
    return config

@router.post("/vote/config")
def set_vote_time(
    data: VoteTimeSchema,
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(get_admin_user)
):
    config = db.query(VoteConfig).first()
    if config:
        config.start_time = data.start_time
        config.end_time = data.end_time
    else:
        config = VoteConfig(
            start_time=data.start_time,
            end_time=data.end_time
        )
        db.add(config)

    db.commit()
    return {"message": "投票時間已更新"}

@router.get("/admin/vote/history")
def get_vote_history(
    db: Session = Depends(get_db),
    admin_user: TokenData = Depends(get_admin_user)
):
    team_map = {
        team.id: team.team_name for team in db.query(Team).all()
    }

    voters = (
        db.query(Voter)
        .outerjoin(Vote, Voter.user_id == Vote.user_id)
        .order_by(desc(Voter.created_at))
        .all()
    )

    history = []
    for voter in voters:
        vote = voter.vote
        latest_time = max(
            filter(None, [voter.created_at, vote.created_at if vote else None]),
            default=voter.created_at
        )

        status_map = {
            "registered": "已註冊",
            "verified": "已驗證",
            "voted": "已投票"
        }

        history.append({
            "user_id": voter.user_id,
            "name": voter.name,
            "department": voter.department,
            "status": status_map.get(voter.status, "未知"),
            "latest_time": latest_time,
            "created_at": voter.created_at,
            "voted_at": vote.created_at if vote else None,
            "vote1": team_map.get(vote.vote1) if vote else None,
            "vote2": team_map.get(vote.vote2) if vote else None,
        })

    history.sort(key=lambda x: x["latest_time"], reverse=True)
    return history