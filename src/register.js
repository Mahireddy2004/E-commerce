// =====================================================
// MAHI LIFESTYLE - USER REGISTRATION
// =====================================================

const API_USERS_URL = "https://fakestoreapi.com/users";

const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const submitBtn = document.getElementById("submitBtn");

// If already logged in, redirect to home page
if (localStorage.getItem("mahiUser")) {
    window.location.replace("index.html");
}

// Password toggle helper
function setupPasswordToggle(button, input) {
    button?.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        button.title = isPassword ? "Hide password" : "Show password";
        button.innerHTML = `<i class="fa-regular fa-eye${isPassword ? "-slash" : ""}"></i>`;
    });
}

setupPasswordToggle(togglePassword, passwordInput);
setupPasswordToggle(toggleConfirmPassword, confirmPasswordInput);

// Numeric filter for phone
phoneInput?.addEventListener("input", event => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
});

// SHA-256 password hashing via Web Crypto API (never store plain text passwords)
async function hashPassword(plainPassword) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Display inline form feedback
function showMessage(message, isError = false) {
    const existingMessage = document.querySelector(".form-message");
    existingMessage?.remove();

    const formMessage = document.createElement("div");
    formMessage.className = `form-message ${isError ? "error" : "success"}`;
    formMessage.innerHTML = `
        <i class="fa-solid fa-${isError ? "circle-exclamation" : "circle-check"}"></i>
        <span>${message}</span>
    `;
    registerForm.appendChild(formMessage);
}

// Form submit handler
registerForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 1. Required fields validation
    if (!fullName) {
        showMessage("Please enter your full name.", true);
        nameInput.focus();
        return;
    }

    if (fullName.length < 2) {
        showMessage("Full name must be at least 2 characters.", true);
        nameInput.focus();
        return;
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showMessage("Please enter a valid email address.", true);
        emailInput.focus();
        return;
    }

    // 3. Password requirements
    if (!password || password.length < 6) {
        showMessage("Password must be at least 6 characters long.", true);
        passwordInput.focus();
        return;
    }

    // 4. Confirm password match
    if (password !== confirmPassword) {
        showMessage("Passwords do not match. Please verify and try again.", true);
        confirmPasswordInput.focus();
        return;
    }

    // 5. Check if user already exists locally
    const existingUsers = JSON.parse(localStorage.getItem("mahiUsers")) || [];
    const userExists = existingUsers.some(u => u.email === email);
    if (userExists) {
        showMessage("An account with this email already exists. Please login.", true);
        return;
    }

    // Prevent duplicate submission
    submitBtn.disabled = true;
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Creating account...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

    try {
        // Backend User API integration (FakeStoreAPI /users)
        const nameParts = fullName.split(" ");
        const firstname = nameParts[0] || fullName;
        const lastname = nameParts.slice(1).join(" ") || "Customer";

        let apiUserId = null;
        try {
            const apiResponse = await fetch(API_USERS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    username: email.split("@")[0],
                    password,
                    name: { firstname, lastname },
                    address: {
                        city: "Hyderabad",
                        street: "Main Street",
                        number: 1,
                        zipcode: "500001",
                        geolocation: { lat: "17.3850", long: "78.4867" }
                    },
                    phone: phone ? `+91 ${phone}` : "+91 8790116301"
                })
            });

            if (apiResponse.ok) {
                const apiData = await apiResponse.json();
                apiUserId = apiData?.id;
            }
        } catch (apiError) {
            console.warn("FakeStoreAPI user endpoint notice:", apiError.message);
        }

        // Securely hash password before storing in local persistent user store
        const passwordHash = await hashPassword(password);

        const newUser = {
            id: apiUserId || `user_${Date.now()}`,
            name: fullName,
            email,
            phone: phone ? `+91 ${phone}` : "+91 8790116301",
            location: "Hyderabad, Telangana",
            passwordHash,
            createdAt: new Date().toISOString()
        };

        existingUsers.push(newUser);
        localStorage.setItem("mahiUsers", JSON.stringify(existingUsers));

        showMessage("Account created successfully! Redirecting to login...", false);

        // Redirect to login page after successful registration
        setTimeout(() => {
            window.location.href = `login.html?registered=true&email=${encodeURIComponent(email)}`;
        }, 1200);

    } catch (error) {
        console.error("Registration error:", error);
        showMessage("Unable to complete registration. Please try again.", true);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
    }
});
