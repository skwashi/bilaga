
/**
 * Hud
 */
function Hud(game, context, width, height) {
  this.game = game;
  this.context = context;
  this.width = width;
  this.height = height;

  this.clear = function () {
    this.context.clearRect(0, 0, this.width, this.height);
  };

  this.update = function () {
    var player = this.game.player;
    this.clear();
    this.context.fillStyle = "white";
    this.context.textAlign = "start";
    this.context.fillText("Level: " + game.levelNum, 20, 2*this.height/5);
    this.context.fillText("Enemies: " + this.game.enemies.length, 20, 3*this.height/5);
    this.context.fillText("vX: " + Math.round(player.vX*10)/10, 20, 4*this.height/5);
    this.context.fillText("vY: " + Math.round(player.vY*10)/10, 64, 4*this.height/5);
    this.context.textAlign = "end";
    this.context.fillText("Rockets: " + player.rockets, this.width - 20, 2*this.height/5);
    this.context.fillText("Lives: " + player.lives, this.width - 20, 3*this.height/5);
    this.context.fillText("Score: " + game.score, this.width - 20, 4*this.height/5);
  };
}


/**
 * Game
 */
function Game() {
  this.init = function (player, numLevels) {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    var hudCanvas = document.getElementById("hud");
    var hudContext = hudCanvas.getContext("2d");
    var hudWidth = hudCanvas.width;
    var hudHeight = hudCanvas.height;

    this.hud = new Hud(this, hudContext, hudWidth, hudHeight);
    this.player = player;
    this.playerAlive = true;
    this.playerCollision = false;
    this.enemies = [];
    this.projectiles = [];
    this.misc = [];
    this.enemyProjectiles = [];
    this.numLevels = numLevels;
    this.level = null;
    this.levelNum = 0;
    this.levelCompleted = true;
    this.currentWave = null;
    this.wave = 0;
    this.timeToWave = 0;
    this.waveFrame = 0;
    this.waveCleared = true;
    this.score = 0;
    this.scoreSaved = 0;
  };
  
  this.startLevel = function (level) {
    this.player.reset(this.width/2, this.height-10, 50);
    this.playerAlive = true;
    this.player.lives = 3;
    this.grace = 120;
    this.enemies = [];
    this.projectiles = [];
    this.misc = [];
    this.enemyProjectiles = [];
    this.level = level;
    this.levelCompleted = false;
    this.currentWave = null;
    this.wave = 0;
    this.timeToWave = level.delay[this.wave];
    this.waveFrame = 0;
    this.waveCleared = true;
    cam.reset();
  };

  this.loadLevel = function (num) {
    var level = loadLevel(num);
    messageLayer.clear();
    this.levelNum = num;
    this.startLevel(level);
  }

  this.start = function () {
    this.loadLevel(1);
    this.score = 0;
    this.scoreSaved = 0;
  }

  this.addEnemies = function (enemies) {
    this.enemies = this.enemies.concat(enemies);
  }

  this.addProjectiles = function (projectiles) {
    this.projectiles = this.projectiles.concat(projectiles);
  }

  this.addEProjectiles = function (projectiles) {
    this.enemyProjectiles = this.enemyProjectiles.concat(projectiles);
  }
  
}

Game.prototype.pullNextWave = function () {
  if (this.timeToWave <= 0) {
    this.currentWave = this.level.waves[this.wave];
    this.waveCleared = false;
    this.waveFrame = 0;
    this.wave++;
    this.timeToWave = this.level.delay[this.wave];
  } else {
    this.timeToWave--;
  }
};

Game.prototype.traverseWave = function () {
  if (this.currentWave.hasOwnProperty(this.waveFrame)) {
    var wave = this.currentWave[this.waveFrame];
    if (wave.type == "enemies") {
      this.addEnemies(wave.content);
    } else if (wave.type == "message") {
      messageLayer.setMessage(wave.content.message, wave.content.time);
    } else if (wave.type == "speed") {
      cam.levelSpeed = wave.content;
    } else if (wave.type == "done") {
      this.waveCleared = true;
    }
  }
}

Game.prototype.killEnemy = function (enemy) {
  var spawn = enemy.deathSpawn();
  for (var k = 0, len = spawn.length; k < len; k++) {
    if (spawn[k].isSolid()) {
      this.enemies.push(spawn[k]);
    } else {
      this.misc.push(spawn[k]);
    }
  }  
}


