// frontend/js/register.js

async function handleRegistration() {
    const userId = localStorage.getItem('user_id');
    // Ensure the key matches what you saved when clicking 'Get Details'
    const selectedEvent = JSON.parse(localStorage.getItem('selectedEvent'));

    if (!userId || !selectedEvent) {
        alert("Please log in to register.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/register_event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                event_id: selectedEvent.id // Ensure your backend expects 'event_id'
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registered! Your QR Pass is being generated.");
            window.location.href = 'qr.html';
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server connection failed.");
    }
}

// frontend/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate the UI with selected details from local storage
    const titleElement = document.getElementById("eventTitle");
    const dateElement = document.getElementById("eventDate");
    const locationElement = document.getElementById("eventLocation");

    if (titleElement) titleElement.innerText = localStorage.getItem("event_title") || "Event Details";
    if (dateElement) dateElement.innerText = localStorage.getItem("event_date") || "TBD";
    if (locationElement) locationElement.innerText = localStorage.getItem("event_location") || "Main Campus Hall";

    // 2. Handle Registration Confirmation Click
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const userId = localStorage.getItem('user_id');
            const eventId = localStorage.getItem('event_id');

            // Debug verification check
            console.log("Attempting registration with User:", userId, "and Event:", eventId);

            if (!userId || userId === "undefined") {
                alert("Please log in to register.");
                window.location.href = 'login.html';
                return;
            }

            if (!eventId) {
                alert("No event selected. Returning to dashboard.");
                window.location.href = 'dashboard.html';
                return;
            }

            try {
                // Pointing to your local Flask backend connection route
                const response = await fetch('http://127.0.0.1:5000/register_event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: parseInt(userId),
                        event_id: parseInt(eventId)
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Check if the backend returned a 200 "Already registered" status code successfully
                    if (data.message && data.message.includes("already registered")) {
                        alert(data.message);
                    } else {
                        alert("Registration successful! Redirecting to your dashboard...");
                    }
                    // 🏠 Safely route back to the main dashboard page
                    window.location.href = 'dashboard.html'; 
                } else {
                    // Handle explicit 400/500 database integrity messages elegantly
                    if (data.error && data.error.includes("UNIQUE constraint failed")) {
                        alert("You are already registered for this event!");
                        window.location.href = 'dashboard.html';
                    } else {
                        alert("Error: " + (data.error || data.message || "Could not complete registration."));
                    }
                }
            } catch (error) {
                console.error("Registration error:", error);
                alert("Could not connect to backend server.");
            }
        });
    }
});