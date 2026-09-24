const navbar = document.querySelector(".navbar");
const profileLink = document.querySelector(
    ".nav-icons a[title*='Profile'], .nav-icons a[href='login.html'], .nav-icons a[href='profile.html']"
);
const cartLink = document.querySelector(
    ".nav-icons a[title='Shopping Cart'], .nav-icons a[href='cart.html']"
);
const wishlistLink = document.querySelector(
    ".nav-icons a[title='Wishlist'], .nav-icons a[href='wishlist.html']"
);

const cartCount = document.querySelector(".nav-icons a[title='Shopping Cart'] .count");
const wishlistCount = document.querySelector(".nav-icons a[title='Wishlist'] .count");

function updateNavCounts() {
    const cart = JSON.parse(localStorage.getItem("mahiCart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("mahiWishlist")) || [];

    if (cartCount) {
        cartCount.textContent = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );
    }

    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

if (profileLink) {
    profileLink.href = "#profilePanel";
    profileLink.setAttribute("aria-label", "Open profile panel");
}

if (cartLink) {
    cartLink.href = "#cartPanel";
    cartLink.setAttribute("aria-label", "Open cart panel");
}

if (wishlistLink) {
    wishlistLink.href = "#wishlistPanel";
    wishlistLink.setAttribute("aria-label", "Open wishlist panel");
}

const user = JSON.parse(localStorage.getItem("mahiUser"));
const orders = (JSON.parse(localStorage.getItem("mahiOrders")) || [])
    .filter(order => !user || order.email === user.email);
const profilePanel = document.createElement("aside");
const cartPanel = document.createElement("aside");
const wishlistPanel = document.createElement("aside");
const profileOverlay = document.createElement("div");

function formatOrderPrice(price) {
    return `₹${Math.round(Number(price) || 0).toLocaleString("en-IN")}`;
}

function formatMemberSince(date) {
    if (!date) return "September 2026";

    const memberDate = new Date(date);
    return Number.isNaN(memberDate.getTime())
        ? "September 2026"
        : memberDate.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });
}

profilePanel.className = "profile-panel";
profilePanel.setAttribute("aria-hidden", "true");
profilePanel.innerHTML = user ? `
    <button class="profile-panel-close" type="button" aria-label="Close profile panel">
        <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="profile-panel-avatar">
        ${user.photo
            ? `<img src="${user.photo}" alt="Profile photo">`
            : (user.name || user.email).charAt(0).toUpperCase()}
    </div>
    <label class="profile-photo-upload" for="profilePhoto">
        <i class="fa-solid fa-camera"></i> Change Photo
        <input id="profilePhoto" type="file" accept="image/*">
    </label>
    <span class="products-tag">MY ACCOUNT</span>
    <h2>${user.name || "Demo Customer"}</h2>
    <p class="profile-panel-email">${user.email}</p>
    <div class="profile-panel-details">
        <div><i class="fa-solid fa-phone"></i><span>${user.phone || "+91 8790116301"}</span></div>
        <div><i class="fa-solid fa-location-dot"></i><span>${user.location || "Hyderabad, Telangana"}</span></div>
        <div><i class="fa-regular fa-calendar-check"></i><span>Member since ${formatMemberSince(user.createdAt)}</span></div>
        <div><i class="fa-solid fa-circle-check"></i><span>Account status: Active</span></div>
    </div>
    <section class="profile-previous-orders">
        <button class="profile-order-history-toggle profile-panel-action" type="button" aria-expanded="false">
            <span>Order History</span>
            <i class="fa-solid fa-arrow-right"></i>
        </button>
        <div class="profile-order-history-panel" hidden>
            ${orders.length === 0 ? `
                <p class="profile-no-orders">No previous orders yet.</p>
            ` : `
                <div class="profile-last-order-products">
                    <span class="products-tag">LAST ORDERED PRODUCTS</span>
                    ${(orders[0].items || []).map(item => `
                        <div class="profile-last-order-item">
                            <strong>${item.title}</strong>
                            <span>${Number(item.quantity) || 1} x ${formatOrderPrice(item.totalPrice || item.unitPrice || 0)}</span>
                        </div>
                    `).join("")}
                </div>
                <div class="profile-order-summary">
                    ${orders.slice(0, 3).map(order => `
                        <article class="profile-previous-order">
                            <div>
                                <strong>#${order.id}</strong>
                                <span>${new Date(order.date).toLocaleDateString("en-IN")}</span>
                            </div>
                            <div>
                                <strong>${formatOrderPrice(order.total)}</strong>
                                <span>${order.itemCount} item${order.itemCount === 1 ? "" : "s"}</span>
                            </div>
                        </article>
                    `).join("")}
                </div>
            `}
            ${orders.length > 3 ? `<a class="profile-orders-link" href="profile.html">View all orders <i class="fa-solid fa-arrow-right"></i></a>` : ""}
        </div>
    </section>
    <a class="profile-panel-action" href="profile.html">View Full Profile <i class="fa-solid fa-arrow-right"></i></a>
    <button class="profile-panel-logout" type="button">Log Out</button>
` : `
    <button class="profile-panel-close" type="button" aria-label="Close profile panel">
        <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="profile-panel-avatar"><i class="fa-regular fa-user"></i></div>
    <span class="products-tag">MY ACCOUNT</span>
    <h2>Welcome to Mahi Lifestyle</h2>
    <p class="profile-panel-email">Sign in or create an account to view your account details and orders.</p>
    <a class="profile-panel-action" href="login.html">Go to Login <i class="fa-solid fa-arrow-right"></i></a>
    <a class="profile-panel-action secondary-action" href="register.html">Create Account <i class="fa-solid fa-user-plus"></i></a>
`;

