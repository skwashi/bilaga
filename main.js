
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

}

Game.prototype.frameReset = function () {
  cam.vX = 0;
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
  }

  this.updateEnemyProjectiles();
  this.updateProjectiles();

  this.updateHud();


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

function render() {
  requestAnimationFrame(render);
  bgHandler.drawBackgrounds();
  game.update();
  messageLayer.render();
}

function init() {
  var pw = 45;
  var ph = 52;
  var px = cwidth/2 - pw/2;
  var py = cheight-10;
  var gridWidth = 940;
  var player = new Player(context, px, py, pw, ph, 10, "grey", 50, 0, 0, accel, accel, 3);//0.4, 0.4);
  player.addSprite(images.ship1);
  grid.init(gridWidth, cheight);
  cam.init(gridWidth, pw, 0, 0, 0, -5);
  bgHandler.init();
  game.init(player, 3);
  messageLayer.init();
  game.start();
  render();  
}

window.onload = function() {
  init();
}
