// frontend/js/organizer_details.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Recover event properties out of active storage state
    const eventId = localStorage.getItem('event_id');
    const title = localStorage.getItem('event_title') || "Event Overview Center";
    const date = localStorage.getItem('event_date') || "Date TBD";
    const location = localStorage.getItem('event_location') || "Main Campus Hall";
    const maxCapacity = parseInt(localStorage.getItem('event_capacity')) || 100;

    // Bind parameters safely to view cards
    if(document.getElementById('metaTitle')) document.getElementById('metaTitle').innerText = title;
    if(document.getElementById('metaDate')) document.getElementById('metaDate').innerText = date;
    if(document.getElementById('metaLocation')) document.getElementById('metaLocation').innerText = location;
    if(document.getElementById('capacityMax')) document.getElementById('capacityMax').innerText = `/ ${maxCapacity} max`;

    if (!eventId) {
        alert("Session parameters broken. Returning to dashboard.");
        window.location.href = 'organizer.html';
        return;
    }

    const rosterContainer = document.getElementById('rosterContainer');

    // 2. Fetch all registered users for this specific event from the backend
    try {
        const response = await fetch(`http://127.0.0.1:5000/get_event_attendees/${eventId}`);
        if (!response.ok) throw new Error("Backend server returned an error status.");

        const attendees = await response.json();

        // Calculate and update capacity details
        const currentCount = attendees.length;
        if(document.getElementById('registeredCount')) document.getElementById('registeredCount').innerText = currentCount;
        
        const occupancyPercentage = Math.min((currentCount / maxCapacity) * 100, 100);
        const progressBar = document.getElementById('capacityProgressBar');
        if(progressBar) progressBar.style.width = `${occupancyPercentage}%`;

        // Render roster rows dynamically
        if (!attendees || attendees.length === 0) {
            rosterContainer.innerHTML = `
                <div class="text-center py-10 bg-[#122A57]/30 rounded-2xl border border-slate-700/10">
                    <p class="text-slate-400 text-sm italic">No users have registered for this event yet.</p>
                </div>`;
            return;
        }

        rosterContainer.innerHTML = attendees.map(person => `
            <div class="flex items-center justify-between p-4 bg-[#122A57]/40 border border-slate-700/20 rounded-2xl shadow-sm hover:border-slate-700/40 transition-all">
                <div class="pr-3 truncate">
                    <h4 class="font-bold text-sm text-slate-100">${person.name}</h4>
                    <p class="text-xs text-slate-400 mt-0.5 truncate">${person.email}</p>
                    <p class="text-[9px] text-slate-500 font-medium mt-1 uppercase tracking-wider">
                        <i class="far fa-clock mr-1"></i> Registered on: ${person.reg_date}
                    </p>
                </div>
                <span class="px-3 py-1 ${person.status.toLowerCase() === 'attended' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/10 text-blue-400'} rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    ${person.status}
                </span>
            </div>
        `).join('');

    } catch (err) {
        console.error("Roster generation error:", err);
        rosterContainer.innerHTML = `
            <div class="text-center py-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
                <i class="fas fa-exclamation-triangle mr-1"></i> Failed to query active attendee logs.
            </div>`;
    }
});

// ── LIVE CAMERA SCANNER CONTROLS ──
let html5QrcodeScanner = null;

function toggleScanner() {
    const scannerBox = document.getElementById('scannerContainer');
    if (!scannerBox) return;
    
    if (scannerBox.classList.contains('hidden')) {
        scannerBox.classList.remove('hidden');
        startQRScanner();
    } else {
        scannerBox.classList.add('hidden');
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(err => console.error("Scanner clear error:", err));
            html5QrcodeScanner = null;
        }
    }
}

function startQRScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { 
        fps: 15, 
        qrbox: { width: 220, height: 220 } 
    }, false);
    
    html5QrcodeScanner.render(onScanSuccess, onScanError);
}

async function onScanSuccess(decodedText) {
    // Stop scanning and turn off camera immediately upon intercept
    if (html5QrcodeScanner) {
        await html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
    document.getElementById('scannerContainer').classList.add('hidden');

    let scannedUserId = null;
    const currentEventId = localStorage.getItem('event_id');

    // Robust Parsing: Handles raw comma separation ("user_id,event_id") or standard JSON object strings
    try {
        if (decodedText.trim().startsWith('{')) {
            const parsedJson = JSON.parse(decodedText);
            scannedUserId = parsedJson.user_id || parsedJson.User_ID;
        } else {
            const parts = decodedText.split(',');
            scannedUserId = parts[0];
        }
    } catch (parseError) {
        console.error("QR Code parsing breakdown:", parseError);
        alert("Invalid format detected inside this QR Code format.");
        return;
    }

    if (!scannedUserId) {
        alert("Could not pull a valid User ID value from the scan data.");
        return;
    }

    try {
        // Dispatch clean fetch POST body sequence to your active backend routing rule
        const response = await fetch('http://127.0.0.1:5000/mark_attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: parseInt(scannedUserId),
                event_id: parseInt(currentEventId)
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Attendance status synchronized! Success! 🎉`);
            window.location.reload(); // Instantly refreshes list row colors to match state changes!
        } else {
            alert(result.error || "Verification step dropped by backend.");
        }
    } catch (err) {
        console.error("Networking connection loop failed:", err);
        alert("Could not update attendance. Check server connection.");
    }
}

function onScanError(err) {
    // Silent fail to avoid flooding console tracking logs during video frames
}

// ── NEW DATA EXPORT LOGIC (Pasted at the bottom) ──
async function exportAttendanceList() {
    const eventId = localStorage.getItem('event_id');
    const eventTitle = localStorage.getItem('event_title') || 'event_roster';
    
    if (!eventId) {
        alert("Cannot export: Missing active event session data.");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/get_event_attendees/${eventId}`);
        if (!response.ok) throw new Error("Could not pull roster from backend server.");

        const attendees = await response.json();

        if (!attendees || attendees.length === 0) {
            alert("Roster is currently empty. There is nothing to export yet!");
            return;
        }

        // Generate CSV string
        let csvContent = "Attendee Name,Email Address,Registration Date,Attendance Status\n";

        attendees.forEach(person => {
            const name = `"${(person.name || '').replace(/"/g, '""')}"`;
            const email = `"${(person.email || '').replace(/"/g, '""')}"`;
            const regDate = `"${(person.reg_date || '').replace(/"/g, '""')}"`;
            const status = `"${(person.status || 'Registered').replace(/"/g, '""')}"`;

            csvContent += `${name},${email},${regDate},${status}\n`;
        });

        // Trigger browser download mechanism
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        
        const cleanTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
        downloadLink.setAttribute("download", `attendance_${cleanTitle}.csv`);
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("CSV Export Failure Tracking:", err);
        alert("Failed to export attendee roster list.");
    }
}

// Explicitly bind functions to the window object so inline HTML onclicks can find them instantly
window.toggleScanner = toggleScanner;
window.exportAttendanceList = exportAttendanceList;