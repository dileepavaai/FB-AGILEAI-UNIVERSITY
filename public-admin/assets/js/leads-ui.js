/* =====================================================
   🔷 FORM UX ENGINE (SAFE + STABLE)
   Version: v2.1.0
===================================================== */

/* =========================
   PILL SELECTOR (SAFE INIT)
========================= */
function initPillSelectors() {

  document.querySelectorAll('.pill-select').forEach(container => {

    // ✅ Prevent duplicate init
    if (container.dataset.initialized === "true") return;
    container.dataset.initialized = "true";

    const targetId = container.getAttribute('data-target');
    const select = document.getElementById(targetId);

    if (!select) return;

    container.innerHTML = ""; // ✅ clear old pills

    Array.from(select.options).forEach((opt, index) => {

      const pill = document.createElement('div');
      pill.className = 'pill-option';
      pill.textContent = opt.text;

      if (index === select.selectedIndex) {
        pill.classList.add('active');
      }

      pill.onclick = () => {
        select.value = opt.value;

        container.querySelectorAll('.pill-option')
          .forEach(p => p.classList.remove('active'));

        pill.classList.add('active');

        select.dispatchEvent(new Event('change'));
      };

      container.appendChild(pill);
    });

  });
}

/* =========================
   ENTER NAVIGATION (SAFE)
========================= */
function initEnterNavigation() {

  const inputs = Array.from(
    document.querySelectorAll(
      '.lead-form input:not([type="hidden"]):not([disabled]), .lead-form select:not([disabled])'
    )
  );

  inputs.forEach((el, index) => {

    el.addEventListener('keydown', (e) => {

      if (e.key === 'Enter') {
        e.preventDefault();

        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          if (typeof addLead === "function") {
            addLead();
          }
        }
      }

    });

  });
}

/* =========================
   CTRL + ENTER SUBMIT (SAFE)
========================= */
function initCtrlEnterSubmit() {

  // ✅ prevent duplicate listener
  if (window.__ctrlEnterBound) return;
  window.__ctrlEnterBound = true;

  document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.key === "Enter") {
      if (typeof addLead === "function") {
        addLead();
      }
    }

  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

  initPillSelectors();
  initEnterNavigation();
  initCtrlEnterSubmit();

});