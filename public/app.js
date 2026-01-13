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

// ======================================
// SIDEBAR (ROBUSTA)
// ======================================
function loadSidebar(callback) {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  fetch("sidebar.html")
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;
      setTimeout(() => {
        initSidebar();
        initStruttureSelect();
        if (callback) callback();
      }, 0);
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
  };

  function close() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  overlay.onclick = close;

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });

  if (logoutBtn) logoutBtn.onclick = logoutUser;

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
  }).then(() => location.reload());
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
// STANZE (AVANZATE)
// ======================================
function addStanza() {
  const numero = document.getElementById("stanzaNumero").value.trim();
  const descrizione = document.getElementById("stanzaDescrizione").value.trim();
  const ospitiMax = parseInt(document.getElementById("stanzaOspiti").value);
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!strutturaId) return alert("Seleziona una struttura");
  if (!numero) return alert("Numero stanza obbligatorio");
  if (!ospitiMax || ospitiMax < 1) return alert("Numero ospiti non valido");

  db.collection("stanze").add({
    strutturaId,
    numeroCamera: numero,
    descrizione,
    ospitiMax,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => location.reload());
}

function loadStanze() {
  const ul = document.getElementById("listaStanze");
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const warning = document.getElementById("noStruttura");

  if (!ul) return;

  if (!strutturaId) {
    if (warning) warning.classList.remove("hidden");
    return;
  }

  if (warning) warning.classList.add("hidden");
  ul.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const s = doc.data();
        const li = document.createElement("li");
        li.className = "list-item";
        li.textContent =
          `${s.numeroCamera} – ${s.descrizione || "—"} (${s.ospitiMax} ospiti)`;
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

// ======================================
// PRENOTAZIONI (BASE, MULTI STANZA)
// ======================================

// ➕ Aggiungi prenotazione
function addPrenotazione() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return alert("Seleziona una struttura");

  const cliente = document.getElementById("pCliente")?.value.trim();
  const checkin = document.getElementById("pCheckin")?.value;
  const checkout = document.getElementById("pCheckout")?.value;
  const acconto = parseFloat(document.getElementById("pAcconto")?.value) || 0;

  const stanze = Array.from(
    document.querySelectorAll("input[name='stanze']:checked")
  ).map(cb => ({
    stanzaId: cb.value,
    prezzo: parseFloat(cb.dataset.prezzo) || 0
  }));

  if (!cliente || !checkin || !checkout || stanze.length === 0) {
    return alert("Compila tutti i campi");
  }

  db.collection("prenotazioni").add({
    strutturaId,
    cliente,
    checkin,
    checkout,
    stanze,
    acconto,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => location.reload());
}

// 📥 Carica stanze per selezione prenotazione
function loadStanzeForPrenotazione() {
  const box = document.getElementById("stanzePrenotazione");
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!box || !strutturaId) return;

  box.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const s = doc.data();
        box.innerHTML += `
          <div class="stanza-pren">
            <label>
              <input type="checkbox" name="stanze"
                value="${doc.id}"
                data-prezzo="0">
              Camera ${s.numeroCamera} (${s.ospitiMax} ospiti)
            </label>
            <input type="number" placeholder="Prezzo €"
              oninput="this.previousElementSibling
                .querySelector('input')
                .dataset.prezzo=this.value">
          </div>
        `;
      });
    });
}

// 📋 Lista prenotazioni
function loadPrenotazioniList() {
  const ul = document.getElementById("listaPrenotazioni");
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!ul || !strutturaId) return;

  ul.innerHTML = "";

  db.collection("prenotazioni")
    .where("strutturaId", "==", strutturaId)
    .orderBy("createdAt", "desc")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const p = doc.data();
        ul.innerHTML += `
          <li class="list-item">
            <strong>${p.cliente}</strong><br>
            ${p.checkin} → ${p.checkout}<br>
            Stanze: ${p.stanze.length} |
            Acconto €${p.acconto}
          </li>
        `;
      });
    });
}

// 🚀 Init pagina prenotazioni
function loadPrenotazioniPage() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const warning = document.getElementById("noStruttura");
  const content = document.getElementById("prenotazioniContent");

  if (!strutturaId) {
    if (warning) warning.classList.remove("hidden");
    return;
  }

  if (warning) warning.classList.add("hidden");
  if (content) content.classList.remove("hidden");

  loadStanzeForPrenotazione();
  loadPrenotazioniList();
}