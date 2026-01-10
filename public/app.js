/*************************
 * FIREBASE CONFIG
 *************************/
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

/*************************
 * AUTH
 *************************/
function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Inserisci email e password");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(() => {
      alert("Credenziali non valide");
    });
}

function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

function logoutUser() {
  auth.signOut().then(() => {
    localStorage.removeItem("strutturaAttiva");
    window.location.href = "login.html";
  });
}

/*************************
 * SIDEBAR
 *************************/
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!sidebar) return;

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      toggleBtn.style.display = "none";
    };
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    if (toggleBtn) toggleBtn.style.display = "block";
  }

  if (overlay) overlay.onclick = closeSidebar;

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSidebar();
  });

  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });

  if (logoutBtn) {
    logoutBtn.onclick = logoutUser;
  }
}

/*************************
 * STRUTTURE
 *************************/
function initStrutture() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  select.innerHTML = `<option value="">Seleziona struttura</option>`;
  const attiva = localStorage.getItem("strutturaAttiva");

  db.collection("strutture").get().then(snapshot => {
    snapshot.forEach(doc => {
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

function addStruttura() {
  const nome = document.getElementById("nomeStruttura").value.trim();
  if (!nome) return alert("Inserisci il nome");

  db.collection("strutture").add({
    nome,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("nomeStruttura").value = "";
    loadStruttureList();
    initStrutture();
  });
}

function loadStruttureList() {
  const list = document.getElementById("listaStrutture");
  if (!list) return;

  list.innerHTML = "";

  db.collection("strutture").get().then(snapshot => {
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.data().nome;
      list.appendChild(li);
    });
  });
}

/*************************
 * DASHBOARD
 *************************/
function loadDashboard() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return;

  // Prenotazioni
  db.collection("prenotazioni")
    .where("structureId", "==", strutturaId)
    .get()
    .then(snap => {
      document.getElementById("totalBookings").textContent = snap.size;
    });

  // Stanze
  db.collection("stanze")
    .where("structureId", "==", strutturaId)
    .get()
    .then(snap => {
      document.getElementById("totalRooms").textContent = snap.size;
    });

  // Strutture totali
  db.collection("strutture").get().then(snap => {
    const el = document.getElementById("totalStructures");
    if (el) el.textContent = snap.size;
  });
}

/*************************
 * AUTO INIT
 *************************/
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.auth === "true") {
    checkAuth();
  }

  loadStruttureList();
});