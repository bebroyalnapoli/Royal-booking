/*************************
 * FIREBASE
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
function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Inserisci email e password");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(() => alert("Credenziali non valide"));
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
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!sidebar) return;

  if (toggle) {
    toggle.onclick = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      toggle.style.display = "none";
    };
  }

  function close() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    if (toggle) toggle.style.display = "block";
  }

  if (overlay) overlay.onclick = close;

  if (logoutBtn) logoutBtn.onclick = logoutUser;
}

/*************************
 * STRUTTURE
 *************************/
function addStruttura() {
  const nome = document.getElementById("sNome").value.trim();
  const indirizzo = document.getElementById("sIndirizzo").value.trim();
  const email = document.getElementById("sEmail").value.trim();
  const telefono = document.getElementById("sTelefono").value.trim();

  if (!nome) return alert("Nome obbligatorio");

  db.collection("strutture").add({
    nome,
    indirizzo,
    email,
    telefono,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.querySelectorAll("input").forEach(i => i.value = "");
    loadStruttureList();
    initStrutture();
  });
}

function loadStruttureList() {
  const list = document.getElementById("listaStrutture");
  if (!list) return;

  list.innerHTML = "";
  const attiva = localStorage.getItem("strutturaAttiva");

  db.collection("strutture").get().then(snapshot => {
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.className = doc.id === attiva ? "active" : "";

      li.innerHTML = `
        <strong>${doc.data().nome}</strong><br>
        <small>${doc.data().indirizzo || ""}</small><br>
        <button onclick="setStrutturaAttiva('${doc.id}')">
          Usa questa struttura
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