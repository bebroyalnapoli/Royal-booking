// ===============================
// FIREBASE
// ===============================
firebase.initializeApp({
  apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
  authDomain: "royal-booking-e6050.firebaseapp.com",
  projectId: "royal-booking-e6050"
});

const db = firebase.firestore();

// ===============================
// AUTH
// ===============================
function loginUser() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("loginError");

  if (!emailInput || !passwordInput) return;

  errorBox.textContent = "";

  if (!emailInput.value || !passwordInput.value) {
    errorBox.textContent = "Inserisci email e password";
    return;
  }

  firebase.auth()
    .signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      console.error(err);
      errorBox.textContent = "Credenziali errate";
    });
}

function checkAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

function logoutUser() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ===============================
// SIDEBAR (DINAMICA)
// ===============================
function loadSidebar() {
  fetch("sidebar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;
      initSidebar();
      initStrutture();
    });
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!sidebar || !toggleBtn || !overlay) return;

  // Apri sidebar (mobile)
  toggleBtn.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    toggleBtn.style.display = "none"; // 🔴 FIX sovrapposizione
  };

  // Chiudi sidebar
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    toggleBtn.style.display = "block";
  }

  overlay.onclick = closeSidebar;

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSidebar();
  });

  // Evidenzia pagina attiva
  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.onclick = logoutUser;
  }
}

// ===============================
// STRUTTURE (MULTI)
// ===============================
function initStrutture() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  const attiva = localStorage.getItem("strutturaAttiva");

  select.innerHTML = `<option value="">Seleziona struttura</option>`;

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

// ===============================
// DASHBOARD
// ===============================
function loadDashboard() {
  const strutturaId = localStorage.getItem("strutturaAttiva");

  const noStruttura = document.getElementById("noStruttura");
  const grid = document.getElementById("dashboardGrid");
  const title = document.getElementById("strutturaTitle");

  if (!strutturaId) {
    if (noStruttura) noStruttura.classList.remove("hidden");
    if (grid) grid.classList.add("hidden");
    return;
  }

  const oggi = new Date().toISOString().slice(0, 10);

  db.collection("strutture").doc(strutturaId).get().then(doc => {
    if (doc.exists && title) {
      title.textContent = "🏨 " + doc.data().nome;
    }
  });

  db.collection("prenotazioni")
    .where("structureId", "==", strutturaId)
    .get()
    .then(snap => {
      let checkin = 0;
      let checkout = 0;

      snap.forEach(d => {
        const p = d.data();
        if (p.checkin === oggi) checkin++;
        if (p.checkout === oggi) checkout++;
      });

      document.getElementById("totPrenotazioni").textContent = snap.size;
      document.getElementById("checkinOggi").textContent = checkin;
      document.getElementById("checkoutOggi").textContent = checkout;
    });
}