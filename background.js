// Reposistory of images

var images = new function () {
   
  var numImages = 0;

  this.repo = {};

  this.load = function (filename) {
    var image = new Image();
    image.src = filename;
    this.repo[filename] = image;
    console.log("Loaded " + filename);
    numImages++;
  }

  this.get = function (filename) {
    return this.repo[filename];
  }

  this.background = new Image();
  this.stars = new Image();
  this.ship = new Image();
  this.bg = new Image();
  this.bg.src = "maps/hoho.png";

  this.background.src = "imgs/background2.png";
  this.stars.src = "imgs/staars.png";
  this.ship.src = "imgs/ship.png";
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
    //this.backgrounds.push(new Background(this.bgContext, this.bgWidth, this.bgHeight, images.bg, 1)); 
  };
  
  this.drawBackgrounds = function () {
    for (var bg = 0; bg < this.backgrounds.length; bg++) {
      this.backgrounds[bg].draw();
    }
  };

}



/*
var bgcanvas = document.getElementById("background");
var c = bgcanvas.getContext("2d");


$.ajaxSetup({
  dataType: "json"
}

function Scene() {
  this.tileset = null;
  this.load = function (name) {
    return $.ajax({
      url: "maps/" + name + ".json"
    };
  }
}

var scene = {
  layers: [],
  renderLayer: function(layer) {
    if (layer.type !== "tilelayer" || !layer.opacity) {
      return; 
    }
    var s = c.canvas.cloneNode();
    var size = scene.data.tilewidth;
    s = s.getContext("2d");
    if (scene.layers.length < scene.data.layers.length) {
      layer.data.forEach(function(tile_idx, i) {
	if (!tile_idx) { return; }
	var img_x, img_y, s_x, s_y;
	var tile = scene.data.tilesets[0];
	tile_idx--;
	img_x = (tile_idx % (tile.imagewidth / size))*size;
	img_y = ~~(tile_idx / (tile.imagewidth / size))*size;
	s_x = (i % layer.width) * size;
	s_y = ~~(i / layer.width) * size;
	s.drawImage(scene.tileset, img_x, img_y, size, size,
		    s_x, s_y, size, size);
      });
      scene.layers.push(s.canvas.toDataURL());
      c.drawImage(s.canvas, 0, 0);
    } else {
      scene.layers.forEach(function(src) {
	var i = $("<img />", { src: src })[0];
	c.drawImage(i, 0, 0);
      });
    }
  },
  render: function (layer) {
    var src = this.layers[layer];
    var i = $("<img />", { src: src})[0];
    c.drawImage(i,300,300);
  },
  renderLayers: function (layers) {
    layers = $.isArray(layers) ? layers : this.data.layers;
    layers.forEach(this.renderLayer);
  },
  loadTileset: function(json) {
    this.data = json;
    this.tileset = $("<img />", {src: json.tilesets[0].image})[0]
    this.tileset.onload = $.proxy(this.renderLayers, this);
  },
  load: function(name) {
    return $.ajax({
      url: "maps/"+ name + ".json",
      data: "JSON"
    }).done($.proxy(this.loadTileset, this));
  }
}
*/

