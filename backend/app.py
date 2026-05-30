import os
import sys
import importlib.util
import re  # 🌟 Added for clean regex validation matches
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from flask_cors import CORS 
from dotenv import load_dotenv

# --- 1. Extensions and Models ---
from extensions import db
from models import User, Event, Registration

# --- 2. Dynamic QR Module Loading ---
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
qr_path = os.path.join(project_root, "qr_module", "generate_qr.py")

try:
    spec = importlib.util.spec_from_file_location("generate_qr", qr_path)
    qr_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(qr_module)
    generate_registration_qr = qr_module.generate_registration_qr
    print("[SUCCESS] QR Module loaded via direct path!")
except Exception as e:
    print(f"[ERROR] QR Module failed: {e}")
    def generate_registration_qr(u_id, e_id):
        print(f"Fallback: QR generation triggered for User {u_id}, Event {e_id}")

# --- 3. App Initialization & Config ---
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app) 

app.secret_key = os.getenv('FLASK_SECRET', 'my_temporary_secret_key_123')
basedir = os.path.abspath(os.path.dirname(__file__))                                                                     
db_path = os.path.join(basedir, "..", "database", "eventpass.db")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app) 

with app.app_context():
    db.create_all()

# --- 4. STATIC FILE SERVING ---

@app.route('/')
def index():
    return send_from_directory('../frontend', 'login.html')

@app.route('/qr_module/qr_images/<path:filename>')
def serve_qr_images(filename):
    qr_folder_path = os.path.join(project_root, 'qr_module', 'qr_images')
    return send_from_directory(qr_folder_path, filename)

@app.route('/signup.html')
def serve_signup_page():
    return send_from_directory('../frontend', 'signup.html')

@app.route('/organizer_details.html')
def serve_organizer_details():
    return send_from_directory('../frontend', 'organizer_details.html')

@app.route('/<path:path>')
def serve_frontend(path):
    return send_from_directory('../frontend', path)

