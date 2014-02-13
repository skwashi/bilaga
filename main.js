

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
    this.context.fillText("x: " + Math.round(player.x) + " vX: " + Math.round(player.vX*10)/10, 20, 2*this.height/4);
    this.context.fillText("y: " + Math.round(player.y) + " vY: " + Math.round(player.vY*10)/10, 20, 3*this.height/4);
    this.context.textAlign = "end";
    this.context.fillText("Rockets: " + player.rockets, this.width - 20, 2*this.height/4);
    this.context.fillText("Enemies: " + this.game.enemies.length, this.width - 20, 3*this.height/4);
  };
}


/**
 * Game
 */
function Game() {
  this.init = function (numLevels) {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    var hudCanvas = document.getElementById("hud");
    var hudContext = hudCanvas.getContext("2d");
    var hudWidth = hudCanvas.width;
    var hudHeight = hudCanvas.height;

    this.hud = new Hud(this, hudContext, hudWidth, hudHeight);
    this.player = new Player(this.context, this.width/2, this.height-10, 10, 20, 10, colors.gradient, 50, 0, 0, 0.4, 0.4);
    this.playerAlive = true;
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
  };
  
  this.startLevel = function (level) {
    this.player.reset(this.width/2, this.height-10, 50);
    this.playerAlive = true;
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
  };

  this.loadLevel = function (num) {
    var level = loadLevel(num);
    messageLayer.clear();
    this.levelNum = num;
    this.startLevel(level);
  }

  this.start = function () {
    this.loadLevel(1);
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


Game.prototype.interact = function () {
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
  if (keys["s"]) {
    if (player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("dualLaser", 0));
      player.cooldowns.laser = player.cd;
    }
  }
  if (keys["d"]) {
    if (player.cooldowns.laser == 0) {
      this.projectiles = this.projectiles.concat(player.fire("dualLaser", 1));
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

Game.prototype.update = function () {
  
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

  // clear canvas
  this.context.clearRect(0, 0, this.width, this.height);
  
  if (!this.playerAlive) {
    messageLayer.gameOver();
    if (keys["space"]) {
      this.loadLevel(this.levelNum);
    }
  } else if (this.levelCompleted) {
    if (this.player.isOutside()) {
      messageLayer.nextLevel();
      if (keys["space"]) {
	if (this.levelNum >= this.numLevels)
	  this.start();
	else
	  this.loadLevel(this.levelNum+1);
      }
    } else {
      this.player.moveOut();
      this.player.draw();
    }   
  } else {
    // player keyboard interaction
    this.interact();
  
    // decrease player cooldowns
    for (var key in this.player.cooldowns) {
      if (this.player.cooldowns[key] > 0) {
	this.player.cooldowns[key]--;
      }
    }
    this.player.draw();
  }

  
  // move and draw enemies and check for collision
  var playerCollision = false;
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
	playerCollision = true;
      }
    }
  }

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
	playerCollision = true;
      }
    }
  }

  var miscBlock = null;
  // move and draw misc
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

  // move and draw projectiles
  var projectile = null;
  var i = 0;
  var hit = false;

  enemy = null;

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

  if (playerCollision) {
    var playerExplosion = this.player.deathSpawn();
    this.misc = this.misc.concat(playerExplosion);
    this.playerAlive = false;
  } 
  
};


Game.prototype.updateHud = function () {
  this.hud.update();
};

Game.prototype.moveOut = function () {
  this.player.clear();
  this.player.moveOut();
  this.player.draw();
  
  if (this.player.outside()) {
    return true;
  } else {
    return false;
  }
}


/**
 * Layer for messages
 */

function MessageLayer() {
  this.init = function () {
    this.canvas = document.getElementById("messages");
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.context.font="30px Verdana";

    this.showing = false;
    this.showingGO = false;
    this.showingNL = false;
    this.changed = false;
    this.message = null;
    this.timeRemaining = -1;
  };

  this.clear = function () {
    this.context.clearRect(0, 0, this.width, this.height);
    this.showing = false;
    this.showingGO = false;
    this.showingNL = false;
    this.message = null;
    this.changed = false;
  };

  this.setMessage = function (message, time) {
    this.message = message;
    this.timeRemaining = time;
    this.changed = true;    
  }

  this.render = function () {
    if (this.changed && this.message != null) {
      this.showMessage(this.message);
    }
    if (this.timeRemaining == 0) {
      this.clear();
      this.timeRemaining = -1;
    } else if (this.timeRemaining > 0) {
      this.timeRemaining -= 1;
    }     
  };

  this.showMessage = function (message) {
    console.log("Drawing Message!");
    this.clear();
    this.context.textAlign="center";
    this.context.fillStyle="blue";
    this.context.fillText(message, this.width/2, height/3);
    this.showing = true;
    this.changed = false;
  };

  this.gameOver = function () {
    if (!this.showingGO) {
      console.log("Drawing message!");
      this.clear();
      this.context.fillStyle="red";
      this.context.textAlign="center";
      this.context.fillText("Game Over!", this.width/2, height/2);
      this.context.fillText("Press space to restart level!", this.width/2, this.height/2 + 80);
      this.showing = true;
      this.showingGO = true;
      this.changed = false;
    }
  };
  
  this.nextLevel = function () {
    if (!this.showingNL) {
      this.clear();
      // Create gradient
      //var gradient=this.context.createLinearGradient(0, 0, this.width, 0);
      //gradient.addColorStop("0","magenta");
      //gradient.addColorStop("0.5","blue");
      //gradient.addColorStop("1.0","red");
      // Fill with gradient
      //this.context.fillStyle=gradient;
      this.context.fillStyle="blue";
      this.context.textAlign="center";
      this.context.fillText("Level completed.", this.width/2, this.height/2);  
      this.context.fillText("Press space to continue!", this.width/2, this.height/2 + 80);
      this.showingNL = true;
      this.showing = true;
      this.changed = false;
    }
  };
}


var bgHandler = new BGHandler();
var game = new Game();
var messageLayer = new MessageLayer();

function render() {
  requestAnimationFrame(render);
  bgHandler.drawBackgrounds();
  game.update();
  game.updateHud();
  messageLayer.render();
}

function init() {
  bgHandler.init();
  game.init(3);
  messageLayer.init();
  game.start();
  render();  
}

window.onload = function() {
  init();
}
