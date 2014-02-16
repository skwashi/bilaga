// Reposistory of images

var images = new function () {
   
  var numImages = 0;

  this.repo = {};

  this.load = function (filename) {
    var image = new Image();
    image.src = filename;
    this.repo[filename] = image;
    console.log(this.repo[filename]);
    numImages++;
  }

  this.get = function (filename) {
    return this.repo[filename];
  }

  this.background = new Image();
  this.stars = new Image();
  this.ship1 = new Image();

  this.background.src = "imgs/background2.png";
  this.stars.src = "imgs/staars.png";
  this.ship1.src = "imgs/ship4.png";
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
  var left = grid.left;

  if (this.offset > this.bg.height) {
    this.offset = 0;
  }

  var xoffset = this.speed*cam.x;
  var offset = Math.floor(this.offset);
  
  if (offset == 0) {
    this.context.drawImage(this.bg, xoffset-left, 0, cw, ch, 0, 0, cw, ch);
  } else if (offset < ch) {
    this.context.drawImage(this.bg, xoffset-left, 0, cw, ch-offset, 0, offset, cw, ch-offset);
    this.context.drawImage(this.bg, xoffset-left, this.bg.height - offset, cw, offset, 0, 0, cw, offset);
  } else {
    this.context.drawImage(this.bg, xoffset-left, this.bg.height - offset, cw, ch, 0, 0, cw, ch);
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
//    this.backgrounds.push(new Background(this.bgContext, this.bgWidth, this.bgHeight, images.forest, 1)); 
  };
  
  this.drawBackgrounds = function () {
//    this.bgContext.fillStyle = "black";
//    this.bgContext.fillRect(0, 0, this.bgWidth, this.bgHeight);
    for (var bg = 0; bg < this.backgrounds.length; bg++) {
      this.backgrounds[bg].draw();
    }
  };
}
