document.getElementById('submitManual').addEventListener('click', async () => {
    const userId = document.getElementById('manualId').value;
    const statusBox = document.getElementById('status-box');
    
    if (!userId) return;

    try {
        // Logic: Send the ID to your Flask backend to verify registration
        const response = await fetch(`http://127.0.0.1:5000/verify_entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, event_id: localStorage.getItem('event_id') })
        });

        const data = await response.json();

        statusBox.style.display = 'block';
        if (response.ok) {
            statusBox.className = 'status-success';
            statusBox.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Access Granted: ${data.username || 'User'}`;
            document.getElementById('manualId').value = ""; // Clear input on success
        } else {
            statusBox.className = 'status-error';
            statusBox.innerHTML = `<i class="fas fa-times-circle mr-2"></i> Access Denied: ${data.message || 'Invalid ID'}`;
        }
    } catch (error) {
        statusBox.style.display = 'block';
        statusBox.className = 'status-error';
        statusBox.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> Connection Error`;
    }

    // Auto-hide status after 3 seconds
    setTimeout(() => { statusBox.style.display = 'none'; }, 3000);
});

document.getElementById('startScan').addEventListener('click', () => {
    alert("Camera integration requires a QR library like html5-qrcode. Manual ID entry is ready for testing!");
});