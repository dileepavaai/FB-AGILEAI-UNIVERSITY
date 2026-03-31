/* =====================================================
   🔷 LEAD INTELLIGENCE MODULE (FULL HISTORY ENABLED)
   Version: v2.3.0
   CHANGE TYPE:
   - SAFE FULL REPLACEMENT
   - Backward compatible

   NEW:
   - Full message history timeline
   - Lazy loading per lead
   - Expandable SaaS-style UI
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
   🔷 NEXT ACTION ENGINE
===================================================== */
function daysSince(dateString) {
  if (!dateString) return 999;
  const now = new Date();
  const past = new Date(dateString);
  return Math.floor((now - past) / (1000 * 60 * 60 * 24));
}

function getNextAction(lead) {
  const days = daysSince(lead.last_contact_date);

  if (lead.stage === "contacted" && days >= 2) {
    return { label: "Follow up", type: "urgent" };
  }

  if (lead.last_response_type === "asked_info") {
    return { label: "Send details", type: "normal" };
  }

  if (lead.last_response_type === "interested" && days >= 3) {
    return { label: "Nudge", type: "urgent" };
  }

  if (lead.last_response_type === "not_now") {
    return { label: "Nurture", type: "normal" };
  }

  if (lead.stage === "new") {
    return { label: "Contact", type: "urgent" };
  }

  return { label: "-", type: "none" };
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
   🔷 CLEAR FORM
===================================================== */
window.clearLeadForm = function () {
  [
    "leadName","leadRole","leadCompany","leadLocation",
    "leadEmail","leadPhone","leadLinkedIn",
    "leadExperience","leadSourceDetail",
    "leadLastContactDate"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
};

/* =====================================================
   🔷 UPDATE LEAD
===================================================== */
window.updateLead = async function (id, field, value) {
  const ref = doc(db, "leads", id);

  await updateDoc(ref, {
    [field]: field === "score" ? (parseInt(value) || 0) : value,
    interactions: (leads.find(l => l.id === id)?.interactions || 0) + 1
  });
};

/* =====================================================
   🔥 MESSAGE MODAL
===================================================== */
window.openMessageModal = function(id) {
  currentLeadId = id;
  document.getElementById("msgModal").classList.remove("hidden");
};

window.closeModal = function() {
  document.getElementById("msgModal").classList.add("hidden");
  document.getElementById("msgText").value = "";
};

/* =====================================================
   🔥 SAVE MESSAGE
===================================================== */
window.saveMessage = async function () {

  const message = get("msgText");
  const channel = get("msgChannel");
  const direction = get("msgDirection");

  if (!message) {
    alert("Message required");
    return;
  }

  const user = auth.currentUser;

  await addDoc(collection(db, "lead_communications"), {
    lead_id: currentLeadId,
    message,
    channel,
    direction,
    created_at: serverTimestamp(),
    created_by: user?.email || "unknown"
  });

  await updateDoc(doc(db, "leads", currentLeadId), {
    last_message: message,
    last_message_date: serverTimestamp()
  });

  closeModal();
};

/* =====================================================
   🔥 LOAD MESSAGE HISTORY
===================================================== */
async function loadHistory(leadId) {

  const container = document.getElementById(`history-${leadId}`);
  if (!container) return;

  container.innerHTML = "Loading...";

  const q = query(
    collection(db, "lead_communications"),
    where("lead_id", "==", leadId),
    orderBy("created_at", "asc")
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
      <div class="msg ${m.direction}">
        <div class="msg-meta">${m.channel} • ${time}</div>
        <div class="msg-body">${m.message}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* =====================================================
   🔷 RENDER (WITH HISTORY PANEL)
===================================================== */
window.renderLeads = function () {

  const body = document.getElementById("leadBody");
  if (!body) return;

  body.innerHTML = "";

  leads.forEach(l => {

    const stage = getSafeStage(l);
    const action = getNextAction(l);

    body.innerHTML += `
      <tr>
        <td>${safe(l.name)}</td>
        <td><input value="${safe(l.role)}" onchange="updateLead('${l.id}','role',this.value)"></td>
        <td>${safe(l.company)}</td>
        <td>${safe(l.source)}</td>
        <td>${safe(l.owner)}</td>
        <td>${safe(l.email)}</td>
        <td>${safe(l.score)}</td>
        <td>${safe(l.status)}</td>
        <td>${stage}</td>
        <td><span class="next-action ${action.type}">${action.label}</span></td>
        <td>${safe(l.notes)}</td>
        <td><button onclick="toggleLead('${l.id}')">View</button></td>
        <td>${safe(l.flag)}</td>
      </tr>

      <tr id="lead-expand-${l.id}" class="lead-expand hidden">
        <td colspan="13">
          <div class="lead-expanded-card">

            <div class="lead-expanded-section">
              <strong>Last Message</strong>
              <p>${safe(l.last_message) || "No message yet"}</p>
            </div>

            <div class="lead-expanded-section">
              <strong>Conversation History</strong>
              <div id="history-${l.id}" class="lead-history"></div>
            </div>

            <div class="lead-expanded-actions">
              <button onclick="openMessageModal('${l.id}')">
                + Log Communication
              </button>
            </div>

          </div>
        </td>
      </tr>
    `;
  });
};

/* =====================================================
   🔷 TOGGLE + LOAD HISTORY
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