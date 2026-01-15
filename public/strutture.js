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
  }).then(() => location.reload());
}

function loadStruttureList() {
  const ul = document.getElementById("listaStrutture");
  if (!ul) return;

  const attiva = localStorage.getItem("strutturaAttiva");
  ul.innerHTML = "";

  db.collection("strutture").get().then(snap => {
    snap.forEach(doc => {
      const s = doc.data();

      ul.innerHTML += `
        <li class="list-item">
          <strong>${s.nome}</strong> (${s.sigla || "—"})
          ${doc.id === attiva ? " ✅" : ""}
          <button onclick="setStrutturaAttiva('${doc.id}')">Usa</button>
        </li>
      `;
    });
  });
}

function setStrutturaAttiva(id) {
  localStorage.setItem("strutturaAttiva", id);
  location.reload();
}

/* EXPORT GLOBALI */
window.addStruttura = addStruttura;
window.loadStruttureList = loadStruttureList;
window.setStrutturaAttiva = setStrutturaAttiva;