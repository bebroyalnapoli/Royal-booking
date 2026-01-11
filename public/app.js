// ===============================
// FIREBASE INIT (UNA SOLA VOLTA)
// ===============================
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
    authDomain: "royal-booking-e6050.firebaseapp.com",
    projectId: "royal-booking-e6050"
  });
}

const auth = firebase.auth();

// ===============================
// LOGIN
// ===============================
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
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      errorBox.textContent = "Credenziali non valide";
    });
}

// ===============================
// PROTEZIONE PAGINE
// ===============================
function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

// ===============================
// LOGOUT
// ===============================
function logoutUser() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}