document.addEventListener("DOMContentLoaded", function () {

  fetch("/assets/partials/header.html")
    .then(response => response.text())
    .then(data => {

      const container = document.getElementById("site-header");
      if (!container) return;

      container.innerHTML = data;

      bindHeaderInteractions();

      // Notify other scripts (theme etc.)
      document.dispatchEvent(new Event("headerInjected"));

    })
    .catch(error => {
      console.error("Header injection failed:", error);
    });

});


function bindHeaderInteractions() {

  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".nav-list");

  if (!hamburger || !navList) return;

  /* ==============================
     MAIN MOBILE TOGGLE
  ============================== */

  hamburger.addEventListener("click", function () {

    const isOpen = navList.classList.toggle("mobile-open");

    document.body.classList.toggle("menu-open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen);

  });

  /* ==============================
     MOBILE SUBMENU TOGGLE
  ============================== */

  const submenuParents = document.querySelectorAll(".has-submenu > a");

  submenuParents.forEach(link => {

    link.addEventListener("click", function (e) {

      if (window.innerWidth <= 768) {

        e.preventDefault();

        const parentLi = this.parentElement;
        parentLi.classList.toggle("submenu-open");

      }

    });

  });

  /* ==============================
     RESET ON RESIZE
  ============================== */

  window.addEventListener("resize", function () {

    if (window.innerWidth > 768) {
      navList.classList.remove("mobile-open");
      document.body.classList.remove("menu-open");
      hamburger.setAttribute("aria-expanded", "false");
    }

  });

}
