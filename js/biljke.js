// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');

if (mobileMenuBtn && mainNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
  });
}

// Praćenje klikova na .trackcall dugmad
document.querySelectorAll(".trackcall").forEach(function (el) {
  el.addEventListener("click", function () {
    // Google Analytics događaj
    if (typeof gtag === "function") {
      gtag("event", "phone_call_click", { link_url: el.getAttribute("href") });
    }

    const payload = JSON.stringify({
      time: new Date().toISOString(),
      call: 1
    });

    fetch("https://bobanwebmaker.com/private/lavandabeograd.php", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: payload,
      keepalive: true
    }).catch(() => {});
  });
});
