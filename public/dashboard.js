async function loadDashboard() {

  const struttura = localStorage.getItem("strutturaAttiva");

  if (!struttura) {
    document.getElementById("noStruttura").classList.remove("hidden");
    return;
  }

  document.getElementById("dashboardKpi").classList.remove("hidden");

  // Nome struttura
  const s = await db.collection("strutture").doc(struttura).get();
  document.getElementById("nomeStrutturaHeader").innerText = s.data().nome;

  // KPI 1 - Numero strutture totali
  const struttureSnap = await db.collection("strutture").get();
  document.getElementById("kpiStrutture").innerText = struttureSnap.size;

  // Prenotazioni della struttura selezionata
  const oggi = new Date().toISOString().split("T")[0];

  const prenotazioni = await db.collection("prenotazioni")
    .where("struttura", "==", struttura)
    .get();

  let checkin = 0;
  let checkout = 0;

  prenotazioni.forEach(doc => {
    const p = doc.data();

    if (p.checkin === oggi) checkin++;
    if (p.checkout === oggi) checkout++;
  });

  document.getElementById("kpiCheckin").innerText = checkin;
  document.getElementById("kpiCheckout").innerText = checkout;

  // OCCUPAZIONE (stima semplice)

  const stanzeSnap = await db.collection("stanze")
    .where("struttura", "==", struttura)
    .get();

  const totStanze = stanzeSnap.size || 1;

  const occupazione = Math.round((checkin / totStanze) * 100);

  document.getElementById("kpiOccupazione").innerText =
    occupazione + "%";
}

function openStrutturaSelect() {
  document.getElementById("strutturaSelect").focus();
}