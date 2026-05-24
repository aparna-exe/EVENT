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