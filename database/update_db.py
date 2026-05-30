import sqlite3
import os

# Let's find your database file dynamically
db_paths = ['database/eventpass.db', '../database/eventpass.db', 'eventpass.db']
db_file = None

for path in db_paths:
    if os.path.exists(path):
        db_file = path
        break

if db_file:
    try:
        conn = sqlite3.connect(db_file)
        conn.execute("ALTER TABLE EVENT ADD COLUMN Description TEXT DEFAULT 'Join us for this exciting event!'")
        conn.commit()
        conn.close()
        print(f"--- SUCCESS: Column added to {db_file}! Old data is perfectly safe! ---")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("--- The Description column already exists! You are good to go! ---")
        else:
            print(f"Error: {e}")
else:
    print("Could not find eventpass.db. Please make sure you run this script from the correct folder!")