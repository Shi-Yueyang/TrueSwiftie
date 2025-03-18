import sqlite3

def create_db_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Exception as e:
        print(e)
    return conn

def create_table(conn):
    try:
        sql = """
        CREATE TABLE IF NOT EXISTS images (
            id integer PRIMARY KEY,
            topic text NOT NULL,
            image_hash text NOT NULL,
            image_path text NOT NULL,
            url text NOT NULL,
            UNIQUE (image_hash, topic)
        );
        """
        cur = conn.cursor()
        cur.execute(sql)
    except Exception as e:
        print(e)