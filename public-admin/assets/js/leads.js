/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE
   Version: v1.4.0 (CHANNEL + DIRECTION ENABLED)
   Date: 2026-04-02

   CHANGE TYPE:
   - SAFE UX ENHANCEMENT (NON-BREAKING)

   NEW:
   ✅ Channel selector (WhatsApp / Email / Call / Manual)
   ✅ Direction selector (Inbound / Outbound)
   ✅ Channel-aware rendering
   ✅ Backward compatible with existing data

   PRESERVED:
   ✅ Interaction lock system
   ✅ Inline edit safety
   ✅ Rendering + listener integrity
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

/* 🔥 GLOBAL INTERACTION LOCK */
let activeInteraction = null;


/* =====================================================
   🔐 HELPERS
===================================================== */

const get = (id) => document.getElementById(id)?.value?.trim() || "";

const safe = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  return v;
};

const renderLinkedInInline = (url) => {
  if (!url) return "";
  return `<a href="${url}" target="_blank" class="lead-linkedin-inline">🔗</a>`;
};

const set = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
};

const escapeHTML = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

/* 🔥 RESET INTERACTION */
function resetActiveInteraction() {
  activeInteraction = null;
}


/* =====================================================
   🔷 CHANNEL FORMATTER
===================================================== */

function formatChannel(channel) {
  if (!channel) return "manual";

  const c = channel.toLowerCase();

  if (c.includes("whatsapp")) return "whatsapp";
  if (c.includes("email")) return "email";
  if (c.includes("call")) return "call";

  return "manual";
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

  const convRate = counts.total ? ((counts.converted / counts.total) * 100).toFixed(1) : 0;
  const qualConvRate = counts.qualified ? ((counts.converted / counts.qualified) * 100).toFixed(1) : 0;

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
      next: "",
      notes: "",
      interactions: 1,
      last_message: "",
      last_message_date: null,
      created_at: serverTimestamp()
    });

    if (typeof clearLeadForm === "function") clearLeadForm();

  } catch (e) {
    console.error(e);
    alert("Failed to save lead");
  } finally {
    isSaving = false;
  }
};


/* =====================================================
   🔷 HISTORY LOADER (CHANNEL ENABLED)
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

          <div class="msg-meta">

            <span class="msg-channel ${formatChannel(m.channel)}">
              ${formatChannel(m.channel).toUpperCase()}
            </span>

            <span>${time}</span>

            <button onclick="enableInlineEdit('${leadId}','${doc.id}','${(m.message || "").replace(/'/g, "\\'")}')">
              ✏️
            </button>

          </div>

          <div class="msg-body" id="msg-${doc.id}">
            ${escapeHTML(m.message)}
            ${m.edit_of ? '<span style="color:orange;font-size:12px;"> (edited)</span>' : ''}
          </div>

        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {
    console.error(err);
    container.innerHTML = "⚠️ Failed to load history";
  }
}


/* =====================================================
   🔷 INTERACTION SAFE LOG (UPDATED)
===================================================== */

window.logCommunicationPrompt = function (leadId) {

  if (activeInteraction) return;

  activeInteraction = "new";

  const container = document.getElementById(`history-${leadId}`);
  if (!container) return;

  container.insertAdjacentHTML("beforeend", `
  <div id="new-msg-box-${leadId}" style="border:1px solid #ddd; padding:10px; margin-top:10px; border-radius:8px; background:#fafafa;">

    <div style="display:flex; gap:8px; margin-bottom:8px;">
      <select id="channel-${leadId}" style="padding:6px;">
        <option value="Manual">Manual</option>
        <option value="WhatsApp">WhatsApp</option>
        <option value="Email">Email</option>
        <option value="Call">Call</option>
      </select>

      <select id="direction-${leadId}" style="padding:6px;">
        <option value="out">Outbound</option>
        <option value="in">Inbound</option>
      </select>
    </div>

    <textarea id="new-msg-${leadId}" style="width:100%; margin-bottom:6px;" placeholder="Type message..."></textarea>
        <select id="channel-${leadId}">
          <option value="LinkedIn" selected>LinkedIn</option>
          <option value="Manual">Manual</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Email">Email</option>
          <option value="Call">Call</option>
        </select>

        <select id="direction-${leadId}">
          <option value="out">Outbound</option>
          <option value="in">Inbound</option>
        </select>
      </div>

      <button onclick="saveNewCommunication('${leadId}')">Save</button>
      <button onclick="cancelNewCommunication('${leadId}')">Cancel</button>

    </div>
  `);
};

