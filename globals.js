/** 
 * Global variables and constants
 */


/**
 * requestAnimationFrame shim by Paul Irish
 */
window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000/60);
    };
})();

/**
 * Main drawing canvas
 */
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

/**
 * Keyboard handling
 */
KEY_CODES = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  32: "space",
  65: "a",
  68: "d",
  81: "q",
  83: "s",
  87: "w",
  90: "z" 
};

var keys = {};
for (var code in KEY_CODES) {
  keys[KEY_CODES[code]] = false;
}

document.onkeydown = function(e) {
  var keyCode = e.keyCode || e.charKode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    keys[KEY_CODES[keyCode]] = true;
  }
};

document.onkeyup = function(e) {
  var keyCode = e.keyCode || e.charKode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    keys[KEY_CODES[keyCode]] = false;
  }
};

/**
 * Color definitions
 */
colors = new function () {
  this.gradient = context.createLinearGradient(width/2, height, width/2, 0);
  this.gradient.addColorStop(0, "green");
  this.gradient.addColorStop(0.5, 'rgb(0, 0, 255)');
  this.gradient.addColorStop(1, 'rgb(255, 0, 0)');
}


/**
 * Vector operations
 */

function dotProduct(a, b) {
  var n = 0, lim = Math.min(a.length, b.length);
  for (var i = 0; i < lim; i++)
    n+= a[i] * b[i];
  return n;
}

function scalarMult(scalar, a) {
  var b = [];
  for (var i = 0; i < a.length; i++)
    b[i] = scalar*a[i];
  return b;
}

function unitVector(a) {
  return scalarMult(1/(dotProduct(a,a), a));
}
