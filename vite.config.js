import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(process.cwd(), "index.html"),
                cart: resolve(process.cwd(), "cart.html"),
                wishlist: resolve(process.cwd(), "wishlist.html"),
                login: resolve(process.cwd(), "login.html"),
                register: resolve(process.cwd(), "register.html"),
                profile: resolve(process.cwd(), "profile.html"),
                checkout: resolve(process.cwd(), "checkout.html"),
                product: resolve(process.cwd(), "product.html")
            }
        }
    }
});
