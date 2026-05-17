(function () {
  "use strict";

  // Configuration matching your React Bits props
  var SHUFFLE_DIRECTION = "right";
  var DURATION = 0.35;
  var EASE = "power3.out";
  var STAGGER = 0.015;
  var SHUFFLE_TIMES = 2;
  var ANIMATION_MODE = "evenodd";
  var SCRAMBLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*0123456789";

  function initShuffle() {
    if (typeof gsap === "undefined") {
      // Retry in case CDN loading has a sub-millisecond delay
      setTimeout(initShuffle, 20);
      return;
    }

    var heading = document.querySelector(".hero h1");
    if (!heading) return;

    heading.classList.add("shuffle-parent");

    // Recurse child nodes to split text while preserving nested HTML tags like <span class="text-gradient">
    var result = splitTextElement(heading, {
      shuffleTimes: SHUFFLE_TIMES,
      shuffleDirection: SHUFFLE_DIRECTION,
      scrambleCharset: SCRAMBLE_CHARSET
    });

    var playing = false;

    function playShuffle() {
      if (playing) return;
      playing = true;

      var isVertical = (SHUFFLE_DIRECTION === "up" || SHUFFLE_DIRECTION === "down");
      var tl = gsap.timeline({
        onComplete: function () {
          playing = false;
        }
      });

      if (ANIMATION_MODE === "evenodd") {
        var odd = result.inners.filter(function (_, i) { return i % 2 === 1; });
        var even = result.inners.filter(function (_, i) { return i % 2 === 0; });
        
        var oddTotal = DURATION + Math.max(0, odd.length - 1) * STAGGER;
        var evenStart = odd.length ? oddTotal * 0.7 : 0;

        var oddVars = { duration: DURATION, ease: EASE, force3D: true, stagger: STAGGER };
        if (isVertical) {
          oddVars.y = function (i, t) { return parseFloat(t.getAttribute("data-final-y") || "0"); };
        } else {
          oddVars.x = function (i, t) { return parseFloat(t.getAttribute("data-final-x") || "0"); };
        }
        if (odd.length) tl.to(odd, oddVars, 0);

        var evenVars = { duration: DURATION, ease: EASE, force3D: true, stagger: STAGGER };
        if (isVertical) {
          evenVars.y = function (i, t) { return parseFloat(t.getAttribute("data-final-y") || "0"); };
        } else {
          evenVars.x = function (i, t) { return parseFloat(t.getAttribute("data-final-x") || "0"); };
        }
        if (even.length) tl.to(even, evenVars, evenStart);
      }
    }

    // Scroll trigger entrance using IntersectionObserver
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            playShuffle();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(heading);
    } else {
      playShuffle();
    }

    // Trigger on hover
    heading.addEventListener("mouseenter", function () {
      if (playing) return;
      
      // Reset position to start before playing again
      result.inners.forEach(function (inner) {
        if (SHUFFLE_DIRECTION === "left" || SHUFFLE_DIRECTION === "right") {
          gsap.set(inner, { x: parseFloat(inner.getAttribute("data-start-x") || "0") });
        } else {
          gsap.set(inner, { y: parseFloat(inner.getAttribute("data-start-y") || "0") });
        }
      });

      playShuffle();
    });
  }

  // Recursive splitter
  function splitTextElement(element, options) {
    var childNodes = Array.from(element.childNodes);
    element.innerHTML = ""; // Clear
    
    var scrambleCharset = options.scrambleCharset;
    var rolls = options.shuffleTimes;
    var direction = options.shuffleDirection;
    
    var wrappers = [];
    var inners = [];

    childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        processText(node.textContent, element);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var clonedSpan = node.cloneNode(false); // Clone tags & classes (e.g. text-gradient)
        element.appendChild(clonedSpan);
        processText(node.textContent, clonedSpan);
      }
    });

    function processText(text, container) {
      var chars = Array.from(text);
      chars.forEach(function (char) {
        if (char === " ") {
          var space = document.createElement("span");
          space.innerHTML = "&nbsp;";
          space.className = "shuffle-space";
          space.style.display = "inline-block";
          container.appendChild(space);
          return;
        }

        var wrap = document.createElement("span");
        wrap.className = "shuffle-char-wrapper";
        wrap.style.display = "inline-block";
        wrap.style.overflow = "hidden";
        wrap.style.verticalAlign = "bottom";

        var inner = document.createElement("span");
        inner.className = "shuffle-char-inner";
        inner.style.display = "inline-block";
        inner.style.whiteSpace = (direction === "up" || direction === "down") ? "normal" : "nowrap";
        inner.style.willChange = "transform";

        var firstOrig = document.createElement("span");
        firstOrig.className = "shuffle-char";
        firstOrig.textContent = char;
        firstOrig.style.display = (direction === "up" || direction === "down") ? "block" : "inline-block";
        firstOrig.style.textAlign = "center";

        var finalReal = document.createElement("span");
        finalReal.className = "shuffle-char";
        finalReal.textContent = char;
        finalReal.setAttribute("data-orig", "1");
        finalReal.style.display = (direction === "up" || direction === "down") ? "block" : "inline-block";
        finalReal.style.textAlign = "center";

        inner.appendChild(firstOrig);
        for (var k = 0; k < rolls; k++) {
          var scram = document.createElement("span");
          scram.className = "shuffle-char";
          scram.textContent = scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));
          scram.style.display = (direction === "up" || direction === "down") ? "block" : "inline-block";
          scram.style.textAlign = "center";
          inner.appendChild(scram);
        }
        inner.appendChild(finalReal);

        wrap.appendChild(inner);
        container.appendChild(wrap);

        // Measure layout size
        var rect = firstOrig.getBoundingClientRect();
        var w = rect.width || 12;
        var h = rect.height || 24;

        wrap.style.width = w + "px";
        wrap.style.height = (direction === "up" || direction === "down") ? h + "px" : "auto";

        Array.from(inner.children).forEach(function (child) {
          child.style.width = w + "px";
        });

        var steps = rolls + 1;
        var startX = 0, finalX = 0, startY = 0, finalY = 0;

        if (direction === "right") {
          startX = -steps * w;
          finalX = 0;
          var last = inner.lastElementChild;
          if (last) inner.insertBefore(last, inner.firstChild);
          var first = inner.children[1];
          if (first) inner.appendChild(first);
        } else if (direction === "left") {
          startX = 0;
          finalX = -steps * w;
        } else if (direction === "down") {
          startY = -steps * h;
          finalY = 0;
          var last = inner.lastElementChild;
          if (last) inner.insertBefore(last, inner.firstChild);
        } else if (direction === "up") {
          startY = 0;
          finalY = -steps * h;
        }

        if (direction === "left" || direction === "right") {
          gsap.set(inner, { x: startX, y: 0 });
          inner.setAttribute("data-start-x", startX);
          inner.setAttribute("data-final-x", finalX);
        } else {
          gsap.set(inner, { x: 0, y: startY });
          inner.setAttribute("data-start-y", startY);
          inner.setAttribute("data-final-y", finalY);
        }

        wrappers.push(wrap);
        inners.push(inner);
      });
    }

    return { wrappers: wrappers, inners: inners };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShuffle);
  } else {
    initShuffle();
  }
})();
