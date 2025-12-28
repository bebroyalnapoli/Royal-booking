// Configurazione Firebase
const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "royal-booking-e6050.firebaseapp.com",
  projectId: "royal-booking-e6050",
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Funzione di login
function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      alert(error.message);
    });
}

// Controllo accesso sulle pagine protette
function checkAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

// Logout
function logoutUser() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
