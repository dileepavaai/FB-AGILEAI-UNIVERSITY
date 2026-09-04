/* =========================================
   Institutional Configuration
   Single Source of Truth
   Version: 1.2
========================================= */

window.INSTITUTION = {

  brand: {
    name: "LAAU",
    descriptor:
      "Professional Learning, Academic Pathways and Applied Research",
    domain: "laau.university",
    canonicalUrl: "https://laau.university",
    homepage: "/"
  },

  navigation: [
    {
      label: "Home",
      href: "/"
    },

    {
      label: "Intellectual Foundation",
      dropdown: [
        {
          label: "Capability Architecture",
          href: "/intellectual-foundation/capability-architecture.html"
        },
        {
          label: "Agile AI Ecosystem",
          href: "/intellectual-foundation/ecosystem.html"
        },
        {
          label: "Myth Framework",
          href: "/intellectual-foundation/myth-framework.html"
        },
        {
          label: "Mindset Transition",
          href: "/intellectual-foundation/mindset-transition.html"
        }
      ]
    },

    {
      label: "Programs",
      dropdown: [
        {
          label: "Academic Frameworks",
          href: "/academics/frameworks.html"
        },
        {
          label: "Professional Pathways (P · M · L)",
          href: "/academics/pathways.html"
        }
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
    copyright: "© 2026 LAAU",
    tagline:
      "Professional Learning, Academic Pathways and Applied Research"
  }

};