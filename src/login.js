// =====================================================
// MAHI LIFESTYLE - LOGIN & AUTHENTICATION
// =====================================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const forgotPassword = document.querySelector(".password-label a");
const demoLogin = document.getElementById("demoLogin");

// If already logged in, redirect to home page
if (localStorage.getItem("mahiUser")) {
    window.location.replace("index.html");
}

// SHA-256 password hashing helper matching registration
async function hashPassword(plainPassword) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Inline message display
function showMessage(message, isError = false) {
    const existingMessage = document.querySelector(".form-message");
    existingMessage?.remove();

    const formMessage = document.createElement("div");
    formMessage.className = `form-message ${isError ? "error" : "success"}`;
    formMessage.innerHTML = `
        <i class="fa-solid fa-${isError ? "circle-exclamation" : "circle-check"}"></i>
        <span>${message}</span>
    `;
    loginForm.appendChild(formMessage);
}

// Check for redirect params from registration
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("registered") === "true") {
    const registeredEmail = urlParams.get("email");
    if (registeredEmail && emailInput) {
        emailInput.value = registeredEmail;
    }
    showMessage("Account created successfully! Please enter your password to login.", false);
}

// Password visibility toggle
togglePassword?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.title = isPassword ? "Hide password" : "Show password";
    togglePassword.innerHTML = `<i class="fa-regular fa-eye${isPassword ? "-slash" : ""}"></i>`;
});

// Forgot password handler
forgotPassword?.addEventListener("click", event => {
    event.preventDefault();
    showMessage("Password reset instructions will be available soon.", false);
});

// Demo login credentials quick-fill
demoLogin?.addEventListener("click", () => {
    emailInput.value = "demo@gmail.com";
    passwordInput.value = "123456";
    passwordInput.type = "text";
    togglePassword.title = "Hide password";
    togglePassword.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`;
});

// Form submission handler
loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage("Please enter both email and password.", true);
        return;
    }

    // 1. Check demo credentials
    if (email === "demo@gmail.com" && password === "123456") {
        localStorage.setItem(
            "mahiUser",
            JSON.stringify({
                name: "Demo Customer",
                email: "demo@gmail.com",
                phone: "+91 8790116301",
                location: "Hyderabad, Telangana"
            })
        );
        window.location.href = "index.html";
        return;
    }

    // 2. Check registered users in localStorage (mahiUsers)
    try {
        const users = JSON.parse(localStorage.getItem("mahiUsers")) || [];
        const passwordHash = await hashPassword(password);
        const matchedUser = users.find(
            u => u.email.toLowerCase() === email && u.passwordHash === passwordHash
        );

        if (matchedUser) {
            localStorage.setItem(
                "mahiUser",
                JSON.stringify({
                    name: matchedUser.name,
                    email: matchedUser.email,
                    phone: matchedUser.phone || "+91 8790116301",
                    location: matchedUser.location || "Hyderabad, Telangana"
                })
            );
            window.location.href = "index.html";
            return;
        }
    } catch (err) {
        console.error("Login authentication error:", err);
    }

    // 3. Authentication failed
    showMessage("Invalid email or password. Please check your credentials or click 'Create Account'.", true);
});
