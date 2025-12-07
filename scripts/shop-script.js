//------------------------------------------
//------------- MOBILE TOGGLE --------------
//------------------------------------------

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    mobileMenuBtn.innerHTML = navLinks.classList.contains("open")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

//------------------------------------------
//----------- AUTH CHECK -------------------
//------------------------------------------

const unauthBox = document.getElementById("unauthorize");
const pageContent = document.getElementById("page-content");
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

function checkAuthorization() {
    if (!currentUser) {
        unauthBox.style.display = "flex";
        pageContent.classList.add("page-locked");
    }
}

checkAuthorization();

//------------------------------------------
//--------------- TOAST --------------------
//------------------------------------------

function showToast(message, color = "#000") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    toast.style.backgroundColor = color;

    setTimeout(() => toast.classList.remove("show"), 2000);
}

// ---------------------------
// FILTER SIDEBAR TOGGLE (Mobile)
// ---------------------------

const filterToggleOpenBtn = document.getElementById("filter-toggle-open-btn");
const filterToggleCloseBtn = document.getElementById("filter-toggle-close-btn");
const filterSidebar = document.querySelector(".filter-sidebar");

if (filterToggleOpenBtn) {
    filterToggleOpenBtn.addEventListener("click", () => {
        filterSidebar.classList.add("open");
        document.body.classList.add("no-scroll");
    });
}
if (filterToggleCloseBtn) {
    filterToggleCloseBtn.addEventListener("click", () => {
        filterSidebar.classList.remove("open");
        document.body.classList.remove("no-scroll");
    });
}

//------------------------------------------
//------------- PRODUCT ENRICHMENT ----------
//------------------------------------------

// Stable pools (you can tweak these later)
const clothingColors = ["black", "white", "red", "blue", "green"];
const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const electronicsColors = ["black", "white", "silver", "grey"];
const jewelleryMaterials = ["Gold", "Silver", "Platinum", "Diamond", "Ruby", "Emerald", "Pearl"];

/**
 * pickUnique(arr, n) - returns n unique items from arr (or fewer if arr shorter)
 */
function pickUnique(arr, n) {
    const set = new Set();
    while (set.size < Math.min(n, arr.length)) {
        const idx = Math.floor(Math.random() * arr.length);
        set.add(arr[idx]);
    }
    return Array.from(set);
}

function getRatingColor(rate) {
    if (rate >= 4.5) return "#2ecc71";     // light green
    if (rate >= 4.0) return "#7bed9f";     // soft green
    if (rate >= 3.0) return "#f1c40f";     // yellow
    if (rate >= 2.0) return "#e67e22";     // orange
    return "#e74c3c";                      // red
}

/**
 * enrichProduct(product) - returns product copy with stable enrichment fields:
 * For clothing (men's/women's): product.colors (array), product.sizes (array)
 * For electronics: product.colors (array)
 * For jewellery: product.material (string)
 */
function enrichProduct(product) {
    const cat = (product.category || "").toLowerCase();
    const p = { ...product };

    // default fields to keep shape consistent
    p.colors = p.colors || [];
    p.sizes = p.sizes || [];
    p.material = p.material || null;

    if (cat.includes("clothing") || cat.includes("men") || cat.includes("women")) {
        // clothing -> give 2-3 colors and 2-3 sizes
        p.colors = pickUnique(clothingColors, 3);
        p.sizes = pickUnique(clothingSizes, 3).sort((a, b) => clothingSizes.indexOf(a) - clothingSizes.indexOf(b));
    } else if (cat.includes("electronics")) {
        p.colors = pickUnique(electronicsColors, 2);
    } else if (cat.includes("jewel") || cat.includes("jewellery") || cat.includes("jewelery")) {
        p.material = jewelleryMaterials[Math.floor(Math.random() * jewelleryMaterials.length)];
    }

    return p;
}

/**
 * saveProductsToStorage(products) - overwrite localStorage.products
 */
