/* =====================================================
   🔷 LEADS INTELLIGENCE ENGINE
   Version: v1.2.0 (Robust Direction Fix + Backward Compatible)
===================================================== */

export function initCommunicationLogging() {

  document.addEventListener("click", function (e) {

    if (e.target.classList.contains("log-communication-btn")) {

      const leadId = e.target.getAttribute("data-id");

      openCommunicationModal(leadId);
    }

  });

}

/* =========================
   MODAL CREATION
========================= */
function openCommunicationModal(leadId) {

  let modal = document.getElementById("communicationModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "communicationModal";
    modal.className = "comm-modal";

    modal.innerHTML = `
      <div class="comm-modal-content">
        <h3>Log Communication</h3>

        <textarea id="commMessage" placeholder="Enter message..."></textarea>

        <select id="commType">
          <option value="LinkedIn">LinkedIn</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Email">Email</option>
          <option value="Call">Call</option>
        </select>

        <select id="commDirection">
          <option value="out">Outbound</option>
          <option value="in">Inbound</option>
        </select>

        <div class="comm-actions">
          <button id="saveComm">Save</button>
          <button id="closeComm">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  modal.style.display = "flex";

  document.getElementById("closeComm").onclick = () => {
    modal.style.display = "none";
  };

  document.getElementById("saveComm").onclick = () => {
    saveCommunication(leadId);
    modal.style.display = "none";
  };
}

/* =========================
   SAVE LOGIC
========================= */
function saveCommunication(leadId) {

  const message = document.getElementById("commMessage").value.trim();
  const type = document.getElementById("commType").value;
  const direction = document.getElementById("commDirection").value;

  if (!message) return;

  const log = {
    message,
    type,
    direction, // always "in" or "out"
    timestamp: new Date().toISOString()
  };

  let data = JSON.parse(localStorage.getItem("lead_comm_logs")) || {};

  if (!data[leadId]) {
    data[leadId] = [];
  }

  data[leadId].push(log);

  localStorage.setItem("lead_comm_logs", JSON.stringify(data));

  renderCommunication(leadId);
}

/* =========================
   RENDER HISTORY
========================= */
export function renderCommunication(leadId) {

  const container = document.querySelector(`[data-history="${leadId}"]`);
  if (!container) return;

  const data = JSON.parse(localStorage.getItem("lead_comm_logs")) || {};
  const logs = data[leadId] || [];

  if (logs.length === 0) {
    container.innerHTML = "No history yet";
    return;
  }

  const latest = logs[logs.length - 1];

  const lastMessageEl = document.querySelector(`[data-last-message="${leadId}"]`);
  if (lastMessageEl) {
    lastMessageEl.innerText = latest.message;
  }

  container.innerHTML = logs.map(l => {

    // 🔥 NORMALIZATION (handles old + new data)
    const rawDir = (l.direction || "").toLowerCase();

    let dirClass = "out";
    let dirLabel = "Outbound";

    if (rawDir === "in" || rawDir === "inbound") {
      dirClass = "in";
      dirLabel = "Inbound";
    }

    return `
      <div class="comm-item ${dirClass}">
        <div style="font-size:11px; opacity:0.6; margin-bottom:4px;">
          ${dirLabel} • ${l.type}
        </div>
        ${l.message}
      </div>
    `;
  }).join("");

}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initCommunicationLogging();
});