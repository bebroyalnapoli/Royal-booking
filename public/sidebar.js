// ======================================
// SIDEBAR
// ======================================
function loadSidebar(callback) {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  fetch("sidebar.html")
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;

      setTimeout(() => {
        initSidebar();
        initStruttureSelect();
        highlightActiveMenu();

        if (callback) callback();
      }, 0);
    })
    .catch(err => console.error("Errore caricamento sidebar:", err));
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!sidebar || !toggle || !overlay) return;

  toggle.onclick = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  };

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  overlay.onclick = closeSidebar;

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSidebar();
  });

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      closeSidebar();
      logoutUser();
    };
  }

  document.querySelectorAll(".sidebar-menu a").forEach(a => {
    a.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        closeSidebar();
      }
    });
  });
}

// ======================================
// EVIDENZIA MENU ATTIVO
// ======================================
function highlightActiveMenu() {
  const path = window.location.pathname.toLowerCase();

  const map = {
    "dashboard": "menu-dashboard",
    "stanze": "menu-stanze",
    "prenotazioni": "menu-prenotazioni",
    "strutture": "menu-strutture"
  };

  Object.keys(map).forEach(key => {
    if (path.includes(key)) {
      const el = document.getElementById(map[key]);
      if (el) el.classList.add("active");
    }
  });
}

// ======================================
// STRUTTURA ATTIVA
// ======================================
function initStruttureSelect() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  const attiva = localStorage.getItem("strutturaAttiva");

  select.innerHTML = `<option value="">Seleziona struttura</option>`;

  db.collection("strutture")
    .orderBy("nome")
    .get()
    .then(snap => {
      snap.forEach(doc => {
        const opt = document.createElement("option");
        opt.value = doc.id;
        opt.textContent = doc.data().nome;

        if (doc.id === attiva) {
          opt.selected = true;
        }

        select.appendChild(opt);
      });
    })
    .catch(err => console.error("Errore caricamento strutture:", err));

  select.onchange = () => {
    const nuova = select.value;

    if (!nuova) {
      localStorage.removeItem("strutturaAttiva");
    } else {
      localStorage.setItem("strutturaAttiva", nuova);
    }

    location.reload();
  };
}

// ======================================
// EXPORT GLOBALI
// ======================================
window.loadSidebar = loadSidebar;