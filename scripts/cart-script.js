//------------------------------------------
//-------------MOBILE-TOGGLE---------------
//------------------------------------------

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

mobileMenuBtn.addEventListener("click", toggleMobileMenu);

function toggleMobileMenu() {
    navLinks.classList.toggle("open");

    // Toggle icon between bars → X
    mobileMenuBtn.innerHTML = navLinks.classList.contains("open")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
}

//---------------------------------------------------
// AUTHENTICATION — SHOW MODAL IF NOT LOGGED IN
//---------------------------------------------------

let users = JSON.parse(localStorage.getItem("users") || "[]");
let currentUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

const unauthBox = document.getElementById("unauthorize");
const pageContent = document.getElementById("page-content");

function checkAuthorization() {
    if (!currentUser) {
        unauthBox.style.display = "flex";
        pageContent.classList.add("page-locked");
    } else {
        unauthBox.style.display = "none";
        pageContent.classList.remove("page-locked");
    }
}

checkAuthorization();

//------------------------------------------
//--------------- TOAST --------------------
//------------------------------------------

function showToast(message, color) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    toast.style.backgroundColor = color;

    setTimeout(() => toast.classList.remove("show"), 2000);
}

//------------------------------------------
//----------LOAD USER CART-----------
//------------------------------------------

function getCurrentCart() {
    return JSON.parse(localStorage.getItem("currentUserCart")) || [];
}

let currentUserCart = getCurrentCart();

//-------------SAVE CARTS--------------

function saveCurrentUserCart(email, updatedCart) {
    localStorage.setItem("currentUserCart", JSON.stringify(updatedCart));

    let allCarts = JSON.parse(localStorage.getItem("carts")) || {};
    allCarts[email] = updatedCart;

    localStorage.setItem("carts", JSON.stringify(allCarts));

    currentUserCart = updatedCart;
}


//-------------REMOVE FROM CART---------

function removeFromCart(productId, email) {
    let cart = getCurrentCart().filter(item => item.id !== productId);

    updateCartBadge();
    saveCurrentUserCart(email, cart);
    renderProducts();
}

//---------------------------------------------------
//               RENDER HELPER
//---------------------------------------------------

