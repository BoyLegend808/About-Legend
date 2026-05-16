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
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// Active link highlighting on scroll
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 150) {
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

// Interactive Tilt effect for cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
    });
});
