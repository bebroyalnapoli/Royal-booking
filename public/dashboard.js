function loadDashboard() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const warning = document.getElementById("noStruttura");
  const grid = document.getElementById("dashboardGrid");
  const title = document.getElementById("strutturaTitle");

  if (!strutturaId) {
    warning?.classList.remove("hidden");
    grid && (grid.style.display = "none");
    return;
  }

  warning?.classList.add("hidden");
  grid && (grid.style.display = "grid");

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