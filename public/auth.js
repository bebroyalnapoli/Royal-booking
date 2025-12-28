// ===============================
// CONFIGURAZIONE FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "royal-booking-e6050.firebaseapp.com",
  projectId: "royal-booking-e6050",
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);


// ===============================
// LOGIN
// ===============================
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email === "" || password === "") {
    alert("Inserisci email e password");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
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
      window.location.href = "login.html";
    }
  });
}


// ===============================
// LOGOUT
// ===============================
function logoutUser() {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch(error => {
      alert("Errore durante il logout: " + error.message);
    });
}
