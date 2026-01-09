document.addEventListener("DOMContentLoaded", () => {

  fetch("sidebar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("sidebar").innerHTML = html;
      initSidebar();
      initStrutture();
      highlightActive();
    });

});

function initSidebar() {
  const sidebar = document.getElementById("sidebarMenu");
  const toggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("closeSidebar");

  toggle.onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    toggle.style.display = "none";
  };

  overlay.onclick = closeSidebar;
  closeBtn.onclick = closeSidebar;

  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    link.onclick = closeSidebar;
  });

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    toggle.style.display = "block";
  }
}

function initStrutture() {
  const select = document.getElementById("strutturaSelect");
  if (!select) return;

  const attiva = localStorage.getItem("strutturaAttiva");

  db.collection("strutture").get().then(snapshot => {
    snapshot.forEach(doc => {
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

function highlightActive() {
  document.querySelectorAll(".sidebar-menu a").forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}