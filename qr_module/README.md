# 🎫 QR Module: Secure Access & Attendance

This module handles the end-to-end workflow for digital ticketing and automated attendance tracking using encrypted QR codes.

---

## 🛠️ Components

### **1. QR Generation (`generate_qr.py`)**
This script is triggered during the **Signup/Registration** phase. 
*   **Logic**: It encodes a unique string formatted as `EP-REG-{User_ID}-{Event_ID}`.
*   **Storage**: Generated images are saved automatically in the `qr_images/` directory.
*   **Security**: Each QR is unique to a specific user-event pair, preventing ticket sharing.

### **2. QR Scanner & Attendance Link (`scan_qr.py`)**
This script acts as the "Bridge" between the physical event and the database.
*   **Workflow**: 
    1. Scans/Decodes the QR image using **OpenCV**.
    2. Extracts the `User_ID` and `Event_ID`.
    3. Connects to `database/eventpass.db`.
    4. Updates the `Attendance_Status` in the `REGISTRATION` table to **'Attended'**.

---

## 📁 Directory Structure
```text
qr_module/
├── qr_images/      # Directory where all ticket images are stored
├── generate_qr.py  # Script to create new tickets
└── scan_qr.py      # Script to verify and mark attendance