/* ============================================================
   script.js – Portfolio interactions
   ============================================================ */

(function () {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────
  const yearEl        = document.getElementById("year");
  const contactBtn    = document.getElementById("contactBtn");
  const helloMessage  = document.getElementById("helloMessage");
  const navLinks      = document.querySelectorAll(".nav-list a");
  const sections      = document.querySelectorAll("section[id]");
  const revealItems   = document.querySelectorAll(".reveal");
  const heroVisual    = document.querySelector(".hero-visual");
  const portraitWrap  = document.querySelector(".hero-portrait-wrap");

  // ── Year ──────────────────────────────────────────────────
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Smooth-scroll nav links ───────────────────────────────
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  });

  // ── Contact button ────────────────────────────────────────
  let contactTimer = null;
  if (contactBtn && helloMessage) {
    contactBtn.addEventListener("click", () => {
      helloMessage.hidden = false;
      contactBtn.textContent = "Message Sent! ✓";
      contactBtn.disabled = true;

      clearTimeout(contactTimer);
      contactTimer = setTimeout(() => {
        helloMessage.hidden = true;
        contactBtn.textContent = "Say Hello";
        contactBtn.disabled = false;
      }, 3500);
    });
  }

  // ── Reveal on scroll (IntersectionObserver) ───────────────
  if (revealItems.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealItems.forEach((el) => el.classList.add("is-visible"));
  }

  // ── Active nav link on scroll ─────────────────────────────
  // Uses rAF + a flag to avoid running on every pixel of scroll.
  let scrollScheduled = false;

  function updateActiveLink() {
    scrollScheduled = false;
    const scrollY = window.scrollY;
    let current = "";

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      const matches = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", matches);
    });
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(updateActiveLink);
      }
    },
    { passive: true }
  );

  // Run once on load to highlight the right link
  updateActiveLink();

  // ── 3D parallax tilt on hero portrait ────────────────────
  function setupParallax() {
    if (!heroVisual || !portraitWrap) return;
    // Only attach on wide viewports
    if (window.innerWidth <= 1024) return;

    let tiltActive = true;

    heroVisual.addEventListener("mousemove", (e) => {
      if (!tiltActive) return;
      const { left, top, width, height } = heroVisual.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 2; // –1 → +1
      const y = ((e.clientY - top)  / height - 0.5) * 2;

      portraitWrap.style.transform =
        `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    heroVisual.addEventListener("mouseleave", () => {
      portraitWrap.style.transform =
        "perspective(900px) rotateY(0deg) rotateX(0deg)";
    });

    // Disable tilt when viewport shrinks below threshold
    const mq = window.matchMedia("(max-width: 1024px)");
    const onBreakpoint = (e) => {
      tiltActive = !e.matches;
      if (e.matches) {
        portraitWrap.style.transform = "none";
      }
    };
    mq.addEventListener("change", onBreakpoint);
  }

  setupParallax();

})();
