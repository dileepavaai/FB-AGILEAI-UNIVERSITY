/* =========================================
   Institutional Configuration
   Single Source of Truth
   Version: 1.0
========================================= */

window.INSTITUTION = {

  brand: {
    name: "AgileAI Foundation & Agile AI University",
    homepage: "/"
  },

  navigation: [
    { label: "Home", href: "/" },

    {
      label: "Intellectual Foundation",
      dropdown: [
        { label: "Capability Architecture", href: "/intellectual-foundation/capability-architecture.html" },
        { label: "Agile AI Ecosystem", href: "/intellectual-foundation/ecosystem.html" },
        { label: "Myth Framework", href: "/intellectual-foundation/myth-framework.html" },
        { label: "Mindset Transition", href: "/intellectual-foundation/mindset-transition.html" }
      ]
    },

    {
      label: "Programs",
      dropdown: [
        { label: "Academic Frameworks", href: "/academics/frameworks.html" },
        { label: "Professional Pathways (P · M · L)", href: "/academics/pathways.html" }
      ]
    },

    {
      label: "Verification",
      href: "/credentials/verification.html"
    },

    {
      label: "Governance",
      href: "/governance/"
    }
  ],

  footer: {
    copyright:
      "© 2026 AgileAI Foundation & Agile AI University",
    tagline:
      "Public learning and research infrastructure."
  }

};
