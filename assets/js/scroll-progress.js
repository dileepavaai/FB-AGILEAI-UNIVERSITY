document.addEventListener("DOMContentLoaded", function () {
  const progressBar = document.createElement("div");
  progressBar.id = "scroll-progress-bar";
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + "%";
  });
});