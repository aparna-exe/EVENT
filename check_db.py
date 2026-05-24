import sys
import os
# Add the backend folder to the system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import app, db
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables found in DB: {tables}")
    
    for table in tables:
        print(f"\nColumns in table '{table}':")
        columns = inspector.get_columns(table)
        for column in columns:
            print(f" - {column['name']} ({column['type']})")