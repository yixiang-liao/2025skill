import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from pdf2image import convert_from_bytes
from app.db.session import get_db
from app.db.models.teamsdaata import Team, TeamAsset
from app.schemas.user import TokenData
from app.core.deps import get_current_user

router = APIRouter()

# 設定公開靜態檔案網址
STATIC_FOLDER = "img"
POSTER_PDF_DIR = os.path.join(STATIC_FOLDER, "poster_pdf")
POSTER_IMG_DIR = os.path.join(STATIC_FOLDER, "poster_img")
PRODUCT_IMG_DIR = os.path.join(STATIC_FOLDER, "product")

# 確保資料夾存在
os.makedirs(POSTER_PDF_DIR, exist_ok=True)
os.makedirs(POSTER_IMG_DIR, exist_ok=True)
os.makedirs(PRODUCT_IMG_DIR, exist_ok=True)

def clean_filename(s: str):
    return "".join(c if c.isalnum() else "_" for c in s)

@router.post("/teams/{team_id}/upload-image")
async def upload_team_image(
    team_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ["admin", "user"]:
        raise HTTPException(status_code=403, detail="權限不足")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="隊伍不存在")

    ext = file.filename.split(".")[-1]
    safe_title = clean_filename(team.project_title)
    filename = f"{team.id}_{safe_title}_img.{ext}"
    save_path = os.path.join(PRODUCT_IMG_DIR, filename)

    asset = db.query(TeamAsset).filter_by(team_id=team_id).first()
    if asset and asset.product_img_path and os.path.exists(asset.product_img_path):
        os.remove(asset.product_img_path)

    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    if not asset:
        asset = TeamAsset(team_id=team.id, product_img_path=save_path)
        db.add(asset)
    else:
        asset.product_img_path = save_path

    db.commit()
    return {"message": "圖片上傳成功", "url": f"/img/product/{filename}"}

@router.post("/teams/{team_id}/upload-poster")
async def upload_team_poster(
    team_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ["admin", "user"]:
        raise HTTPException(status_code=403, detail="權限不足")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="僅支援 PDF 檔案")

    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="隊伍不存在")

    safe_title = clean_filename(team.project_title)
    pdf_filename = f"{team.id}_{safe_title}_poster.pdf"
    pdf_path = os.path.join(POSTER_PDF_DIR, pdf_filename)
    pdf_bytes = await file.read()

    asset = db.query(TeamAsset).filter_by(team_id=team_id).first()
    if asset:
        if asset.poster_pdf_path and os.path.exists(asset.poster_pdf_path):
            os.remove(asset.poster_pdf_path)
        if asset.poster_img_path and os.path.exists(asset.poster_img_path):
            os.remove(asset.poster_img_path)

    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    images = convert_from_bytes(pdf_bytes, dpi=200)
    png_filename = f"{team.id}_{safe_title}_poster.png"
    png_path = os.path.join(POSTER_IMG_DIR, png_filename)
    images[0].save(png_path, "PNG")

    if not asset:
        asset = TeamAsset(
            team_id=team.id,
            poster_pdf_path=pdf_path,
            poster_img_path=png_path
        )
        db.add(asset)
    else:
        asset.poster_pdf_path = pdf_path
        asset.poster_img_path = png_path

    db.commit()
    return {
        "message": "海報上傳成功",
        "pdf_url": f"/img/poster_pdf/{pdf_filename}",
        "png_url": f"/img/poster_img/{png_filename}"
    }

@router.delete("/teams/{team_id}/assets")
def delete_team_assets(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ["admin", "user"]:
        raise HTTPException(status_code=403, detail="權限不足")

    asset = db.query(TeamAsset).filter(TeamAsset.team_id == team_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="找不到對應的 TeamAsset 資料")

    for path in [asset.product_img_path, asset.poster_pdf_path, asset.poster_img_path]:
        if path and os.path.exists(path):
            os.remove(path)

    db.delete(asset)
    db.commit()

    return {"message": f"已成功刪除 team_id={team_id} 的 TeamAsset 與相關圖片檔案"}