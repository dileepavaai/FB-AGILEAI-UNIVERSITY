document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("header");
  if (el) {
    el.innerHTML = `
      <header style="padding:20px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between;">
        <strong>Agile AI Academy</strong>
        <nav>
          <a href="#" style="margin-left:20px; color:white;">Programs</a>
          <a href="#" style="margin-left:20px; color:white;">Cohorts</a>
          <a href="#" style="margin-left:20px; color:white;">Contact</a>
        </nav>
      </header>
    `;
  }
});