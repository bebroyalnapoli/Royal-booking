function addPrenotazione() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return alert("Seleziona struttura");

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
  }).then(() => loadPrenotazioniList());
}

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
          <label>
            <input type="checkbox" name="stanze" value="${doc.id}" data-prezzo="0">
            Camera ${s.numeroCamera}
          </label>
        `;
      });
    });
}

function loadPrenotazioniList() {
  const ul = document.getElementById("listaPrenotazioni");
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!ul || !strutturaId) return;

  ul.innerHTML = "";

  db.collection("prenotazioni")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      if (snap.empty) {
        ul.innerHTML = "<li>Nessuna prenotazione</li>";
        return;
      }

      snap.forEach(doc => {
        const p = doc.data();
        ul.innerHTML += `
          <li>
            ${p.cliente} (${p.checkin} → ${p.checkout})
          </li>
        `;
      });
    });
}