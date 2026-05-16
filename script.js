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
      window.scrollTo({
        top: targetSection.offsetTop - 80,
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

// Intersection Observer for Reveal items (optimized)
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

// Active link highlighting on scroll (throttled)
let isScrolling = false;
window.addEventListener("scroll", () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
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
      isScrolling = false;
    });
    isScrolling = true;
  }
});

// Optimized Parallax for Hero
const heroVisual = document.querySelector('.hero-visual');
const heroPortraitWrap = document.querySelector('.hero-portrait-wrap');

if (heroVisual && heroPortraitWrap && window.innerWidth > 1024) {
    heroVisual.addEventListener('mousemove', (e) => {
        window.requestAnimationFrame(() => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) / 30;
            const moveY = (y - centerY) / 30;
            
            heroPortraitWrap.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
            
            document.querySelectorAll('.hero-tag').forEach((tag, index) => {
                const speed = (index + 1) * 25;
                const tx = (x - centerX) / speed;
                const ty = (y - centerY) / speed;
                tag.style.transform = `translate(${tx}px, ${ty}px)`;
            });
        });
    });
    
    heroVisual.addEventListener('mouseleave', () => {
        heroPortraitWrap.style.transform = `perspective(1000px) rotateY(-10deg) rotateX(5deg)`;
        document.querySelectorAll('.hero-tag').forEach(tag => {
            tag.style.transform = `translate(0, 0)`;
        });
    });
}
