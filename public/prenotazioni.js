async function generaCodicePrenotazione(strutturaId) {
  const ref = db.collection("strutture").doc(strutturaId);

  return db.runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);

    if (!doc.exists) throw "Struttura non trovata";

    const data = doc.data();
    const nuovo = (data.progressivo || 0) + 1;

    transaction.update(ref, { progressivo: nuovo });

    const anno = new Date().getFullYear();
    const sigla = data.sigla || "XX";

    return `${sigla}${anno}-${String(nuovo).padStart(4, "0")}`;
  });
}

async function mostraAnteprimaCodice(strutturaId) {
  try {
    const doc = await db.collection("strutture").doc(strutturaId).get();

    if (!doc.exists) return;

    const data = doc.data();
    const sigla = data.sigla || "XX";
    const anno = new Date().getFullYear();
    const prossimo = (data.progressivo || 0) + 1;

    const codice = `${sigla}${anno}-${String(prossimo).padStart(4, "0")}`;

    const preview = document.getElementById("codicePreview");
    if (preview) {
      preview.innerText = codice;
    }
  } catch (err) {
    console.error("Errore anteprima codice:", err);
  }
}

async function addPrenotazione() {
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!strutturaId) return alert("Seleziona struttura");

  const cliente = document.getElementById("pCliente")?.value.trim();
  const telefono = document.getElementById("pTelefono")?.value.trim();
  const checkin = document.getElementById("pCheckin")?.value;
  const checkout = document.getElementById("pCheckout")?.value;
  const acconto = parseFloat(document.getElementById("pAcconto")?.value) || 0;

  const stanze = Array.from(
    document.querySelectorAll("input[name='stanze']:checked")
  ).map(cb => ({
    stanzaId: cb.value,
    prezzo: parseFloat(cb.dataset.prezzo) || 0
  }));

  if (!cliente || !telefono || !checkin || !checkout || stanze.length === 0) {
    return alert("Compila tutti i campi");
  }

  const totale = stanze.reduce((acc, s) => acc + s.prezzo, 0);
  const resto = totale - acconto;

  try {
    const codice = await generaCodicePrenotazione(strutturaId);

    await db.collection("prenotazioni").add({
      strutturaId,
      codice,
      cliente,
      telefono,
      checkin,
      checkout,
      stanze,
      totale,
      acconto,
      resto,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Prenotazione salvata con codice: " + codice);

    window.location.href = "prenotazioni.html";

  } catch (err) {
    alert("Errore salvataggio: " + err);
  }
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
            <input type="checkbox"
                   name="stanze"
                   value="${doc.id}"
                   data-prezzo="0"
                   onchange="calcolaTotali()">
            Camera ${s.numeroCamera}
          </label>
        `;
      });
    });
}

function calcolaTotali() {
  const acconto = parseFloat(document.getElementById("pAcconto")?.value) || 0;

  const totale = Array.from(
    document.querySelectorAll("input[name='stanze']:checked")
  ).reduce((acc, cb) => acc + (parseFloat(cb.dataset.prezzo) || 0), 0);

  document.getElementById("totalePrenotazione").innerText = totale.toFixed(2);
  document.getElementById("restoDaPagare").innerText = (totale - acconto).toFixed(2);
}

function loadPrenotazioniList() {
  const ul = document.getElementById("listaPrenotazioni");
  const strutturaId = localStorage.getItem("strutturaAttiva");
  if (!ul || !strutturaId) return;

  const ordine = document.getElementById("ordinePrenotazioni")?.value || "checkin";

  ul.innerHTML = "";

  db.collection("prenotazioni")
    .where("strutturaId", "==", strutturaId)
    .orderBy(ordine)
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
            <strong>${p.codice}</strong> -
            ${p.cliente}
            (${p.checkin} → ${p.checkout})
            - Acconto: ${p.acconto} €
          </li>
        `;
      });
    });
}

function loadPrenotazioniPage() {
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!strutturaId) {
    document.getElementById("noStruttura")?.classList.remove("hidden");
    return;
  }

  document.getElementById("prenotazioniContent")?.classList.remove("hidden");

  loadPrenotazioniList();
}

function loadNuovaPrenotazionePage() {
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!strutturaId) {
    document.getElementById("noStruttura")?.classList.remove("hidden");
    return;
  }

  document.getElementById("prenotazioneForm")?.classList.remove("hidden");

  loadStanzeForPrenotazione();

  mostraAnteprimaCodice(strutturaId);

  document.getElementById("pAcconto")
    ?.addEventListener("input", calcolaTotali);
}

/* EXPORT GLOBALI */
window.loadPrenotazioniPage = loadPrenotazioniPage;
window.loadNuovaPrenotazionePage = loadNuovaPrenotazionePage;
window.addPrenotazione = addPrenotazione;
window.loadPrenotazioniList = loadPrenotazioniList;
window.loadStanzeForPrenotazione = loadStanzeForPrenotazione;
window.calcolaTotali = calcolaTotali;