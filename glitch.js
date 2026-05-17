(function () {
  "use strict";

  // Configuration matching your React Bits props exactly
  var GLITCH_COLORS = ["#c084fc", "#f472b6", "#38bdf8", "#5b68dd", "#7c3aed"];
  var GLITCH_SPEED = 50;
  var CENTER_VIGNETTE = true;
  var OUTER_VIGNETTE = false;
  var SMOOTH = true;
  var CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789";

  var container = document.getElementById("hero-glitch");
  if (!container) return;

  // Create canvas
  var canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  // Add center vignette if specified
  if (CENTER_VIGNETTE) {
    var centerVig = document.createElement("div");
    centerVig.style.position = "absolute";
    centerVig.style.inset = "0";
    centerVig.style.pointerEvents = "none";
    centerVig.style.background = "radial-gradient(circle, rgba(3,3,3,0.3) 0%, rgba(3,3,3,0.95) 75%)";
    container.appendChild(centerVig);
  }

  // Add outer vignette if specified
  if (OUTER_VIGNETTE) {
    var outerVig = document.createElement("div");
    outerVig.style.position = "absolute";
    outerVig.style.inset = "0";
    outerVig.style.pointerEvents = "none";
    outerVig.style.background = "radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)";
    container.appendChild(outerVig);
  }

  var ctx = canvas.getContext("2d");
  var letters = [];
  var grid = { columns: 0, rows: 0 };
  var lastGlitchTime = Date.now();
  var animationFrameId;

  var lettersAndSymbols = Array.from(CHARACTERS);
  var fontSize = 16;
  var charWidth = 10;
  var charHeight = 20;

  function getRandomChar() {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  }

  function getRandomColor() {
    return GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)];
  }

  function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  function rgbStringToRgb(rgbStr) {
    var match = rgbStr.match(/\d+/g);
    if (match) {
      return {
        r: parseInt(match[0], 10),
        g: parseInt(match[1], 10),
        b: parseInt(match[2], 10)
      };
    }
    return null;
  }

  function parseColorToRgb(colorStr) {
    if (colorStr.indexOf("#") === 0) {
      return hexToRgb(colorStr);
    } else if (colorStr.indexOf("rgb") === 0) {
      return rgbStringToRgb(colorStr);
    }
    return { r: 255, g: 255, b: 255 };
  }

  function interpolateColor(start, end, factor) {
    var result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor)
    };
    return "rgb(" + result.r + ", " + result.g + ", " + result.b + ")";
  }

  function calculateGrid(width, height) {
    var columns = Math.ceil(width / charWidth);
    var rows = Math.ceil(height / charHeight);
    return { columns: columns, rows: rows };
  }

  function initializeLetters(columns, rows) {
    grid = { columns: columns, rows: rows };
    var totalLetters = columns * rows;
    letters = [];
    for (var i = 0; i < totalLetters; i++) {
      letters.push({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1
      });
    }
  }

  function resizeCanvas() {
    var rect = container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var gridDimensions = calculateGrid(rect.width, rect.height);
    initializeLetters(gridDimensions.columns, gridDimensions.rows);

    drawLetters();
  }

  function drawLetters() {
    if (!ctx || letters.length === 0) return;
    var rect = container.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = fontSize + "px monospace";
    ctx.textBaseline = "top";

    for (var i = 0; i < letters.length; i++) {
      var letter = letters[i];
      var x = (i % grid.columns) * charWidth;
      var y = Math.floor(i / grid.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    }
  }

  function updateLetters() {
    if (letters.length === 0) return;
    var updateCount = Math.max(1, Math.floor(letters.length * 0.05));

    for (var i = 0; i < updateCount; i++) {
      var index = Math.floor(Math.random() * letters.length);
      var letter = letters[index];
      if (!letter) continue;

      letter.char = getRandomChar();
      letter.targetColor = getRandomColor();

      if (!SMOOTH) {
        letter.color = letter.targetColor;
        letter.colorProgress = 1;
      } else {
        letter.colorProgress = 0;
      }
    }
  }

  function handleSmoothTransitions() {
    var needsRedraw = false;
    for (var i = 0; i < letters.length; i++) {
      var letter = letters[i];
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        var startRgb = parseColorToRgb(letter.color);
        var endRgb = parseColorToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
          needsRedraw = true;
        }
      }
    }

    if (needsRedraw) {
      drawLetters();
    }
  }

  function animate() {
    var now = Date.now();
    if (now - lastGlitchTime >= GLITCH_SPEED) {
      updateLetters();
      drawLetters();
      lastGlitchTime = now;
    }

    if (SMOOTH) {
      handleSmoothTransitions();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  function initGlitch() {
    resizeCanvas();
    animate();

    var resizeTimeout;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        cancelAnimationFrame(animationFrameId);
        resizeCanvas();
        animate();
      }, 100);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlitch);
  } else {
    initGlitch();
  }
})();
