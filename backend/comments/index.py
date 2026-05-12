import json
import os
import psycopg2

SCHEMA = "t_p54894760_book_publishing_plat"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Комментарии: GET по chapter_id, POST добавить"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    if method == "GET":
        chapter_id = params.get("chapter_id")
        conn = get_conn()
        cur = conn.cursor()
        if chapter_id:
            cur.execute(
                f"SELECT id, chapter_id, author, text, created_at FROM {SCHEMA}.comments WHERE chapter_id=%s ORDER BY created_at",
                (chapter_id,)
            )
        else:
            cur.execute(
                f"SELECT id, chapter_id, author, text, created_at FROM {SCHEMA}.comments ORDER BY created_at"
            )
        rows = cur.fetchall()
        cols = ["id", "chapter_id", "author", "text", "created_at"]
        comments = []
        for row in rows:
            d = dict(zip(cols, row))
            d["created_at"] = d["created_at"].strftime("%d.%m.%Y %H:%M") if d["created_at"] else ""
            comments.append(d)
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"comments": comments})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.comments (chapter_id, author, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (body.get("chapter_id"), body.get("author", ""), body.get("text", ""))
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "id": row[0],
            "created_at": row[1].strftime("%d.%m.%Y %H:%M"),
            "ok": True
        })}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