function saveProductsToStorage(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

/**
 * loadProductsFromStorage() - return array or null
 */
function loadProductsFromStorage() {
    try {
        const raw = localStorage.getItem("products");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed parse stored products", e);
        return null;
    }
}

//------------------------------------------
//------------- FETCH / LOAD ---------------
//------------------------------------------

let allProducts = []; // enriched products (persistent)
async function loadProducts() {
    // try localStorage first (enriched)
    const stored = loadProductsFromStorage();
    if (stored && Array.isArray(stored) && stored.length > 0) {
        allProducts = stored;
        renderAllCategories();
        return;
    }

    // otherwise fetch and enrich, then store
    try {
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const apiProducts = await res.json();

        allProducts = apiProducts.map(p => enrichProduct(p));
        saveProductsToStorage(allProducts);

        renderAllCategories();
    } catch (err) {
        console.error("Failed to load products", err);
        showToast("Failed to load products", "red");
    }
}

loadProducts();

//------------------------------------------
//----------- CATEGORY FILTERING -----------
//------------------------------------------

function getCategoryData(category) {
    return allProducts.filter(p => p.category === category);
}

//------------------------------------------
//------------- RENDER HELPERS -------------
//------------------------------------------

function createClothingProductCard(product) {
    const div = document.createElement("div");
    div.className = "product-card";

    // Use product.colors and product.sizes (enriched, stable)
    const colours = product.colors && product.colors.length ? product.colors : ["black", "white"];
    const sizes = product.sizes && product.sizes.length ? product.sizes : ["M", "L"];
    const rate = product.rating?.rate || 4.0;
    
    div.innerHTML = `
        <div class="card-img">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="card-details">
            <div class="card-row">
                <h3 class="title">${product.title}</h3>
            </div>
            <div class="card-row">
                <span class="price">$${product.price}</span>
                <span class="sizes">${sizes.slice(0, 3).join(', ')}</span>
            </div>
            <div class="card-row">
                <div class="colors">
                    ${colours.slice(0, 3).map(c => `<span class="dot ${c}"></span>`).join('')}
                </div>
                <div class="rating-badge" style="background:${getRatingColor(rate)}">
                    ${rate.toFixed(1)} ★
                </div>
            </div>
        </div>
        <button class="btn btn-primary add-cart-btn">Add To Cart</button>
    `;

    div.querySelector(".add-cart-btn").addEventListener("click", () => {
        addToCart(product, currentUser && currentUser.email);
    });

    return div;
}

function createJewelleryProductCard(product) {
    const div = document.createElement("div");
    div.className = "product-card";

    const material = product.material || "Gold";
    const rate = product.rating?.rate || 4.0;

    div.innerHTML = `
        <div class="card-img">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="card-details">
            <div class="card-row">
                <h3 class="title">${product.title}</h3>
            </div>
            <div class="card-row">
                <span class="price">$${product.price}</span>
            </div>
            <div class="card-row">
                <div class="material-type"><span class="material">${material}</span></div>
                <div class="rating-badge" style="background:${getRatingColor(rate)}">
                    ${rate.toFixed(1)} ★
                </div>
            </div>
        </div>
        <button class="btn btn-primary add-cart-btn">Add To Cart</button>
    `;

    div.querySelector(".add-cart-btn").addEventListener("click", () => {
        addToCart(product, currentUser && currentUser.email);
    });

    return div;
}

function createElectronicsProductCard(product) {
    const div = document.createElement("div");
    div.className = "product-card";

    const colours = product.colors && product.colors.length ? product.colors : ["black", "white"];
    const rate = product.rating?.rate || 4.0;

    div.innerHTML = `
        <div class="card-img">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="card-details">
            <div class="card-row">
                <h3 class="title">${product.title}</h3>
            </div>
            <div class="card-row">
                <span class="price">$${product.price}</span>
            </div>
            <div class="card-row">
                <div class="colors">
                    ${colours.slice(0, 2).map(c => `<span class="dot ${c}"></span>`).join('')}
                </div>
                <div class="rating-badge" style="background:${getRatingColor(rate)}">
                    ${rate.toFixed(1)} ★
                </div>
            </div>
        </div>
        <button class="btn btn-primary add-cart-btn">Add To Cart</button>
    `;

    div.querySelector(".add-cart-btn").addEventListener("click", () => {
        addToCart(product, currentUser && currentUser.email);
    });

    return div;
}

//------------------------------------------
//---------- RENDER ALL CATEGORIES ---------
//------------------------------------------

function renderMensCategory() {
    const sectionCategory = document.getElementById("mens-category");
    const grid = document.getElementById("mens-product-grid");
    const mensData = getCategoryData("men's clothing") || [];

    sectionCategory.style.display = "block";
    grid.innerHTML = "";

    mensData.forEach(product => grid.appendChild(createClothingProductCard(product)));
}

function renderWomensCategory() {
    const sectionCategory = document.getElementById("womens-category");
    const grid = document.getElementById("womens-product-grid");
    const womensData = getCategoryData("women's clothing") || [];

    sectionCategory.style.display = "block";
    grid.innerHTML = "";

    womensData.forEach(product => grid.appendChild(createClothingProductCard(product)));
}

function renderJewelleryCategory() {
    const sectionCategory = document.getElementById("jewellery-category");
    const grid = document.getElementById("jewellery-product-grid");
    const jewelleryData = getCategoryData("jewelery") || [];

    sectionCategory.style.display = "block";
    grid.innerHTML = "";

    jewelleryData.forEach(product => grid.appendChild(createJewelleryProductCard(product)));
}

function renderElectronicsCategory() {
    const sectionCategory = document.getElementById("electronics-category");
    const grid = document.getElementById("electronics-product-grid");
    const electronicsData = getCategoryData("electronics") || [];

    sectionCategory.style.display = "block";
    grid.innerHTML = "";

    electronicsData.forEach(product => grid.appendChild(createElectronicsProductCard(product)));
}

function renderAllCategories() {
    renderMensCategory();
    renderWomensCategory();
    renderJewelleryCategory();
    renderElectronicsCategory();
}

//------------------------------------------
//----------SHOW ONLY SELECTED TAB----------
//------------------------------------------

function showOnly(sectionId) {
    const sections = [
        "mens-category",
        "womens-category",
        "jewellery-category",
        "electronics-category"
    ];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = (id === sectionId ? "block" : "none");
    });
}

