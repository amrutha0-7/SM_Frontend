const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

// Toggle between forms
sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Role Selection Functionality
const roleButtons = document.querySelectorAll(".role-btn");
const userRoleInput = document.getElementById("user-role");

roleButtons.forEach(button => {
  button.addEventListener("click", () => {
    roleButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    userRoleInput.value = button.dataset.role;
  });
});

// Initialize data structures when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize users array if not exists
  if (!localStorage.getItem('donationUsers')) {
    localStorage.setItem('donationUsers', JSON.stringify([]));
  }
  
  // Initialize food donations if not exists
  if (!localStorage.getItem('foodDonations')) {
    localStorage.setItem('foodDonations', JSON.stringify([]));
  }
  
  // Initialize food requests if not exists
  if (!localStorage.getItem('foodRequests')) {
    localStorage.setItem('foodRequests', JSON.stringify([]));
  }
});

const API_BASE = 'http://localhost:5000';

// Sign Up Functionality
// Replace localStorage registration with backend API call

document.querySelector(".sign-up-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const role = userRoleInput.value;

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role })
    });
    if (res.status === 201) {
      const user = await res.json();
      if (!user.token) {
        alert('Registration failed: No token received from server.');
        return;
      }
      localStorage.setItem("currentDonationUser", JSON.stringify(user));
      alert("Account created successfully! Please set your location.");
      window.location.href = "location.html";
    } else {
      let errMsg = "Registration failed";
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch {}
      alert(errMsg);
    }
  } catch (error) {
    alert("Registration error: " + error.message);
  }
});

// Sign In Functionality
// Replace localStorage login with backend API call

document.querySelector(".sign-in-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;

  // Validation
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const user = await res.json();
      if (!user.token) {
        alert('Login failed: No token received from server.');
        return;
      }
      localStorage.setItem("currentDonationUser", JSON.stringify(user));
      // Check if user has location set (required for all users)
      const locRes = await fetch(`${API_BASE}/api/location/${user.username}`);
      if (!locRes.ok) {
        alert("Please set your location first");
        window.location.href = "location.html";
        return;
      }
      redirectBasedOnRole(user.role);
    } else {
      let errMsg = "Invalid credentials";
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch {}
      alert(errMsg);
    }
  } catch (error) {
    alert("Login error: " + error.message);
  }
});

// Single, unified redirect function for all roles
function redirectBasedOnRole(role) {
  if (role === 'donor') {
    window.location.href = 'donor.html';
  } else if (role === 'receiver') {
    window.location.href = 'receiver.html';
  } else if (role === 'ngo') {
    window.location.href = 'ngo-dashboard.html';
  }
}

// Helper function to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

