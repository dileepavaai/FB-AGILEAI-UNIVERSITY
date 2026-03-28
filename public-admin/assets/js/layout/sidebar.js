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