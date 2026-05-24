from flask import Blueprint, request, jsonify, session
from extensions import db
from models import Event

event_bp = Blueprint('events', __name__)

@event_bp.route('/create_event', methods=['POST'])
def create_event():
    # Use get_json() to read the data sent by your fetch() call
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if session.get('role') != 'organizer':
        return jsonify({"error": "Unauthorized"}), 403

    new_event = Event(
        title=data.get('title'),
        date=data.get('date'),
        location=data.get('location'),
        capacity=data.get('capacity'),
        organizer_id=session.get('user_id')
    )

    db.session.add(new_event)
    db.session.commit()
    
    return jsonify({"message": "Event created successfully!", "event_id": new_event.event_id})

@event_bp.route('/get_events', methods=['GET'])
def get_events():
    events = Event.query.all()
    
    # This matches your requested API format: id, title, date, location, capacity
    event_list = []
    for event in events:
        event_list.append({
            "id": event.event_id,
            "title": event.title,
            "date": event.date,
            "location": event.location,
            "capacity": event.capacity
        })
    
    return jsonify(event_list)