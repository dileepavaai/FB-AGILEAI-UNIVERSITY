document.addEventListener("DOMContentLoaded", function () {

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">

        <p><strong>AgileAI Foundation & Agile AI University</strong></p>

        <p>
          An independent academic and professional body advancing 
          structured capability in Agile AI and Agentic AI.
        </p>

        <p>
          Public learning, governance frameworks, and credential verification.
        </p>

        <p style="margin-top:20px;">
          © ${new Date().getFullYear()} AgileAI Foundation & Agile AI University
        </p>

      </div>
    </footer>
  `;

  document.getElementById("footer").innerHTML = footerHTML;

});
