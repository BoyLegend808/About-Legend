(function () {
  "use strict";

  // Configuration matching your React Bits TiltedCard props
  var ROTATE_AMPLITUDE = 14;
  var SCALE_ON_HOVER = 1.08;
  var DAMPING = 0.08; // Velocity smoothing factor (lerp coefficent)

  var figure = document.getElementById("hero-tilt-card");
  if (!figure) return;

  var inner = figure.querySelector(".tilted-card-inner");
  var caption = figure.querySelector(".tilted-card-caption");

  var rect = figure.getBoundingClientRect();
  var mouseX = 0, mouseY = 0;
  var isHovered = false;

  // Linear interpolation states
  var curRotateX = 0, targetRotateX = 0;
  var curRotateY = 0, targetRotateY = 0;
  var curScale = 1, targetScale = 1;
  var curOpacity = 0, targetOpacity = 0;
  var curCaptionX = 0, targetCaptionX = 0;
  var curCaptionY = 0, targetCaptionY = 0;
  var curCaptionRotate = 0, targetCaptionRotate = 0;

  var lastY = 0;

  figure.addEventListener("mousemove", function (e) {
    rect = figure.getBoundingClientRect();
    
    // Calculate cursor displacement from center of card
    var offsetX = e.clientX - rect.left - rect.width / 2;
    var offsetY = e.clientY - rect.top - rect.height / 2;

    targetRotateX = (offsetY / (rect.height / 2)) * -ROTATE_AMPLITUDE;
    targetRotateY = (offsetX / (rect.width / 2)) * ROTATE_AMPLITUDE;

    targetCaptionX = e.clientX - rect.left;
    targetCaptionY = e.clientY - rect.top;

    var velocityY = offsetY - lastY;
    targetCaptionRotate = -velocityY * 0.45;
    lastY = offsetY;
  });

  figure.addEventListener("mouseenter", function () {
    isHovered = true;
    targetScale = SCALE_ON_HOVER;
    targetOpacity = 1;
  });

  figure.addEventListener("mouseleave", function () {
    isHovered = false;
    targetScale = 1;
    targetRotateX = 0;
    targetRotateY = 0;
    targetOpacity = 0;
    targetCaptionRotate = 0;
  });

  function tick() {
    // Smooth transition interpolations
    curRotateX += (targetRotateX - curRotateX) * DAMPING;
    curRotateY += (targetRotateY - curRotateY) * DAMPING;
    curScale += (targetScale - curScale) * DAMPING;
    curOpacity += (targetOpacity - curOpacity) * DAMPING;
    
    // Faster lag tracking for tooltip caption
    curCaptionX += (targetCaptionX - curCaptionX) * 0.15;
    curCaptionY += (targetCaptionY - curCaptionY) * 0.15;
    curCaptionRotate += (targetCaptionRotate - curCaptionRotate) * DAMPING;

    // Apply 3D transforms to inner card container
    if (inner) {
      inner.style.transform = 
        "rotateX(" + curRotateX.toFixed(3) + "deg) " +
        "rotateY(" + curRotateY.toFixed(3) + "deg) " +
        "scale(" + curScale.toFixed(3) + ")";
    }

    // Apply spatial coordinates and rotation to the tooltip caption
    if (caption) {
      // Offset values ensure the tooltip hovers offset from the precise cursor tip
      var displayX = curCaptionX + 15;
      var displayY = curCaptionY + 15;
      caption.style.transform = 
        "translate3d(" + displayX.toFixed(1) + "px, " + displayY.toFixed(1) + "px, 0) " +
        "rotate(" + curCaptionRotate.toFixed(2) + "deg)";
      caption.style.opacity = curOpacity.toFixed(3);
    }

    requestAnimationFrame(tick);
  }

  // Recalculate dimensions on window resize
  window.addEventListener("resize", function () {
    rect = figure.getBoundingClientRect();
  });

  tick();
})();
