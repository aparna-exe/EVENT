document.addEventListener("DOMContentLoaded", function() {
    // 1. Pull data from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const eventId = urlParams.get('event_id');
    
    // 2. Get username (ensure this matches the key used in auth.js)
    const username = localStorage.getItem("username") || "Participant";

    const qrImgElement = document.getElementById("qrImage");
    const nameDisplay = document.getElementById("displayUsername");
    const idDisplay = document.getElementById("displayUserId");

    // 3. Update the UI text
    if (nameDisplay) nameDisplay.innerText = username;
    if (idDisplay) idDisplay.innerText = `User ID: ${userId} | Event ID: ${eventId}`;

    // 4. Load the image (which is already working!)
    if (userId && eventId && qrImgElement) {
        qrImgElement.src = `/qr_module/qr_images/qr_${userId}_${eventId}.png`;
    }
});