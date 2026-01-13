function addStanza() {
  const numero = document.getElementById("stanzaNumero").value.trim();
  const descrizione = document.getElementById("stanzaDescrizione").value.trim();
  const ospitiMax = parseInt(document.getElementById("stanzaOspiti").value);
  const strutturaId = localStorage.getItem("strutturaAttiva");

  if (!strutturaId) return alert("Seleziona una struttura");
  if (!numero) return alert("Numero stanza obbligatorio");
  if (!ospitiMax || ospitiMax < 1) return alert("Numero ospiti non valido");

  db.collection("stanze").add({
    strutturaId,
    numeroCamera: numero,
    descrizione,
    ospitiMax,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => location.reload());
}

function loadStanze() {
  const ul = document.getElementById("listaStanze");
  const strutturaId = localStorage.getItem("strutturaAttiva");
  const warning = document.getElementById("noStruttura");

  if (!ul) return;

  if (!strutturaId) {
    warning?.classList.remove("hidden");
    return;
  }

  warning?.classList.add("hidden");
  ul.innerHTML = "";

  db.collection("stanze")
    .where("strutturaId", "==", strutturaId)
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const s = doc.data();
        ul.innerHTML += `
          <li class="list-item">
            ${s.numeroCamera} – ${s.descrizione || "—"} (${s.ospitiMax} ospiti)
          </li>
        `;
      });
    });
}