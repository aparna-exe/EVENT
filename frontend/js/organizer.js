// frontend/js/organizer.js

document.addEventListener('DOMContentLoaded', async () => {
    // Guard: must be logged in as organizer
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Show organizer name
    const nameEl = document.getElementById('organizer-name');
    if (nameEl) nameEl.textContent = localStorage.getItem('username') || 'Organizer';

    await loadOrganizerEvents();

    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titleInput  = document.getElementById('eventName');
            const dateInput   = document.getElementById('eventDate');
            const locInput    = document.getElementById('eventLocation');
            const descInput   = document.getElementById('eventDesc');
            const capInput    = document.getElementById('eventCapacity');
            const submitBtn   = createEventForm.querySelector('button[type="submit"]');

            if (!titleInput.value || !dateInput.value || !locInput.value) {
                alert("Please fill in Event Name, Date and Location.");
                return;
            }

            submitBtn.textContent = 'Posting...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://127.0.0.1:5000/create_event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id:     parseInt(userId),
                        title:       titleInput.value,
                        date:        dateInput.value,
                        location:    locInput.value,
                        description: (descInput && descInput.value.trim()) ? descInput.value : 'Join us for this exciting event!',
                        capacity:    parseInt(capInput?.value) || 100
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Event posted successfully! 🎉");
                    createEventForm.reset();
                    await loadOrganizerEvents();
                } else {
                    alert(data.error || "Failed to create event.");
                }
            } catch (err) {
                console.error("Error posting event:", err);
                alert("Could not connect to server.");
            } finally {
                submitBtn.textContent = 'Post Event';
                submitBtn.disabled = false;
            }
        });
    }
});

async function loadOrganizerEvents() {
    const container = document.getElementById('myEventsList');
    const countEl   = document.getElementById('eventCount');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-10 text-slate-500 text-sm">
            <i class="fas fa-circle-notch fa-spin text-blue-500 text-xl mb-3 block"></i>
            Loading your events...
        </div>`;

    try {
        const response = await fetch('http://127.0.0.1:5000/get_events');
        const events = await response.json();

        if (countEl) countEl.textContent = events.length || 0;

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-slate-500 text-sm">
                    <i class="fas fa-calendar-plus text-3xl mb-3 block text-slate-700"></i>
                    No events yet. Create your first one!
                </div>`;
            return;
        }

        container.innerHTML = events.map(event => `
            <div onclick="viewOrganizerEvent(${event.id}, '${event.title.replace(/'/g,"\\'")}', '${event.location.replace(/'/g,"\\'")}', '${event.date}', ${event.capacity || 100})"
                 class="group bg-[#0d2147]/70 hover:bg-[#152e5d] border border-slate-700/40 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/20">
                <div class="overflow-hidden">
                    <h4 class="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors truncate">${event.title}</h4>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                        <span><i class="far fa-calendar mr-1 text-blue-500"></i>${event.date}</span>
                        <span class="truncate"><i class="fas fa-map-marker-alt mr-1 text-rose-400"></i>${event.location}</span>
                        <span><i class="fas fa-users mr-1 text-emerald-400"></i>${event.capacity || 100} cap</span>
                    </div>
                </div>
                <div class="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-blue-600 flex items-center justify-center transition-all ml-4 shrink-0">
                    <i class="fas fa-chevron-right text-xs text-slate-400 group-hover:text-white transition-colors"></i>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error loading events:", err);
        container.innerHTML = `<div class="text-center py-8 text-red-400 text-sm">Failed to load events.</div>`;
    }
}

function viewOrganizerEvent(id, title, location, date, capacity) {
    localStorage.setItem("event_id", id);
    localStorage.setItem("event_title", title);
    localStorage.setItem("event_location", location);
    localStorage.setItem("event_date", date);
    localStorage.setItem("event_capacity", capacity);
    window.location.href = "organizer_details.html";
}