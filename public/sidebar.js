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
        if (callback) callback();
      }, 0);
    });
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!sidebar || !toggle || !overlay) return;

  toggle.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  };

  function close() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  overlay.onclick = close;
  document.addEventListener("keydown", e => e.key === "Escape" && close());

  if (logoutBtn) logoutBtn.onclick = logoutUser;

  document.querySelectorAll(".sidebar-menu a").forEach(a => {
    if (a.href === window.location.href) a.classList.add("active");
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