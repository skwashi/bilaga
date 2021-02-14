// Reposistory of images

var images = new (function () {
    var numImages = 0;

    this.repo = {};

    this.load = function (filename) {
        var image = new Image();
        image.src = filename;
        this.repo[filename] = image;
        console.log("Loaded " + filename);
        numImages++;
    };

    this.get = function (filename) {
        return this.repo[filename];
    };

    this.background = new Image();
    this.stars = new Image();
    this.ship = new Image();
    this.bg = new Image();
    this.bg.src = "maps/hoho.png";

    this.background.src = "imgs/background2.png";
    this.stars.src = "imgs/staars.png";
    this.ship.src = "imgs/ship.png";
})();

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

    var bottom = this.bg.height;
    var first = this.bg.height - ch;
    var xoffset = Math.floor(this.speed * cam.x);
    var yoffset = Math.floor(-this.speed * cam.y);
    var x = xoffset - left;
    var y = first - yoffset;

    while (y < 0) {
        y += bottom;
    }

    if (y > first) {
        this.context.drawImage(
            this.bg,
            x,
            y,
            cw,
            bottom - y,
            0,
            0,
            cw,
            bottom - y
        );
        this.context.drawImage(
            this.bg,
            x,
            0,
            cw,
            ch - (bottom - y),
            0,
            bottom - y,
            cw,
            ch - (bottom - y)
        );
    } else this.context.drawImage(this.bg, x, y, cw, ch, 0, 0, cw, ch);

    /*
  if (this.offset > this.bg.height) {
    this.offset = 0;
  }

  var offset = Math.floor(this.offset);

  if (offset == 0) {
    this.context.drawImage(this.bg, xoffset-left, 0, cw, ch, 0, 0, cw, ch);
  } else if (offset < ch) {
    this.context.drawImage(this.bg, 0, 0, cw, ch-offset, 0, offset, cw, ch-offset);
    this.context.drawImage(this.bg, 0, this.bg.height - offset, cw, offset, 0, 0, cw, offset);
  } else {
    this.context.drawImage(this.bg, xoffset-left, this.bg.height - offset, cw, ch, 0, 0, cw, ch);
  }

  this.offset -= this.speed * cam.vY;
  */
};

function BGHandler() {
    this.init = function () {
        this.bgCanvas = document.getElementById("background");
        this.bgContext = this.bgCanvas.getContext("2d");
        this.bgWidth = this.bgCanvas.width;
        this.bgHeight = this.bgCanvas.height;
        this.backgrounds = [];
        this.backgrounds.push(
            new Background(
                this.bgContext,
                this.bgWidth,
                this.bgHeight,
                images.background,
                1 / 9
            )
        ); // 1/9
        this.backgrounds.push(
            new Background(
                this.bgContext,
                this.bgWidth,
                this.bgHeight,
                images.stars,
                2 / 5
            )
        ); // 1/6
        //this.backgrounds.push(new Background(this.bgContext, this.bgWidth, this.bgHeight, images.bg, 1));
    };

    this.drawBackgrounds = function () {
        for (var bg = 0; bg < this.backgrounds.length; bg++) {
            this.backgrounds[bg].draw();
        }
    };

    this.add = function (image, speed) {
        this.backgrounds.push(
            new Background(
                this.bgContext,
                this.bgWidth,
                this.bgHeight,
                image,
                speed
            )
        );
    };
}
