function Map (filename) {
  this.filename = filename;
  this.data = null; // parsed json generated by Tiled
  this.width = 0; // width of map in px
  this.height = 0; // height of the map in px
  this.tilesets = []; 
  this.tileWidth = 0; 
  this.tileHeight = 0;
  this.numRows = 0;
  this.numColumns = 0; 
  this.tileLayers = []; // layers for generating the background map
  this.metaLayer = {}; // layer called "meta" in Tiled with meta information (e.g. collision)
  this.objectLayers = [];   // for enemies, powerups, etc
  this.ready = false;
  this.canvas = null;
  this.context = null;

  this.getTileCoords = function (x, y) {
    return {row: Math.floor(y / this.tileHeight), col: Math.floor(x / this.tileWidth)};
  }

  this.getTileset = function (gid) {
    var i = 0;
    var id = gid & 0x0FFFFFFF; // clear the upper bits
    while(id > this.tilesets[i].gids.last)
      i++;
    return this.tilesets[i];
  }

  this.getTileProperties = function (gid) {
    if (gid == 0)
      return {};
    var tileset = this.getTileset(gid);
    var offset = tileset.gids.first;
    if (tileset.hasOwnProperty("properties") && tileset.properties.hasOwnProperty(gid-offset))
      return tileset.properties[gid-offset];
    else
      return {};
  }

  this.getProperties = function(x, y) {
    var row = (this.getTileCoords(x,y)).row;
    var col = (this.getTileCoords(x,y)).col;
    return this.getTileProperties(this.metaLayer.gids[row][col]);
  }
  
  this.load = function () {
    $.getJSON(filename).done($.proxy(this.loadData, this));	      
  };

  this.loadData = function(json) {
    this.data = json;
    this.tilesetsToLoad = json.tilesets.length;
    this.tileWidth = json.tilewidth;
    this.tileHeight = json.tileheight;
    this.numRows = json.height;
    this.numColumns = json.width;
    this.width = this.numRows * this.tileWidth;
    this.height = this.numColumns * this.tileHeight;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext("2d");

    for (var i = 0, len = json.tilesets.length; i < len; i++) {
      this.tilesets[i] = {};
      this.tilesets[i].width = json.tilesets[i].imagewidth;
      this.tilesets[i].height = json.tilesets[i].imageheight;
      this.tilesets[i].tileWidth = json.tilesets[i].tilewidth;
      this.tilesets[i].tileHeight = json.tilesets[i].tileheight;
      this.tilesets[i].numTiles = 
	this.tilesets[i].width / json.tilesets[i].tilewidth
	* this.tilesets[i].height / json.tilesets[i].tileheight;
      this.tilesets[i].gids = {};
      this.tilesets[i].gids.first = json.tilesets[i].firstgid;
      this.tilesets[i].gids.last = this.tilesets[i].gids.first + this.tilesets[i].numTiles - 1;
      this.tilesets[i].properties = json.tilesets[i].tileproperties;
      this.tilesets[i].image = $("<img />", {src: json.tilesets[0].image})[0];
      this.tilesets[i].image.onload = $.proxy(function () {
	this.tilesetsToLoad--;
	if (this.tilesetsToLoad == 0)
	  this.loadLayers();
      }, this);
    }
  }

  this.loadLayers = function() {
    var layer, gids;
    for (var m = 0, len = this.data.layers.length; m < len; m++) {
      layer = this.data.layers[m];
      if (layer.type == "objectgroup")
	this.objectLayers.push({name: layer.name, objects: layer.objects});
      else if (layer.type == "tilelayer") {
	gids = [];
	for (var i = 0; i < this.numRows; i++) {
	  gids[i] = [];
	  for (var j = 0; j < this.numColumns; j++) {
	    gids[i][j] = layer.data[this.numColumns*i + j];
	  }
	}
	if (layer.name == "meta" || layer.name == "Meta")
	  this.metaLayer.gids = gids;
	else 
	  this.tileLayers.push({gids: gids});
      }
    }
    
    this.renderTileLayers();
  }
  
  this.renderTileLayer = function(layer) {
    var gid, id, tx, ty, x, y;
    var tw, th;
    var width = this.width;
    var height = this.height;
    var tileset;
    this.context.clearRect(0, 0, width, height);
    
    for (var row = 0; row < this.numRows; row++) {
      for (var col = 0; col < this.numColumns; col++) {
	
	gid = layer.gids[row][col];
	if (gid == 0)
	  continue;
	tileset = this.getTileset(gid);
	tw = tileset.tileWidth;
	th = tileset.tileHeight;
	var id = gid & 0x0FFFFFFF; // clear the upper bits
	id -= tileset.gids.first;
	
	tx = (id % (tileset.width / tw))*tw;
	ty = ~~(id / (tileset.width / tw))*th;
	
	x = col * this.tileWidth;
	y = row * this.tileHeight;
	 
	this.context.drawImage(tileset.image, tx, ty, tw, th, x, y, tw, th);
      }
    }
    
    var image = new Image();
    image.src = this.canvas.toDataURL();
    layer.image = image;
    bgHandler.add(image, 1); // must change for generality
  }

  this.renderTileLayers = function () {
    for (var l = 0, len = this.tileLayers.length; l < len; l++)
      this.renderTileLayer(this.tileLayers[l]);
  }

  this.drawLayer = function(context, num, x, y, width, height) {
    context.drawImage(this.tileLayers[num].image, x, y, width, height, 0, 0, width, height);
  }

  this.drawLayers = function(context, x, y, width, height) {
    for (var i = 0; i < this.tileLayers.length; i++)
      this.drawLayer(context, i, x, y, width, height);
  }
}