// =====================================================
// MAHI LIFE STYLE
// FAKE STORE API
// =====================================================


// API URL
const API_URL = "https://fakestoreapi.com/products";


// Get HTML elements
const productsContainer =
    document.getElementById("productsContainer");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const searchInput =
    document.querySelector(".search-box input");

const searchButton =
    document.querySelector(".search-box button");


// Store all products
let allProducts = [];

let selectedCategory = "all";

function formatCategory(category) {
    return category
        .replace("jewelery", "jewellery")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}


// =====================================================
// FETCH PRODUCTS
// =====================================================

async function fetchProducts() {

    try {

        // Show loading
        productsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                Loading products...
            </div>
        `;


        // Fetch API
        const response = await fetch(API_URL);


        // Check response
        if (!response.ok) {

            throw new Error(
                "Unable to fetch products"
            );

        }


        // Convert response to JSON
        const products = await response.json();


        // Store products
        allProducts = products;


        // Display products
        displayProducts(products);


    } catch (error) {

        console.error(
            "API Error:",
            error
        );


        productsContainer.innerHTML = `
            <div class="api-error">
                <i class="fas fa-triangle-exclamation"></i>
                <p>
                    Unable to load products.
                    Please try again later.
                </p>
            </div>
        `;

    }

}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayProducts(products) {


    // Clear existing products
    productsContainer.innerHTML = "";


    // If no products
    if (products.length === 0) {

        productsContainer.innerHTML = `
            <div class="api-error">
                No products found.
            </div>
        `;

        return;
    }


    // Create product cards
    products.forEach(product => {


        // Create card
        const productCard =
            document.createElement("div");


        productCard.className =
            "product-card";

        productCard.addEventListener("click", event => {
            if (event.target.closest("button")) {
                return;
            }

            window.location.href = `product.html?id=${product.id}`;
        });


        // Product rating
        const rating =
            product.rating?.rate || 0;


        const ratingCount =
            product.rating?.count || 0;


        // Product category
        const category =
            formatCategory(product.category);


        // Product card HTML
        productCard.innerHTML = `

            <!-- Product Image -->
            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.title}"
                    loading="lazy"
                >

                <!-- Wishlist -->
                <button
                    class="product-wishlist"
                    title="Add to Wishlist"
                    onclick="addToWishlist(${product.id}, this)"
                >

                    <i class="fa-regular fa-heart"></i>

                </button>

            </div>


            <!-- Product Information -->
            <div class="product-info">


                <!-- Category -->
                <span class="product-category">
                    ${category}
                </span>


                <!-- Title -->
                <h3 class="product-title">
                    ${product.title}
                </h3>


                <!-- Rating -->
                <div class="product-rating">

                    <i class="fas fa-star"></i>

                    <strong>
                        ${rating}
                    </strong>

                    <span>
                        (${ratingCount})
                    </span>

                </div>


                <!-- Price -->
                <div class="product-price">

                    <span class="price">
                        ₹${convertToINR(product.price)}
                    </span>

                </div>


                <div class="product-actions">
                    ${getCartActionMarkup(product)}

                    <button
                        class="buy-now-btn"
                        onclick="buyNow(${product.id})"
                    >
                        <i class="fas fa-bolt"></i>
                        Buy Now
                    </button>
                </div>


            </div>

        `;


        // Add card to page
        productsContainer.appendChild(
            productCard
        );

    });

}


// =====================================================
// CONVERT USD TO INR
// =====================================================

function convertToINR(price) {

    // Approximate conversion
    const exchangeRate = 90;

    return Math.round(
        price * exchangeRate
    );

}

function getCartQuantity(productId) {
    const cart = JSON.parse(localStorage.getItem("mahiCart")) || [];
    return cart.find(item => item.id === productId)?.quantity || 0;
}

function getCartActionMarkup(product) {
    const quantity = getCartQuantity(product.id);

    if (quantity === 0) {
        return `
            <button
                class="add-cart-btn"
                onclick="addToCart(${product.id})"
            >
                <i class="fas fa-cart-plus"></i>
                Add to Cart
            </button>
        `;
    }

    return `
        <div class="quantity-control product-quantity-control" aria-label="Quantity for ${product.title}">
            <button type="button" onclick="decreaseCartQuantity(${product.id})" aria-label="Decrease quantity">-</button>
            <strong>${quantity}</strong>
            <button type="button" onclick="increaseCartQuantity(${product.id})" aria-label="Increase quantity">+</button>
        </div>
    `;
}

function refreshProductCartAction(productId) {
    const productCard = [...productsContainer.children].find(card =>
        card.querySelector(`button[onclick*="${productId}"]`)
    );

    if (!productCard) return;

    const product = allProducts.find(item => item.id === productId);
    const actions = productCard.querySelector(".product-actions");
    const buyButton = actions.querySelector(".buy-now-btn");
    actions.innerHTML = `${getCartActionMarkup(product)}${buyButton.outerHTML}`;
}


function filterProducts() {

    const searchTerm =
        searchInput?.value.trim().toLowerCase() || "";

    productsContainer.classList.add("is-filtering");

    const filteredProducts =
        allProducts.filter(product => {
            const matchesCategory =
                selectedCategory === "all" ||
                product.category === selectedCategory;

            const matchesSearch =
                !searchTerm ||
                product.title.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm);

            return matchesCategory && matchesSearch;
        });

    displayProducts(filteredProducts);

    requestAnimationFrame(() => {
        productsContainer.classList.remove("is-filtering");
    });

}


searchInput?.addEventListener(
    "input",
    filterProducts
);

searchButton?.addEventListener(
    "click",
    filterProducts
);


// =====================================================
// CATEGORY FILTER
// =====================================================

categoryButtons.forEach(button => {

    button.setAttribute(
        "aria-pressed",
        button.classList.contains("active")
    );

    button.addEventListener(
        "click",
        () => {


            // Remove active
            categoryButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );
                btn.setAttribute("aria-pressed", "false");

            });


            // Add active
            button.classList.add(
                "active"
            );
            button.setAttribute("aria-pressed", "true");


            // Get category
            selectedCategory =
                button.dataset.category;

            filterProducts();

            requestAnimationFrame(() => {
                productsContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });

        }
    );

});


// =====================================================
// ADD TO CART
// =====================================================

function addToCart(productId) {


    // Find product
    const product =
        allProducts.find(
            item => item.id === productId
        );


    if (!product) {

        return;

    }


    // Get existing cart
    let cart =
        JSON.parse(
            localStorage.getItem("mahiCart")
        ) || [];


    // Check if product already exists
    const existingProduct =
        cart.find(
            item => item.id === productId
        );


    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({

            id: product.id,

            title: product.title,

            price: product.price,

            image: product.image,

            quantity: 1

        });

    }


    // Save cart
    localStorage.setItem(
        "mahiCart",
        JSON.stringify(cart)
    );


    // Update cart count
    updateCartCount();
    refreshProductCartAction(productId);
    window.openCartPanel?.();


}


// Inline handlers in product cards need these functions on the window.
window.addToCart = addToCart;

function increaseCartQuantity(productId) {
    addToCart(productId);
}

function decreaseCartQuantity(productId) {
    const cart = JSON.parse(localStorage.getItem("mahiCart")) || [];
    const product = cart.find(item => item.id === productId);

    if (!product) return;

    product.quantity -= 1;
    localStorage.setItem(
        "mahiCart",
        JSON.stringify(cart.filter(item => item.quantity > 0))
    );
    updateCartCount();
    refreshProductCartAction(productId);
}

window.increaseCartQuantity = increaseCartQuantity;
window.decreaseCartQuantity = decreaseCartQuantity;


function buyNow(productId) {

    addToCart(productId);
    window.location.href = "cart.html";

}


window.buyNow = buyNow;


// =====================================================
// UPDATE CART COUNT
// =====================================================

function updateCartCount() {


    const cart =
        JSON.parse(
            localStorage.getItem("mahiCart")
        ) || [];


    // Total quantity
    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    // Find cart count
    const cartCount =
        document.querySelector(
            ".nav-icons a[title='Shopping Cart'] .count"
        );


    if (cartCount) {

        cartCount.textContent =
            totalItems;

    }

}


// =====================================================
// WISHLIST
// =====================================================

function addToWishlist(productId, button) {


    const product =
        allProducts.find(
            item => item.id === productId
        );


    if (!product) {

        return;

    }


    let wishlist =
        JSON.parse(
            localStorage.getItem(
                "mahiWishlist"
            )
        ) || [];


    const wishlistIndex =
        wishlist.findIndex(
            item => item.id === productId
        );


    if (wishlistIndex === -1) {

        wishlist.push(product);


        if (button) {
            button.classList.add("active");
            button.title = "Remove from Wishlist";
            button.querySelector("i")?.classList.replace(
                "fa-regular",
                "fa-solid"
            );
        }

    } else {

        wishlist.splice(wishlistIndex, 1);

        if (button) {
            button.classList.remove("active");
            button.title = "Add to Wishlist";
            button.querySelector("i")?.classList.replace(
                "fa-solid",
                "fa-regular"
            );
        }

    }

    localStorage.setItem(
        "mahiWishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

}


window.addToWishlist = addToWishlist;


function updateWishlistCount() {

    const wishlist =
        JSON.parse(
            localStorage.getItem("mahiWishlist")
        ) || [];

    const wishlistCount =
        document.querySelector(
            ".nav-icons a[title='Wishlist'] .count"
        );

    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }

}


// =====================================================
// INITIAL LOAD
// =====================================================

fetchProducts();


// Update cart count
updateCartCount();
updateWishlistCount();