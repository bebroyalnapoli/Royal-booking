// LOGIN
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Inserisci email e password");
    return;
  }

  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
}

// PROTEZIONE PAGINE PRIVATE
function checkAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) window.location.href = "login.html";
  });
}

// LOGOUT
function logoutUser() {
  firebase.auth().signOut().then(() => {
    localStorage.removeItem("strutturaAttiva");
    window.location.href = "login.html";
  });
}