cartPanel.className = "profile-panel cart-panel";
cartPanel.setAttribute("aria-hidden", "true");
wishlistPanel.className = "profile-panel wishlist-panel";
wishlistPanel.setAttribute("aria-hidden", "true");

function formatCartPrice(price) {
    return `₹${Math.round(price * 90).toLocaleString("en-IN")}`;
}

function renderCartPanel() {
    const cart = JSON.parse(localStorage.getItem("mahiCart")) || [];
    const itemCount = cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
    const subtotal = cart.reduce(
        (sum, item) => sum + Math.round(Number(item.price) * 90) * (Number(item.quantity) || 1),
        0
    );
    const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    cartPanel.innerHTML = `
        <button class="profile-panel-close cart-panel-close" type="button" aria-label="Close cart panel">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <span class="products-tag">YOUR CART</span>
        <h2>Shopping Cart</h2>
        ${cart.length === 0 ? `
            <div class="cart-panel-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Your cart is empty.</p>
                <a class="profile-panel-action" href="index.html#products">Start Shopping <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        ` : `
            <p class="profile-panel-email">${itemCount} item${itemCount === 1 ? "" : "s"} in your cart</p>
            <div class="cart-panel-items">
                ${cart.map(item => `
                    <div class="cart-panel-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div><strong>${item.title}</strong><span>${item.quantity} x ₹${Math.round(Number(item.price) * 90).toLocaleString("en-IN")}</span></div>
                    </div>
                `).join("")}
            </div>
            <div class="cart-panel-total"><span>Total</span><strong>₹${total.toLocaleString("en-IN")}</strong></div>
            <a class="profile-panel-action" href="checkout.html">Checkout <i class="fa-solid fa-arrow-right"></i></a>
            <a class="profile-panel-action" href="cart.html">View Full Cart <i class="fa-solid fa-arrow-right"></i></a>
        `}
    `;
}

