import sqlite3
import os

# Path to the database file
DB_PATH = os.path.join(os.path.dirname(__file__), "eventpass.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def initialize_db():
    """Initializes the eventpass.db database using schema.sql."""
    print(f"[INFO] Initializing database at: {DB_PATH}")
    
    # Connect to the database (creates it if it doesn't exist)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Read and execute the schema.sql file
    try:
        with open(SCHEMA_PATH, 'r') as f:
            schema_sql = f.read()
            cursor.executescript(schema_sql)
        
        conn.commit()
        print("[SUCCESS] Database initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to initialize database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    initialize_db()
