const wishlistContent = document.getElementById("wishlistContent");
const wishlistCount = document.getElementById("wishlistCount");
const cartCount = document.getElementById("cartCount");

function getWishlist() {
    return JSON.parse(localStorage.getItem("mahiWishlist")) || [];
}

function getCart() {
    return JSON.parse(localStorage.getItem("mahiCart")) || [];
}

function formatPrice(price) {
    return `₹${Math.round(price * 90).toLocaleString("en-IN")}`;
}

function formatCategory(category) {
    return category
        .replace("jewelery", "jewellery")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function updateCounts() {
    wishlistCount.textContent = getWishlist().length;
    cartCount.textContent = getCart().reduce(
        (total, item) => total + item.quantity,
        0
    );
}

function renderWishlist() {
    const wishlist = getWishlist();
    updateCounts();

    if (wishlist.length === 0) {
        wishlistContent.innerHTML = `
            <section class="empty-wishlist">
                <i class="fa-regular fa-heart"></i>
                <h2>Your wishlist is empty</h2>
                <p>Save products from the store to see them here.</p>
                <a class="cart-action primary" href="index.html#products">Explore Products</a>
            </section>
        `;
        return;
    }

    wishlistContent.innerHTML = wishlist.map(product => `
        <article class="wishlist-card">
            <div class="wishlist-card-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="wishlist-card-info">
                <span>${formatCategory(product.category)}</span>
                <h2>${product.title}</h2>
                <strong>${formatPrice(product.price)}</strong>
                <div class="wishlist-actions">
                    <button type="button" class="cart-action primary" data-action="cart" data-id="${product.id}">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button type="button" class="wishlist-remove" data-action="remove" data-id="${product.id}">
                        <i class="fa-solid fa-trash-can"></i> Remove
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

wishlistContent.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const productId = Number(button.dataset.id);
    const wishlist = getWishlist();

    if (button.dataset.action === "remove") {
        localStorage.setItem(
            "mahiWishlist",
            JSON.stringify(wishlist.filter(product => product.id !== productId))
        );
    }

    if (button.dataset.action === "cart") {
        const product = wishlist.find(item => item.id === productId);
        const cart = getCart();
        const cartItem = cart.find(item => item.id === productId);

        if (product) {
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }

            localStorage.setItem("mahiCart", JSON.stringify(cart));
        }
    }

    renderWishlist();
});

renderWishlist();
