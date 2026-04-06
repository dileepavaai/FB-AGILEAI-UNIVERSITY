/* =====================================================
🔷 LEAD INTELLIGENCE MODULE
Version: v1.6.0 (STABLE + COMPACT PREMIUM UI)
Date: 2026-04-03

CHANGE TYPE:

* SAFE UX CONSOLIDATION (NON-BREAKING)

NEW:
✅ Single-row compact interaction layout
✅ LinkedIn added as default channel
✅ Cleaner spacing + alignment

PRESERVED:
✅ All Firestore logic
✅ Inline edit system
✅ Interaction lock
✅ Metrics + rendering
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
where,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
🔐 STATE
===================================================== */

let leads = [];
let unsubscribe = null;
let isSaving = false;
let activeInteraction = null;
let activeInteractionLeadId = null;

/* =====================================================
🔐 HELPERS
===================================================== */

const get = (id) => document.getElementById(id)?.value?.trim() || "";

const safe = (v) => (!v ? "-" : v);

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

function resetActiveInteraction() {
activeInteraction = null;
}

function getChannelClass(channel) {
  if (!channel) return "channel-manual";

  const c = channel.toLowerCase();

  if (c.includes("linkedin")) return "channel-linkedin";
  if (c.includes("whatsapp")) return "channel-whatsapp";
  if (c.includes("email")) return "channel-email";
  if (c.includes("call")) return "channel-call";

  return "channel-manual";
}

/* =====================================================
🔷 CHANNEL FORMATTER
===================================================== */

function formatChannel(channel) {
  if (!channel) return "other";

  const c = channel.toLowerCase();

  if (c.includes("whatsapp")) return "whatsapp";
  if (c.includes("email")) return "email";
  if (c.includes("call")) return "call";
  if (c.includes("linkedin")) return "linkedin";
  if (c.includes("manual") || c.includes("offline") || c.includes("other")) return "other";

  return "other";
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

if (typeof clearLeadForm === "function") clearLeadForm();

}
catch (e) {
console.error(e);
alert("Failed to save lead");
} finally {
isSaving = false;
}
};

