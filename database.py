import sqlite3
import json
import time
from contextlib import contextmanager

DB_NAME = "cinematch.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Watchlist table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS watchlist (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                rating REAL,
                release_date TEXT,
                genres TEXT,
                added_at REAL
            )
        """)
        
        # Cache table for TMDB responses
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tmdb_cache (
                cache_key TEXT PRIMARY KEY,
                response_json TEXT NOT NULL,
                cached_at REAL NOT NULL
            )
        """)
        conn.commit()
    print("SQLite database initialized successfully.")

# Watchlist helpers
def get_watchlist():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, rating, release_date, genres FROM watchlist ORDER BY added_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def add_to_watchlist(movie_id, title, rating=0.0, release_date="", genres=""):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO watchlist (id, title, rating, release_date, genres, added_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (movie_id, title, rating, release_date, genres, time.time())
        )
        conn.commit()

def remove_from_watchlist(movie_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM watchlist WHERE id = ?", (movie_id,))
        conn.commit()

# TMDB Cache helpers
def get_cached_response(key, ttl=86400):
    """Retrieves cached response from SQLite database if still within TTL (default: 24h)"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT response_json, cached_at FROM tmdb_cache WHERE cache_key = ?", (key,))
        row = cursor.fetchone()
        if row:
            response_json, cached_at = row
            if time.time() - cached_at < ttl:
                try:
                    return json.loads(response_json)
                except Exception:
                    pass
        return None

def set_cached_response(key, data):
    """Caches response data inside SQLite database"""
    with get_db() as conn:
        cursor = conn.cursor()
        try:
            response_json = json.dumps(data)
            cursor.execute(
                """
                INSERT OR REPLACE INTO tmdb_cache (cache_key, response_json, cached_at)
                VALUES (?, ?, ?)
                """,
                (key, response_json, time.time())
            )
            conn.commit()
        except Exception as e:
            print(f"Error caching response for key {key}: {e}")

if __name__ == "__main__":
    init_db()
