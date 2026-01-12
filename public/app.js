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

/* ======================================
   AUTH
====================================== */
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const err = document.getElementById("loginError");

  if (!email || !password) {
    if (err) err.textContent = "Inserisci email e password";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => location.href = "dashboard.html")
    .catch(() => {
      if (err) err.textContent = "Credenziali non valide";
    });
}

function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) location.href = "login.html";
  });
}

function logoutUser() {
  auth.signOut().then(() => {
    localStorage.removeItem("strutturaAttiva");
    location.href = "login.html";
  });
}

/* ======================================
   SIDEBAR
====================================== */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (toggle) toggle.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  };

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
    if (a.href === location.href) a.classList.add("active");
  });
}

/* ======================================
   STRUTTURA ATTIVA
====================================== */
function initStruttureSelect() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  const attiva = localStorage.getItem("strutturaAttiva");
  select.innerHTML = `<option value="">Seleziona struttura</option>`;

  db.collection("strutture").get().then(snap => {
    snap.forEach(doc => {
      const o = document.createElement("option");
      o.value = doc.id;
      o.textContent = doc.data().nome;
      if (doc.id === attiva) o.selected = true;
      select.appendChild(o);
    });
  });

  select.onchange = () => {
    localStorage.setItem("strutturaAttiva", select.value);
    location.reload();
  };
}

/* ======================================
   STRUTTURE (CRUD)
====================================== */
function addStruttura() {
  const nome = sNome.value.trim();
  if (!nome) return alert("Nome obbligatorio");

  db.collection("strutture").add({
    nome,
    indirizzo: sIndirizzo.value.trim(),
    email: sEmail.value.trim(),
    telefono: sTelefono.value.trim(),
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

/* ======================================
   STANZE (CRUD)
====================================== */
function addStanza() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return alert("Seleziona una struttura");

  db.collection("stanze").add({
    strutturaId,
    numeroCamera: stanzaNumero.value.trim(),
    descrizione: stanzaDescrizione.value.trim(),
    ospitiMax: parseInt(stanzaOspiti.value),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => location.reload());
}

function loadStanze() {
  const ul = document.getElementById("listaStanze");
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!ul || !strutturaId) return;

  ul.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const s = doc.data();
        const li = document.createElement("li");
        li.textContent =
          `${s.numeroCamera} – ${s.descrizione || "—"} (${s.ospitiMax} ospiti)`;
        ul.appendChild(li);
      });
    });
}

/* ======================================
   DASHBOARD
====================================== */
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

/* ======================================
   PRENOTAZIONI (MULTI-STANZA)
====================================== */
let stanzeSelezionate = [];

function initPrenotazioni() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return;

  const box = document.getElementById("listaStanzePrenotazione");
  box.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const s = doc.data();
        const row = document.createElement("div");
        row.innerHTML = `
          <label>
            <input type="checkbox"
              onchange="toggleStanza(this,'${doc.id}','${s.numeroCamera}')">
            Camera ${s.numeroCamera}
          </label>
          <input type="number" placeholder="Prezzo €"
            oninput="calcolaTotale()">
        `;
        box.appendChild(row);
      });
    });

  acconto.oninput = calcolaTotale;
}

function toggleStanza(cb, id, numero) {
  const prezzoInput = cb.parentElement.nextElementSibling;

  if (cb.checked) {
    stanzeSelezionate.push({ stanzaId: id, numeroCamera: numero, prezzoInput });
  } else {
    stanzeSelezionate = stanzeSelezionate.filter(s => s.stanzaId !== id);
  }
  calcolaTotale();
}

function calcolaTotale() {
  let tot = 0;
  stanzeSelezionate.forEach(s => {
    const p = parseFloat(s.prezzoInput.value);
    if (!isNaN(p)) tot += p;
  });
  totale.textContent = tot.toFixed(2);
}

function salvaPrenotazione() {
  const strutturaId = localStorage.getItem("strutturaAttiva");

  const stanze = stanzeSelezionate.map(s => ({
    stanzaId: s.stanzaId,
    numeroCamera: s.numeroCamera,
    prezzo: parseFloat(s.prezzoInput.value) || 0
  }));

  const totaleCalc = stanze.reduce((t, s) => t + s.prezzo, 0);

  db.collection("prenotazioni").add({
    strutturaId,
    clienteNome: clienteNome.value.trim(),
    clienteTelefono: clienteTelefono.value.trim(),
    checkin: checkin.value,
    checkout: checkout.value,
    stanze,
    acconto: parseFloat(acconto.value) || 0,
    totale: totaleCalc,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Prenotazione salvata");
    location.reload();
  });
}