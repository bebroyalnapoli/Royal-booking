// ===============================
// FIREBASE CONFIG
// ===============================
firebase.initializeApp({
  apiKey: "AIzaSyDVmp6c4_9gg_nyIvkLPvy9BE4U5DlDP2w",
  authDomain: "royal-booking-e6050.firebaseapp.com",
  projectId: "royal-booking-e6050",
  storageBucket: "royal-booking-e6050.firebasestorage.app",
  messagingSenderId: "868870824428",
  appId: "1:868870824428:web:58442b53ee5fbd847960c9"
});

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
    .then(r => r.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;
      initSidebar();
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
      toggle.style.display = "none";
    };
  }

  overlay.onclick = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    toggle.style.display = "block";
  };

  logoutBtn.onclick = logoutUser;

  initStruttureSelect();
}

function initStruttureSelect() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  const attiva = localStorage.getItem("strutturaAttiva");

  db.collection("strutture").get().then(snap => {
    select.innerHTML = `<option value="">Seleziona struttura</option>`;
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

  const noStruttura = document.getElementById("noStruttura");
  const section = document.getElementById("stanzeSection");

  if (!strutturaId) {
    noStruttura.classList.remove("hidden");
    section.classList.add("hidden");
    return;
  }

  noStruttura.classList.add("hidden");
  section.classList.remove("hidden");

  const list = document.getElementById("stanzeList");
  list.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const d = doc.data();
        list.innerHTML += `
          <div class="list-item">
            <strong>${d.nome}</strong><br>
            🛏️ ${d.postiLetto} posti — €${d.prezzo}/notte
          </div>
        `;
      });
    });

  document.getElementById("stanzaForm").onsubmit = e => {
    e.preventDefault();

    const nome = nomeStanza.value.trim();
    const posti = Number(postiLetto.value);
    const prezzo = Number(prezzo.value);

    if (!nome || posti < 1) return;

    db.collection("stanze").add({
      nome,
      postiLetto: posti,
      prezzo,
      strutturaId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      nomeStanza.value = "";
      postiLetto.value = "";
      prezzo.value = "";
      loadStanze();
    });
  };
}