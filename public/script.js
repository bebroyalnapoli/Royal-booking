const db = firebase.firestore();
let currentUser = null;
let activeStructure = null;

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("pageContent");
  const arrow = document.getElementById("toggleArrow");

  sidebar.classList.toggle("collapsed");
  content.classList.toggle("expanded");

  arrow.textContent = sidebar.classList.contains("collapsed") ? "→" : "←";
}

function logoutUser() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

function loadStructureSelector() {
  db.collection("strutture")
    .where("owner", "==", currentUser.uid)
    .get()
    .then(snapshot => {
      const selector = document.getElementById("structureSelector");
      selector.innerHTML = `<option value="default">Seleziona struttura</option>`;
      snapshot.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.data().nome;
        selector.appendChild(option);
      });

      const saved = localStorage.getItem("activeStructure");
      if (saved) {
        selector.value = saved;
        activeStructure = saved;
        loadCounts();
      }
    });
}

function changeStructure() {
  activeStructure = document.getElementById("structureSelector").value;
  localStorage.setItem("activeStructure", activeStructure);
  loadCounts();
}

function loadDashboard() {
  checkAuth();
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;
    loadStructureSelector();
  });
}

function loadCounts() {
  if (!activeStructure || activeStructure === "default") return;

  db.collection("prenotazioni")
    .where("owner", "==", currentUser.uid)
    .where("structureId", "==", activeStructure)
    .get()
    .then(snap => {
      document.getElementById("totalBookings").textContent = snap.size;
    });

  db.collection("stanze")
    .where("owner", "==", currentUser.uid)
    .where("structureId", "==", activeStructure)
    .get()
    .then(snap => {
      document.getElementById("totalRooms").textContent = snap.size;
    });

  document.getElementById("totalStructures").textContent = "1";
  document.getElementById("avgOccupancy").textContent = "0%";
}

function loadRooms() {
  checkAuth();
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;
    loadStructureSelector();
    // TODO: carica stanze
  });
}

function loadBookings() {
  checkAuth();
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;
    loadStructureSelector();
    // TODO: carica prenotazioni
  });
}

function loadStructures() {
  checkAuth();
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    currentUser = user;
    loadStructureSelector();
    // TODO: carica strutture
  });
}
