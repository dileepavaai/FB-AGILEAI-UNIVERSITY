document.addEventListener("DOMContentLoaded", function () {

  fetch("/assets/partials/header.html")
    .then(response => response.text())
    .then(data => {

      const container = document.getElementById("header");

      if (!container) return;

      container.innerHTML = data;

      /* ================================
         MOBILE NAVIGATION BINDING
      ================================= */

      const hamburger = container.querySelector(".hamburger");
      const navList = container.querySelector(".nav-list");

      if (hamburger && navList) {

        hamburger.addEventListener("click", function () {
          navList.classList.toggle("mobile-open");
        });

        // Mobile submenu toggle
        const submenuParents = container.querySelectorAll(".has-submenu > a");

        submenuParents.forEach(function (parentLink) {

          parentLink.addEventListener("click", function (e) {

            if (window.innerWidth <= 768) {
              e.preventDefault();
              parentLink.parentElement.classList.toggle("submenu-open");
            }

          });

        });

      }

      /* ================================
         THEME RE-BIND EVENT
      ================================= */

      document.dispatchEvent(new Event("headerInjected"));

    })
    .catch(error => {
      console.error("Header injection failed:", error);
    });

});
