// =====================================================
// MAHI LIFESTYLE - CHECKOUT & BILLING
// =====================================================

const checkoutContent = document.getElementById("checkoutContent");

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("mahiCart")) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("mahiCart", JSON.stringify(cart));
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("mahiUser"));
    } catch {
        return null;
    }
}

// Ensure clean numeric unit price in INR
function getItemUnitPriceINR(item) {
    const rawPrice = Number(item.price);
    if (isNaN(rawPrice) || rawPrice < 0) return 0;
    return Math.round(rawPrice * 90);
}

function formatCurrency(amount) {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function renderCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
        checkoutContent.innerHTML = `
            <section class="empty-cart">
                <i class="fa-solid fa-receipt"></i>
                <h2>Your cart is empty</h2>
                <p>Add a product before proceeding to checkout.</p>
                <a class="cart-action primary" href="index.html#products">Continue Shopping</a>
            </section>
        `;
        return;
    }

    const user = getUser();
    const itemCount = cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);

    // 1. Subtotal: sum of cart item numeric prices * quantities
    const subtotal = cart.reduce((sum, item) => {
        const unitPrice = getItemUnitPriceINR(item);
        const qty = Math.max(1, Number(item.quantity) || 1);
        return sum + (unitPrice * qty);
    }, 0);

    // 2. Delivery fee rule:
    //    subtotal < 500  => delivery fee = 50
    //    subtotal >= 500 => delivery fee = 0
    //    (if subtotal is 0, delivery fee is 0)
    const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 50;

    // 3. Discount & Tax
    const discount = 0;
    const tax = 0;

    // 4. Grand Total
    const total = subtotal + deliveryFee - discount + tax;

    checkoutContent.innerHTML = `
        <section class="checkout-form-card">
            ${!user ? `
                <div class="checkout-guest-notice">
                    <i class="fa-solid fa-circle-info"></i>
                    <span>Have a Mahi Lifestyle account? <a href="login.html">Log in</a> for faster checkout with saved details, or continue as guest below.</span>
                </div>
            ` : ""}
            <h2>Delivery Details</h2>
            <form id="orderForm">
                <div class="checkout-form-grid">
                    <label>
                        Full Name
                        <input name="name" type="text" placeholder="Your full name" value="${user?.name || ""}" required>
                    </label>
                    <label>
                        Phone Number
                        <input name="phone" type="tel" inputmode="numeric" maxlength="10" minlength="10" placeholder="10-digit phone number" pattern="[0-9]{10}" value="${user?.phone ? user.phone.replace(/[^0-9]/g, "").slice(-10) : ""}" required>
                    </label>
                </div>
                <label>
                    Email Address
                    <input name="email" type="email" placeholder="you@example.com" value="${user?.email || ""}" required>
                </label>
                <label>
                    Delivery Address
                    <textarea name="address" rows="3" placeholder="House number, street, city and state" required>${user?.location || ""}</textarea>
                </label>
                <label>
                    Payment Method
                    <select name="payment" required>
                        <option value="">Select payment method</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Credit / Debit Card</option>
                    </select>
                </label>
                <button class="cart-action primary" type="submit">
                    <i class="fa-solid fa-lock"></i> Place Order (${formatCurrency(total)})
                </button>
            </form>
        </section>

        <aside class="bill-card" id="billCard">
            <div class="bill-header">
                <span class="products-tag">MAHI LIFESTYLE</span>
                <h2>Order Bill</h2>
                <span>${itemCount} item${itemCount === 1 ? "" : "s"}</span>
            </div>
            <div class="bill-items">
                ${cart.map(item => {
                    const unitPrice = getItemUnitPriceINR(item);
                    const qty = Math.max(1, Number(item.quantity) || 1);
                    const lineTotal = unitPrice * qty;
                    return `
                        <div class="bill-item">
                            <div class="bill-item-details">
                                <span class="bill-item-title">${item.title}</span>
                                <div class="bill-item-qty-controls">
                                    <button type="button" class="bill-qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                                    <span class="bill-qty-number">${qty}</span>
                                    <button type="button" class="bill-qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
                                    <button type="button" class="bill-remove-btn" data-action="remove" data-id="${item.id}" title="Remove item"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </div>
                            <strong class="bill-item-price">${formatCurrency(lineTotal)}</strong>
                        </div>
                    `;
                }).join("")}
            </div>
            <div class="bill-row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
            <div class="bill-row"><span>Delivery Fee</span><strong>${deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}</strong></div>
            ${deliveryFee > 0 ? `<div class="delivery-threshold-note">Add ${formatCurrency(500 - subtotal)} more for FREE delivery!</div>` : ""}
            <div class="bill-total"><span>Grand Total</span><strong>${formatCurrency(total)}</strong></div>
            <p class="bill-note"><i class="fa-solid fa-shield-halved"></i> Your order details are kept secure.</p>
        </aside>
    `;

    const phoneInput = document.querySelector("#orderForm input[name='phone']");
    phoneInput?.addEventListener("input", event => {
        event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
    });

    document.getElementById("orderForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const orderId = `ML${Date.now().toString().slice(-8)}`;
        const formData = new FormData(event.currentTarget);
        const orders = JSON.parse(localStorage.getItem("mahiOrders")) || [];

        orders.unshift({
            id: orderId,
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            address: formData.get("address"),
            payment: formData.get("payment"),
            date: new Date().toISOString(),
            itemCount,
            subtotal,
            deliveryFee,
            total,
            items: cart.map(item => ({
                title: item.title,
                quantity: Number(item.quantity) || 1,
                unitPrice: getItemUnitPriceINR(item),
                totalPrice: getItemUnitPriceINR(item) * (Number(item.quantity) || 1)
            }))
        });

        localStorage.setItem("mahiOrders", JSON.stringify(orders));
        localStorage.removeItem("mahiCart");
        window.dispatchEvent(new Event("storage"));

        const cartCountEl = document.querySelector(".nav-icons a[title='Shopping Cart'] .count");
        if (cartCountEl) cartCountEl.textContent = "0";

        checkoutContent.innerHTML = `
            <section class="order-success">
                <i class="fa-solid fa-circle-check"></i>
                <h2>Order placed successfully</h2>
                <p>Thank you, <strong>${formData.get("name")}</strong>! Your order <strong>#${orderId}</strong> has been confirmed.</p>
                <p class="success-total">Total paid: <strong>${formatCurrency(total)}</strong> (via ${formData.get("payment")})</p>
                <p>A confirmation email has been logged to <strong>${formData.get("email")}</strong>.</p>
                <a class="cart-action primary" href="index.html">Continue Shopping</a>
            </section>
        `;
    });
}

// Interactive quantity changes directly on checkout bill card
checkoutContent?.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const productId = Number(button.dataset.id);
    let cart = getCart();
    const item = cart.find(p => p.id === productId);

    if (action === "remove") {
        cart = cart.filter(p => p.id !== productId);
    } else if (action === "increase" && item) {
        item.quantity = (Number(item.quantity) || 1) + 1;
    } else if (action === "decrease" && item) {
        const nextQty = (Number(item.quantity) || 1) - 1;
        if (nextQty <= 0) {
            cart = cart.filter(p => p.id !== productId);
        } else {
            item.quantity = nextQty;
        }
    }

    saveCart(cart);
    window.dispatchEvent(new Event("storage"));

    const cartCountEl = document.querySelector(".nav-icons a[title='Shopping Cart'] .count");
    if (cartCountEl) {
        cartCountEl.textContent = cart.reduce((tot, it) => tot + (Number(it.quantity) || 1), 0);
    }

    renderCheckout();
});

// React to external cart modifications (e.g., slide panels or other tabs)
window.addEventListener("storage", renderCheckout);

renderCheckout();
