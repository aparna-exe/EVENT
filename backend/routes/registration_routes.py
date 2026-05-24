from flask import Blueprint, request, jsonify, session
from extensions import db
from models import Registration
from datetime import datetime

reg_bp = Blueprint('registration', __name__)

@reg_bp.route('/register_event', methods=['POST'])
def register_event():
    # Switch to get_json() to catch the data from your frontend
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Fallback: Use the user_id from the JSON body if the session is empty
    user_id = data.get('user_id') or session.get('user_id')
    event_id = data.get('event_id')

    if not user_id:
        return jsonify({"error": "Please login first"}), 401

    # Check if already registered
    existing = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing:
        return jsonify({"message": "Already registered for this event"}), 400

    new_reg = Registration(
        user_id=user_id,
        event_id=event_id,
        reg_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        attendance_status="Absent"
    )

    db.session.add(new_reg)
    db.session.commit()
    
    return jsonify({"message": "Registration successful!"})