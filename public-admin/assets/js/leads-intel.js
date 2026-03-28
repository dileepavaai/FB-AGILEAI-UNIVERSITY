<!-- =========================
     LEVEL 1: LINKEDIN URL
========================= -->
<script>
const linkedInInput = document.getElementById("leadLinkedIn");

linkedInInput.addEventListener("blur", () => {
  const url = linkedInInput.value.trim();
  if (!url.includes("linkedin.com")) return;

  leadSource.value = "LinkedIn";
  leadSource.dispatchEvent(new Event("change"));

  if (!leadName.value) {
    const clean = url.split("/in/")[1]?.split("/")[0];
    if (clean) {
      leadName.value = clean
        .split("-")
        .filter(p => isNaN(p))
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
});
</script>

<!-- =========================
     LEVEL 2: TEXT PARSER
========================= -->
<script>
document.getElementById("leadForm").addEventListener("paste", (e) => {
  const text = (e.clipboardData || window.clipboardData).getData("text");
  if (!text || text.length < 30) return;

  const lower = text.toLowerCase();
  if (!lower.includes("experience") && !lower.includes(" at ")) return;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  if (lines[0] && !leadName.value) leadName.value = lines[0];

  const roleLine = lines.find(l => l.toLowerCase().includes(" at "));
  if (roleLine) {
    const parts = roleLine.split(" at ");
    if (!leadRole.value) leadRole.value = parts[0];
    if (!leadCompany.value) leadCompany.value = parts[1];
  }

  const expLine = lines.find(l => l.toLowerCase().includes("year"));
  if (expLine) {
    const match = expLine.match(/\d+/);
    if (match && !leadExperience.value) {
      leadExperience.value = match[0];
    }
  }

  leadSource.value = "LinkedIn";
  leadSource.dispatchEvent(new Event("change"));

  if (!leadLocation.value) leadLocation.focus();
});
</script>

<!-- =========================
     LEVEL 3: BULK PARSER
========================= -->
<script>

function splitProfiles(text) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20);
}

function parseProfile(block) {
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean);

  let lead = { name: "", role: "", company: "", experience: "" };

  if (lines[0]) lead.name = lines[0];

  const roleLine = lines.find(l => l.toLowerCase().includes(" at "));
  if (roleLine) {
    const parts = roleLine.split(" at ");
    lead.role = parts[0] || "";
    lead.company = parts[1] || "";
  }

  const expLine = lines.find(l => l.toLowerCase().includes("year"));
  if (expLine) {
    const match = expLine.match(/\d+/);
    if (match) lead.experience = match[0];
  }

  return lead;
}

document.getElementById("leadForm").addEventListener("paste", (e) => {

  if (e.target.tagName === "INPUT") return; // ✅ moved inside

  const text = (e.clipboardData || window.clipboardData).getData("text");
  if (!text || text.length < 60) return;

  const profiles = splitProfiles(text);
  if (profiles.length <= 1) return;

  e.preventDefault();

  profiles.forEach(profile => {
    const parsed = parseProfile(profile);
    if (!parsed.name) return;

    leadName.value = parsed.name;
    leadRole.value = parsed.role;
    leadCompany.value = parsed.company;
    leadExperience.value = parsed.experience;
    leadSource.value = "LinkedIn";

    addLead();
  });

  clearLeadForm();
  leadName.focus();
});
</script>