//------------------------------------------
//---------------ACTIVE TAB-----------------
//------------------------------------------

function setActiveTab(btn) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}


//------------------------------------------
//---------- FILTERS FOR CATEGORY ----------
//------------------------------------------

function showFilterForCategory(category) {

    document.querySelectorAll(".filter-section").forEach(sec => sec.classList.remove("active"));

    if (category === "all") {
        const c = document.getElementById("filter-clothing");
        const j = document.getElementById("filter-jewellery");
        const e = document.getElementById("filter-electronics");
        if (c) c.classList.add("active");
        if (j) j.classList.add("active");
        if (e) e.classList.add("active");
    }

    if (category === "mens" || category === "womens") {
        const c = document.getElementById("filter-clothing");
        if (c) c.classList.add("active");
    }

    if (category === "jewellery") {
        const j = document.getElementById("filter-jewellery");
        if (j) j.classList.add("active");
    }

    if (category === "electronics") {
        const e = document.getElementById("filter-electronics");
        if (e) e.classList.add("active");
    }
}

showFilterForCategory("all");

//------------------------------------------
//----------LOAD USER CART & SAVE/GET ------
//------------------------------------------

let allCarts = JSON.parse(localStorage.getItem("carts")) || {};

function loadUserCart(email) {
    if (!email) return;
    if (!allCarts[email]) allCarts[email] = [];
    saveCurrentUserCart(email, allCarts[email]);
}

if (currentUser && currentUser.email) loadUserCart(currentUser.email);

