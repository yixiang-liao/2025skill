import hmac
import hashlib
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
import os
import re
from app.core.config import settings

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# 產生驗證碼
def secure_verification_code(input_str, secret_key=settings.VERIFICATION_CODE_SECRET_KEY):
    # 使用 UUID 當 salt 增加隨機性
    salt = uuid.uuid4().hex[:8]  # 取前 8 字元
    message = f"{input_str}-{salt}"

    digest = hmac.new(secret_key.encode(), message.encode(), hashlib.sha256).hexdigest()
    num = int(digest[:12], 16) % 1000000
    code = f"{num:06d}"  # 六位數字

    return {"code": code, "salt": salt}

# 回傳驗證碼是否正確
def verify_code(input_str, code_input, salt, secret_key=settings.VERIFICATION_CODE_SECRET_KEY):
    message = f"{input_str}-{salt}"
    digest = hmac.new(secret_key.encode(), message.encode(), hashlib.sha256).hexdigest()
    num = int(digest[:12], 16) % 1000000
    expected_code = f"{num:06d}"
    return code_input == expected_code

def send_verification_email(to_email: str, code: str):
    template = env.get_template("email_verification.html")
    html_content = template.render(code=code)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "2025技優成果競賽 人氣獎票選 - 驗證碼通知"
    msg["From"] = settings.EMAIL_SENDER
    msg["To"] = to_email
    print(msg)

    # 🔧 正確處理 utf-8 編碼
    mime_text = MIMEText(html_content.encode("utf-8"), "html", "utf-8")
    msg.attach(mime_text)

    try:
        with smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT) as smtp:
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(msg)
            print(f"✅ 驗證碼已寄送至 {to_email}")
    except Exception as e:
        print(f"❌ 郵件寄送失敗：{e}")

def normalize_user_id(user_id: str) -> str:
    """
    檢查 user_id 是否為 1 個英文字母 + 9 個數字，
    若符合，則回傳大寫版本；否則原樣回傳。
    """
    if re.match(r"^[a-zA-Z]\d{9}$", user_id):
        return user_id.upper()
    return user_id

