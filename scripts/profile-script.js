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


//------------------------------------------
//----------EYE BUTTON (PASSWORD)-----------
//------------------------------------------

const oldPasswordInput = document.getElementById("oldPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");
const toggleOldPassword = document.getElementById('toggleOldPassword');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

toggleOldPassword.addEventListener('click', function () {
    const type = oldPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    oldPasswordInput.setAttribute('type', type);

    // Toggle the icon class (e.g., Font Awesome classes)
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

toggleNewPassword.addEventListener('click', function () {
    const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    newPasswordInput.setAttribute('type', type);

    // Toggle the icon class (e.g., Font Awesome classes)
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

toggleConfirmPassword.addEventListener('click', function () {
    const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmInput.setAttribute('type', type);

    // Toggle the icon class (e.g., Font Awesome classes)
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});


//---------------------------------------------------
// AUTHENTICATION — SHOW MODAL IF NOT LOGGED IN
//---------------------------------------------------

let users = JSON.parse(localStorage.getItem("users") || "[]");
let currentUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

const unauthBox = document.getElementById("unauthorize");
const pageContent = document.getElementById("page-content");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");

function checkAuthorization() {
    if (!currentUser) {
        unauthBox.style.display = "flex";
        pageContent.classList.add("page-locked");
    } else {
        unauthBox.style.display = "none";
        pageContent.classList.remove("page-locked");
        firstNameInput.value = currentUser.firstName;
        lastNameInput.value = currentUser.lastName;
    }
}

checkAuthorization();

//---------------------------------------------------
//              UPDATE PROFILE
//---------------------------------------------------

const saveNameForm = document.getElementById("change-username-form");

// HIDE ALL ALERTS
function hideAlerts() {
    document.querySelectorAll(".alert").forEach(alert => {
        alert.style.display = "none";
    });
}

hideAlerts();

//  UPDATE NAME
function updateName(e) {
    e.preventDefault();
    hideAlerts();

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    let isValid = true;

    if (!firstName) {
        showAlert("firstName-alert");
        isValid = false;
    }

    if (!lastName) {
        showAlert("lastName-alert");
        isValid = false;
    }

    if (!isValid) {
        if (!firstName) firstNameInput.focus();
        else if (!lastName) lastNameInput.focus();
        return;
    }


    currentUser.firstName = firstName;
    currentUser.lastName = lastName;

    const user = users.find(user => user.email === currentUser.email);
    user.firstName = firstName;
    user.lastName = lastName;

    saveUserInfo();
    saveCurrentUser();
    showToast("Profile Name Updated Successfully!");
}

// UPDATE PASSWORD
const changePasswordForm = document.getElementById("edit-password-form");

function changePassword(e) {
    e.preventDefault();
    hideAlerts();

    let isValid = true;
    const oldPassword = oldPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!oldPassword) {
        showAlert("oldPassword-alert");
        isValid = false;
    }

    if (!newPassword) {
        document.getElementById("newPassword-alert").textContent = "Please enter new password";
        showAlert("newPassword-alert");
        isValid = false;
    }

    if (!confirmPassword) {
        showAlert("confirmPassword-alert");
        isValid = false;
    }

    if (!isValid){
        if(!oldPassword) oldPasswordInput.focus();
        else if(!newPassword) newPasswordInput.focus();
        else if(!confirmPassword) confirmInput.focus();
        return;
    }

    const currentPassword = currentUser.password;

    if (oldPassword !== currentPassword) {
        document.getElementById("oldPassword-alert").textContent = "Please enter correct password";
        showAlert("oldPassword-alert");
        return;
    }

    const strongPwdRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPwdRule.test(newPassword)) {
        showAlert("newPassword-alert");
        return;
    }

    if (newPassword === oldPassword) {
        document.getElementById("newPassword-alert").textContent = "Password should be different from the old password";
        showAlert("newPassword-alert");
        return;
    }

    if (confirmPassword !== newPassword) {
        document.getElementById("confirmPassword-alert").textContent = "Not Matched.";
        showAlert("confirmPassword-alert");
        return;
    }

    currentUser.password = newPassword;
    const user = users.find(user => user.email === currentUser.email);
    user.password = newPassword;

    oldPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmInput.value = "";

    saveCurrentUser();
    saveUserInfo();

    showToast("Password Updated Successfully!");
}


// LOGOUT
const logoutForm = document.getElementById("logout-form");

function logout(e) {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("currentUserCart");
    window.location.href = "index.html";
}


saveNameForm.addEventListener("submit", updateName);
changePasswordForm.addEventListener("submit", changePassword);
logoutForm.addEventListener("submit", logout);
//SAVE CURRENT USER
function saveCurrentUser() {
    localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
}

//SAVE USERS
function saveUserInfo() {
    localStorage.setItem("users", JSON.stringify(users));
}

//SHOW ALERT
function showAlert(id) {
    document.getElementById(id).style.display = "block";
}

//TOAST MESSAGE
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}

firstNameInput.addEventListener("input", () => {
    document.getElementById("firstName-alert").style.display = "none";
});

lastNameInput.addEventListener("input", () => {
    document.getElementById("lastName-alert").style.display = "none";
});

oldPasswordInput.addEventListener("input", () => {
    document.getElementById("oldPassword-alert").style.display = "none";
});

newPasswordInput.addEventListener("input", () => {
    document.getElementById("newPassword-alert").style.display = "none";
});

confirmInput.addEventListener("input", () => {
    document.getElementById("confirmPassword-alert").style.display = "none";
});


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

//------------------------------------------
//----------LOAD USER CART-----------
//------------------------------------------

function getCurrentCart() {
    return JSON.parse(localStorage.getItem("currentUserCart")) || [];
}

updateCartBadge();