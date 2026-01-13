// ======================================
// FIREBASE INIT
// ======================================
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
    authDomain: "royal-booking-e6050.firebaseapp.com",
    projectId: "royal-booking-e6050"
  });
}

const auth = firebase.auth();
const db = firebase.firestore();

// ======================================
// AUTH
// ======================================
function loginUser() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const errorEl = document.getElementById("loginError");

  if (!email || !password) {
    if (errorEl) errorEl.textContent = "Inserisci email e password";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(() => {
      if (errorEl) errorEl.textContent = "Credenziali non valide";
    });
}

function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) window.location.href = "login.html";
  });
}

function logoutUser() {
  auth.signOut().then(() => {
    localStorage.removeItem("strutturaAttiva");
    window.location.href = "login.html";
  });
}