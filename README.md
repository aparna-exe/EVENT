# EventPass
EventPass is a mobile-first web app streamlining event management. Organizers can create events and scan QR codes for real-time attendance tracking. Participants can browse, register, and receive unique entry codes. Built with a responsive design and secure role-based access, it simplifies the entire lifecycle of event organization.

## 🛠️ Backend Setup (Megha)
I've refactored the app to fix circular imports and sync with the database schema.

### 1. Environment Variables
Create a `.env` file in the root directory and add:
`FLASK_SECRET=your_generated_hex_key`

### 2. Project Structure
- `backend/app.py`: Main entry point (Run this!)
- `backend/models.py`: Database tables (User, Event, Registration)
- `backend/extensions.py`: Shared SQLAlchemy instance
- `backend/routes/`: Blueprint-based routes

### 3. How to Run
From the root folder:
`python backend/app.py`

## 🔐 Database & QR Module (Aparna)
I have implemented the core relational database architecture and the secure QR-based attendance tracking system.

### 1. Data Architecture & Security Logic
- **ISA Relationship**: Designed a specialized schema using an inheritance model to differentiate between `PARTICIPANT` and `ORGANIZER` roles.
- **Integrity Control**: Enforced data consistency using `FOREIGN KEY` constraints and `ON DELETE CASCADE` triggers.
- **Attendance Workflow**: Developed a system where unique registration IDs are encrypted into QR codes and synced with the database upon scanning.

### 2. Project Structure

**Database Module**
- `database/schema.sql`: The SQL blueprint for all 6 tables and relational constraints.
- `database/db_setup.py`: Automation script to initialize the SQLite database file.

**QR Module**
- `qr_module/generate_qr.py`: Logic for creating and saving unique registration codes to `qr_images/`.
- `qr_module/scan_qr.py`: Attendance module using OpenCV to decode tickets and update database status.

### 3. How to Run
From the root folder, initialize the database:
`python database/db_setup.py`

Install dependencies for the QR module:
`pip install qrcode[pil] opencv-python`

⚙️ Systems Integration & API Architecture (KHADIJA SHIZA)
I have engineered the backend-to-frontend bridge and resolved critical system-level bottlenecks to ensure the application components function as a single, cohesive unit.

1. Integration Logic & Debugging
Module Resolution: Engineered a robust path-loading strategy using importlib and sys.path to resolve critical ModuleNotFoundError issues across sibling directories.

API Orchestration: Developed the core Flask routes and request handling logic to synchronize JavaScript frontend modules with the SQLite database.

Package Standardization: Stabilized the project environment by implementing proper Python package markers (__init__.py) and correcting file extension mismatches for consistent deployment.

2. Project Structure
API & Routing

backend/routes/auth.py: Managed user sessions and role-based login logic.

backend/routes/events.py: Handles event discovery and dashboard data retrieval.

System Configuration

requirements.txt: Curated the full list of project dependencies for environment replication.

.gitignore: Configured to protect sensitive .env files and avoid tracking __pycache__ or binary database files.

3. How to Run
Ensure the parent directory is recognized for module imports by running:
$env:PYTHONPATH = ".."; python backend/app.py