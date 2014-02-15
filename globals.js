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
var cwidth = canvas.width;
var cheight = canvas.height;

/**
 * Keyboard handling
 */
KEY_CODES = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  32: "space",
  49: "1",
  50: "2",
  65: "a",
  68: "d",
  69: "e",
  70: "f",
  81: "q",
//  82: "r",
  83: "s",
  87: "w",
  88: "x",
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


var mouse = {x:0, y:0};

/*
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
document.body.addEventListener('mousemove', function(evt) {
  mouse = getMousePos(canvas, evt);
  if (game.playerAlive && !game.player.isOutside())
    game.player.mouseMove();
}, false);
*/
/**
 * Color definitions
 */
colors = new function () {
  this.gradient = context.createLinearGradient(cwidth/2, cheight, cwidth/2, 0);
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


/**
 * camera speed
 */

