// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");
const authButtons = document.querySelector(".auth-buttons");

mobileMenuBtn.addEventListener("click", toggleMobileMenu);

function toggleMobileMenu(){
    navLinks.classList.toggle("open");

    // Toggle icon between bars → X
    mobileMenuBtn.innerHTML = navLinks.classList.contains("open")
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
}

const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || "";

//ALREADY LOGGED IN
if(currentUser){
    showToast("Already Logged In!");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        window.location.href = "shop.html";
    }, 1000);
}