//-------------SAVE CARTS--------------
function saveCurrentUserCart(email, updatedCart) {
    if (!email) return;
    localStorage.setItem("currentUserCart", JSON.stringify(updatedCart));

    let all = JSON.parse(localStorage.getItem("carts")) || {};
    all[email] = updatedCart;
    localStorage.setItem("carts", JSON.stringify(all));

    // update global var too
    allCarts = all;
}

// get current user's cart (from storage)
function getCurrentCart() {
    return JSON.parse(localStorage.getItem("currentUserCart")) || [];
}

//------------ADD TO CART ----------
function addToCart(product, email) {
    if (!email) {
        showToast("Please login to add to cart", "#ff6961");
        return;
    }

    const cart = getCurrentCart();
    // check if product already exists in cart  
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity = (existing.quantity || 0) + 1;
        existing.totalPrice = Number((existing.price * existing.quantity).toFixed(2));
    } else {
        cart.push({
            ...product,
            quantity: 1,
            price: product.price,
            totalPrice: Number(product.price)
        });
    }

    saveCurrentUserCart(email, cart);
    updateCartBadge();
    showToast("Added to Cart!", "#01fd01");
}

//-------------REMOVE FROM CART---------
// accepts productId (number) or product object
function removeFromCart(productId, email) {
    if (!email) return;
    const id = (typeof productId === "object" && productId.id) ? productId.id : productId;
    const newCart = getCurrentCart().filter(item => item.id !== id);
    saveCurrentUserCart(email, newCart);
    updateCartBadge();
}

//---------------------------------------------------
//               UPDATE CART BADGE
//---------------------------------------------------

function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    const cart = getCurrentCart();
    const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    if (count > 0) {
        badge.textContent = count;
        badge.classList.add("show");
    } else {
        badge.textContent = 0;
        badge.classList.remove("show");
    }
}

updateCartBadge();

// Expose some functions to console for debugging (_meShop.reloadProducts())
window._meShop = {
    allProducts,
    reloadProducts: () => { localStorage.removeItem("products"); loadProducts(); },
    getCurrentCart,
    saveCurrentUserCart,
    removeFromCart,
    addToCart,
    updateCartBadge
};


//------------------------------------------
//               SEARCH FILTER
//------------------------------------------

const searchInput = document.getElementById("search-input");

// Detect which category is currently visible
function getActiveCategory() {
    const activeBtn = document.querySelector(".tab-btn.active");

    if (!activeBtn) return "all";

    const id = activeBtn.id;

    if (id === "all-category-btn") return "all";
    if (id === "mens-category-btn") return "mens";
    if (id === "womens-category-btn") return "womens";
    if (id === "jewellery-category-btn") return "jewellery";
    if (id === "electronics-category-btn") return "electronics";

    return "all";
}


// Filter helper (case insensitive)
function searchProducts(list, query) {
    query = query.toLowerCase();
    return list.filter(p => p.title.toLowerCase().includes(query));
}

// Re-render based on search
function applySearch() {
    const query = searchInput.value.trim().toLowerCase();
    const active = getActiveCategory();

    if (query === "") {
        // Empty search → restore default rendering
        if (active === "all") renderAllCategories();
        if (active === "mens") renderMensCategory();
        if (active === "womens") renderWomensCategory();
        if (active === "jewellery") renderJewelleryCategory();
        if (active === "electronics") renderElectronicsCategory();
        return;
    }

    let filtered;

    switch (active) {
        case "mens":
            filtered = searchProducts(getCategoryData("men's clothing"), query);
            renderSearchResults("mens-product-grid", filtered, createClothingProductCard);
            break;

        case "womens":
            filtered = searchProducts(getCategoryData("women's clothing"), query);
            renderSearchResults("womens-product-grid", filtered, createClothingProductCard);
            break;

        case "jewellery":
            filtered = searchProducts(getCategoryData("jewelery"), query);
            renderSearchResults("jewellery-product-grid", filtered, createJewelleryProductCard);
            break;

        case "electronics":
            filtered = searchProducts(getCategoryData("electronics"), query);
            renderSearchResults("electronics-product-grid", filtered, createElectronicsProductCard);
            break;

        case "all":
        default:
            renderSearchAcrossAllCategories(query);
    }
}

