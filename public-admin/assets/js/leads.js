/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE
   Version: v1.2.4
   Date: 2026-04-01

   CHANGE TYPE:
   - STRICT GOVERNANCE PRESERVATION UPDATE (NON-BREAKING)

   FIXES:
   ✅ safe() improved (no blank UI)
   ✅ removed duplicate fallbacks (|| "-")
   ✅ NO structural compression
   ✅ NO logic changes
   ✅ FULL file preserved

===================================================== */

import { db, auth } from "./core.js";

import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   🔐 STATE
===================================================== */

let leads = [];
let unsubscribe = null;
let isSaving = false;


/* =====================================================
   🔐 HELPERS
===================================================== */

const get = (id) => document.getElementById(id)?.value?.trim() || "";

/* 🔥 FIXED SAFE (STRICT NON-BREAKING UI FIX) */
const safe = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  return v;
};

/* 🔗 INLINE LINKEDIN (PRIMARY DISPLAY) */
const renderLinkedInInline = (url) => {
  if (!url) return "";
  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="lead-linkedin-inline">
      🔗
    </a>
  `;
};

/* ⚠️ LEGACY FUNCTION RETAINED (DO NOT REMOVE — GOVERNANCE SAFETY) */
const renderLinkedIn = (url) => {
  if (!url) return `<span style="opacity:0.5">-</span>`;
  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="lead-linkedin">
      🔗 Profile
    </a>
  `;
};

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
    // add later if index created:
    // orderBy("created_at", "desc")
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
          
          <div class="msg-meta" style="display:flex; justify-content:space-between; align-items:center;">
            
            <span>
              ${m.channel || "-"} • ${time}
            </span>

            <button 
              style="border:none;background:transparent;cursor:pointer;font-size:14px;"
              onclick="enableInlineEdit('${leadId}', '${doc.id}', \`${m.message || ""}\`)"
                    >
              ✏️
            </button>

          </div>

          <div class="msg-body" id="msg-${doc.id}">
            ${m.message || ""}
            ${m.edit_of ? '<span style="color:orange;font-size:12px;"> (edited)</span>' : ''}
          </div>

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
   🔷 ACTION HANDLER
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

  } catch (err) {
    console.error("openCommunication error:", err);
  }
};


/* =====================================================
   🔷 RENDER LEADS
===================================================== */

