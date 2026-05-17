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

  // ── Scroll progress indicator & active nav link ───────────
  let scrollScheduled = false;
  const progressEl = document.getElementById("scroll-progress");

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressEl) {
      progressEl.style.width = `${progress}%`;
    }
  }

  function updateActiveLink() {
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

  function handleScroll() {
    scrollScheduled = false;
    updateActiveLink();
    updateScrollProgress();
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(handleScroll);
      }
    },
    { passive: true }
  );

  // Run on initial load
  updateActiveLink();
  updateScrollProgress();

  // ── 3D parallax tilt on hero portrait ────────────────────
  function setupParallax() {
    return; // Disabled for static state
    if (!heroVisual || !portraitWrap) return;
    if (window.innerWidth <= 1024) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tiltActive = true;
    let animationFrameId = null;
    let isHovered = false;

    // Interpolation (lerp) states
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const ease = 0.08;

    function updateParallax() {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      portraitWrap.style.transform =
        `perspective(1000px) rotateY(${currentX * 6}deg) rotateX(${-currentY * 6}deg) translate3d(0, 0, 0)`;

      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);

      if (isHovered || dx > 0.001 || dy > 0.001) {
        animationFrameId = requestAnimationFrame(updateParallax);
      } else {
        currentX = targetX;
        currentY = targetY;
        portraitWrap.style.transform =
          `perspective(1000px) rotateY(${currentX * 6}deg) rotateX(${-currentY * 6}deg) translate3d(0, 0, 0)`;
        animationFrameId = null;
      }
    }

    function startAnimationLoop() {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    }

    heroVisual.addEventListener("mousemove", (e) => {
      if (!tiltActive) return;
      isHovered = true;

      const { left, top, width, height } = heroVisual.getBoundingClientRect();
      targetX = ((e.clientX - left) / width  - 0.5) * 2;
      targetY = ((e.clientY - top)  / height - 0.5) * 2;

      startAnimationLoop();
    });

    heroVisual.addEventListener("mouseleave", () => {
      if (!tiltActive) return;
      isHovered = false;
      targetX = 0;
      targetY = 0;
      startAnimationLoop();
    });

    const mq = window.matchMedia("(max-width: 1024px)");
    const onBreakpoint = (e) => {
      tiltActive = !e.matches;
      if (e.matches) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        portraitWrap.style.transform = "none";
        isHovered = false;
        currentX = 0;
        currentY = 0;
        targetX = 0;
        targetY = 0;
      } else {
        portraitWrap.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translate3d(0, 0, 0)";
      }
    };
    mq.addEventListener("change", onBreakpoint);
  }

  // ── Dynamic 'Value Proposition' Typewriter ───────────────
  function setupTypewriter() {
    const el = document.getElementById("typewriter-text");
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = "Experiences";
      const cursor = document.querySelector(".typewriter-cursor");
      if (cursor) cursor.style.display = "none";
      return;
    }

    const words = ["Experiences", "E-commerce", "FinTech", "Digital Solutions"];
    let wordIdx = 0;
    let charIdx = words[0].length;
    let isDeleting = false;
    let timer = null;

    function type() {
      const currentWord = words[wordIdx];

      if (isDeleting) {
        charIdx--;
      } else {
        charIdx++;
      }

      el.textContent = currentWord.substring(0, charIdx);

      let delay = isDeleting ? 40 : 100;

      if (!isDeleting && charIdx === currentWord.length) {
        delay = 2000; // Pause at typed word
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        delay = 500; // Delay before starting next word
      }

      timer = setTimeout(type, delay);
    }

    setTimeout(type, 1000);
  }

  // ── Magnetic Button Interactions ──────────────────────────
  function setupMagneticButtons() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const buttons = document.querySelectorAll(".btn");
    const magnetRadius = 50;

    buttons.forEach((btn) => {
      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let isNear = false;
      let rAFId = null;

      function updateButtonTranslation() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        btn.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

        const dist = Math.sqrt(currentX * currentX + currentY * currentY);
        if (isNear || dist > 0.1) {
          rAFId = requestAnimationFrame(updateButtonTranslation);
        } else {
          btn.style.transform = "none";
          currentX = 0;
          currentY = 0;
          rAFId = null;
        }
      }

      function startrAF() {
        if (!rAFId) rAFId = requestAnimationFrame(updateButtonTranslation);
      }

      window.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 - currentX;
        const centerY = rect.top + rect.height / 2 - currentY;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const hoverThreshold = rect.width / 2 + magnetRadius;

        if (distance < hoverThreshold) {
          isNear = true;
          targetX = dx * 0.35;
          targetY = dy * 0.35;
          startrAF();
        } else {
          isNear = false;
          targetX = 0;
          targetY = 0;
          startrAF();
        }
      });

      window.addEventListener("mouseleave", () => {
        isNear = false;
        targetX = 0;
        targetY = 0;
        startrAF();
      });
    });
  }

  // ── Glassmorphic Project Reveal (3D Card Tilt) ───────────
  function setupCardTilts() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth <= 1024) return;

    const cards = document.querySelectorAll(".project-card");

    cards.forEach((card) => {
      const inner = card.querySelector(".card-inner");
      if (!inner) return;

      let rAFId = null;
      let isHovered = false;

      let currentRotateX = 0;
      let currentRotateY = 0;
      let currentLift = 0;

      let targetRotateX = 0;
      let targetRotateY = 0;
      let targetLift = 0;

      const ease = 0.08;

      function updateCardTransform() {
        currentRotateX += (targetRotateX - currentRotateX) * ease;
        currentRotateY += (targetRotateY - currentRotateY) * ease;
        currentLift += (targetLift - currentLift) * ease;

        inner.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translate3d(0, ${-currentLift}px, 0)`;

        const dx = Math.abs(targetRotateX - currentRotateX);
        const dy = Math.abs(targetRotateY - currentRotateY);
        const dl = Math.abs(targetLift - currentLift);

        if (isHovered || dx > 0.01 || dy > 0.01 || dl > 0.1) {
          rAFId = requestAnimationFrame(updateCardTransform);
        } else {
          inner.style.transform = "none";
          currentRotateX = 0;
          currentRotateY = 0;
          currentLift = 0;
          rAFId = null;
        }
      }

      function startrAF() {
        if (!rAFId) rAFId = requestAnimationFrame(updateCardTransform);
      }

      card.addEventListener("mousemove", (e) => {
        isHovered = true;
        const rect = card.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        targetRotateY = x * 3; // gentle 3deg tilt
        targetRotateX = -y * 3;
        targetLift = 10; // Lift up 10px

        startrAF();
      });

      card.addEventListener("mouseleave", () => {
        isHovered = false;
        targetRotateX = 0;
        targetRotateY = 0;
        targetLift = 0;
        startrAF();
      });
    });
  }

  // ── Initialization ────────────────────────────────────────
  setupParallax();
  setupTypewriter();
  setupMagneticButtons();
  setupCardTilts();
})();

