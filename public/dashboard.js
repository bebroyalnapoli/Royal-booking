<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - Royal Booking</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="stylesheet" href="style.css">

  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>

  <script src="firebase.js"></script>
  <script src="auth.js"></script>
  <script src="sidebar.js"></script>
  <script src="dashboard.js"></script>
</head>

<body>

<div id="sidebar-container"></div>

<header class="app-header">
  <button id="menuToggle" class="menu-btn">☰</button>

  <div class="header-titles">
    <h1>ROYAL BOOKING</h1>
    <p id="nomeStrutturaHeader" onclick="openStrutturaSelect()">
      Seleziona struttura
    </p>
  </div>
</header>

<main class="page-content">

  <div id="noStruttura" class="warning hidden">
    ⚠️ Seleziona una struttura per visualizzare i dati
  </div>

  <section id="dashboardKpi" class="kpi-grid hidden">

    <div class="kpi-card">
      <span class="kpi-label">STRUTTURE</span>
      <span id="kpiStrutture" class="kpi-value">0</span>
    </div>

    <div class="kpi-card">
      <span class="kpi-label">OCCUPAZIONE</span>
      <span id="kpiOccupazione" class="kpi-value">0%</span>
      <span class="kpi-sub">oggi</span>
    </div>

    <div class="kpi-card">
      <span class="kpi-label">CHECK-IN</span>
      <span id="kpiCheckin" class="kpi-value">0</span>
      <span class="kpi-sub">arrivi</span>
    </div>

    <div class="kpi-card">
      <span class="kpi-label">CHECK-OUT</span>
      <span id="kpiCheckout" class="kpi-value">0</span>
      <span class="kpi-sub">partenze</span>
    </div>

  </section>

</main>

<script>
  checkAuth();
  loadSidebar(loadDashboard);
</script>

</body>
</html>