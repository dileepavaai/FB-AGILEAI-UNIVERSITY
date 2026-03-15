document.addEventListener("DOMContentLoaded", function () {

  const content = document.querySelector(".md-content");

  if (!content) return;

  const banner = document.createElement("div");
  banner.className = "spec-banner";

  banner.innerHTML =
    "Agile AI Specification — " +
    "<span>Status: Canonical</span> — " +
    "<span>Version: 1.0</span> — " +
    "<span>Maintained by Agile AI University</span>";

  content.prepend(banner);

});