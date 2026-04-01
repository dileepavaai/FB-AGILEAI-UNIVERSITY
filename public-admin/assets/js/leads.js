/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE
   Version: v1.1.4
   Date: 2026-04-01

   CHANGE TYPE:
   - SAFE NON-BREAKING UI ENHANCEMENT

   IMPROVEMENTS:
   ✅ LinkedIn icon moved next to Name (inline)
   ✅ Phone number displayed under Name
   ✅ No table structure changes
   ✅ No impact to existing logic or layout

   PREVIOUS VERSION:
   - v1.1.3 (LinkedIn clickable + stability fixes)

===================================================== */

import { db, auth } from "./core.js";

import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔷 STATE
===================================================== */
let leads = [];
let unsubscribe = null;
let isSaving = false;

/* =====================================================
   🔷 HELPERS
===================================================== */

// Safe getter for inputs
const get = (id) => document.getElementById(id)?.value?.trim() || "";

// Safe render (prevents undefined/null issues)
const safe = (v) => v ?? "";

// 🔥 UPDATED: LinkedIn inline icon (for name column)
const renderLinkedInInline = (url) => {
  if (!url) return "";
  return `
    <a href="${url}" 
       target="_blank" 
       rel="noopener noreferrer" 
       class="lead-linkedin-inline"
       title="Open LinkedIn Profile">
      🔗
    </a>
  `;
};

// Existing LinkedIn renderer (unchanged, used in column)
const renderLinkedIn = (url) => {
  if (!url) {
    return `<span style="opacity:0.5">-</span>`;
  }

  return `
    <a href="${url}" 
       target="_blank" 
       rel="noopener noreferrer" 
       class="lead-linkedin">
      🔗 Profile
    </a>
  `;
};

// Safe metric setter
const set = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
};

/* =====================================================
   🔷 METRICS
===================================================== */
function updateLeadMetrics() {

  const counts = {
    total: 0,
    engaged: 0,
    qualified: 0,
    converted: 0
  };

  leads.forEach(l => {
    const stage = (l.stage || "").toLowerCase();

    counts.total++;

    if (stage === "engaged") counts.engaged++;
    if (stage === "qualified") counts.qualified++;
    if (stage === "converted") counts.converted++;
  });

  set("mTotal", counts.total);
  set("mEngaged", counts.engaged);
  set("mQualified", counts.qualified);
  set("mConverted", counts.converted);

  const convRate = counts.total
    ? ((counts.converted / counts.total) * 100).toFixed(1)
    : 0;

  const qualConvRate = counts.qualified
    ? ((counts.converted / counts.qualified) * 100).toFixed(1)
    : 0;

  set("mConvRate", convRate + "%");
  set("mQualConvRate", qualConvRate + "%");
}

/* =====================================================
   🔷 ADD LEAD
===================================================== */
window.addLead = async function () {

  if (isSaving) return;
  isSaving = true;

  const name = get("leadName");
  const linkedin = get("leadLinkedIn");

  if (!name || !linkedin) {
    alert("Name and LinkedIn are required");
    isSaving = false;
    return;
  }

  try {

    const lastContactDate = get("leadLastContactDate") || null;

    await addDoc(collection(db, "leads"), {

      name,
      role: get("leadRole"),
      company: get("leadCompany"),
      location: get("leadLocation"),
      experience: get("leadExperience"),

      linkedin_url: linkedin,

      email: get("leadEmail") || null,
      phone: get("leadPhone") || null,

      source: get("leadSource") || "LinkedIn",
      source_detail: get("leadSourceDetail"),

      owner: auth.currentUser?.email || "system",
      created_by: auth.currentUser?.email || "system",

      score: 3,
      status: "Warm",

      stage: lastContactDate ? "contacted" : "new",

      last_contact_date: lastContactDate,
      next: "",
      notes: "",

      interactions: 1,

      last_message: "",
      last_message_date: null,

      created_at: serverTimestamp()
    });

    if (typeof clearLeadForm === "function") {
      clearLeadForm();
    }

  } catch (e) {

    console.error(e);
    alert("Failed to save lead");

  } finally {

    isSaving = false;

  }
};

