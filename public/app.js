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
const db = firebase.firestore();

// ===============================
// AUTH
// ===============================
function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

function loginUser() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const errorBox = document.getElementById("loginError");

  if (!email || !password) {
    if (errorBox) errorBox.textContent = "Inserisci email e password";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(() => {
      if (errorBox) errorBox.textContent = "Credenziali non valide";
    });
}

function logoutUser() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ===============================
// SIDEBAR
// ===============================
function loadSidebar() {
  fetch("sidebar.html")
    .then(res => res.text())
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

  if (!sidebar || !toggle || !overlay) return;

  toggle.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    toggle.style.display = "none";
  };

  overlay.onclick = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    toggle.style.display = "block";
  };

  if (logoutBtn) logoutBtn.onclick = logoutUser;
}

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

// ===============================
// STRUTTURE
// ===============================
function addStruttura() {
  const nome = document.getElementById("sNome").value.trim();
  const indirizzo = document.getElementById("sIndirizzo").value.trim();
  const email = document.getElementById("sEmail").value.trim();
  const telefono = document.getElementById("sTelefono").value.trim();

  if (!nome || !indirizzo) {
    alert("Nome e indirizzo obbligatori");
    return;
  }

  db.collection("strutture").add({
    nome,
    indirizzo,
    email,
    telefono,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("sNome").value = "";
    document.getElementById("sIndirizzo").value = "";
    document.getElementById("sEmail").value = "";
    document.getElementById("sTelefono").value = "";
    loadStruttureList();
  });
}

function loadStruttureList() {
  const list = document.getElementById("listaStrutture");
  if (!list) return;

  const attiva = localStorage.getItem("strutturaAttiva");
  list.innerHTML = "";

  db.collection("strutture").orderBy("createdAt", "desc").get().then(snap => {
    snap.forEach(doc => {
      const d = doc.data();
      const li = document.createElement("li");
      li.className = "list-item";
      if (doc.id === attiva) li.classList.add("active");

      li.innerHTML = `
        <strong>${d.nome}</strong><br>
        ${d.indirizzo}<br>
        <button onclick="setStrutturaAttiva('${doc.id}')">
          ${doc.id === attiva ? "✔ Attiva" : "Usa questa struttura"}
        </button>
      `;

      list.appendChild(li);
    });
  });
}

function setStrutturaAttiva(id) {
  localStorage.setItem("strutturaAttiva", id);
  location.reload();
}

// ===============================
// DASHBOARD (BASE)
// ===============================
function loadDashboard() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const title = document.getElementById("strutturaTitle");
  const warning = document.getElementById("noStruttura");
  const grid = document.getElementById("dashboardGrid");

  if (!strutturaId) {
    if (warning) warning.classList.remove("hidden");
    if (grid) grid.classList.add("hidden");
    return;
  }

  if (warning) warning.classList.add("hidden");
  if (grid) grid.classList.remove("hidden");

  db.collection("strutture").doc(strutturaId).get().then(doc => {
    if (doc.exists && title) {
      title.textContent = `Dashboard – ${doc.data().nome}`;
    }
  });

  // Numeri placeholder (verranno reali con prenotazioni)
  document.getElementById("totPrenotazioni").textContent = "0";
  document.getElementById("checkinOggi").textContent = "0";
  document.getElementById("checkoutOggi").textContent = "0";
}