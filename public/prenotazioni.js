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

/* ===== ANTEPRIMA CODICE ===== */

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

/* ===== CREAZIONE PRENOTAZIONE ===== */

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

/* ===== CARICAMENTO STANZE ===== */

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
  <label class="stanza-item">
    <input type="checkbox"
           name="stanze"
           value="${doc.id}"
           data-prezzo="${s.prezzo || 0}"
           onchange="calcolaTotali()">
    Camera ${s.numeroCamera} - ${s.prezzo || 0} €
  </label>
`;
      });
    });
}

/* ===== CALCOLO TOTALI ===== */

function calcolaTotali() {
  const acconto = parseFloat(document.getElementById("pAcconto")?.value) || 0;

  const totale = Array.from(
    document.querySelectorAll("input[name='stanze']:checked")
  ).reduce((acc, cb) => acc + (parseFloat(cb.dataset.prezzo) || 0), 0);

  document.getElementById("totalePrenotazione").innerText = totale.toFixed(2);
  document.getElementById("restoDaPagare").innerText = (totale - acconto).toFixed(2);
}

/* ===== NAVIGAZIONE PER MESE ===== */

let meseCorrente = new Date().getMonth();
let annoCorrente = new Date().getFullYear();

function cambiaMese(delta) {
  meseCorrente += delta;

  if (meseCorrente < 0) {
    meseCorrente = 11;
    annoCorrente--;
  }

  if (meseCorrente > 11) {
    meseCorrente = 0;
    annoCorrente++;
  }

  loadPrenotazioniList();
}

function formattaMeseAnno() {
  const mesi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile",
    "Maggio", "Giugno", "Luglio", "Agosto",
    "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  return `${mesi[meseCorrente]} ${annoCorrente}`;
}

/* ===== LISTA PRENOTAZIONI ===== */

function loadPrenotazioniList() {
  const ul = document.getElementById("listaPrenotazioni");
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const titolo = document.getElementById("titoloMese");

  if (!ul || !strutturaId) return;

  if (titolo) {
    titolo.innerText = formattaMeseAnno();
  }

  ul.innerHTML = "";

  const inizio = `${annoCorrente}-${String(meseCorrente + 1).padStart(2, "0")}-01`;
  const fine = `${annoCorrente}-${String(meseCorrente + 1).padStart(2, "0")}-31`;

  db.collection("prenotazioni")
    .where("strutturaId", "==", strutturaId)
    .where("checkin", ">=", inizio)
    .where("checkin", "<=", fine)
    .orderBy("checkin")
    .get()
    .then(snap => {

      if (snap.empty) {
        ul.innerHTML = "<li>Nessuna prenotazione in questo mese</li>";
        return;
      }

      snap.forEach(doc => {
        const p = doc.data();

        ul.innerHTML += `
          <li onclick="apriDettaglioPrenotazione('${doc.id}')" style="cursor:pointer">
            <strong>${p.codice}</strong> -
            ${p.cliente}
            (${p.checkin} → ${p.checkout})
            - Acconto: ${p.acconto} €
          </li>
        `;
      });
    });
}

/* ===== APERTURA DETTAGLIO ===== */

function apriDettaglioPrenotazione(id) {
  window.location.href = "dettaglio_prenotazione.html?id=" + id;
}

/* ===== DETTAGLIO PRENOTAZIONE ===== */

async function loadDettaglioPrenotazione() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return alert("ID prenotazione mancante");

  const doc = await db.collection("prenotazioni").doc(id).get();

  if (!doc.exists) return alert("Prenotazione non trovata");

  const p = doc.data();

  document.getElementById("dCodice").innerText = p.codice;
  document.getElementById("dCliente").value = p.cliente;
  document.getElementById("dTelefono").value = p.telefono;
  document.getElementById("dCheckin").value = p.checkin;
  document.getElementById("dCheckout").value = p.checkout;

  document.getElementById("dTotale").innerText = p.totale.toFixed(2);
  document.getElementById("dAcconto").innerText = p.acconto.toFixed(2);
  document.getElementById("dResto").innerText = p.resto.toFixed(2);
}

/* ===== MODIFICA PRENOTAZIONE ===== */

function abilitaModifica() {
  document.getElementById("dCliente").disabled = false;
  document.getElementById("dTelefono").disabled = false;
  document.getElementById("dCheckin").disabled = false;
  document.getElementById("dCheckout").disabled = false;

  document.getElementById("pulsantiNormali").classList.add("hidden");
  document.getElementById("pulsantiModifica").classList.remove("hidden");
}

function annullaModifica() {
  location.reload();
}

async function salvaModifichePrenotazione() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  await db.collection("prenotazioni").doc(id).update({
    cliente: document.getElementById("dCliente").value,
    telefono: document.getElementById("dTelefono").value,
    checkin: document.getElementById("dCheckin").value,
    checkout: document.getElementById("dCheckout").value
  });

  alert("Modifiche salvate");
  location.reload();
}

/* ===== ELIMINA PRENOTAZIONE ===== */

async function eliminaPrenotazione() {
  if (!confirm("Vuoi eliminare questa prenotazione?")) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  await db.collection("prenotazioni").doc(id).delete();

  alert("Prenotazione eliminata");
  window.location.href = "prenotazioni.html";
}

/* ===== GENERAZIONE PDF ===== */

function generaPDFPrenotazione() {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Riepilogo Prenotazione", 20, 20);

  doc.setFontSize(12);

  doc.text("Codice: " + document.getElementById("dCodice").innerText, 20, 40);
  doc.text("Cliente: " + document.getElementById("dCliente").value, 20, 50);
  doc.text("Telefono: " + document.getElementById("dTelefono").value, 20, 60);

  doc.text("Check-in: " + document.getElementById("dCheckin").value, 20, 80);
  doc.text("Check-out: " + document.getElementById("dCheckout").value, 20, 90);

  doc.text("Totale: " + document.getElementById("dTotale").innerText + " €", 20, 110);
  doc.text("Acconto: " + document.getElementById("dAcconto").innerText + " €", 20, 120);
  doc.text("Resto: " + document.getElementById("dResto").innerText + " €", 20, 130);

  doc.save("Prenotazione_" + document.getElementById("dCodice").innerText + ".pdf");
}

/* ===== CARICAMENTO PAGINE ===== */

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

/* ===== EXPORT GLOBALI ===== */

window.loadPrenotazioniPage = loadPrenotazioniPage;
window.loadNuovaPrenotazionePage = loadNuovaPrenotazionePage;
window.addPrenotazione = addPrenotazione;
window.loadPrenotazioniList = loadPrenotazioniList;
window.loadStanzeForPrenotazione = loadStanzeForPrenotazione;
window.calcolaTotali = calcolaTotali;
window.cambiaMese = cambiaMese;
window.apriDettaglioPrenotazione = apriDettaglioPrenotazione;

window.loadDettaglioPrenotazione = loadDettaglioPrenotazione;
window.abilitaModifica = abilitaModifica;
window.annullaModifica = annullaModifica;
window.salvaModifichePrenotazione = salvaModifichePrenotazione;
window.eliminaPrenotazione = eliminaPrenotazione;
window.generaPDFPrenotazione = generaPDFPrenotazione;