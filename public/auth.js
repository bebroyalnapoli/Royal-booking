// ===============================
// CONFIGURAZIONE FIREBASE
// ===============================
firebase.initializeApp({
  apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
  authDomain: "royal-booking-e6050.firebaseapp.com",
  projectId: "royal-booking-e6050",
  storageBucket: "royal-booking-e6050.firebasestorage.app",
  messagingSenderId: "868870824428",
  appId: "1:868870824428:web:58442b53ee5fbd847960c9"
});

// ===============================
// LOGIN
// ===============================
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Inserisci email e password");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.php"; // 🔥 CORRETTO
    })
    .catch(error => {
      alert(error.message);
    });
}

// ===============================
// PROTEZIONE PAGINE
// ===============================
function checkAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html"; // login resta HTML
    }
  });
}

// ===============================
// LOGOUT
// ===============================
function logoutUser() {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = "login.html"; // logout torna a login.html
    })
    .catch(error => {
      alert("Errore durante il logout: " + error.message);
    });
}
