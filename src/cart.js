// =====================================================
// MAHI LIFESTYLE - SHOPPING CART
// =====================================================

const cartContent = document.getElementById("cartContent");
const cartCount = document.getElementById("cartCount");

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

function getItemUnitPriceINR(item) {
    const rawPrice = Number(item.price);
    if (isNaN(rawPrice) || rawPrice < 0) return 0;
    return Math.round(rawPrice * 90);
}

function formatCurrency(amount) {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function updateCart() {
    const cart = getCart();
    const itemCount = cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);

    // Numeric Subtotal in INR
    const subtotal = cart.reduce(
        (total, item) => total + getItemUnitPriceINR(item) * (Number(item.quantity) || 1),
        0
    );

    // Delivery fee rule: free above/at 500, 50 below 500, 0 when empty
    const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    if (cartCount) {
        cartCount.textContent = itemCount;
    }

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <section class="empty-cart">
                <i class="fa-solid fa-cart-shopping"></i>
                <h2>Your cart is empty</h2>
                <p>Add products from the store to see them here.</p>
                <a class="cart-action primary" href="index.html#products">Continue Shopping</a>
            </section>
        `;
        return;
    }

    cartContent.innerHTML = `
        <section class="cart-items">
            ${cart.map(item => {
                const unitPrice = getItemUnitPriceINR(item);
                const qty = Number(item.quantity) || 1;
                return `
                    <article class="cart-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h2>${item.title}</h2>
                            <strong>${formatCurrency(unitPrice)}</strong>
                            <div class="quantity-control" aria-label="Quantity controls">
                                <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                                <span>${qty}</span>
                                <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
                            </div>
                        </div>
                        <button class="remove-item" type="button" data-action="remove" data-id="${item.id}">
                            <i class="fa-solid fa-trash-can"></i>
                            <span>Remove</span>
                        </button>
                    </article>
                `;
            }).join("")}
        </section>

        <aside class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
                <span>Items</span>
                <span>${itemCount}</span>
            </div>
            <div class="summary-row">
                <span>Subtotal</span>
                <strong>${formatCurrency(subtotal)}</strong>
            </div>
            <div class="summary-row">
                <span>Delivery</span>
                <strong>${deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}</strong>
            </div>
            ${deliveryFee > 0 ? `<div class="delivery-threshold-note">Add ${formatCurrency(500 - subtotal)} more for FREE delivery!</div>` : ""}
            <div class="summary-row total-row">
                <span>Estimated Total</span>
                <strong>${formatCurrency(total)}</strong>
            </div>
            <a class="cart-action primary" href="checkout.html">Checkout</a>
            <button class="cart-action secondary" type="button" data-action="clear">Clear Cart</button>
        </aside>
    `;
}

cartContent?.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const productId = Number(button.dataset.id);
    const cart = getCart();
    const item = cart.find(product => product.id === productId);

    if (action === "clear") {
        saveCart([]);
    } else if (action === "remove") {
        saveCart(cart.filter(product => product.id !== productId));
    } else if (item && action === "increase") {
        item.quantity = (Number(item.quantity) || 1) + 1;
        saveCart(cart);
    } else if (item && action === "decrease") {
        const nextQty = (Number(item.quantity) || 1) - 1;
        if (nextQty <= 0) {
            saveCart(cart.filter(product => product.id !== productId));
        } else {
            item.quantity = nextQty;
            saveCart(cart);
        }
    }

    window.dispatchEvent(new Event("storage"));
    updateCart();
});

window.addEventListener("storage", updateCart);

updateCart();
