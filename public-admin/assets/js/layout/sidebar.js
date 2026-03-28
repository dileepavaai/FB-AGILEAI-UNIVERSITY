/* =====================================================
   🔷 SIDEBAR AUTO HIGHLIGHT
   ===================================================== */

export function highlightActiveSidebar() {

  const links = document.querySelectorAll(".sidebar a");

  if (!links.length) return;

  // Get current page (e.g., "leads.html")
  const currentPath = window.location.pathname.split("/").pop();

  links.forEach(link => {
    const linkPath = link.getAttribute("href");

    // Remove existing active
    link.classList.remove("active");

    // Match current page
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });

}

// ==========================================
// ACTIVE NAVIGATION (AUTO HIGHLIGHT)
// ==========================================
(function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".sidebar a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;

    if (href === path) {
      link.classList.add("active");
    }

    if (path === "" && href === "index.html") {
      link.classList.add("active");
    }
  });
})();