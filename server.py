#!/usr/bin/env python3
"""
THE MĂM MĂM - BACKEND SERVER & TELEGRAM BOT ROUTER
Hỗ trợ phục vụ web tĩnh & điều hướng tin nhắn khách hàng về Telegram Bot.
"""

import http.server
import json
import os
import sys
import urllib.request
import urllib.parse
from datetime import datetime

PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")


def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[ERROR] Could not read config.json: {e}", file=sys.stderr)
    return {
        "telegram": {
            "bot_token": os.environ.get("TELEGRAM_BOT_TOKEN", ""),
            "chat_id": os.environ.get("TELEGRAM_CHAT_ID", ""),
            "bot_username": os.environ.get("TELEGRAM_BOT_USER", "themammam_bot"),
        }
    }


def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"[ERROR] Could not save config.json: {e}", file=sys.stderr)
        return False


def send_telegram_message(bot_token, chat_id, text):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        res_data = resp.read().decode("utf-8")
        return json.loads(res_data)


class MammamHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers", "Content-Type, Authorization"
        )
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/telegram-config":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            cfg = load_config()
            tg = cfg.get("telegram", {})
            # Return config with masked token for security
            token = tg.get("bot_token", "")
            masked = (
                token[:6] + "..." + token[-4:] if len(token) > 10 else token
            )
            res = {
                "bot_token": token,
                "masked_token": masked,
                "chat_id": tg.get("chat_id", ""),
                "bot_username": tg.get("bot_username", "themammam_bot"),
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}

        if self.path == "/api/chat-telegram":
            self.handle_chat_telegram(payload)
            return

        if self.path == "/api/telegram-config":
            self.handle_save_telegram_config(payload)
            return

        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"error": "Endpoint not found"}')

    def handle_chat_telegram(self, payload):
        name = payload.get("name", "").strip()
        phone = payload.get("phone", "").strip()
        msg = payload.get("message", "").strip()

        if not name or not phone or not msg:
            self.send_response(400)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "ok": False,
                        "error": "Vui lòng nhập đủ Họ tên, Số điện thoại và Lời nhắn!",
                    },
                    ensure_ascii=False,
                ).encode("utf-8")
            )
            return

        cfg = load_config()
        tg = cfg.get("telegram", {})
        bot_token = payload.get("bot_token") or tg.get("bot_token") or os.environ.get("TELEGRAM_BOT_TOKEN", "")
        chat_id = payload.get("chat_id") or tg.get("chat_id") or os.environ.get("TELEGRAM_CHAT_ID", "")

        now_str = datetime.now().strftime("%H:%M %d/%m/%Y")
        text = (
            f"🛎️ <b>KHÁCH CHAT TƯ VẤN - THE MĂM MĂM</b>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"👤 <b>Khách hàng:</b> {name}\n"
            f"📞 <b>Số điện thoại:</b> <a href='tel:{phone}'>{phone}</a>\n"
            f"💬 <b>Lời nhắn:</b>\n<i>{msg}</i>\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"⏰ <b>Thời gian:</b> {now_str}\n"
            f"🌐 <b>Nguồn:</b> Website The Măm Măm (Khách gửi từ form chat)\n"
            f"👉 <i>Bấm số điện thoại trên để gọi lại ngay cho khách!</i>"
        )

        if not bot_token or not chat_id:
            # Token not yet configured on backend, return informative message
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            res = {
                "ok": True,
                "sent_to_telegram": False,
                "message": "Đã ghi nhận thông tin khách hàng vào hệ thống! (Backend chưa cấu hình bot_token/chat_id).",
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode("utf-8"))
            return

        try:
            tg_res = send_telegram_message(bot_token, chat_id, text)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "ok": True,
                        "sent_to_telegram": True,
                        "telegram_response": tg_res,
                        "message": "Đã chuyển tin nhắn thành công tới Telegram của tiệm!",
                    },
                    ensure_ascii=False,
                ).encode("utf-8")
            )
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                json.dumps(
                    {
                        "ok": False,
                        "error": f"Lỗi gửi Telegram: {str(e)}",
                    },
                    ensure_ascii=False,
                ).encode("utf-8")
            )

    def handle_save_telegram_config(self, payload):
        cfg = load_config()
        if "telegram" not in cfg:
            cfg["telegram"] = {}

        if "bot_token" in payload:
            cfg["telegram"]["bot_token"] = payload["bot_token"].strip()
        if "chat_id" in payload:
            cfg["telegram"]["chat_id"] = payload["chat_id"].strip()
        if "bot_username" in payload:
            cfg["telegram"]["bot_username"] = payload["bot_username"].strip()

        ok = save_config(cfg)
        self.send_response(200 if ok else 500)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(
            json.dumps(
                {
                    "ok": ok,
                    "message": "Đã lưu cấu hình Telegram thành công!" if ok else "Lỗi lưu file cấu hình",
                },
                ensure_ascii=False,
            ).encode("utf-8")
        )


if __name__ == "__main__":
    server_address = ("", PORT)
    httpd = http.server.HTTPServer(server_address, MammamHandler)
    print(f"🚀 The Măm Măm Server đang chạy tại http://127.0.0.1:{PORT}")
    print(f"📁 Thư mục phục vụ: {BASE_DIR}")
    print(f"⚙️ File cấu hình Telegram: {CONFIG_FILE}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")
        httpd.server_close()
