export function loadFooter() {
  const footer = `
    <footer class="admin-footer">
      <div class="footer-inner">
        <p>
          Agile AI University defines structured academic frameworks, capability standards, 
          and professional recognition models for the Agile AI domain.
          It operates as an independent academic and professional body and is not positioned 
          as a commercial training provider.
        </p>
        <p style="margin-top:8px; font-size:12px;">
          © 2026 Agile AI University · Admin System
        </p>
      </div>
    </footer>
  `;

  document.getElementById("footerContainer").innerHTML = footer;
}