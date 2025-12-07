// Mobile Menu Toggle
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

//passwordInput has been instantiated already!
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the icon class (e.g., Font Awesome classes)
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});


//------------------------------------------
//-------------AUTHENTICATION---------------
//------------------------------------------


//USERS-INFO
let users = JSON.parse(localStorage.getItem("users") || "[]");

// INPUT ELEMENTS
const emailInput = document.getElementById("email");

const loginForm = document.getElementById("loginForm");

// HIDE ALL ALERTS
function hideAlerts() {
    document.querySelectorAll(".alert").forEach(alert => {
        alert.style.display = "none";
    });
}

hideAlerts();

const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || "";

//ALREADY LOGGED IN
if(currentUser){
    showToast("Already Logged In!", "shop.html", 1000);
}

function validateLogin(e) {
    e.preventDefault();
    hideAlerts();

    let isValid = true;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!email) {
        document.getElementById("email-alert").innerText = "Enter valid emailId";
        showAlert("email-alert");
        isValid = false;
    }

    if (!password) {
        showAlert("password-alert");
        isValid = false;
    }

    if (!isValid){
        if(!email) emailInput.focus();
        else if(!password) passwordInput.focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        document.getElementById("email-alert").innerText = "Invalid email format";
        showAlert("email-alert");
        emailInput.value = "";
        emailInput.focus();
        return;
    }


    const currUser = users.find(user => user.email === email);

    if (currUser === undefined) {
        showToast("Account does not exist! Please signUp", "signup.html", "red", 2000);
        return;
    }

    if (currUser.password !== password) {
        showAlert("alert-msg");
        passwordInput.focus();
        return;
    }

    saveLoggedInUser(currUser);

    showToast("Logged In Successfully!", "shop.html", "#01fd01", 1000);
}

loginForm.addEventListener("submit", validateLogin);


function saveLoggedInUser(user){
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function showAlert(id){
    document.getElementById(id).style.display = "block";
}

function showToast(message, url, color, time) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    toast.style.backgroundColor = color;
    setTimeout(() => {
        window.location.href = url;
    }, time);
}

emailInput.addEventListener("input", () => {
    document.getElementById("alert-msg").style.display = "none";
    document.getElementById("email-alert").style.display = "none";
});

passwordInput.addEventListener("input", () => {
    document.getElementById("alert-msg").style.display = "none";
    document.getElementById("password-alert").style.display = "none";
});





