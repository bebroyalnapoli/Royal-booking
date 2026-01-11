// ===============================
// FIREBASE INIT
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
    if (!user) window.location.href = "login.html";
  });
}

function loginUser() {
  const email = email?.value || document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => location.href = "dashboard.html")
    .catch(() => alert("Credenziali errate"));
}

function logoutUser() {
  auth.signOut().then(() => location.href = "login.html");
}

// ===============================
// SIDEBAR
// ===============================
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

  document.getElementById("logoutBtn").onclick = logoutUser;
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
// STANZE
// ===============================
function loadStanze() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const warn = document.getElementById("noStruttura");
  const box = document.getElementById("stanzeBox");
  const listBox = document.getElementById("listaBox");

  if (!strutturaId) {
    warn.classList.remove("hidden");
    return;
  }

  warn.classList.add("hidden");
  box.classList.remove("hidden");
  listBox.classList.remove("hidden");

  const list = document.getElementById("listaStanze");
  list.innerHTML = "";

  db.collection("strutture")
    .doc(strutturaId)
    .collection("stanze")
    .orderBy("nome")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const s = doc.data();
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `
          <strong>${s.nome}</strong> (${s.tipo || "-"})<br>
          <small>${s.note || ""}</small>
        `;
        list.appendChild(li);
      });
    });
}

function addStanza() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return;

  const nome = document.getElementById("roomNome").value.trim();
  const tipo = document.getElementById("roomTipo").value;
  const note = document.getElementById("roomNote").value.trim();

  if (!nome) {
    alert("Nome stanza obbligatorio");
    return;
  }

  db.collection("strutture")
    .doc(strutturaId)
    .collection("stanze")
    .add({
      nome,
      tipo,
      note,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      document.getElementById("roomNome").value = "";
      document.getElementById("roomTipo").value = "";
      document.getElementById("roomNote").value = "";
      loadStanze();
    });
}