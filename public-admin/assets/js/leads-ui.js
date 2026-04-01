/* =====================================================
   🔷 FORM UX ENGINE (SAFE + STABLE)
   Version: v2.1.1
   Date: 2026-04-01

   CHANGE TYPE:
   - NON-BREAKING SAFETY FIX

   IMPROVEMENTS:
   ✅ Fixed selector mismatch (.lead-form → .leads-form-grid)
   ✅ Prevent duplicate Enter listeners
   ✅ Future-safe textarea handling
===================================================== */


/* =========================
   PILL SELECTOR (SAFE INIT)
========================= */
function initPillSelectors() {

  document.querySelectorAll('.pill-select').forEach(container => {

    if (container.dataset.initialized === "true") return;
    container.dataset.initialized = "true";

    const targetId = container.getAttribute('data-target');
    const select = document.getElementById(targetId);

    if (!select) return;

    container.innerHTML = "";

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

  // ✅ prevent duplicate binding
  if (window.__enterNavBound) return;
  window.__enterNavBound = true;

  const inputs = Array.from(
    document.querySelectorAll(
      '.leads-form-grid input:not([type="hidden"]):not([disabled]), .leads-form-grid select:not([disabled])'
    )
  );

  inputs.forEach((el, index) => {

    el.addEventListener('keydown', (e) => {

      if (e.key === 'Enter' && e.target.tagName !== "TEXTAREA") {

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