window.renderLeads = function () {

  const body = document.getElementById("leadBody");
  if (!body) return;

  if (!leads.length) {

    body.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:20px;">
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

        <td>
          <strong>${safe(l.name)}</strong>
          ${renderLinkedInInline(l.linkedin_url)}
          <div style="font-size:12px;opacity:0.7">
            ${safe(l.phone)}
          </div>
        </td>

        <td>${safe(l.role)}</td>
        <td>${safe(l.company)}</td>
        <td>${safe(l.source)}</td>
        <td>${safe(l.owner)}</td>
        <td>${safe(l.email)}</td>

      </tr>

      <tr class="lead-meta-row">

        <td></td>

        <td colspan="7">

          <div class="lead-meta-grid">

            <span><b>Score:</b> ${safe(l.score)}</span>
            <span><b>Status:</b> ${safe(l.status)}</span>
            <span><b>Stage:</b> ${safe(l.stage)}</span>
            <span><b>Next Action:</b> ${safe(l.next)}</span>
            <span><b>Last Message:</b> ${safe(l.last_message)}</span>
            <span><b>Notes:</b> ${safe(l.notes)}</span>
            <span><b>Flag:</b> ${safe(l.flag)}</span>

          </div>

        </td>

      </tr>

      <tr id="lead-expand-${l.id}" class="lead-expand hidden">
        <td colspan="7">
          <div class="lead-expanded-card">

            <div>
              <strong>Last Message</strong>
              <p>${safe(l.last_message)}</p>
            </div>

            <div>
              <strong>Conversation History</strong>
              <div id="history-${l.id}" class="lead-history"></div>
            </div>

            <button onclick="logCommunicationPrompt('${l.id}')">
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
   🔷 LISTENER
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
   🔷 LOG COMMUNICATION (MINIMAL SAFE IMPLEMENTATION)
===================================================== */

window.logCommunicationPrompt = function (leadId) {

  const container = document.getElementById(`history-${leadId}`);
  if (!container) return;

  const inputId = `new-msg-${leadId}`;

  container.insertAdjacentHTML("beforeend", `
    <div id="new-msg-box-${leadId}" style="margin-top:10px;">
      
      <textarea 
        id="${inputId}" 
        placeholder="Type message..."
        style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;"
        rows="3"
      ></textarea>

      <div style="margin-top:6px;display:flex;gap:8px;">
        <button onclick="saveNewCommunication('${leadId}')">💾 Save</button>
        <button onclick="cancelNewCommunication('${leadId}')">❌ Cancel</button>
      </div>

    </div>
  `);

  setTimeout(() => {
    document.getElementById(inputId)?.focus();
  }, 0);
};

window.saveNewCommunication = async function (leadId) {

  const el = document.getElementById(`new-msg-${leadId}`);
  const message = el?.value;

  if (!message || !message.trim()) {
    alert("Message cannot be empty");
    return;
  }

  try {

    await addDoc(collection(db, "lead_communications"), {
      lead_id: leadId,
      message,
      channel: "Manual",
      direction: "out",
      created_at: serverTimestamp(),
      created_by: auth.currentUser?.email || "system"
    });

    await updateDoc(doc(db, "leads", leadId), {
      last_message: message,
      last_message_date: serverTimestamp()
    });

    loadHistory(leadId);

  } catch (e) {
    console.error(e);
    alert("Failed to save communication");
  }
};

window.cancelNewCommunication = function (leadId) {

  const box = document.getElementById(`new-msg-box-${leadId}`);
  if (box) box.remove();
};

/* =====================================================
   🔷 AUDIT EDIT COMMUNICATION (NEW)
===================================================== */

window.enableInlineEdit = function (leadId, docId, oldMessage) {

  const el = document.getElementById(`msg-${docId}`);
  if (!el) return;

  el.innerHTML = `
    <textarea id="edit-${docId}" style="width:100%;padding:6px;">${oldMessage}</textarea>
    <div style="margin-top:6px;">
      <button onclick="saveInlineEdit('${leadId}', '${docId}')" style="margin-right:6px;">Save</button>
      <button onclick="cancelInlineEdit('${docId}', \`${oldMessage}\`)">Cancel</button>
    </div>
  `;
};

window.saveInlineEdit = async function (leadId, docId) {

  const updated = document.getElementById(`edit-${docId}`)?.value;
  if (!updated || !updated.trim()) {
  alert("Message cannot be empty");
  return;
  }

  try {

    await addDoc(collection(db, "lead_communications"), {
      lead_id: leadId,
      message: updated,
      channel: "Manual",
      direction: "out",
      created_at: serverTimestamp(),
      created_by: auth.currentUser?.email || "system",
      edit_of: docId
    });

    await updateDoc(doc(db, "leads", leadId), {
      last_message: updated,
      last_message_date: serverTimestamp()
    });

    loadHistory(leadId);

  } catch (e) {
    console.error("Inline edit failed:", e);
    alert("Failed to update message");
  }
};

window.cancelInlineEdit = function (docId, oldMessage) {

  const el = document.getElementById(`msg-${docId}`);
  if (!el) return;

  el.innerHTML = `
  ${oldMessage}
  <span style="color:orange;font-size:12px;"> (edited)</span>
  `;
};

/* =====================================================
   🔷 INIT
===================================================== */

function initLeadsModule() {

  console.log("🚀 Leads module v1.2.4 initializing...");
  startListener();

}

initLeadsModule();