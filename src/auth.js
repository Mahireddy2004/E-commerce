// =====================================================
// MAHI LIFESTYLE - AUTHENTICATION UTILITIES & ROUTE GUARD
// =====================================================

export function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("mahiUser"));
    } catch {
        return null;
    }
}

export function isAuthenticated() {
    return Boolean(getCurrentUser());
}

export function logout() {
    localStorage.removeItem("mahiUser");
    window.location.href = "login.html";
}

// Route guard:
// Only redirect if the current document explicitly declares authentication requirement
// via <body data-require-auth="true">.
// Public store pages (Home, Product details, Cart, Wishlist) remain accessible to guests.
if (typeof document !== "undefined" && document.body?.dataset?.requireAuth === "true") {
    if (!isAuthenticated()) {
        window.location.replace("login.html");
    }
}
