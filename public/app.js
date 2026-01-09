document.addEventListener("DOMContentLoaded", () => {

  fetch("sidebar.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("sidebar").innerHTML = html;
      initSidebar();
      initStrutture();
    });

});

function initSidebar() {
  const sidebar = document.getElementById("sidebarMenu");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");

  if (toggle) {
    toggle.onclick = () => {
      sidebar.classList.add("open");
      overlay.classList.add("show");
    };
  }

  if (overlay) {
    overlay.onclick = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };
  }
}

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