window.cancelNewCommunication = function (leadId) {
  document.getElementById(`new-msg-box-${leadId}`)?.remove();
  resetActiveInteraction();
};

window.saveNewCommunication = async function (leadId) {

  const message = document.getElementById(`new-msg-${leadId}`)?.value;
  const channel = document.getElementById(`channel-${leadId}`)?.value || "Manual";
  const direction = document.getElementById(`direction-${leadId}`)?.value || "out";

  if (!message?.trim()) {
    alert("Message cannot be empty");
    return;
  }

  await addDoc(collection(db, "lead_communications"), {
    lead_id: leadId,
    message,
    channel,
    direction,
    created_at: serverTimestamp(),
    created_by: auth.currentUser?.email || "system"
  });

  await updateDoc(doc(db, "leads", leadId), {
    last_message: message,
    last_message_date: serverTimestamp()
  });

  resetActiveInteraction();
  loadHistory(leadId);
};


/* =====================================================
   🔷 INLINE EDIT (UNCHANGED)
===================================================== */

window.enableInlineEdit = function (leadId, docId, oldMessage) {

  if (activeInteraction) return;

  activeInteraction = docId;

  const el = document.getElementById(`msg-${docId}`);
  if (!el) return;

  el.innerHTML = `
    <textarea id="edit-${docId}">${escapeHTML(oldMessage)}</textarea>
    <button onclick="saveInlineEdit('${leadId}','${docId}')">Save</button>
    <button onclick="cancelInlineEdit('${docId}','${escapeHTML(oldMessage)}')">Cancel</button>
  `;
};

window.cancelInlineEdit = function (docId, oldMessage) {
  document.getElementById(`msg-${docId}`).innerHTML = escapeHTML(oldMessage);
  resetActiveInteraction();
};

window.saveInlineEdit = async function (leadId, docId) {

  const updated = document.getElementById(`edit-${docId}`)?.value;

  if (!updated?.trim()) {
    alert("Message cannot be empty");
    return;
  }

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

  resetActiveInteraction();
  loadHistory(leadId);
};


/* =====================================================
   🔷 RENDER + LISTENER (UNCHANGED)
===================================================== */

window.openCommunication = function (leadId) {
  const row = document.getElementById(`lead-expand-${leadId}`);
  if (!row) return;

  const isHidden = row.classList.contains("hidden");
  row.classList.toggle("hidden");

  if (isHidden) loadHistory(leadId);
};

window.renderLeads = function () {

  const body = document.getElementById("leadBody");
  if (!body) return;

  if (!leads.length) {
    body.innerHTML = `<tr><td colspan="7">No leads</td></tr>`;
    return;
  }

  let html = "";

  leads.forEach(l => {
    html += `
      <tr>
        <td><button onclick="openCommunication('${l.id}')">💬</button></td>
        <td><strong>${safe(l.name)}</strong>${renderLinkedInInline(l.linkedin_url)}</td>
        <td>${safe(l.role)}</td>
        <td>${safe(l.company)}</td>
        <td>${safe(l.source)}</td>
        <td>${safe(l.owner)}</td>
        <td>${safe(l.email)}</td>
      </tr>

      <tr id="lead-expand-${l.id}" class="hidden">
        <td colspan="7">

          <div style="padding:12px; background:#f9fafb; border-top:1px solid #eee;">

            <div id="history-${l.id}" style="margin-bottom:10px;"></div>

            <button 
              onclick="logCommunicationPrompt('${l.id}')" 
              style="padding:6px 12px; border-radius:6px; border:1px solid #ccc; background:white; cursor:pointer;"
            >
              + Log Interaction
            </button>

          </div>

        </td>
      </tr>
    `;
  });

  body.innerHTML = html;
};

function initLeadsModule() {
  startListener();
}

async function startListener() {

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "leads"));

  unsubscribe = onSnapshot(q, (snap) => {

    leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    updateLeadMetrics();
    renderLeads();

  });
}

initLeadsModule();