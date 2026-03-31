/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE (STABLE + SAFE)
   Version: v2.4.0 (Stability + UX Fix)
===================================================== */

import { db, auth } from "./core.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔷 STATE
===================================================== */
let leads = [];
let unsubscribe = null;
let isSaving = false;
let currentLeadId = null;

/* =====================================================
   🔷 HELPERS
===================================================== */
const get = (id) => document.getElementById(id)?.value?.trim() || "";
const safe = (v) => v ?? "";

const set = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
};

function getSafeStage(l) {
  return l.stage || "new";
}

/* =====================================================
   🔷 METRICS
===================================================== */
function updateLeadMetrics() {
  const counts = { total: 0, engaged: 0, qualified: 0, converted: 0 };

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
   🔷 ADD LEAD (UNCHANGED)
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
      last_response_type: null,
      next: "",
      notes: "",
      interactions: 1,
      last_message: "",
      last_message_date: null,
      created_at: serverTimestamp()
    });

    clearLeadForm();

  } catch (e) {
    console.error(e);
    alert("Failed to save lead");
  } finally {
    isSaving = false;
  }
};

/* =====================================================
   🔷 HISTORY (FIXED + SAFE)
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
   🔷 RENDER (FIXED)
===================================================== */
window.renderLeads = function () {

  const body = document.getElementById("leadBody");
  if (!body) return;

  if (!leads.length) {
    body.innerHTML = `
      <tr>
        <td colspan="13" style="text-align:center;padding:20px;">
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
        <td>${safe(l.name)}</td>
        <td>${safe(l.role)}</td>
        <td>${safe(l.company)}</td>
        <td>${safe(l.source)}</td>
        <td>${safe(l.owner)}</td>
        <td>${safe(l.email)}</td>
        <td>${safe(l.score)}</td>
        <td>${safe(l.status)}</td>
        <td>${safe(l.stage)}</td>
        <td>${safe(l.notes)}</td>
        <td><button onclick="toggleLead('${l.id}')">View</button></td>
        <td>${safe(l.flag)}</td>
      </tr>

      <tr id="lead-expand-${l.id}" class="lead-expand hidden">
        <td colspan="13">
          <div class="lead-expanded-card">

            <div>
              <strong>Last Message</strong>
              <p>${safe(l.last_message) || "No message yet"}</p>
            </div>

            <div>
              <strong>Conversation History</strong>
              <div id="history-${l.id}" class="lead-history"></div>
            </div>

            <button onclick="openMessageModal('${l.id}')">
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
   🔷 TOGGLE
===================================================== */
window.toggleLead = async function(id) {
  const el = document.getElementById(`lead-expand-${id}`);
  if (!el) return;

  const isHidden = el.classList.contains("hidden");

  el.classList.toggle("hidden");

  if (isHidden) {
    await loadHistory(id);
  }
};

/* =====================================================
   🔷 LISTENER
===================================================== */
function startListener() {

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "leads"), orderBy("created_at", "desc"));

  unsubscribe = onSnapshot(q, (snap) => {
    leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateLeadMetrics();
    renderLeads();
  });
}

/* =====================================================
   🔷 INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  startListener();
});