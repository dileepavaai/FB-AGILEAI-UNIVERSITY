(function () {
  const status = document.getElementById("status");
  const debug = document.getElementById("debug");

  function add(label, ok, extra = "") {
    const line = document.createElement("div");
    line.textContent = `${label}: ${ok ? "OK" : "FAIL"} ${extra}`;
    line.style.color = ok ? "green" : "red";
    status.appendChild(line);
  }

  // Firebase
  const firebaseLoaded = typeof window.firebase !== "undefined";
  add("Firebase SDK loaded", firebaseLoaded);

  const firebaseInitialized =
    firebaseLoaded &&
    firebase.apps &&
    firebase.apps.length > 0;

  add(
    "Firebase initialized",
    firebaseInitialized,
    firebaseInitialized ? `(apps=${firebase.apps.length})` : ""
  );

  // Razorpay
  const razorpayLoaded = typeof window.Razorpay === "function";
  add("Razorpay SDK loaded", razorpayLoaded);

  debug.textContent = JSON.stringify(
    {
      firebaseLoaded,
      firebaseApps: firebaseLoaded && firebase.apps ? firebase.apps.length : 0,
      razorpayLoaded,
      userAgent: navigator.userAgent
    },
    null,
    2
  );
})();
