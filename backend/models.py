from extensions import db

class User(db.Model):
    __tablename__ = 'USER'
    user_id = db.Column('User_ID', db.Integer, primary_key=True)
    name = db.Column('Name', db.String(100), nullable=False)
    email = db.Column('Email', db.String(120), unique=True, nullable=False)
    password = db.Column('Password', db.String(120), nullable=False)

class Event(db.Model):
    __tablename__ = 'EVENT'
    event_id = db.Column('Event_ID', db.Integer, primary_key=True)
    title = db.Column('Title', db.String(150), nullable=False)
    date = db.Column('Date', db.String(50), nullable=False)
    location = db.Column('Location', db.String(150), nullable=False)
    capacity = db.Column('Capacity', db.Integer)
    organizer_id = db.Column('Organizer_ID', db.Integer, db.ForeignKey('USER.User_ID'))

class Registration(db.Model):
    __tablename__ = 'REGISTRATION'
    reg_id = db.Column('Reg_ID', db.Integer, primary_key=True)
    user_id = db.Column('User_ID', db.Integer, db.ForeignKey('USER.User_ID'))
    event_id = db.Column('Event_ID', db.Integer, db.ForeignKey('EVENT.Event_ID'))
    reg_date = db.Column('Reg_Date', db.String(50))
    attendance_status = db.Column('Attendance_Status', db.String(20), default='Absent')
    scan_time = db.Column('Scan_Time', db.String(50))