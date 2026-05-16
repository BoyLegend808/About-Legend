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

// Interactive Tilt and Parallax effect
const heroVisual = document.querySelector('.hero-visual');
const heroPortraitWrap = document.querySelector('.hero-portrait-wrap');

if (heroVisual && heroPortraitWrap) {
    heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 20;
        const moveY = (y - centerY) / 20;
        
        heroPortraitWrap.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg) scale(1.05)`;
        
        // Parallax tags
        document.querySelectorAll('.hero-tag').forEach((tag, index) => {
            const speed = (index + 1) * 15;
            const tx = (x - centerX) / speed;
            const ty = (y - centerY) / speed;
            tag.style.transform = `translate(${tx}px, ${ty}px)`;
        });
    });
    
    heroVisual.addEventListener('mouseleave', () => {
        heroPortraitWrap.style.transform = `perspective(1000px) rotateY(-10deg) rotateX(5deg) scale(1)`;
        document.querySelectorAll('.hero-tag').forEach(tag => {
            tag.style.transform = `translate(0, 0)`;
        });
    });
}

// Card Tilt
document.querySelectorAll('.project-card').forEach(card => {
    const inner = card.querySelector('.card-inner');
    if(!inner) return;
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        inner.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
});