function createProductCard(product) {
    const div = document.createElement("div");
    div.className = "product-card";

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
                <div class="qty-wrapper">
                    <button class="minus-btn">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="quantity">${product.quantity}</span>
                    <button class="plus-btn">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        <button class="btn btn-primary remove-cart-btn">Remove from Cart</button>
        <input type="checkbox" class="product-select" ${product.checked ? "checked" : ""}>
    `;

    div.querySelector(".remove-cart-btn").addEventListener("click", () => {
        removeFromCart(product.id, currentUser.email);
    });

    div.querySelector(".minus-btn").addEventListener("click", () => {
        minusQuantity(product, currentUser.email);
    });

    div.querySelector(".plus-btn").addEventListener("click", () => {
        plusQuantity(product, currentUser.email);
    });

    div.querySelector(".product-select").addEventListener("change", (e) => {
        toggleProductCheck(product.id, e.target.checked, currentUser.email);
    });

    return div;
}

//---------------------------------------------------
//               RENDER ALL PRODUCTS
//---------------------------------------------------

function renderProducts() {
    const emptyCartElement = document.getElementById("empty-cart");
    const grid = document.getElementById("product-grid");

    if (currentUserCart.length === 0){
        emptyCartElement.style.display = "flex";
        grid.innerHTML = "";
        updateCheckoutList();
        updateCartBadge();

        document.getElementById("select-all-btn").style.display = "none";
        document.getElementById("remove-selected-btn").style.display = "none";
        return;
    }

    emptyCartElement.style.display = "none";
    grid.innerHTML = "";

    currentUserCart.forEach(product =>
        grid.appendChild(createProductCard(product))
    );

    updateCheckoutList();
    updateCartBadge();

    const allChecked = currentUserCart.every(item => item.checked);
    document.getElementById("select-all-btn").textContent =
        allChecked ? "Unselect All" : "Select All";

    document.getElementById("select-all-btn").style.display = "inline-block";
    document.getElementById("remove-selected-btn").style.display = "inline-block";
}


renderProducts();


//---------------------------------------------------
//               UPDATE QUANTITY
//---------------------------------------------------

function updateQuantity(productId, newQuantity, email) {
    let cart = getCurrentCart();

    cart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.price } : item
    );

    saveCurrentUserCart(email, cart);
    renderProducts();
 
}

//---------------------------------------------------
//               QUANTITY HANDLERS
//---------------------------------------------------

function minusQuantity(product, email) {
    const newQuantity = parseInt(product.quantity) - 1;

    if (newQuantity <= 0) {
        removeFromCart(product.id, email);
        return;
    }

    updateQuantity(product.id, newQuantity, email);
    updateCartBadge();

}

function plusQuantity(product, email) {
    const newQuantity = parseInt(product.quantity) + 1;
    if (newQuantity >= 10) {
        showToast("Limited Stock Available Only", "red");
        return;
    }
    updateQuantity(product.id, newQuantity, email);
    updateCartBadge();

}


//------------------------------------------
//        CHECKLIST — LIVE UPDATE
//------------------------------------------

function updateCheckoutList() {
    const checklist = document.querySelector(".checkout-items");
    const totalBox = document.querySelector(".checkout-total span:last-child");

    const checkboxes = document.querySelectorAll(".product-select");

    checklist.innerHTML = "";
    let totalAmount = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const card = checkbox.closest(".product-card");

            const title = card.querySelector(".title").textContent;
            const quantity = parseInt(card.querySelector(".quantity").textContent);
            const price = parseFloat(card.querySelector(".price").textContent.replace("$", ""));
            const totalPrice = price * quantity;

            totalAmount += totalPrice;

            const li = document.createElement("li");
            li.innerHTML = `
                <span>${quantity} × ${title.slice(0,20) + "..."}</span>
                <span>$${totalPrice.toFixed(2)}</span>
            `;

            checklist.appendChild(li);
        }
    });

    totalBox.textContent = `$${totalAmount.toFixed(2)}`;
}


//------------------------------------------
//     TOGGLE PRODUCT CHECK
//------------------------------------------

function toggleProductCheck(productId, status, email) {
    let cart = getCurrentCart();

    cart = cart.map(item =>
        item.id === productId ? { ...item, checked: status } : item
    );

    saveCurrentUserCart(email, cart);
    updateCheckoutList();
    renderProducts();
}


//---------------------------------------------------
//               SELECT ALL / UNSELECT ALL
//---------------------------------------------------

document.getElementById("select-all-btn").addEventListener("click", toggleSelectAll);

function toggleSelectAll() {
    let cart = getCurrentCart();
    const allChecked = cart.every(item => item.checked === true);

    cart = cart.map(item => ({
        ...item,
        checked: !allChecked
    }));

    saveCurrentUserCart(currentUser.email, cart);

    renderProducts();
    updateCartBadge();

    document.getElementById("select-all-btn").textContent =
        allChecked ? "Select All" : "Unselect All";    
}

//---------------------------------------------------
//               REMOVE SELECTED
//---------------------------------------------------

document.getElementById("remove-selected-btn").addEventListener("click", removeSelected);

function removeSelected() {
    let cart = getCurrentCart();

    const remaining = cart.filter(item => !item.checked);

    saveCurrentUserCart(currentUser.email, remaining);
    renderProducts();
    updateCartBadge();

    showToast("Selected items removed", "#01fd01");
}

//---------------------------------------------------
//               UPDATE CART BADGE
//---------------------------------------------------

function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    const cart = getCurrentCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (count > 0) {
        badge.textContent = count;
        badge.classList.add("show");
    } else {
        badge.textContent = 0;
        badge.classList.remove("show");
    }
}


/* -------------------------------
   RAZORPAY INTEGRATION
--------------------------------*/

document.querySelector(".checkout-btn").addEventListener("click", dummyCheckout);

function dummyCheckout() {
    
    const cart = getCurrentCart();
    const selectedItems = cart.filter(item => item.checked);

    if (selectedItems.length === 0) {
        showToast("Please select at least 1 item!", "red");
        return;
    }

    const totalAmount = selectedItems.reduce((sum, item) =>
        sum + item.price * item.quantity, 0
    );

    const options = {
        key: "rzp_test_RobdfysSIFD3Po", // dummy test key

        // Convert Rupees → Paisa (required)
        amount: totalAmount * 100, 
        currency: "INR",

        name: "MeShop Checkout",
        description: "Test Payment — No backend used",

        handler: function (response) {
            showToast("Payment Successful! (Dummy)", "#01fd01");
            clearSelectedItemsAfterPayment();
        },

        prefill: {
            name: currentUser?.fullname || "Guest User",
            email: currentUser?.email || "guest@example.com",
            contact: "9999999999"
        },

        theme: {
            color: "#000"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function clearSelectedItemsAfterPayment() {
    let cart = getCurrentCart();
    cart = cart.filter(item => !item.checked);

    saveCurrentUserCart(currentUser.email, cart);
    renderProducts();
    updateCartBadge();
}
