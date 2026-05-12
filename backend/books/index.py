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
    """CRUD для книг: GET список, POST создать, PUT обновить, DELETE удалить"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET /books
    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, title, subtitle, year, cover_url, description, status, sort_order FROM {SCHEMA}.books ORDER BY sort_order, id"
        )
        rows = cur.fetchall()
        cols = ["id", "title", "subtitle", "year", "cover_url", "description", "status", "sort_order"]
        books = [dict(zip(cols, row)) for row in rows]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"books": books})}

    body = json.loads(event.get("body") or "{}")

    # POST /books — создать
    if method == "POST":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.books (title, subtitle, year, cover_url, description, status, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (body.get("title", ""), body.get("subtitle", ""), body.get("year", ""),
             body.get("cover_url", ""), body.get("description", ""),
             body.get("status", "Новинка"), body.get("sort_order", 0))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id, "ok": True})}

    # PUT /books — обновить
    if method == "PUT":
        book_id = body.get("id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.books SET title=%s, subtitle=%s, year=%s, cover_url=%s,
                description=%s, status=%s, sort_order=%s WHERE id=%s""",
            (body.get("title", ""), body.get("subtitle", ""), body.get("year", ""),
             body.get("cover_url", ""), body.get("description", ""),
             body.get("status", "Новинка"), body.get("sort_order", 0), book_id)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # DELETE /books?id=...
    if method == "DELETE":
        book_id = params.get("id")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.chapters WHERE book_id=%s", (book_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.books WHERE id=%s", (book_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
