// ======================================
// FIREBASE INIT (SAFE)
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
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const errorEl = document.getElementById("loginError");

  if (!emailEl || !passEl) return;

  const email = emailEl.value.trim();
  const password = passEl.value.trim();

  if (!email || !password) {
    if (errorEl) errorEl.textContent = "Inserisci email e password";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
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

// ======================================
// SIDEBAR
// ======================================
function loadSidebar() {
  fetch("sidebar.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;
      initSidebar();
      initStruttureSelect();
    });
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (toggle) {
    toggle.onclick = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
    };
  }

  function close() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  if (overlay) overlay.onclick = close;

  if (logoutBtn) logoutBtn.onclick = logoutUser;

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });

  document.querySelectorAll(".sidebar-menu a").forEach(a => {
    if (a.href === window.location.href) a.classList.add("active");
  });
}

// ======================================
// STRUTTURA ATTIVA
// ======================================
function initStruttureSelect() {
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

// ======================================
// STRUTTURE (CRUD)
// ======================================
function addStruttura() {
  const nome = document.getElementById("sNome").value.trim();
  const indirizzo = document.getElementById("sIndirizzo").value.trim();
  const email = document.getElementById("sEmail").value.trim();
  const telefono = document.getElementById("sTelefono").value.trim();

  if (!nome) return alert("Nome obbligatorio");

  db.collection("strutture").add({
    nome, indirizzo, email, telefono,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    location.reload();
  });
}

function loadStruttureList() {
  const ul = document.getElementById("listaStrutture");
  if (!ul) return;

  const attiva = localStorage.getItem("strutturaAttiva");
  ul.innerHTML = "";

  db.collection("strutture").get().then(snap => {
    snap.forEach(doc => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerHTML = `
        <strong>${doc.data().nome}</strong>
        ${doc.id === attiva ? " ✅" : ""}
        <button onclick="setStrutturaAttiva('${doc.id}')">Usa</button>
      `;
      ul.appendChild(li);
    });
  });
}

function setStrutturaAttiva(id) {
  localStorage.setItem("strutturaAttiva", id);
  location.reload();
}

// ======================================
// STANZE
// ======================================
function addStanza() {
  const nome = document.getElementById("stanzaNome").value.trim();
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!strutturaId) return alert("Seleziona una struttura");
  if (!nome) return alert("Nome stanza obbligatorio");

  db.collection("stanze").add({
    nome,
    strutturaId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => location.reload());
}

function loadStanze() {
  const ul = document.getElementById("listaStanze");
  if (!ul) return;

  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return;

  ul.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const li = document.createElement("li");
        li.textContent = doc.data().nome;
        ul.appendChild(li);
      });
    });
}

// ======================================
// DASHBOARD
// ======================================
function loadDashboard() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const warning = document.getElementById("noStruttura");
  const grid = document.getElementById("dashboardGrid");
  const title = document.getElementById("strutturaTitle");

  if (!strutturaId) {
    if (warning) warning.classList.remove("hidden");
    if (grid) grid.style.display = "none";
    return;
  }

  if (warning) warning.classList.add("hidden");
  if (grid) grid.style.display = "grid";

  db.collection("strutture").doc(strutturaId).get().then(doc => {
    if (doc.exists && title) title.textContent = doc.data().nome;
  });

  db.collection("prenotazioni")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      document.getElementById("totPrenotazioni").textContent = snap.size;
    });
}