Game.prototype.handleInput = function () {
  var player = this.player;
  
  // player movement
  
  var xMove = 0;
  var yMove = 0;

  if (keys["left"]) {
    xMove -= 1;
  }
  if (keys["up"]) {
    yMove -= 1;
  }
  if (keys["right"]) {
    xMove += 1;
  }  
  if (keys["down"]) {
    yMove += 1;
  }

  player.move(xMove, yMove);

  // player firing
  /*
  if (keys["space"]) {
    if (this.player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("laser", 0));
      player.cooldowns.laser = player.cd;
    }
  }
  */
  if (keys["a"]) {
    if (player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("dualLaser", -1));
      player.cooldowns.laser = player.cd;
    }
  }
  if (keys["d"]) {
    if (player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("dualLaser", 1));
      player.cooldowns.laser = player.cd;
    }
  }
  if (keys["s"]) {
    if (player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("dualLaser", 0));
      player.cooldowns.laser = player.cd;
    }
  }
  if (keys["x"]) {
    if (player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("quadLaser", 0));
      player.cooldowns.laser = player.cd;
    }
  }
  if (keys["z"] && player.rockets > 0) {
    if (player.cooldowns.rocket == 0) {
      this.projectiles = this.projectiles.concat(player.fire("rocket", 0));
      player.cooldowns.rocket = player.cd;
      player.rockets -= 1;
    }
  }
  
  if (keys["e"])
    cam.vY += (5*cam.levelSpeed - cam.vY)/30;
  else
    cam.vY -= (cam.vY - cam.levelSpeed)/15;

  if (keys["f"])
    player.hasShield = true;
  
  if (keys["q"]) {
    if (this.enemies.length > 0 && player.cooldowns.rocket == 0) {
      var enemy = this.enemies[0];
      this.enemies.splice(0,1);
      this.killEnemy(enemy);
      delete enemy;
      player.cooldowns.rocket = player.cd;
    }
  }
  
  if (keys["w"]) {
    if (player.cooldowns.rocket == 0) {
      this.loadLevel(this.levelNum+1);
      player.cooldowns.rocket = 5*player.cd;
    }
  }
  
  if (keys["1"]) {
    grid.set(940, cheight);
    this.start();
  }
  if (keys["2"]) {
    grid.set(cwidth, cheight);
    this.start();
  }
     

}

Game.prototype.frameReset = function () {
  cam.vX = 0;
  this.player.dir = 0;
  this.playerCollision = false;
  this.player.hasShield = true;
  // clear canvas
  this.context.clearRect(0, 0, this.width, this.height);
}

Game.prototype.updateWave = function () {
   
  if (this.playerAlive) {
    // Wait for next wave if their are no remaining enemies.
    if (this.enemies.length == 0 && this.waveCleared == true) {
      if (this.wave < this.level.numWaves) {
	this.pullNextWave();
      } else {
	this.levelCompleted = true;
      }
    } else {
      // Check for new enemies in wave
      this.waveFrame++;
      this.traverseWave();
    }
  }

}

Game.prototype.updatePlayer = function () {
  
  if (this.player.time <= game.grace)
    this.player.hasShield = true;
  else
    this.player.hasShield = false;

  if (!this.playerAlive) {
    if (this.player.lives <= 0) {
      messageLayer.gameOver();
      if (keys["space"]) {    
	this.loadLevel(this.levelNum);
	this.score = this.scoreSaved;
      }
    } else {
      messageLayer.respawn();
      if (keys["space"]) {    
	this.playerAlive = true;
	this.player.reset(50);
	cam.reset();
	messageLayer.clear();
      }
    }
  } else if (this.levelCompleted) {
    //cam.vY = 5*cam.levelSpeed;
    cam.vY += (5*cam.levelSpeed - cam.vY)/15;
    if (this.player.isOutside()) {
      messageLayer.nextLevel();
      if (keys["space"]) {
	if (this.levelNum >= this.numLevels)
	  this.start();
	else {
	  this.loadLevel(this.levelNum+1);
	  this.scoreSaved = this.score;
	}
      }
    } else {
      this.player.moveOut();
    }   
  } else {
    // player keyboard interaction
    this.handleInput();
    
    // decrease player cooldowns
    for (var key in this.player.cooldowns) {
      if (this.player.cooldowns[key] > 0) {
	this.player.cooldowns[key]--;
      }
    }
   
  }
}

Game.prototype.updateEnemies = function () {
  var enemy = null;

  for (var i = this.enemies.length - 1; i >= 0; i--) {
    enemy = this.enemies[i];
    enemy.executeActions();
    enemy.move();
    if (enemy.isGone()) {
      this.enemies.splice(i,1);
      delete enemy;
    } else {
      enemy.draw();
      if (this.playerAlive && enemy.collide(this.player)) {
	this.playerCollision = true;
      }
    }
  }
}