# --- 5. AUTHENTICATION ROUTES ---

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
        
    username = data.get('Name')   
    email = data.get('Email')      
    password = data.get('Password') 
    role = data.get('Role', 'participant').lower() 

    if not all([username, email, password]):
        return jsonify({"message": "Missing required fields"}), 400

    # 🌟 NEW: Validate Email Structure (Requires @ and valid extension)
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format. Account creation rejected."}), 400

    # 🌟 NEW: Enforce Strong Passwords (Min 8 characters, 1 letter, 1 number)
    if len(password) < 8 or not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
        return jsonify({"message": "Password weak! Must be at least 8 characters long and contain both letters and numbers."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    try:
        new_user = User(name=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        if role == 'organizer':
            db.session.execute(
                db.text("INSERT INTO ORGANIZER (User_ID, Company_Name) VALUES (:uid, :company)"),
                {"uid": new_user.user_id, "company": "Independent Organizer"}
            )
            db.session.commit()
        
        return jsonify({"message": "Signup successful!"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Signup Database Error: {e}") 
        return jsonify({"message": "Database error occurred"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('Email')      
    password = data.get('Password') 
    selected_role = data.get('Role', 'participant').lower() 

    print(f"Login attempt for: {email} as explicit role: {selected_role}")

    user = User.query.filter_by(email=email, password=password).first()
    
    if user:
        actual_db_role = 'participant'
        try:
            is_organizer = db.session.execute(
                db.text("SELECT 1 FROM ORGANIZER WHERE User_ID = :uid"),
                {"uid": user.user_id}
            ).fetchone()
            if is_organizer:
                actual_db_role = 'organizer'
        except Exception as e:
            print(f"Database relational error check failed: {e}")
            actual_db_role = 'participant'

        # Auto-route: if role mismatch, just use the actual DB role (don't reject)
        session.clear()
        session['user_id'] = user.user_id
        session['username'] = user.name
        session['role'] = actual_db_role

        return jsonify({
            "message": "Login successful",
            "username": user.name,
            "User_ID": user.user_id, 
            "Role": actual_db_role            
        }), 200
    
    return jsonify({"message": "Invalid Email or Password."}), 401

@app.route('/dashboard_view')
def dashboard_view():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    template = 'organizer.html' if session.get('role') == 'organizer' else 'dashboard.html'
    return render_template(template, name=session.get('username'))

# --- 6. EVENT & REGISTRATION ROUTES ---

@app.route('/get_events', methods=['GET'])
def get_events():
    try:
        events = Event.query.all()
        event_list = []
        for event in events:
            event_list.append({
                "id": event.event_id,
                "title": event.title,
                "date": event.date,
                "location": event.location,
                "capacity": event.capacity or 100
            })
        return jsonify(event_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_event', methods=['POST'])
def create_event():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input parameters found"}), 400

    organizer_id = data.get('user_id') or session.get('user_id')
    if not organizer_id:
        return jsonify({"error": "Unauthorized. Please log in again."}), 401

    title = data.get('title')
    date = data.get('date')
    location = data.get('location')
    
    # Capture custom text data sent from the event creation form textarea element
    description = data.get('description', 'Join us for this exciting event!')

    if not all([title, date, location]):
        return jsonify({"error": "Missing required title, date, or location values"}), 400

    # 🌟 NEW: Server-Side Date Validation Check (Blocks past dates)
    try:
        # HTML date input sends format as 'YYYY-MM-DD'
        input_date = datetime.strptime(date, '%Y-%m-%d').date()
        today_date = datetime.now().date()
        if input_date < today_date:
            return jsonify({"error": "Event creation failed. You cannot select a past date."}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format submitted."}), 400

    # Extract capacity safely as an integer value
    try:
        capacity = int(data.get('capacity', 100))
    except (ValueError, TypeError):
        return jsonify({"error": "Capacity must be a numeric whole number."}), 400

    # Validate Minimum Capacity Boundary Constraint (Must be at least 10)
    if capacity < 10:
        return jsonify({"error": "Event capacity setup failed. The minimum allowed capacity threshold is 10."}), 400

    try:
        new_event = Event(
            title=title,
            date=date,
            location=location,
            capacity=capacity,
            description=description,  
            organizer_id=organizer_id  
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify({"message": "Event generated successfully!", "event_id": new_event.event_id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Database insertion crash error: {e}")
        return jsonify({"error": "Failed to sync event creation: " + str(e)}), 500

@app.route('/get_user_registrations/<int:user_id>', methods=['GET'])
def get_user_registrations(user_id):
    try:
        registrations = db.session.query(Registration, Event).join(
            Event, Registration.event_id == Event.event_id
        ).filter(Registration.user_id == user_id).all()
        
        history_list = []
        for reg, event in registrations:
            history_list.append({
                "id": event.event_id,
                "title": event.title,
                "date": event.date,
                "location": event.location,
                "status": reg.attendance_status
            })
        return jsonify(history_list), 200
    except Exception as e:
        print(f"Error fetching registrations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_event_attendees/<int:event_id>', methods=['GET'])
def get_event_attendees(event_id):
    try:
        roster = db.session.query(Registration, User).join(
            User, Registration.user_id == User.user_id
        ).filter(Registration.event_id == event_id).all()
        
        attendee_list = []
        for reg, user in roster:
            attendee_list.append({
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "reg_date": reg.reg_date,
                "status": reg.attendance_status
            })
        return jsonify(attendee_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to look up roster entries: " + str(e)}), 500

@app.route('/qr')
def serve_qr_page():
    return send_from_directory('../frontend', 'qr.html')

@app.route('/register_event', methods=['POST'])
def register_event():
    data = request.get_json()
    
    try:
        user_id = int(data.get('user_id'))
        event_id = int(data.get('event_id'))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid or missing user_id or event_id"}), 400

    existing_reg = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing_reg:
        return jsonify({"message": "You are already registered for this event!", "user_id": user_id, "event_id": event_id}), 200

    try:
        new_reg = Registration(
            user_id=user_id,
            event_id=event_id,
            reg_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            attendance_status="Registered"
        )
        db.session.add(new_reg)
        db.session.commit()
        
        generate_registration_qr(user_id, event_id)
        
        return jsonify({
            "message": "Registration successful!",
            "user_id": user_id,
            "event_id": event_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to complete registration: " + str(e)}), 500

# --- 7. EXPORT DATA ROUTE ---

import csv
from io import StringIO
from flask import make_response

@app.route('/export_attendance/<int:event_id>', methods=['GET'])
def export_attendance(event_id):
    try:
        roster = db.session.query(Registration, User).join(
            User, Registration.user_id == User.user_id
        ).filter(Registration.event_id == event_id).all()
        
        si = StringIO()
        cw = csv.writer(si)
        
        cw.writerow(['User ID', 'Name', 'Email', 'Registration Date', 'Attendance Status'])
        
        for reg, user in roster:
            cw.writerow([
                user.user_id,
                user.name,
                user.email,
                reg.reg_date,
                reg.attendance_status
            ])
        
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = f"attachment; filename=attendance_event_{event_id}.csv"
        output.headers["Content-Type"] = "text/csv"
        
        return output
        
    except Exception as e:
        print(f"Export Error: {e}")
        return jsonify({"error": "Failed to generate CSV export stream"}), 500

# --- 8. LIVE QR CHECK-IN ATTENDANCE ROUTE ---

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Payload dictionary completely empty"}), 400

    user_id = data.get('user_id')
    event_id = data.get('event_id')

    if not user_id or not event_id:
        return jsonify({"error": "Missing verified tracking foreign keys"}), 400

    try:
        record = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
        
        if not record:
            return jsonify({"error": "No matching user registration instance found for this event"}), 404
        
        record.attendance_status = "Attended"
        db.session.commit()
        
        return jsonify({"message": "Attendance checked and synchronized successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"SQL update execution fault: {e}")
        return jsonify({"error": "Database error processing registration change"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)