// Helper to render search inside one category container
function renderSearchResults(gridId, list, cardFunc) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = "";
    list.forEach(product => grid.appendChild(cardFunc(product)));
}

// Search inside all categories simultaneously
function renderSearchAcrossAllCategories(query) {
    // Mens
    renderSearchResults(
        "mens-product-grid",
        searchProducts(getCategoryData("men's clothing"), query),
        createClothingProductCard
    );

    // Womens
    renderSearchResults(
        "womens-product-grid",
        searchProducts(getCategoryData("women's clothing"), query),
        createClothingProductCard
    );

    // Jewellery
    renderSearchResults(
        "jewellery-product-grid",
        searchProducts(getCategoryData("jewelery"), query),
        createJewelleryProductCard
    );

    // Electronics
    renderSearchResults(
        "electronics-product-grid",
        searchProducts(getCategoryData("electronics"), query),
        createElectronicsProductCard
    );
}

// Live search listener
searchInput.addEventListener("input", applySearch);
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        applySearch();
    }
});

/* ======================================================
   ADVANCED FILTER ENGINE (Option A: Persistent Filters
   — but each category only applies its own filters)
   ====================================================== */

// Track current tab (needed to know which category to render)
let currentView = "all";

// Override your tab click handlers — after rendering,
// instead of calling only applySearch(), you must call updateView()

document.getElementById("all-category-btn").addEventListener("click", (e) => {
    currentView = "all";
    setActiveTab(e.target);
    showFilterForCategory("all");
    updateView();
});

document.getElementById("mens-category-btn").addEventListener("click", (e) => {
    currentView = "mens";
    setActiveTab(e.target);
    showFilterForCategory("mens");
    updateView();
});

document.getElementById("womens-category-btn").addEventListener("click", (e) => {
    currentView = "womens";
    setActiveTab(e.target);
    showFilterForCategory("womens");
    updateView();
});

document.getElementById("jewellery-category-btn").addEventListener("click", (e) => {
    currentView = "jewellery";
    setActiveTab(e.target);
    showFilterForCategory("jewellery");
    updateView();
});

document.getElementById("electronics-category-btn").addEventListener("click", (e) => {
    currentView = "electronics";
    setActiveTab(e.target);
    showFilterForCategory("electronics");
    updateView();
});

// Filter checkbox listeners
document.querySelectorAll(".filter-sidebar input[type='checkbox']")
    .forEach(box => box.addEventListener("change", updateView));

// Rating slider listener
if (document.querySelector(".range-slider")) {
    document.querySelector(".range-slider").addEventListener("input", updateView);
}

// Price ranges listener
document.querySelectorAll("input[data-price]")
    .forEach(box => box.addEventListener("change", updateView));

/* -------------------------------
   READ FILTERS PER CATEGORY
--------------------------------*/

function readClothingFilters() {
    return {
        colors: [...document.querySelectorAll('#filter-clothing input[data-color]:checked')]
            .map(i => i.dataset.color),

        sizes: [...document.querySelectorAll('#filter-clothing input[data-size]:checked')]
            .map(i => i.dataset.size)
    };
}

function readJewelleryFilters() {
    return {
        materials: [...document.querySelectorAll('#filter-jewellery input[data-material]:checked')]
            .map(i => i.dataset.material)
    };
}

function readElectronicsFilters() {
    return {
        colors: [...document.querySelectorAll('#filter-electronics input[data-color]:checked')]
            .map(i => i.dataset.color)
    };
}

function readSharedFilters() {
    return {
        priceRanges: [...document.querySelectorAll("input[data-price]:checked")]
            .map(i => i.dataset.price),

        ratingMin: Number(document.querySelector(".range-slider")?.value || 0),

        search: document.getElementById("search-input").value.trim().toLowerCase()
    };
}

