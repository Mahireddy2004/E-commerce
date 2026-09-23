const API_URL = "https://fakestoreapi.com/products";
const productContent = document.getElementById("productContent");
const productId = new URLSearchParams(window.location.search).get("id");

function formatPrice(price) {
    return `₹${Math.round(price * 90).toLocaleString("en-IN")}`;
}

function formatCategory(category) {
    return category
        .replace("jewelery", "jewellery")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function addToCart(product, quantity) {
    const cart = JSON.parse(localStorage.getItem("mahiCart")) || [];
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity = (Number(existingProduct.quantity) || 0) + safeQuantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: safeQuantity
        });
    }

    localStorage.setItem("mahiCart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
}

function addToWishlist(product) {
    const wishlist = JSON.parse(localStorage.getItem("mahiWishlist")) || [];
    const wishlistIndex = wishlist.findIndex(item => item.id === product.id);

    if (wishlistIndex === -1) {
        wishlist.push(product);
    } else {
        wishlist.splice(wishlistIndex, 1);
    }

    localStorage.setItem("mahiWishlist", JSON.stringify(wishlist));

    const wishlistCount = document.querySelector(
        ".nav-icons a[title='Wishlist'] .count"
    );

    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }

    return wishlistIndex === -1;
}

async function loadProduct() {
    if (!productId) {
        productContent.innerHTML = `
            <section class="product-error">
                <h1>Product not found</h1>
                <a class="cart-action primary" href="index.html#products">Back to Products</a>
            </section>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) throw new Error("Product request failed");
        const product = await response.json();
        const rating = product.rating?.rate || 0;
        const ratingCount = product.rating?.count || 0;

        productContent.innerHTML = `
            <a class="product-back" href="index.html#products">
                <i class="fa-solid fa-arrow-left"></i> Back to Products
            </a>
            <section class="product-detail-card">
                <div class="product-detail-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-detail-info">
                    <span class="product-category">${formatCategory(product.category)}</span>
                    <h1>${product.title}</h1>
                    <div class="product-detail-rating">
                        <span><i class="fas fa-star"></i> ${rating}</span>
                        <span>${ratingCount} customer reviews</span>
                    </div>
                    <p class="product-detail-description">${product.description}</p>
                    <strong class="product-detail-price">${formatPrice(product.price)}</strong>
                    <div class="detail-purchase-row">
                        <div class="quantity-picker">
                            <span>Quantity</span>
                            <div class="quantity-control">
                                <button id="decreaseQuantity" type="button" aria-label="Decrease quantity">-</button>
                                <strong id="quantity">1</strong>
                                <button id="increaseQuantity" type="button" aria-label="Increase quantity">+</button>
                            </div>
                        </div>
                        <button class="detail-wishlist" id="wishlistButton" type="button" title="Add to Wishlist">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                    <div class="detail-actions">
                        <button class="cart-action primary" id="addCartButton" type="button">
                            <i class="fa-solid fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="cart-action detail-buy" id="buyButton" type="button">
                            <i class="fa-solid fa-bolt"></i> Buy Now
                        </button>
                    </div>
                    <div class="product-trust">
                        <span><i class="fa-solid fa-truck-fast"></i> Fast delivery</span>
                        <span><i class="fa-solid fa-shield-halved"></i> Secure checkout</span>
                    </div>
                </div>
            </section>
            <section class="related-products">
                <div class="related-heading">
                    <span class="products-tag">YOU MAY ALSO LIKE</span>
                    <h2>Related Products</h2>
                </div>
                <div class="related-grid" id="relatedGrid">
                    <p class="product-loading">Loading related products...</p>
                </div>
            </section>
        `;

        const quantityDisplay = document.getElementById("quantity");
        let quantity = 1;
        const updateQuantity = value => {
            quantity = Math.min(99, Math.max(1, value));
            quantityDisplay.textContent = quantity;
        };
        const getQuantity = () => quantity;

        document.getElementById("decreaseQuantity").addEventListener(
            "click",
            () => updateQuantity(quantity - 1)
        );

        document.getElementById("increaseQuantity").addEventListener(
            "click",
            () => updateQuantity(quantity + 1)
        );

        document.getElementById("addCartButton").addEventListener("click", event => {
            addToCart(product, getQuantity());
            const button = event.currentTarget;
            button.innerHTML = '<i class="fa-solid fa-check"></i> Added to Cart';
            button.classList.add("added");
            window.setTimeout(() => {
                button.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
                button.classList.remove("added");
            }, 1600);
        });

        document.getElementById("buyButton").addEventListener("click", () => {
            addToCart(product, getQuantity());
            window.location.href = "cart.html";
        });

        document.getElementById("wishlistButton").addEventListener("click", event => {
            const added = addToWishlist(product);
            event.currentTarget.classList.toggle("active", added);
            event.currentTarget.title = added
                ? "Remove from Wishlist"
                : "Add to Wishlist";
            event.currentTarget.innerHTML = `<i class="fa-${added ? "solid" : "regular"} fa-heart"></i>`;
        });

        const allProductsResponse = await fetch(API_URL);
        const allProducts = await allProductsResponse.json();
        const categoryProducts = allProducts
            .filter(item => item.id !== product.id && item.category === product.category)
            .slice(0, 4);
        const relatedProducts = categoryProducts.length > 0
            ? categoryProducts
            : allProducts
                .filter(item => item.id !== product.id)
                .slice(0, 4);

        document.getElementById("relatedGrid").innerHTML = relatedProducts.map(item => `
            <article class="related-card" data-product-url="product.html?id=${item.id}">
                <div class="related-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="related-info">
                    <span>${formatCategory(item.category)}</span>
                    <h3>${item.title}</h3>
                    <strong>${formatPrice(item.price)}</strong>
                    <div class="related-actions">
                        <button class="add-cart-btn" type="button" data-related-action="cart" data-product-id="${item.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="buy-now-btn" type="button" data-related-action="buy" data-product-id="${item.id}">
                            <i class="fas fa-bolt"></i> Buy Now
                        </button>
                    </div>
                </div>
            </article>
        `).join("");

        const relatedGrid = document.getElementById("relatedGrid");
        relatedGrid.addEventListener("click", event => {
            const button = event.target.closest("button[data-related-action]");
            const card = event.target.closest(".related-card");

            if (!card) return;

            if (!button) {
                window.location.href = card.dataset.productUrl;
                return;
            }

            const relatedProduct = relatedProducts.find(
                item => item.id === Number(button.dataset.productId)
            );

            if (relatedProduct) {
                addToCart(relatedProduct, 1);
                if (button.dataset.relatedAction === "buy") {
                    window.location.href = "cart.html";
                }
            }
        });
    } catch (error) {
        productContent.innerHTML = `
            <section class="product-error">
                <h1>Unable to load this product</h1>
                <p>Please try again from the products page.</p>
                <a class="cart-action primary" href="index.html#products">Back to Products</a>
            </section>
        `;
    }
}

loadProduct();
