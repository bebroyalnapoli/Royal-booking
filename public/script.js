/* ============================================
   VARIABILI GLOBALI
============================================ */
let currentUser = null;
let activeStructure = localStorage.getItem("activeStructure") || "default";

const db = firebase.firestore();

/* ============================================
   SIDEBAR TOGGLE
============================================ */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const arrow = document.getElementById("toggleArrow");

  sidebar.classList.toggle("collapsed");

  if (sidebar.classList.contains("collapsed")) {
    arrow.textContent = "→";
  } else {
    arrow.textContent = "←";
  }
}

/* ============================================
   STRUTTURE - SELECTOR
============================================ */
function loadStructureSelector() {
  const selector = document.getElementById("structureSelector");
  if (!selector) return;

  selector.innerHTML = `<option value="default">Seleziona struttura</option>`;

  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;

    db.collection("strutture")
      .where("owner", "==", currentUser.uid)
      .get()
      .then(snap => {
        snap.forEach(doc => {
          const data = doc.data();
          const opt = document.createElement("option");
          opt.value = doc.id;
          opt.textContent = data.nome;
          selector.appendChild(opt);
        });

        // Ripristina struttura selezionata
        if (activeStructure && activeStructure !== "default") {
          selector.value = activeStructure;
        }
      });
  });
}

function changeStructure() {
  const selector = document.getElementById("structureSelector");
  activeStructure = selector.value;
  localStorage.setItem("activeStructure", activeStructure);

  // Aggiorna dashboard o liste
  if (typeof loadCounts === "function") loadCounts();
  if (typeof loadRooms === "function") loadRooms();
  if (typeof loadBookings === "function") loadBookings();
}

/* ============================================
   DASHBOARD
============================================ */
function loadDashboard() {
  checkAuth();

  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;

    loadStructureSelector();
    loadCounts();
  });
}

function loadCounts() {
  if (!activeStructure || activeStructure === "default") {
    document.getElementById("totalBookings").textContent = "0";
    document.getElementById("totalRooms").textContent = "0";
    document.getElementById("totalStructures").textContent = "1";
    document.getElementById("avgOccupancy").textContent = "0%";
    return;
  }

  // Prenotazioni
  db.collection("prenotazioni")
    .where("owner", "==", currentUser.uid)
    .where("structureId", "==", activeStructure)
    .get()
    .then(snap => {
      document.getElementById("totalBookings").textContent = snap.size;
    });

  // Stanze
  db.collection("stanze")
    .where("owner", "==", currentUser.uid)
    .where("structureId", "==", activeStructure)
    .get()
    .then(snap => {
      document.getElementById("totalRooms").textContent = snap.size;
    });

  // Strutture (per ora 1)
  document.getElementById("totalStructures").textContent = "1";

  // Occupazione media (placeholder)
  document.getElementById("avgOccupancy").textContent = "0%";
}

/* ============================================
   STANZE
============================================ */
function loadRooms() {
  checkAuth();

  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;

    loadStructureSelector();

    if (!activeStructure || activeStructure === "default") {
      document.getElementById("roomsList").innerHTML =
        "<p>Seleziona una struttura.</p>";
      return;
    }

    db.collection("stanze")
      .where("owner", "==", currentUser.uid)
      .where("structureId", "==", activeStructure)
      .get()
      .then(snap => {
        const container = document.getElementById("roomsList");
        container.innerHTML = "";

        snap.forEach(doc => {
          const data = doc.data();
          const div = document.createElement("div");
          div.className = "dash-card";
          div.onclick = () =>
            (window.location.href = `stanza_dettaglio.html?id=${doc.id}`);

          div.innerHTML = `
            <div class="dash-icon">🛏️</div>
            <div class="dash-info">
              <h2>${data.nome}</h2>
              <p>${data.tipo || ""}</p>
            </div>
          `;
          container.appendChild(div);
        });
      });
  });
}

/* ============================================
   PRENOTAZIONI
============================================ */
function loadBookings() {
  checkAuth();

  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;

    loadStructureSelector();

    if (!activeStructure || activeStructure === "default") {
      document.getElementById("bookingsList").innerHTML =
        "<p>Seleziona una struttura.</p>";
      return;
    }

    db.collection("prenotazioni")
      .where("owner", "==", currentUser.uid)
      .where("structureId", "==", activeStructure)
      .get()
      .then(snap => {
        const container = document.getElementById("bookingsList");
        container.innerHTML = "";

        snap.forEach(doc => {
          const data = doc.data();
          const div = document.createElement("div");
          div.className = "dash-card";
          div.onclick = () =>
            (window.location.href = `prenotazione_dettaglio.html?id=${doc.id}`);

          div.innerHTML = `
            <div class="dash-icon">📅</div>
            <div class="dash-info">
              <h2>${data.ospite}</h2>
              <p>${data.checkin} → ${data.checkout}</p>
            </div>
          `;
          container.appendChild(div);
        });
      });
  });
}

/* ============================================
   STRUTTURE
============================================ */
function loadStructures() {
  checkAuth();

  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;

    db.collection("strutture")
      .where("owner", "==", currentUser.uid)
      .get()
      .then(snap => {
        const container = document.getElementById("structuresList");
        container.innerHTML = "";

        snap.forEach(doc => {
          const data = doc.data();
          const div = document.createElement("div");
          div.className = "dash-card";
          div.onclick = () =>
            (window.location.href = `struttura_dettaglio.html?id=${doc.id}`);

          div.innerHTML = `
            <div class="dash-icon">🏢</div>
            <div class="dash-info">
              <h2>${data.nome}</h2>
              <p>${data.citta || ""}</p>
            </div>
          `;
          container.appendChild(div);
        });
      });
  });
}

/* ============================================
   DETTAGLI
============================================ */
function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function loadRoomDetail() {
  checkAuth();

  const id = getParam("id");
  if (!id) return;

  db.collection("stanze").doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById("roomDetail").innerHTML = `
      <h2>${data.nome}</h2>
      <p>Tipo: ${data.tipo}</p>
      <p>Capienza: ${data.capienza}</p>
    `;
  });
}

function loadBookingDetail() {
  checkAuth();

  const id = getParam("id");
  if (!id) return;

  db.collection("prenotazioni").doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById("bookingDetail").innerHTML = `
      <h2>Prenotazione #${doc.id}</h2>
      <p>Ospite: ${data.ospite}</p>
      <p>Check-in: ${data.checkin}</p>
      <p>Check-out: ${data.checkout}</p>
    `;
  });
}

function loadStructureDetail() {
  checkAuth();

  const id = getParam("id");
  if (!id) return;

  db.collection("strutture").doc(id).get().then(doc => {
    const data = doc.data();
    document.getElementById("structureDetail").innerHTML = `
      <h2>${data.nome}</h2>
      <p>Indirizzo: ${data.indirizzo}</p>
      <p>Città: ${data.citta}</p>
    `;
  });
}
