# 🗄️ EventPass Database Module

This folder contains the core relational database logic for the **EventPass** system. It uses **SQLite** for lightweight, persistent data management and follows a structured schema with proper entity relationships.

---

## 🏛️ Schema Architecture

### **1. ISA Relationship (Specialization)**
The system utilizes a class-based inheritance model for users:
*   **USER**: The base entity containing core credentials (Email, Password, Name).
*   **PARTICIPANT**: A subtype of User for event attendees.
*   **ORGANIZER**: A subtype of User for event creators, including `Company_Name`.

### **2. Core Relationships**
*   **Event Management**: Organizers have a `1:N` relationship with Events.
*   **Registration**: A junction table linking `PARTICIPANT` and `EVENT` to handle many-to-many registrations.
*   **Constraints**: 
    *   `UNIQUE (User_ID, Event_ID)` prevents duplicate ticket claims.
    *   `FOREIGN KEY` constraints with `ON DELETE CASCADE` ensure data integrity.

---

## 📁 Files
| File | Purpose |
| :--- | :--- |
| `schema.sql` | The raw SQL blueprint for all tables. |
| `db_setup.py` | A Python automation script that initializes the `.db` file using the schema. |
| `eventpass.db` | The actual SQLite database file (generated after setup). |

---

## 🚀 Setup Instructions

To initialize or reset the database, run the following command from the project root:

```bash
python database/db_setup.py