Game.prototype.updateEnemyProjectiles = function () {
  var eproj = null;
  // move and check for enemy projectiles;
  for (var i = this.enemyProjectiles.length - 1; i >= 0; i--) {
    eproj = this.enemyProjectiles[i];
    eproj.move();
    if (eproj.isGone()) {
      this.enemyProjectiles.splice(i,1);
      delete eproj;
    } else {
      eproj.draw();
      if (this.playerAlive && eproj.collide(this.player)) {
	this.playerCollision = true;
      }
    }
  }
}


Game.prototype.updateProjectiles = function () {

  var projectile = null;
  var hit = false;
  var enemy = null;

  for (var i = this.projectiles.length - 1; i >= 0; i--) {
    hit = false;
    projectile = this.projectiles[i];
    projectile.move();
   
    for (var j = this.enemies.length -1; j >= 0; j--) {
      enemy = this.enemies[j];
      if (enemy.collide(projectile)) {
	hit = true;
	enemy.takeDamage(projectile.damage);
	if (enemy.health <= 0) {
	  console.log("Enemy died!");
	  this.enemies.splice(j,1);
	  this.killEnemy(enemy);
	  this.score++;
	  delete enemy;
	  break;
	}
      }
    }    
    if (hit && projectile.alive) {
      this.projectiles.splice(i, 1);
      this.addProjectiles(projectile.deathSpawn());
      delete projectile;
    } else if (projectile.isGone()) {
      this.projectiles.splice(i, 1);
      delete projectile;
    } else {
      projectile.draw();
    }
  }
}

Game.prototype.updateMisc = function () {
  var miscBlock = null;
  for (var i = this.misc.length - 1; i >= 0; i--) {
    miscBlock = this.misc[i];
    miscBlock.move();
    if (miscBlock.isGone()) {
      this.misc.splice(i,1);
      delete miscBlock;
    } else {
      miscBlock.draw();
    }
  }
}

Game.prototype.updateHud = function () {
  this.hud.update();
};

Game.prototype.update = function () {
  
  this.frameReset();
  this.updateWave();
  this.updatePlayer();
  this.updateEnemies();
  this.updateMisc();
  
  // draw player after enemies and misc but before projecties
  if (this.playerAlive && !this.player.isOutside()) {
    this.player.time++;
    this.player.draw();
//    this.player.drawCols();
  }

  this.updateEnemyProjectiles();
  this.updateProjectiles();

  this.updateHud();
  cam.move();

  if (this.playerCollision && !this.player.hasShield) {
    var playerExplosion = this.player.deathSpawn();
    this.misc = this.misc.concat(playerExplosion);
    this.playerAlive = false;
    this.player.lives--;
  } 

};

function Camera() {
  this.init = function (gridwidth, pw, x, y, vX, vY) {
    this.pan = (gridwidth - cwidth) / (gridwidth - pw);
    this.len = (gridwidth - cwidth) / 2;
    this.x = x;
    this.y = y;
    this.vX = vX;
    this.vY = vY;
    this.defSpeed = vY;
    this.levelSpeed = this.defSpeed;
  }
  
  this.reset = function() {
    var gw = grid.width;
    var pw = game.player.w;
    this.pan = (gw - cwidth) / (gw - pw);
    this.len = (gw - cwidth) / 2;
    this.x = 0;
    this.y = 0;
    this.vX = 0;
    this.vY = this.levelSpeed;
  }

  this.move = function () {
//    cam.x += cam.vX;
    cam.y += cam.vY;
  }
}

// coordinate system in which objects move
function Grid() {
  this.init = function (width, height) {
    this.width = width;
    this.height = height;
    this.left = -(width-cwidth)/2;
    this.right = cwidth + (width - cwidth)/2
  }
  this.set = function (width, height) {
    this.width = width;
    this.height = height;
    this.left = -(width-cwidth)/2;
    this.right = cwidth + (width - cwidth)/2;
  }
}

// setting up the game environment

var bgHandler = new BGHandler(); // background.js
var game = new Game();
var messageLayer = new MessageLayer(); // messagelayer.js
var cam = new Camera();
var grid = new Grid();
var drag = 1; //0.5;
var accel = 1;
var gridWidth = 940;