async function loadHistory(leadId) {

  const container = document.getElementById(`history-${leadId}`);
  if (!container) return;

  container.innerHTML = "Loading...";

  try {

    const q = query(
      collection(db, "lead_communications"),
      where("lead_id", "==", leadId),
      orderBy("created_at", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = "No history yet";
      return;
    }

    let html = "";

    snap.forEach(docSnap => {

      const m = docSnap.data();

      const time = m.created_at?.seconds
        ? new Date(m.created_at.seconds * 1000).toLocaleString()
        : "-";

      html += `
        <div class="msg ${m.direction || "out"}">

          <div class="msg-meta">
            ${getChannelBadge(m.channel)}
            <span>${time}</span>

            <button onclick="enableInlineEdit('${leadId}','${docSnap.id}','${(m.message || "").replace(/'/g, "\\'")}')">
              ✏️
            </button>
          </div>

          <div class="msg-body" id="msg-${docSnap.id}">
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
🔷 TO GET CHANNEL BADGE
===================================================== */

function getChannelBadge(channel) {
  const ch = formatChannel(channel);

  const map = {
    linkedin: "channel-linkedin",
    whatsapp: "channel-whatsapp",
    email: "channel-email",
    call: "channel-call",
    other: "channel-other"
  };

  const labelMap = {
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    email: "Email",
    call: "Call",
    other: "Other / Offline"
  };

  return `
    <span class="channel-badge ${map[ch] || "channel-other"}">
      ${labelMap[ch]}
    </span>
  `;
}

/* =====================================================
🔷 SINGLE-ROW INTERACTION UI
===================================================== */

window.logCommunicationPrompt = function (leadId) {

  const container = document.getElementById(`history-${leadId}`);
  if (!container) return;

  const existingBox = document.getElementById(`new-msg-box-${leadId}`);

  // 🔁 TOGGLE SAME LEAD
  if (activeInteractionLeadId === leadId) {
    existingBox?.remove();
    activeInteractionLeadId = null;
    activeInteraction = null;
    return;
  }

  // 🔥 CLOSE ANY OTHER OPEN INTERACTION
  if (activeInteractionLeadId !== null) {
    const prevBox = document.getElementById(`new-msg-box-${activeInteractionLeadId}`);
    prevBox?.remove();
  }

  // ✅ SET ACTIVE STATE
  activeInteractionLeadId = leadId;
  activeInteraction = "new";

  // ✅ RENDER CLEAN UI
  container.insertAdjacentHTML("beforeend", `
    <div id="new-msg-box-${leadId}" class="interaction-row">

      <select id="channel-${leadId}" class="interaction-field small">
        <option value="LinkedIn" selected>LinkedIn</option>
        <option value="WhatsApp">WhatsApp</option>
        <option value="Email">Email</option>
        <option value="Call">Call</option>
        <option value="Other / Offline">Other / Offline</option>
      </select>

      <select id="direction-${leadId}" class="interaction-field small">
        <option value="out">Outbound</option>
        <option value="in">Inbound</option>
      </select>

      <input 
        id="new-msg-${leadId}" 
        class="interaction-field flex"
        placeholder="Type message..."
      />

      <button onclick="saveNewCommunication('${leadId}')" class="interaction-btn primary">
        Save
      </button>

      <button onclick="cancelNewCommunication('${leadId}')" class="interaction-btn">
        Cancel
      </button>

    </div>
  `);
};

/* =====================================================
🔷 SAVE / CANCEL
===================================================== */

window.cancelNewCommunication = function (leadId) {
  document.getElementById(`new-msg-box-${leadId}`)?.remove();
  activeInteraction = null;
  activeInteractionLeadId = null;
};

window.saveNewCommunication = async function (leadId) {

const msg = document.getElementById(`new-msg-${leadId}`)?.value?.trim();
const channel = document.getElementById(`channel-${leadId}`)?.value;
const direction = document.getElementById(`direction-${leadId}`)?.value;

if (!msg) {
alert("Message required");
return;
}

await addDoc(collection(db, "lead_communications"), {
lead_id: leadId,
message: msg,
channel,
direction,
created_at: serverTimestamp(),
created_by: auth.currentUser?.email || "system"
});

await updateDoc(doc(db, "leads", leadId), {
last_message: msg,
last_message_date: serverTimestamp()
});

cancelNewCommunication(leadId);
loadHistory(leadId);
};

/* =====================================================
🔷 INLINE EDIT
===================================================== */

window.enableInlineEdit = function (leadId, docId, oldMessage) {

if (activeInteraction) return;
activeInteraction = docId;

const el = document.getElementById(`msg-${docId}`);
if (!el) return;

el.innerHTML = `     <textarea id="edit-${docId}">${escapeHTML(oldMessage)}</textarea>     <button onclick="saveInlineEdit('${leadId}','${docId}')">Save</button>     <button onclick="cancelInlineEdit('${docId}','${escapeHTML(oldMessage)}')">Cancel</button>
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
🔷 RENDER + LISTENER
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

  const roleParts = (l.role || "").split("|");

  html += `

    <!-- ROW 1 -->
    <tr>
      <td rowspan="2">
        <button onclick="openCommunication('${l.id}')">💬</button>
      </td>

      <td rowspan="2">
        <strong>${safe(l.name)}</strong>
        ${renderLinkedInInline(l.linkedin_url)}
      </td>

      <td>${safe(roleParts[0])}</td>

      <td rowspan="2">${safe(l.company)}</td>
      <td rowspan="2">${safe(l.source)}</td>
      <td rowspan="2">${safe(l.owner)}</td>
      <td rowspan="2">${safe(l.email)}</td>
    </tr>

    <!-- ✅ ROW 2 (NEW - ROLE CONTINUATION ONLY) -->
    <tr>
      <td>${safe(roleParts.slice(1).join(" | "))}</td>
    </tr>

    <!-- EXISTING INTERACTION ROW (UNCHANGED) -->
    <tr id="lead-expand-${l.id}" class="hidden">
      <td colspan="7">

        <div style="padding:12px; background:#f9fafb; border-top:1px solid #eee;">

          <div id="history-${l.id}" style="margin-bottom:10px;"></div>

          <button onclick="logCommunicationPrompt('${l.id}')">
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

function startListener() {

if (unsubscribe) unsubscribe();

const q = query(collection(db, "leads"));

unsubscribe = onSnapshot(q, (snap) => {

  leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  updateLeadMetrics();
  renderLeads();

});

}

initLeadsModule();
