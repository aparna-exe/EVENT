// frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LOGIN HANDLING LOGIC
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    const btnParticipant = document.getElementById('btn-participant');
    const btnOrganizer = document.getElementById('btn-organizer');

    let currentLoginRole = 'participant';

    if (btnParticipant && btnOrganizer) {
        btnParticipant.addEventListener('click', () => {
            currentLoginRole = 'participant';
            btnParticipant.className = "w-1/2 bg-white text-[#0B1E3F] py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all";
            btnOrganizer.className = "w-1/2 text-slate-400 py-2.5 rounded-xl text-sm font-medium transition-all";
        });

        btnOrganizer.addEventListener('click', () => {
            currentLoginRole = 'organizer';
            btnOrganizer.className = "w-1/2 bg-white text-[#0B1E3F] py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all";
            btnParticipant.className = "w-1/2 text-slate-400 py-2.5 rounded-xl text-sm font-medium transition-all";
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const loginBtn = document.getElementById('loginBtn');

            if (!emailInput.value || !passwordInput.value) {
                alert("Please enter both your email and password.");
                return;
            }

            loginBtn.textContent = 'Signing in...';
            loginBtn.disabled = true;

            const loginPayload = {
                Email: emailInput.value,
                Password: passwordInput.value,
                Role: currentLoginRole
            };

            try {
                const response = await fetch('http://127.0.0.1:5000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginPayload)
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('user_id', result.User_ID);
                    localStorage.setItem('username', result.username);
                    localStorage.setItem('role', result.Role);

                    alert(`Welcome back, ${result.username}! 👋`);

                    if (result.Role === 'organizer') {
                        window.location.href = 'organizer.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    loginBtn.textContent = 'Login';
                    loginBtn.disabled = false;
                    alert(result.message || "Login failed. Please check your credentials.");
                }
            } catch (err) {
                console.error("Connection error:", err);
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
                alert("Can't reach the server. Make sure it's running.");
            }
        });
    }

    // ==========================================
    // 2. SIGNUP HANDLING LOGIC
    // ==========================================
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            // Read role from the radio buttons
            const roleRadio = document.querySelector('input[name="role"]:checked');
            const selectedRole = roleRadio ? roleRadio.value : 'participant';

            if (!nameInput.value || !emailInput.value || !passwordInput.value) {
                alert("Please fill in all fields.");
                return;
            }

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            const payload = {
                Name: nameInput.value,
                Email: emailInput.value,
                Password: passwordInput.value,
                Role: selectedRole
            };

            try {
                const response = await fetch('http://127.0.0.1:5000/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Account created! Taking you to login...");
                    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                } else {
                    submitBtn.textContent = 'Create Account';
                    submitBtn.disabled = false;
                    alert(result.message || "Signup failed. Try again.");
                }
            } catch (err) {
                console.error("Connection error:", err);
                submitBtn.textContent = 'Create Account';
                submitBtn.disabled = false;
                alert("Can't reach the server. Make sure it's running.");
            }
        });
    }
});
