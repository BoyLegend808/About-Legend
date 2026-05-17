/* Portfolio interactions — plain, simple JS */
(function () {
  "use strict";

  // ── Year ──────────────────────────────────────────────
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Mobile nav toggle ─────────────────────────────────
  var navToggle = document.querySelector(".nav-toggle");
  var navList   = document.getElementById("primary-menu");
  if (navToggle && navList) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu on link click (mobile)
    navList.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navList.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    // Close menu on touching or clicking anywhere outside the navigation
    document.addEventListener("click", function (e) {
      if (navList.classList.contains("open")) {
        if (!navList.contains(e.target) && !navToggle.contains(e.target)) {
          navList.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  // ── Copy email button ─────────────────────────────────
  var copyBtn = document.getElementById("copyEmailBtn");
  var copyMsg = document.getElementById("copyMessage");
  var copyTimer = null;
  if (copyBtn && copyMsg) {
    copyBtn.addEventListener("click", function () {
      var email = "ugwunekejohn@gmail.com";
      var done = function () {
        copyMsg.hidden = false;
        copyBtn.textContent = "Copied ✓";
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () {
          copyMsg.hidden = true;
          copyBtn.textContent = "Copy Email";
        }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  // ── Reveal on scroll ──────────────────────────────────
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ── Active nav link via IntersectionObserver ──────────
  var navLinks = document.querySelectorAll(".nav-list a");
  var sections = document.querySelectorAll("main section[id], header section[id]");
  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
