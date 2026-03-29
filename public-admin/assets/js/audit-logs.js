import { auth } from "./core.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  loadLogs();
});

async function loadLogs() {

  const table = document.getElementById("auditTable");

  const snap = await getDocs(
    query(collection(db, "learner_status_logs"), orderBy("updated_at", "desc"))
  );

  table.innerHTML = "";

  if (snap.empty) {
    table.innerHTML = `<tr><td colspan="6">No logs found</td></tr>`;
    return;
  }

  snap.forEach(d => {
    const l = d.data();

    table.innerHTML += `
      <tr>
        <td>${l.learner_name || "-"}</td>
        <td>${l.learner_email || "-"}</td>
        <td>${l.previous_status || "-"}</td>
        <td>${l.new_status || "-"}</td>
        <td>${l.updated_by || "-"}</td>
        <td>${new Date(l.updated_at.seconds * 1000).toLocaleString()}</td>
      </tr>
    `;
  });
}