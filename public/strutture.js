function addStruttura() {
  const nome = document.getElementById("sNome").value.trim();
  const indirizzo = document.getElementById("sIndirizzo").value.trim();
  const email = document.getElementById("sEmail").value.trim();
  const telefono = document.getElementById("sTelefono").value.trim();
  const sigla = document.getElementById("sSigla")?.value.trim().toUpperCase();

  if (!nome) return alert("Nome obbligatorio");
  if (!sigla) return alert("Sigla obbligatoria (es. RT)");

  db.collection("strutture").add({
    nome,
    indirizzo,
    email,
    telefono,
    sigla,
    progressivo: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Struttura creata correttamente");
    clearFormStruttura();
    loadStruttureList();
  })
  .catch(err => {
    alert("Errore creazione struttura: " + err);
  });
}

function clearFormStruttura() {
  document.getElementById("sNome").value = "";
  document.getElementById("sIndirizzo").value = "";
  document.getElementById("sEmail").value = "";
  document.getElementById("sTelefono").value = "";
  document.getElementById("sSigla").value = "";
}

function loadStruttureList() {
  const ul = document.getElementById("listaStrutture");
  if (!ul) return;

  const attiva = localStorage.getItem("strutturaAttiva");
  ul.innerHTML = "";

  db.collection("strutture")
    .orderBy("nome")
    .get()
    .then(snap => {

      if (snap.empty) {
        ul.innerHTML = "<li>Nessuna struttura presente</li>";
        return;
      }

      snap.forEach(doc => {
        const s = doc.data();

        ul.innerHTML += `
          <li class="list-item">
            <div>
              <strong>${s.nome}</strong> (${s.sigla || "—"})<br>
              <small>Progressivo attuale: ${s.progressivo || 0}</small>
            </div>

            <div>
              ${doc.id === attiva ? " ✅ Attiva " : ""}
              <button onclick="setStrutturaAttiva('${doc.id}')">Usa</button>
              <button onclick="deleteStruttura('${doc.id}')">Elimina</button>
            </div>
          </li>
        `;
      });
    })
    .catch(err => {
      ul.innerHTML = "<li>Errore caricamento strutture</li>";
      console.error(err);
    });
}

function setStrutturaAttiva(id) {
  localStorage.setItem("strutturaAttiva", id);
  alert("Struttura selezionata");
  loadStruttureList();
}

function deleteStruttura(id) {
  if (!confirm("Eliminare questa struttura?")) return;

  db.collection("strutture").doc(id).delete()
    .then(() => {
      if (localStorage.getItem("strutturaAttiva") === id) {
        localStorage.removeItem("strutturaAttiva");
      }

      alert("Struttura eliminata");
      loadStruttureList();
    })
    .catch(err => {
      alert("Errore eliminazione: " + err);
    });
}

/* EXPORT GLOBALI */
window.addStruttura = addStruttura;
window.loadStruttureList = loadStruttureList;
window.setStrutturaAttiva = setStrutturaAttiva;
window.deleteStruttura = deleteStruttura;