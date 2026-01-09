function loginUser() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("loginError");

  errorBox.textContent = "";

  if (!email || !password) {
    errorBox.textContent = "Inserisci email e password";
    return;
  }

  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      errorBox.textContent = "Credenziali non valide";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  // Apri sidebar (mobile)
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
    };
  }

initStrutture();

  // Chiudi sidebar
  if (overlay) {
    overlay.onclick = closeSidebar;
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  // Evidenzia pagina attiva
  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
      });
    };
  }
const db = firebase.firestore();

function initStrutture() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  const attiva = localStorage.getItem("strutturaAttiva");

  db.collection("strutture").get().then(snap => {
    snap.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = doc.data().nome;
      if (doc.id === attiva) opt.selected = true;
      select.appendChild(opt);
    });
  });

  select.onchange = () => {
    localStorage.setItem("strutturaAttiva", select.value);
    location.reload();
  };
}

  // ESC per chiudere (mobile)
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSidebar();
  });
});