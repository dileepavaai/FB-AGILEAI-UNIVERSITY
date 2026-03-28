export function loadHeader() {
  const header = `
    <header class="topbar">
      <h1>Agile AI University – Admin</h1>
      <div class="user">
        <span id="status">Checking authentication...</span>
        <button id="logoutBtn" style="display:none;">Logout</button>
      </div>
    </header>

    <div id="adminWarning" class="admin-warning hidden">
      ⚠️ Restricted Admin Area — All actions are logged and audited.
    </div>
  `;

  document.getElementById("headerContainer").innerHTML = header;
}