/* =====================================================
   🔷 HISTORY LOADER
===================================================== */
async function loadHistory(leadId) {

  const container = document.getElementById(`history-${leadId}`);
  if (!container) return;

  container.innerHTML = "Loading...";

  try {

    const q = query(
      collection(db, "lead_communications"),
      where("lead_id", "==", leadId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = "No history yet";
      return;
    }

    let html = "";

    snap.forEach(doc => {

      const m = doc.data();

      const time = m.created_at?.seconds
        ? new Date(m.created_at.seconds * 1000).toLocaleString()
        : "-";

      html += `
        <div class="msg ${m.direction || "out"}">
          <div class="msg-meta">${m.channel || "-"} • ${time}</div>
          <div class="msg-body">${m.message || ""}</div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {

    console.error("History load failed:", err);
    container.innerHTML = "⚠️ Failed to load history";

  }
}

/* =====================================================
   🔷 ACTION HANDLER (ROW EXPAND)
===================================================== */
window.openCommunication = function (leadId) {

  try {

    const expandRow = document.getElementById(`lead-expand-${leadId}`);
    if (!expandRow) return;

    const isHidden = expandRow.classList.contains("hidden");

    expandRow.classList.toggle("hidden");

    if (isHidden) {
      loadHistory(leadId);
    }

    expandRow.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  } catch (err) {

    console.error("openCommunication error:", err);

  }
};

/* =====================================================
   🔷 RENDER LEADS (ONLY SAFE ENHANCEMENT APPLIED)
===================================================== */
window.renderLeads = function () {

  const body = document.getElementById("leadBody");
  if (!body) return;

  if (!leads.length) {

    body.innerHTML = `
      <tr>
        <td colspan="14" style="text-align:center;padding:20px;">
          No leads found
        </td>
      </tr>
    `;

    return;
  }

  let html = "";

  leads.forEach(l => {

    html += `

      <tr>

        <td>
          <button class="lead-action-btn" onclick="openCommunication('${l.id}')">
            💬
          </button>
        </td>

        <!-- 🔥 UPDATED NAME CELL (INLINE LINKEDIN + PHONE) -->
        <td>
          <strong>${safe(l.name)}</strong>
          ${renderLinkedInInline(l.linkedin_url)}
          <div style="font-size:12px;opacity:0.7">
            ${safe(l.phone) || "-"}
          </div>
        </td>

        <td>${safe(l.role)}</td>
        <td>${safe(l.company)}</td>
        <td>${safe(l.source)}</td>
        <td>${safe(l.owner)}</td>
        <td>${safe(l.email)}</td>

        <!-- KEEP EXISTING COLUMN -->
        <td>${renderLinkedIn(l.linkedin_url)}</td>

        <td>${safe(l.score)}</td>
        <td>${safe(l.status)}</td>
        <td>${safe(l.stage)}</td>
        <td>${safe(l.next)}</td>
        <td>${safe(l.notes)}</td>
        <td>${safe(l.last_message) || "-"}</td>
        <td>${safe(l.flag)}</td>

      </tr>

      <tr id="lead-expand-${l.id}" class="lead-expand hidden">
        <td colspan="14">
          <div class="lead-expanded-card">

            <div>
              <strong>Last Message</strong>
              <p>${safe(l.last_message) || "No message yet"}</p>
            </div>

            <div>
              <strong>Conversation History</strong>
              <div id="history-${l.id}" class="lead-history"></div>
            </div>

            <button onclick="openCommunication('${l.id}')">
              + Log Communication
            </button>

          </div>
        </td>
      </tr>
    `;
  });

  body.innerHTML = html;
};

/* =====================================================
   🔷 FIRESTORE LISTENER
===================================================== */
async function startListener() {

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "leads"));

  unsubscribe = onSnapshot(q, (snap) => {

    leads = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    leads.sort((a, b) => {
      const t1 = a.created_at?.seconds || 0;
      const t2 = b.created_at?.seconds || 0;
      return t2 - t1;
    });

    updateLeadMetrics();
    renderLeads();

  });

  const snap = await getDocs(q);

  leads = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  updateLeadMetrics();
  renderLeads();
}

/* =====================================================
   🔷 INIT
===================================================== */
function initLeadsModule() {

  console.log("🚀 Leads module v1.1.4 initializing...");
  startListener();

}

initLeadsModule();