function loadPlayerSprites(player, inc, max) {
  var filename;
  for (var i = inc; i <= max; i += inc) {
    filename = "imgs/shipr"+i+".png";
    images.load(filename);
    player.addSprite(i, images.get(filename));
    filename = "imgs/shipl"+i+".png";
    images.load(filename);
    player.addSprite(-i, images.get(filename));
  }
  player.angleInc = inc;
  player.angleMax = max;
  player.clearCols();
  player.addCol(17, 7, 11, 13);
  player.addCol(11, 20, 23, 6);
  player.addCol(4, 26, 37, 11);
  player.addCol(14, 37, 17, 9);
  player.addCol(8, 46, 29, 4);
}

function render() {
  requestAnimationFrame(render);
  bgHandler.drawBackgrounds();
  game.update();
  messageLayer.render();
  map.renderLayers(bgHandler.bgContext);
}


function Map (name) {
  this.name = name;
  this.data = null;
  this.tileset = null;
  this.width = 0;
  this.height = 0;
  this.tilewidth = 0;
  this.tileheight = 0;
  this.tileIW = 0;
  this.tileIH = 0;
  this.layers = [];

  this.load = function () {
    $.getJSON("maps/" + this.name + ".json").done($.proxy(this.loadTileset, this));	      
  };

  this.loadTileset = function(json) {
    this.data = json;
    this.width = json.width;
    this.height = json.height;
    this.tilewidth = json.tilewidth;
    this.tileheight = json.tileheight;
    this.tileIW = json.tilesets[0].imagewidth;
    this.tileIH = json.tilesets[0].imageheight;
    this.tileset = $("<img />", {src: json.tilesets[0].image})[0];
    this.tileset.onload = $.proxy(this.loadLayers, this);
  };

  this.loadLayers = function() {
    for (var l = 0, len = this.data.layers.length; l < len; l++) {
      this.layers[l] = this.data.layers[l];
      this.layers[l].matrix = [];
      for (var i = 0; i < this.height; i++) {
	this.layers[l].matrix[i] = [];
	for (var j = 0; j < this.width; j++) {
	  this.layers[l].matrix[i][j] = this.layers[l].data[this.height*i + j];
	}
      }
    }
  }

  this.renderLayer = function(context, layer) {
    var gid, img_x, img_y, s_x, s_y;
    var tw = this.tilewidth;
    var th = this.tileheight;
    for (var i = 0, len = layer.data.length; i < len; i++) {
      gid = layer.data[i];
      if (gid == 0)
	continue;
      gid--;
      img_x = (gid % (this.tileIW / tw))*tw;
      img_y = ~~(gid / (this.tileIW / th))*th;
      s_x = (i % layer.width) * tw + grid.left;
      s_y = ~~(i / layer.height) * th;

      var h = this.height*this.tileheight;

      var offset = -cam.y;
      while (offset > this.height*this.tileheight)
	offset -= this.height*this.tileheight;

      if (offset == 0) {
	context.drawImage(this.tileset, img_x, img_y, tw, th, s_x - cam.x, s_y, tw, th);
      } else if (offset <  cheight) {
	context.drawImage(this.tileset, img_x, img_y, tw, th, s_x - cam.x, s_y + offset, tw, th);
	context.drawImage(this.tileset, img_x, img_y, tw, th, s_x - cam.x, s_y - h + offset, tw, th);
	//this.context.drawImage(this.bg, xoffset-left, 0, cw, ch-offset, 0, offset, cw, ch-offset);
	//this.context.drawImage(this.bg, xoffset-left, this.bg.height - offset, cw, offset, 0, 0, cw, offset);
      } else {
	context.drawImage(this.tileset, img_x, img_y, tw, th, s_x - cam.x, s_y - h + offset, tw, th);
	//this.context.drawImage(this.bg, xoffset-left, this.bg.height - offset, cw, ch, 0, 0, cw, ch);
      }
      
      //context.drawImage(this.tileset, img_x, img_y, tw, th, s_x - cam.x, s_y - cam.y, tw, th);
    }
  }

  this.renderLayers = function (context) {
    for (var l = 0, len = this.layers.length; l < len; l++)
      this.renderLayer(context, this.layers[l]);
  }
}


var map = new Map("world");

function init() {
  bgHandler.init();
  grid.init(gridWidth, cheight);
  messageLayer.init();
  var pw = images.ship.width;//45;
  var ph = images.ship.height;//52;
  var px = Math.floor(cwidth/2 - pw/2);
  var py = cheight-ph;
  var player = new Player(context, px, py, pw, ph, 10, "grey", 50, 0, 0, accel, accel, 3);//0.4, 0.4);
  player.addSprite(0, images.ship);
  loadPlayerSprites(player, 5,45);
  cam.init(gridWidth, player.w, 0, 0, 0, -5);
  game.init(player, 3);  
  game.start();
  map.load();
  render();
}

window.onload = function() {
  init();
}

