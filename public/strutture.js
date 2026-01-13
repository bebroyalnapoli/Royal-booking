function addStruttura() {
  const nome = document.getElementById("sNome").value.trim();
  const indirizzo = document.getElementById("sIndirizzo").value.trim();
  const email = document.getElementById("sEmail").value.trim();
  const telefono = document.getElementById("sTelefono").value.trim();

  if (!nome) return alert("Nome obbligatorio");

  db.collection("strutture").add({
    nome, indirizzo, email, telefono,
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
      ul.innerHTML += `
        <li class="list-item">
          <strong>${doc.data().nome}</strong>
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