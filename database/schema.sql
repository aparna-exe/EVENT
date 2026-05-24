-- EventPass Database Schema
-- Smart Event Discovery System

-- 1. USER: Core identity table
CREATE TABLE IF NOT EXISTS USER (
    User_ID  INTEGER PRIMARY KEY AUTOINCREMENT,
    Name     TEXT    NOT NULL,
    Email    TEXT    NOT NULL UNIQUE,
    Password TEXT    NOT NULL
);

-- 2. PARTICIPANT: Subtype of USER (ISA Relationship)
CREATE TABLE IF NOT EXISTS PARTICIPANT (
    User_ID INTEGER PRIMARY KEY,
    FOREIGN KEY (User_ID) REFERENCES USER (User_ID) ON DELETE CASCADE
);

-- 3. ORGANIZER: Subtype of USER (ISA Relationship)
CREATE TABLE IF NOT EXISTS ORGANIZER (
    User_ID      INTEGER PRIMARY KEY,
    Company_Name TEXT    NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES USER (User_ID) ON DELETE CASCADE
);

-- 4. EVENT: Events created by Organizers
CREATE TABLE IF NOT EXISTS EVENT (
    Event_ID     INTEGER PRIMARY KEY AUTOINCREMENT,
    Title        TEXT    NOT NULL,
    Date         TEXT    NOT NULL,
    Location     TEXT    NOT NULL,
    Capacity     INTEGER NOT NULL CHECK (Capacity > 0),
    Organizer_ID INTEGER NOT NULL,
    FOREIGN KEY (Organizer_ID) REFERENCES ORGANIZER (User_ID) ON DELETE CASCADE
);

-- 5. REGISTRATION: Junction table linking Participants to Events
-- UNIQUE constraint on (User_ID, Event_ID) prevents duplicate registrations
CREATE TABLE IF NOT EXISTS REGISTRATION (
    Reg_ID            INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID           INTEGER NOT NULL,
    Event_ID          INTEGER NOT NULL,
    Reg_Date          TEXT    NOT NULL DEFAULT (datetime('now')),
    Attendance_Status TEXT    NOT NULL DEFAULT 'Registered' 
                              CHECK (Attendance_Status IN ('Registered', 'Attended', 'Absent', 'Cancelled')),
    Scan_Time         TEXT,
    FOREIGN KEY (User_ID) REFERENCES PARTICIPANT (User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Event_ID) REFERENCES EVENT (Event_ID) ON DELETE CASCADE,
    UNIQUE (User_ID, Event_ID)
);

-- 6. QR_PASS: Links a User to their generated QR code path
CREATE TABLE IF NOT EXISTS QR_PASS (
    QR_ID   INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    QR_Path TEXT    NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES USER (User_ID) ON DELETE CASCADE
);
-- 1. Create a User
INSERT INTO USER (Name, Email, Password) 
VALUES ('Admin User', 'admin@eventpass.com', 'hashed_password_123');

-- 2. Make that User an Organizer (User_ID will be 1)
INSERT INTO ORGANIZER (User_ID, Company_Name) 
VALUES (1, 'Tech Academy');

-- 3. Now you can safely create the Event linked to Organizer 1
INSERT INTO EVENT (Title, Date, Location, Capacity, Organizer_ID) 
VALUES ('Python Workshop', '2026-06-01', 'Lab A', 50, 1);