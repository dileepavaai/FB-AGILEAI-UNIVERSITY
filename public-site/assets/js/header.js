document.addEventListener("DOMContentLoaded", function () {

  fetch("/assets/partials/header.html")
    .then(response => response.text())
    .then(data => {
      const container = document.getElementById("header");
      if (container) {
        container.innerHTML = data;

        // Dispatch required event for theme binding
        document.dispatchEvent(new Event("headerInjected"));
      }
    })
    .catch(error => {
      console.error("Header injection failed:", error);
    });

});
