// FIREBASE CONFIG
firebase.initializeApp({
  apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
  authDomain: "royal-booking-e6050.firebaseapp.com",
  projectId: "royal-booking-e6050"
});

const db = firebase.firestore();

// AUTH
function loginUser() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const error = document.getElementById("loginError");

  error.textContent = "";

  if (!emailInput.value || !passwordInput.value) {
    error.textContent = "Inserisci email e password";
    return;
  }

  firebase.auth()
    .signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      error.textContent = "Credenziali errate";
      console.error(err);
    });
}

function checkAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) location.href = "login.html";
  });
}

function logoutUser() {
  firebase.auth().signOut().then(() => location.href = "login.html");
}

// SIDEBAR
function loadSidebar() {
  fetch("sidebar.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;
      initSidebar();
      loadStrutture();
    });
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");

  toggle.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    toggle.style.display = "none";
  };

  overlay.onclick = close;

  function close() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    toggle.style.display = "block";
  }
}

// STRUTTURE
function loadStrutture() {
  const select = document.getElementById("strutturaSelect");
  const attiva = localStorage.getItem("strutturaAttiva");

  db.collection("strutture").get().then(snap => {
    snap.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = doc.data().nome;
      if (doc.id === attiva) opt.selected = true;
      select.appendChild(opt);
    });
  });

  select.onchange = () => {
    localStorage.setItem("strutturaAttiva", select.value);
    location.reload();
  };
}

// DASHBOARD
function loadDashboard() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) {
    document.getElementById("noStruttura").classList.remove("hidden");
    document.getElementById("dashboardGrid").classList.add("hidden");
    return;
  }

  const oggi = new Date().toISOString().slice(0,10);

  db.collection("prenotazioni")
    .where("structureId", "==", strutturaId)
    .get()
    .then(snap => {
      document.getElementById("totPrenotazioni").textContent = snap.size;

      let ci = 0, co = 0;
      snap.forEach(d => {
        if (d.data().checkin === oggi) ci++;
        if (d.data().checkout === oggi) co++;
      });

      document.getElementById("checkinOggi").textContent = ci;
      document.getElementById("checkoutOggi").textContent = co;
    });
}