const profileContent = document.getElementById("profileContent");
const user = JSON.parse(localStorage.getItem("mahiUser"));

function formatProductPrice(price) {
    return `₹${Math.round(Number(price) * 90).toLocaleString("en-IN")}`;
}

function formatOrderPrice(price) {
    return `₹${Math.round(Number(price) || 0).toLocaleString("en-IN")}`;
}

if (!user) {
    profileContent.innerHTML = `
        <i class="fa-regular fa-user profile-icon"></i>
        <span class="products-tag">MY ACCOUNT</span>
        <h1>Sign in to view your profile</h1>
        <p>Log in or create an account to view your account details, manage addresses, and track your orders.</p>
        <div class="profile-guest-actions">
            <a class="cart-action primary" href="login.html"><i class="fa-solid fa-arrow-right-to-bracket"></i> Go to Login</a>
            <a class="cart-action secondary" href="register.html"><i class="fa-solid fa-user-plus"></i> Create Account</a>
        </div>
    `;
} else {
    const userName = user.name || "Demo Customer";
    const userPhone = user.phone || "+91 8790116301";
    const userLocation = user.location || "Hyderabad, Telangana";
    const orders = (JSON.parse(localStorage.getItem("mahiOrders")) || [])
        .filter(order => order.email === user.email);

    profileContent.innerHTML = `
        <div class="profile-avatar">${userName.charAt(0).toUpperCase()}</div>
        <span class="products-tag">MY ACCOUNT</span>
        <h1>${userName}</h1>
        <p class="profile-email">${user.email}</p>
        <div class="profile-user-details">
            <div><i class="fa-regular fa-envelope"></i><span>Email Address</span><strong>${user.email}</strong></div>
            <div><i class="fa-solid fa-phone"></i><span>Phone Number</span><strong>${userPhone}</strong></div>
            <div><i class="fa-solid fa-location-dot"></i><span>Location</span><strong>${userLocation}</strong></div>
            <div><i class="fa-solid fa-calendar-check"></i><span>Member Since</span><strong>September 2026</strong></div>
        </div>
        <div class="profile-details">
            <div><span>Account status</span><strong>Active</strong></div>
            <div><span>Previous orders</span><strong>${orders.length}</strong></div>
        </div>
        <div class="profile-orders">
            <button class="profile-order-history-toggle profile-page-order-toggle" type="button" aria-expanded="false">
                <span class="products-tag">ORDER HISTORY</span>
                <h2>Previous Orders</h2>
            </button>
            <div class="profile-order-history-panel" hidden>
                ${orders.length === 0 ? `
                    <p class="no-orders">No previous orders yet.</p>
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
                    <div class="profile-order-history">
                        ${orders.map(order => {
                            const orderDate = order.date ? new Date(order.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }) : "Recently";

                            return `
                                <article class="profile-order-card">
                                    <button class="profile-order-toggle" type="button" aria-expanded="false">
                                        <div class="profile-order-card-header">
                                            <div>
                                                <span class="products-tag">ORDER</span>
                                                <h3>#${order.id}</h3>
                                            </div>
                                            <span class="profile-order-status">Confirmed</span>
                                        </div>
                                        <div class="profile-order-meta">
                                            <span>${orderDate}</span>
                                            <span>${order.itemCount} item${order.itemCount === 1 ? "" : "s"}</span>
                                            <span>${order.payment || "Cash on Delivery"}</span>
                                        </div>
                                    </button>
                                    <div class="profile-order-details" hidden>
                                        <div class="profile-order-items">
                                            ${(order.items || []).map(item => {
                                                const itemQty = Number(item.quantity) || 1;
                                                const unitPrice = Number(item.unitPrice) || 0;
                                                const itemTotal = Number(item.totalPrice) || unitPrice * itemQty;

                                                return `
                                                    <div class="profile-order-item">
                                                        <div>
                                                            <strong>${item.title}</strong>
                                                            <span>${itemQty} x ${formatOrderPrice(unitPrice)}</span>
                                                        </div>
                                                        <strong>${formatOrderPrice(itemTotal)}</strong>
                                                    </div>
                                                `;
                                            }).join("")}
                                        </div>
                                        <div class="profile-order-footer">
                                            <div class="profile-order-address">
                                                <span>Delivery Address</span>
                                                <strong>${order.address || userLocation}</strong>
                                            </div>
                                            <div class="profile-order-total">
                                                <span>Total</span>
                                                <strong>${formatOrderPrice(order.total)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            `;
                        }).join("")}
                    </div>
                `}
            </div>
        </div>
        <button class="cart-action secondary" id="logoutButton" type="button">Log Out</button>
    `;

    document.querySelectorAll(".profile-page-order-toggle").forEach(button => {
        button.addEventListener("click", () => {
            const panel = button.nextElementSibling;
            const isOpen = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;
        });
    });

    document.querySelectorAll(".profile-order-toggle").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".profile-order-card");
            const details = card.querySelector(".profile-order-details");
            const isOpen = card.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(isOpen));
            details.hidden = !isOpen;
        });
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.removeItem("mahiUser");
        window.location.href = "login.html";
    });
}
