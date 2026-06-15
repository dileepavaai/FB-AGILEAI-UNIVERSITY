  /* =====================================================
    🔷 SIDEBAR AUTO HIGHLIGHT
    -----------------------------------------------------
    Governance-Aware Navigation

    Supports:
    - Exact page matching
    - Credential Generator sub-surfaces
    - Future nested modules
  ===================================================== */

  export function highlightActiveSidebar() {

    const links = document.querySelectorAll(".sidebar a");

    if (!links.length) return;

    const pathname = window.location.pathname;    

    links.forEach(link => {

      link.classList.remove("active");

      const href = link.getAttribute("href");

      if (!href) return;

      /* ==========================================
        Credential Generator Family
      ========================================== */

      if (
        pathname.includes("/credential-generator/")
        && href.includes("credential-generator.html")
      ) {
        link.classList.add("active");
        return;
      }

      /* ==========================================
        Credential Registry
      ========================================== */

      if (
        pathname.includes("/credential-registry/")
        && href.includes("credential-registry.html")
      ) {
        link.classList.add("active");
        return;
      }

      /* ==========================================
        Standard Exact Match
      ========================================== */

      const currentPage =
        pathname.split("/").pop() || "index.html";

      const targetPage =
        href.split("/").pop();

      if (currentPage === targetPage) {
        link.classList.add("active");
      }

    });

  }

  /* ==========================================
    Auto Highlight
  ========================================== */

  highlightActiveSidebar();