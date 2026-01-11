// ===============================
// FIREBASE INIT
// ===============================
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
    authDomain: "royal-booking-e6050.firebaseapp.com",
    projectId: "royal-booking-e6050"
  });
}

const auth = firebase.auth();
const db = firebase.firestore();

// ===============================
// AUTH
// ===============================
function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) window.location.href = "login.html";
  });
}

function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  errorBox.textContent = "";

  if (!email || !password) {
    errorBox.textContent = "Inserisci email e password";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(() => errorBox.textContent = "Credenziali non valide");
}

function logoutUser() {
  auth.signOut().then(() => window.location.href = "login.html");
}

// ===============================
// SIDEBAR
// ===============================
function loadSidebar() {
  fetch("sidebar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;
      initSidebar(); // 🔥 IMPORTANTISSIMO
    });
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!sidebar || !toggle || !overlay) return;

  // APRI
  toggle.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    toggle.style.display = "none";
  };

  // CHIUDI
  overlay.onclick = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    toggle.style.display = "block";
  };

  // LOGOUT
  logoutBtn.onclick = logoutUser;
}