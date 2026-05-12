import json
import os
import psycopg2

SCHEMA = "t_p54894760_book_publishing_plat"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """CRUD для глав: GET по book_id, POST создать, PUT обновить, DELETE удалить"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET /chapters?book_id=...
    if method == "GET":
        book_id = params.get("book_id")
        conn = get_conn()
        cur = conn.cursor()
        if book_id:
            cur.execute(
                f"""SELECT id, book_id, number, title, teaser, content, read_time, sort_order
                    FROM {SCHEMA}.chapters WHERE book_id=%s ORDER BY sort_order, id""",
                (book_id,)
            )
        else:
            cur.execute(
                f"""SELECT id, book_id, number, title, teaser, content, read_time, sort_order
                    FROM {SCHEMA}.chapters ORDER BY book_id, sort_order, id"""
            )
        rows = cur.fetchall()
        cols = ["id", "book_id", "number", "title", "teaser", "content", "read_time", "sort_order"]
        chapters = [dict(zip(cols, row)) for row in rows]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"chapters": chapters})}

    body = json.loads(event.get("body") or "{}")

    # POST /chapters — создать
    if method == "POST":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.chapters (book_id, number, title, teaser, content, read_time, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (body.get("book_id"), body.get("number", ""), body.get("title", ""),
             body.get("teaser", ""), body.get("content", ""),
             body.get("read_time", ""), body.get("sort_order", 0))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id, "ok": True})}

    # PUT /chapters — обновить
    if method == "PUT":
        chapter_id = body.get("id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.chapters SET number=%s, title=%s, teaser=%s, content=%s,
                read_time=%s, sort_order=%s WHERE id=%s""",
            (body.get("number", ""), body.get("title", ""), body.get("teaser", ""),
             body.get("content", ""), body.get("read_time", ""),
             body.get("sort_order", 0), chapter_id)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # DELETE /chapters?id=...
    if method == "DELETE":
        chapter_id = params.get("id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.comments WHERE chapter_id=%s", (chapter_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.chapters WHERE id=%s", (chapter_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
