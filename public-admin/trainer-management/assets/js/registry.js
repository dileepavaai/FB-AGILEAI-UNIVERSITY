/* =====================================================
   TRAINER REGISTRY
   Version: 1.1.0
   Status: ACTIVE

   Purpose
   -----------------------------------------------------
   Authoritative trainer identity registry.

   Revenue Sprint Scope
   -----------------------------------------------------
   ✓ Trainer Creation
   ✓ Trainer Search
   ✓ Trainer Listing
   ✓ Trainer Status
   ✓ Trainer Resolution

   Collection
   -----------------------------------------------------
   trainerRegistry

   Trainer ID Format
   -----------------------------------------------------
   TRN-AAU-XXXX

   Governance
   -----------------------------------------------------
   - Non-sequential IDs
   - No trainer count exposure
   - Firestore direct access
   - No Cloud Run dependency
===================================================== */

import { db, auth }
  from "../../../assets/js/core.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   STATE
===================================================== */

let trainers = [];
let unsubscribe = null;

/* =====================================================
   HELPERS
===================================================== */

function safe(value) {
  return value || "-";
}

function generateTrainerId() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let suffix = "";

  for (let i = 0; i < 4; i++) {

    suffix += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );

  }

  return `TRN-AAU-${suffix}`;
}

/* =====================================================
   TRAINER RESOLUTION
===================================================== */

export async function resolveTrainer(trainerId) {

  if (!trainerId) {
    return null;
  }

  try {

    const snap = await getDocs(
      query(
        collection(
          db,
          "trainerRegistry"
        ),
        where(
          "trainerId",
          "==",
          trainerId
        )
      )
    );

    if (snap.empty) {
      return null;
    }

    return snap.docs[0].data();

  } catch (error) {

    console.error(
      "Trainer resolution failed:",
      error
    );

    return null;
  }
}

/* =====================================================
   RENDER TABLE
===================================================== */

function renderRegistry() {

  const body =
    document.getElementById(
      "trainerRegistryBody"
    );

  if (!body) return;

  if (!trainers.length) {

    body.innerHTML = `
      <tr>
        <td colspan="5">
          No trainer records available.
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML = trainers.map(t => `
    <tr>
      <td>${safe(t.trainerId)}</td>
      <td>${safe(t.trainerName)}</td>
      <td>${safe(t.email)}</td>
      <td>${safe(t.status)}</td>
      <td>View</td>
    </tr>
  `).join("");

}

/* =====================================================
   FIRESTORE LISTENER
===================================================== */

function startListener() {

  if (unsubscribe) {
    unsubscribe();
  }

  const q =
    query(
      collection(
        db,
        "trainerRegistry"
      )
    );

  unsubscribe =
    onSnapshot(
      q,
      snapshot => {

        trainers =
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        renderRegistry();

      },
      error => {

        console.error(
          "Trainer listener error:",
          error
        );

      }
    );

}

/* =====================================================
   CREATE TRAINER
===================================================== */

window.createTrainer = async function () {

  const trainerName =
    document
      .getElementById(
        "newTrainerName"
      )
      ?.value
      ?.trim();

  const email =
    document
      .getElementById(
        "newTrainerEmail"
      )
      ?.value
      ?.trim();

  const status =
    document
      .getElementById(
        "newTrainerStatus"
      )
      ?.value || "active";

  if (!trainerName) {

    alert(
      "Trainer Name is required."
    );

    return;
  }

  try {

    await addDoc(
      collection(
        db,
        "trainerRegistry"
      ),
      {
        trainerId:
          generateTrainerId(),

        trainerName,

        email,

        status,

        createdBy:
          auth.currentUser?.email
          || "system",

        createdAt:
          serverTimestamp()
      }
    );

    document.getElementById(
      "newTrainerName"
    ).value = "";

    document.getElementById(
      "newTrainerEmail"
    ).value = "";

    document.getElementById(
      "newTrainerStatus"
    ).value = "active";

    alert(
      "Trainer created successfully."
    );

  } catch (error) {

    console.error(
      "Trainer creation failed:",
      error
    );

    alert(
      "Failed to create trainer."
    );

  }

};

/* =====================================================
   SEARCH
===================================================== */

window.searchTrainerRegistry =
  function () {

    const trainerId =
      document
        .getElementById(
          "searchTrainerId"
        )
        ?.value
        ?.toLowerCase();

    const trainerName =
      document
        .getElementById(
          "searchTrainerName"
        )
        ?.value
        ?.toLowerCase();

    const email =
      document
        .getElementById(
          "searchTrainerEmail"
        )
        ?.value
        ?.toLowerCase();

    const status =
      document
        .getElementById(
          "searchTrainerStatus"
        )
        ?.value
        ?.toLowerCase();

    const filtered =
      trainers.filter(t => {

        return (

          (!trainerId ||
            t.trainerId
              ?.toLowerCase()
              .includes(trainerId))

          &&

          (!trainerName ||
            t.trainerName
              ?.toLowerCase()
              .includes(trainerName))

          &&

          (!email ||
            t.email
              ?.toLowerCase()
              .includes(email))

          &&

          (!status ||
            t.status
              ?.toLowerCase()
              === status)

        );

      });

    const body =
      document.getElementById(
        "trainerRegistryBody"
      );

    body.innerHTML =
      filtered.map(t => `
        <tr>
          <td>${safe(t.trainerId)}</td>
          <td>${safe(t.trainerName)}</td>
          <td>${safe(t.email)}</td>
          <td>${safe(t.status)}</td>
          <td>View</td>
        </tr>
      `).join("");

  };

/* =====================================================
   INIT
===================================================== */

function initRegistry() {

  startListener();

}

initRegistry();