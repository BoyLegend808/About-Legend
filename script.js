const yearEl = document.getElementById("year");
const contactBtn = document.getElementById("contactBtn");
const helloMessage = document.getElementById("helloMessage");
const projectImages = document.querySelectorAll(".project-image");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-list a");
const sections = document.querySelectorAll("section");

// Set year
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Smooth Scrolling for Navigation
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// Contact button interaction
if (contactBtn && helloMessage) {
  contactBtn.addEventListener("click", () => {
    helloMessage.hidden = false;
    contactBtn.textContent = "Message Sent!";
    setTimeout(() => {
        helloMessage.hidden = true;
        contactBtn.textContent = "Say Hello";
    }, 3000);
  });
}

// Image error handling
projectImages.forEach((img) => {
  img.addEventListener("error", () => {
    img.hidden = true;
    const slot = img.nextElementSibling;
    if (slot) {
      slot.hidden = false;
    }
  });
});

// Intersection Observer for Reveal items
if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// Active link highlighting on scroll
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});

// Optimized Parallax for Hero
const heroVisual = document.querySelector('.hero-visual');
const heroPortraitWrap = document.querySelector('.hero-portrait-wrap');

if (heroVisual && heroPortraitWrap && window.innerWidth > 1024) {
    heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 40;
        const moveY = (y - centerY) / 40;
        
        heroPortraitWrap.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
    });
    
    heroVisual.addEventListener('mouseleave', () => {
        heroPortraitWrap.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    });
}