/* -------------------------------
   PRICE RANGE CHECKER
--------------------------------*/
function matchesPriceRange(price, ranges) {
    if (!ranges.length) return true;

    return ranges.some(r => {
        if (r.endsWith("+")) {
            const min = parseFloat(r);
            return price >= min;
        } else {
            const [min, max] = r.split("-").map(Number);
            return price >= min && price <= max;
        }
    });
}

/* -------------------------------
   PRODUCT → FILTER MATCHING
--------------------------------*/
function productMatchesFilters(product) {
    const shared = readSharedFilters();
    const category = product.category.toLowerCase();

    // SEARCH
    if (!product.title.toLowerCase().includes(shared.search))
        return false;

    // PRICE
    if (!matchesPriceRange(product.price, shared.priceRanges))
        return false;

    // RATING
    if (shared.ratingMin && product.rating?.rate < shared.ratingMin)
        return false;

    // CATEGORY–SPECIFIC FILTERS
    if (category.includes("clothing")) {
        const f = readClothingFilters();

        if (f.colors.length && !product.colors.some(c => f.colors.includes(c)))
            return false;

        if (f.sizes.length && !product.sizes.some(s => f.sizes.includes(s)))
            return false;

        return true;
    }

    if (category.includes("jewel")) {
        const f = readJewelleryFilters();

        if (f.materials.length && !f.materials.includes(product.material))
            return false;

        return true;
    }

    if (category.includes("electronics")) {
        const f = readElectronicsFilters();

        if (f.colors.length && !product.colors.some(c => f.colors.includes(c)))
            return false;

        return true;
    }

    return true;
}

/* -------------------------------
   RENDER FILTERED CATEGORIES
--------------------------------*/
function renderFilteredMens() {
    const data = getCategoryData("men's clothing").filter(productMatchesFilters);
    const grid = document.getElementById("mens-product-grid");
    grid.innerHTML = "";
    data.forEach(p => grid.appendChild(createClothingProductCard(p)));
    document.getElementById("mens-category").style.display = "block";
}

function renderFilteredWomens() {
    const data = getCategoryData("women's clothing").filter(productMatchesFilters);
    const grid = document.getElementById("womens-product-grid");
    grid.innerHTML = "";
    data.forEach(p => grid.appendChild(createClothingProductCard(p)));
    document.getElementById("womens-category").style.display = "block";
}

function renderFilteredJewellery() {
    const data = getCategoryData("jewelery").filter(productMatchesFilters);
    const grid = document.getElementById("jewellery-product-grid");
    grid.innerHTML = "";
    data.forEach(p => grid.appendChild(createJewelleryProductCard(p)));
    document.getElementById("jewellery-category").style.display = "block";
}

function renderFilteredElectronics() {
    const data = getCategoryData("electronics").filter(productMatchesFilters);
    const grid = document.getElementById("electronics-product-grid");
    grid.innerHTML = "";
    data.forEach(p => grid.appendChild(createElectronicsProductCard(p)));
    document.getElementById("electronics-category").style.display = "block";
}

/* -------------------------------
   MASTER UPDATE FUNCTION
--------------------------------*/
function updateView() {
    const view = currentView;

    // Always apply filters + search
    if (view === "all") {
        renderFilteredMens();
        renderFilteredWomens();
        renderFilteredJewellery();
        renderFilteredElectronics();
        return;
    }

    // Single category modes
    if (view === "mens") {
        renderFilteredMens();
        showOnly("mens-category");
        return;
    }
    if (view === "womens") {
        renderFilteredWomens();
        showOnly("womens-category");
        return;
    }
    if (view === "jewellery") {
        renderFilteredJewellery();
        showOnly("jewellery-category");
        return;
    }
    if (view === "electronics") {
        renderFilteredElectronics();
        showOnly("electronics-category");
        return;
    }
}


