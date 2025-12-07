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

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

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

//------------------------------------------
//-------------AUTHENTICATION---------------
//------------------------------------------

//USERS-INFO
let users = JSON.parse(localStorage.getItem("users") || "[]");

// INPUT ELEMENTS
//passwordInput and confirmInput has been instantiated already!
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");

const signupForm = document.getElementById("signupForm");

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
    showToast("Already Logged In!", "shop.html");
}

// VALIDATION FUNCTION
function validateSignup(e) {
    e.preventDefault(); // stop submission
    hideAlerts();

    let isValid = true;

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    // FIRST NAME
    if (!firstName) {
        showAlert("firstName-alert");
        isValid = false;
    }

    // LAST NAME
    if (!lastName) {
        showAlert("lastName-alert");
        isValid = false;
    }

    // EMAIL VALIDATION (custom)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailPattern.test(email)) {
        showAlert("email-alert");
        isValid = false;
    }

    // PASSWORD VALIDATION
    const strongPwdRule =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!password || !strongPwdRule.test(password)) {
        showAlert("password-alert");
        isValid = false;
    }

    // CONFIRM PASSWORD MATCH
    if (!confirmPassword || confirmPassword !== password) {
        showAlert("confirmPassword-alert");
        isValid = false;
    }


    // IF INVALID, STOP HERE
    if (!isValid){
        if(!firstName) firstNameInput.focus();
        else if(!lastName) lastNameInput.focus();
        else if(!email) emailInput.focus();
        else if(!password) passwordInput.focus();
        else if(!confirmPassword) confirmInput.focus();
        return;
    }

    const userExists = users.some(user => user.email === email);
    if (userExists) {
        showToast("Account already exists!", "login.html");
        return;
    }

    const user = {
        firstName,
        lastName,
        email,
        password, // NOTE: never store plain passwords in real apps
    };

    users.push(user);
    saveUserInfo();

    showToast("Signup successful!", "login.html");
}

signupForm.addEventListener("submit", validateSignup);

//Save User Info
function saveUserInfo() {
    localStorage.setItem("users", JSON.stringify(users));
}

function showAlert(id){
    document.getElementById(id).style.display = "block";
}

function showToast(message, url) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        window.location.href = url;
    }, 1000);
}

firstNameInput.addEventListener("input", () => {
    document.getElementById("firstName-alert").style.display = "none";
});

lastNameInput.addEventListener("input", () => {
    document.getElementById("lastName-alert").style.display = "none";
});

emailInput.addEventListener("input", () => {
    document.getElementById("email-alert").style.display = "none";
});

passwordInput.addEventListener("input", () => {
    document.getElementById("password-alert").style.display = "none";
});

confirmInput.addEventListener("input", () => {
    document.getElementById("confirmPassword-alert").style.display = "none";
});