function renderWishlistPanel() {
    const wishlist = JSON.parse(localStorage.getItem("mahiWishlist")) || [];

    wishlistPanel.innerHTML = `
        <button class="profile-panel-close wishlist-panel-close" type="button" aria-label="Close wishlist panel">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <span class="products-tag">SAVED FOR LATER</span>
        <h2>My Wishlist</h2>
        ${wishlist.length === 0 ? `
            <div class="cart-panel-empty">
                <i class="fa-regular fa-heart"></i>
                <p>Your wishlist is empty.</p>
                <a class="profile-panel-action" href="index.html#products">Explore Products <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        ` : `
            <p class="profile-panel-email">${wishlist.length} saved product${wishlist.length === 1 ? "" : "s"}</p>
            <div class="cart-panel-items">
                ${wishlist.map(item => `
                    <div class="cart-panel-item wishlist-panel-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="wishlist-panel-info">
                            <a href="product.html?id=${item.id}"><strong>${item.title}</strong><span>${formatCartPrice(item.price)}</span></a>
                            <button class="wishlist-panel-remove" type="button" data-remove-wishlist="${item.id}">Remove</button>
                        </div>
                    </div>
                `).join("")}
            </div>
            <a class="profile-panel-action" href="wishlist.html">View Wishlist <i class="fa-solid fa-arrow-right"></i></a>
        `}
    `;

    wishlistPanel.querySelectorAll("[data-remove-wishlist]").forEach(button => {
        button.addEventListener("click", () => {
            const productId = Number(button.dataset.removeWishlist);
            const updatedWishlist = wishlist.filter(item => item.id !== productId);
            localStorage.setItem("mahiWishlist", JSON.stringify(updatedWishlist));
            updateNavCounts();
            renderWishlistPanel();
        });
    });
}

profileOverlay.className = "profile-overlay";
document.body.append(profileOverlay, profilePanel, cartPanel, wishlistPanel);
profilePanel.querySelector(".profile-order-history-toggle")?.addEventListener("click", () => {
    const button = profilePanel.querySelector(".profile-order-history-toggle");
    const panel = profilePanel.querySelector(".profile-order-history-panel");
    if (!button || !panel) return;

    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    panel.hidden = isOpen;
});

function closeProfilePanel() {
    profilePanel.classList.remove("open");
    profileOverlay.classList.remove("open");
    profilePanel.setAttribute("aria-hidden", "true");
}

function closeCartPanel() {
    cartPanel.classList.remove("open");
    profileOverlay.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
}

function closeWishlistPanel() {
    wishlistPanel.classList.remove("open");
    profileOverlay.classList.remove("open");
    wishlistPanel.setAttribute("aria-hidden", "true");
}

function openCartPanel() {
    closeProfilePanel();
    closeWishlistPanel();
    renderCartPanel();
    cartPanel.classList.add("open");
    profileOverlay.classList.add("open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartPanel.querySelector(".cart-panel-close")?.addEventListener(
        "click",
        closeCartPanel
    );
}

window.openCartPanel = openCartPanel;

profileLink?.addEventListener("click", event => {
    event.preventDefault();
    closeCartPanel();
    closeWishlistPanel();
    profilePanel.classList.add("open");
    profileOverlay.classList.add("open");
    profilePanel.setAttribute("aria-hidden", "false");
});

cartLink?.addEventListener("click", event => {
    event.preventDefault();
    openCartPanel();
});

wishlistLink?.addEventListener("click", event => {
    event.preventDefault();
    closeProfilePanel();
    closeCartPanel();
    renderWishlistPanel();
    wishlistPanel.classList.add("open");
    profileOverlay.classList.add("open");
    wishlistPanel.setAttribute("aria-hidden", "false");
    wishlistPanel.querySelector(".wishlist-panel-close")?.addEventListener(
        "click",
        closeWishlistPanel
    );
});

profilePanel.querySelector(".profile-panel-close")?.addEventListener(
    "click",
    closeProfilePanel
);
profileOverlay.addEventListener("click", closeProfilePanel);
profileOverlay.addEventListener("click", closeCartPanel);
profileOverlay.addEventListener("click", closeWishlistPanel);
profilePanel.querySelector("#profilePhoto")?.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const updatedUser = {
            ...user,
            photo: reader.result
        };

        localStorage.setItem("mahiUser", JSON.stringify(updatedUser));
        profilePanel.querySelector(".profile-panel-avatar").innerHTML =
            `<img src="${reader.result}" alt="Profile photo">`;
    });
    reader.readAsDataURL(file);
});
profilePanel.querySelector(".profile-panel-logout")?.addEventListener("click", () => {
    localStorage.removeItem("mahiUser");
    window.location.href = "login.html";
});
window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeProfilePanel();
        closeCartPanel();
        closeWishlistPanel();
    }
});
window.addEventListener("cartUpdated", updateNavCounts);

function updateNavbar() {
    navbar?.classList.toggle("scrolled", window.scrollY > 20);
}

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();
updateNavCounts();
