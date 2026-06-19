/* ============================================================
   Agile AI University Portal
   Portal Authentication Controller
   Version: 1.0
   Status: MVP
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

  try {

    if (window.AAIUAuth?.completeEmailLinkSignIn) {
      await window.AAIUAuth.completeEmailLinkSignIn();
    }

  } catch (err) {
    console.error(err);
  }

  const signedOutUI = document.getElementById("signedOutUI");
  const signedInUI = document.getElementById("signedInUI");

  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");

  const btnGoogle = document.getElementById("btnGoogle");
  const btnEmailLink = document.getElementById("btnEmailLink");
  const btnSignOut = document.getElementById("btnSignOut");

  const emailInput = document.getElementById("emailInput");
  const emailStatus = document.getElementById("emailStatus");

  function showSignedOut() {
    if (signedOutUI) signedOutUI.style.display = "block";
    if (signedInUI) signedInUI.style.display = "none";
  }

  function showSignedIn(user) {
    if (signedOutUI) signedOutUI.style.display = "none";
    if (signedInUI) signedInUI.style.display = "block";

    if (userName) {
      userName.textContent =
        user.displayName || user.email || "";
    }

    if (userEmail) {
      userEmail.textContent =
        user.email || "";
    }
  }

  if (window.__AAIU_AUTH_READY__) {

  const authState =
    await window.__AAIU_AUTH_READY__;

  if (authState?.user) {
    showSignedIn(authState.user);
  } else {
    showSignedOut();
  }

  firebase.auth().onAuthStateChanged(user => {

    if (user) {
      showSignedIn(user);
    } else {
      showSignedOut();
    }

  });

}

  if (btnEmailLink) {

    btnEmailLink.addEventListener("click", async () => {

      try {

        const email =
          emailInput?.value?.trim();

        await window.AAIUAuth.sendEmailLink(email);

        if (emailStatus) {
          emailStatus.textContent =
            "Login link sent. Check your email.";
        }

      } catch (err) {

        console.error(err);

        if (emailStatus) {
          emailStatus.textContent =
            "Unable to send login link.";
        }
      }

    });

  }

  if (btnSignOut) {

    btnSignOut.addEventListener("click", async () => {

      try {

        await firebase.auth().signOut();

      } catch (err) {
        console.error(err);
      }

    });

  }

});