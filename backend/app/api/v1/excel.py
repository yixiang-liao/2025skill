from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from io import BytesIO
import openpyxl
from app.db.session import SessionLocal  # 資料庫連線與 SessionLocal
from app.db.models.teamsdaata import Team, TeamMember, Instructor
from app.db.models.votedata import VoteStatistic
from app.schemas.user import TokenData
from app.core.deps import get_current_user


router = APIRouter()

@router.post("/upload-excel")
async def upload_excel(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ["admin", "user"]:
        raise HTTPException(status_code=403, detail="只有管理員與工作人員可操作")
    
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="檔案類型錯誤")
    
    contents = await file.read()
    try:
        wb = openpyxl.load_workbook(BytesIO(contents), data_only=True)
    except Exception:
        raise HTTPException(status_code=400, detail="無法解析 Excel 檔案")
    
    sheet = wb.active  # 假設使用第一個工作表
    db = SessionLocal()
    
    try:
        # 假設第一列為標題，從第二列開始讀取資料
        for row in sheet.iter_rows(min_row=2, values_only=True):
            # 若該列資料長度不足 40 個欄位則跳過
            if len(row) < 40:
                continue

            # 建立隊伍資料（使用欄位 36～39）
            team = Team(
                team_name=row[36],
                project_title=row[37],
                theme_category=row[38],
                project_abstract=row[39]
            )
            db.add(team)
            db.commit()  # commit 取得 team.id
            db.refresh(team)
            
            # ✅ 同步建立 VoteStatistic 資料
            vote_stat = VoteStatistic(team_id=team.id, vote_count=0)
            db.add(vote_stat)

            # 建立組長（欄位 0～6），假設姓名必填
            if row[0] and str(row[0]).strip() != "":
                leader = TeamMember(
                    team_id=team.id,
                    name=row[0],
                    student_id=row[1],
                    gender=row[2],
                    campus=row[3],
                    department=row[4],
                    class_=row[5],
                    phone_number=row[6],
                    email=row[1]+"@nkust.edu.tw",
                    is_leader=True
                )
                db.add(leader)
            
            # 建立組員1（欄位 7～13）
            if row[7] and str(row[7]).strip() != "":
                member1 = TeamMember(
                    team_id=team.id,
                    name=row[7],
                    student_id=row[8],
                    gender=row[9],
                    campus=row[10],
                    department=row[11],
                    class_=row[12],
                    phone_number=row[13],
                    email=row[8]+"@nkust.edu.tw",
                    is_leader=False
                )
                db.add(member1)
            
            # 建立組員2（欄位 14～20），若有資料才新增
            if row[14] and str(row[14]).strip() != "":
                member2 = TeamMember(
                    team_id=team.id,
                    name=row[14],
                    student_id=row[15],
                    gender=row[16],
                    campus=row[17],
                    department=row[18],
                    class_=row[19],
                    phone_number=row[20],
                    email=row[15]+"@nkust.edu.tw",
                    is_leader=False
                )
                db.add(member2)
            
            # 建立組員3（欄位 21～27），若有資料才新增
            if row[21] and str(row[21]).strip() != "":
                member3 = TeamMember(
                    team_id=team.id,
                    name=row[21],
                    student_id=row[22],
                    gender=row[23],
                    campus=row[24],
                    department=row[25],
                    class_=row[26],
                    phone_number=row[27],
                    email=row[22]+"@nkust.edu.tw",
                    is_leader=False
                )
                db.add(member3)
            
            # 建立指導老師1（欄位 28～31），假設必填
            if row[28] and str(row[28]).strip() != "":
                instructor1 = Instructor(
                    team_id=team.id,
                    name=row[28],
                    gender=row[29],
                    affiliated_department=row[30],
                    email=row[31]
                )
                db.add(instructor1)
            
            # 建立指導老師2（欄位 32～35），若有資料才新增
            if row[32] and str(row[32]).strip() != "":
                instructor2 = Instructor(
                    team_id=team.id,
                    name=row[32],
                    gender=row[33],
                    affiliated_department=row[34],
                    email=row[35]
                )
                db.add(instructor2)
            
            db.commit()  # 每筆資料都 commit 一次（或考慮批次 commit）
        return {"message": "資料上傳成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
