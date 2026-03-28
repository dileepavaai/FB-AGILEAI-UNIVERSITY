// =========================
// PILL SELECTOR
// =========================
document.querySelectorAll('.pill-select').forEach(container => {
  const targetId = container.getAttribute('data-target');
  const select = document.getElementById(targetId);

  if (!select) return;

  Array.from(select.options).forEach((opt, index) => {
    const pill = document.createElement('div');
    pill.className = 'pill-option';
    pill.textContent = opt.text;

    if (index === select.selectedIndex) {
      pill.classList.add('active');
    }

    pill.onclick = () => {
      select.value = opt.value;
      container.querySelectorAll('.pill-option').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      select.dispatchEvent(new Event('change'));
    };

    container.appendChild(pill);
  });
});


// =========================
// ENTER NAVIGATION
// =========================
const inputs = Array.from(document.querySelectorAll('.lead-form input, .lead-form select'));

inputs.forEach((el, index) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else {
        addLead();
      }
    }
  });
});


// =========================
// CTRL + ENTER SUBMIT
// =========================
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    if (typeof addLead === "function") {
      addLead();
    }
  }
});