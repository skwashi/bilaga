// Reposistory of images

var images = new function () {
  this.background = new Image();
  this.stars = new Image();
  
  var numImages = 2;
  var numLoaded = 0;

  function imageLoaded() {
    numLoaded++;
    /*
    if (numLoaded == numImages) {
      window.init();
    }
    */
  }
  
  this.background.onload = function () {
    imageLoaded();
  }

  this.stars.onload = function () {
    imageLoaded();
  }
  
  this.background.src = "imgs/background.png";
  this.stars.src = "imgs/stars.png";
};


function Background(context, canvasWidth, canvasHeight, image, speed) {
  this.context = context;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.speed = speed;
  this.bg = image;
  this.offset = 0;
  this.reset = function () {
    this.offset = 0;
  };
}

Background.prototype.draw = function () {
  var cw = this.canvasWidth;
  var ch = this.canvasHeight;

  if (this.offset > this.bg.height) {
    this.offset = 0;
  }

  var xoffset = this.speed*cam.x;
  var offset = Math.floor(this.offset);

  if (offset == 0) {
    this.context.drawImage(this.bg, xoffset, 0, cw, ch, 0, 0, cw, ch);
  } else if (offset < ch) {
    this.context.drawImage(this.bg, xoffset, 0, cw, ch-offset, 0, offset, cw, ch-offset);
    this.context.drawImage(this.bg, xoffset, this.bg.height - offset, cw, offset, 0, 0, cw, offset);
  } else {
    this.context.drawImage(this.bg, xoffset, this.bg.height - offset, cw, ch, 0, 0, cw, ch);
  }
  
  this.offset -= this.speed * cam.vY;
}


function BGHandler() {
  this.init = function () {
    this.bgCanvas = document.getElementById("background");
    this.bgContext = this.bgCanvas.getContext("2d");
    this.bgWidth = this.bgCanvas.width;
    this.bgHeight = this.bgCanvas.height;
    this.backgrounds = [];
    this.backgrounds.push(new Background(this.bgContext, this.bgWidth, this.bgHeight, images.background, 1/10)); // 1/9
    this.backgrounds.push(new Background(this.bgContext, this.bgWidth, this.bgHeight, images.stars, 2/5)); // 1/6
  };
  
  this.drawBackgrounds = function () {
    //this.bgContext.clearRect(0, 0, this.bgWidth, this.bgHeight);
    for (var bg = 0; bg < this.backgrounds.length; bg++) {
      this.backgrounds[bg].draw();
    }
  };
}
