/* =========================================================
   Agile + AI Capability Assessment
   UI Flow + Progress Indicator
   v1.6.4 — PARTICIPANT PERSISTENCE FIXED (LOCKED)
   ========================================================= */

(function () {

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const intro = $(".assessment-intro");
  const context = $(".assessment-context");
  const sections = $$(".assessment-section");
  const lead = $(".assessment-lead");
  const submit = $(".assessment-submit");

  const startBtn = $("#startAssessment");
  const continueBtn = $("#continueToQuestions");
  const submitLeadBtn = $("#submitLead");

  const progress = $("#assessmentProgress");
  const progressText = $("#progressText");
  const progressFill = $("#progressFill");

  /* ---------- CONTEXT ---------- */
  const ctxRole = $("#ctx-role");
  const ctxIndustry = $("#ctx-industry");
  const ctxAspiration = $("#ctx-aspiration");
  const contextError = $("#contextError");

  /* ---------- LEAD ---------- */
  const leadName = $("#lead-name");
  const leadEmail = $("#lead-email");
  const leadError = $("#leadError");

  const TOTAL = 8;
  let index = 0;

  /* ---------- SAFETY ---------- */
  if (!intro || !startBtn) {
    console.error("Assessment intro missing.");
    return;
  }

  function hideAll() {
    context?.classList.add("hidden");
    lead?.classList.add("hidden");
    submit?.classList.add("hidden");
    sections.forEach(s => s.classList.add("hidden"));
  }

  function update(step) {
    progress.classList.remove("hidden");
    progressText.textContent = `Step ${step} of ${TOTAL}`;
    progressFill.style.width = `${(step / TOTAL) * 100}%`;
  }

  /* ---------- VALIDATION ---------- */
  const isContextValid = () =>
    ctxRole.value && ctxIndustry.value && ctxAspiration.value;

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isLeadValid = () =>
    leadName.value.trim() && isValidEmail(leadEmail.value.trim());

  /* ---------- INIT ---------- */
  hideAll();
  progress.classList.add("hidden");

  /* ---------- START ---------- */
  startBtn.addEventListener("click", () => {
    intro.classList.add("hidden");
    hideAll();
    context.classList.remove("hidden");
    update(1);
  });

  /* ---------- CONTEXT ---------- */
  continueBtn.addEventListener("click", () => {
    if (!isContextValid()) {
      contextError.style.display = "block";
      return;
    }

    contextError.style.display = "none";
    index = 0;

    hideAll();
    sections[0].classList.remove("hidden");
    update(2);
  });

  /* ---------- QUESTIONS ---------- */
  sections.forEach((sec, i) => {

    sec.querySelector(".next-btn")?.addEventListener("click", () => {
      const valid = [...sec.querySelectorAll(".question-block")]
        .every(q => q.querySelector("input:checked"));

      if (!valid) {
        alert("Please answer all questions.");
        return;
      }

      if (i < sections.length - 1) {
        hideAll();
        sections[++index].classList.remove("hidden");
        update(index + 2);
      } else {
        hideAll();
        lead.classList.remove("hidden");
        update(7);
      }
    });

    sec.querySelector(".prev-btn")?.addEventListener("click", () => {
      if (i === 0) {
        hideAll();
        context.classList.remove("hidden");
        update(1);
      } else {
        hideAll();
        sections[--index].classList.remove("hidden");
        update(index + 2);
      }
    });
  });

  /* ---------- LEAD SUBMIT (🔥 FIX HERE 🔥) ---------- */
  submitLeadBtn.addEventListener("click", () => {

    if (!isLeadValid()) {
      leadError.style.display = "block";
      return;
    }

    leadError.style.display = "none";

    /* ✅ STORE PARTICIPANT — SOURCE OF TRUTH */
    sessionStorage.setItem(
      "assessmentParticipant",
      JSON.stringify({
        name: leadName.value.trim(),
        email: leadEmail.value.trim()
      })
    );

    hideAll();
    submit.classList.remove("hidden");
    update(8);
  });

})();