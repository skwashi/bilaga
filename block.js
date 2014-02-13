/***
 ** 
 ** Begin blargh
 **
 **/

var drag = 0.5;


// Block class
function Block(context, x, y, w, h, solid, mass, color, health, vX, vY) {
  this.context = context;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.solid = solid;
  this.mass = mass;
  this.color = color;
  this.health = health;
  this.maxHealth = health;
  this.vX = vX;
  this.vY = vY;
  this.showHit = 0;
  this.alive = true;
  this.timeToDeath = 0;
  this.frame = 1;
  this.cycleLength = 0;
  this.actions = {};

  // actions are of the form [f, p1, p2 ... pn]
  this.execAction = function (action) {
    var f = action[0];
    var params = action.slice(1);
    this[f].apply(this, params);
  }
  
  this.addAction = function (time, action) {
    this.actions[time] = action;
  }

  this.addActions = function (array) {
    for (var i = 0, len = array.length; i < len; i++) 
      this.addAction(array[i][0], array[i][1]);
  }

  this.setVal = function(valName, val) {this[valName] = val;};
  /*
  this.setx = function (x) {this.x = x;}
  this.sety = function (y) {this.y = y;}
  this.setw = function (w) {this.w = h;}
  this.seth = function (h) {this.h = h;}
  this.setvX = function (vX) {this.vX = vX;}
  this.setvY = function (vY) {this.vY = vY;}
  */
}


Block.prototype = {
  x: 10,
  y: 10,
  w: 20,
  h: 20,
  solid: false,
  mass: 50,
  color: "purple",
  health: 1,
  maxHealth: 1,
  vX: 0,
  vY: 0,
  showHit: 0,
  alive: true,
  timeToDeath: 0,
  actions: {}
};

Block.prototype.isSolid = function () {
  return this.solid;
};

Block.prototype.split = function (xDir, yDir) {
  var w = this.w/3;
  var h = this.w/3;
  var x = this.x + (xDir+1)*w;
  var y = this.y + (yDir+1)*w;
  //var dir = unitVector([-1,-1]);
  var len = Math.sqrt(xDir*xDir + yDir*yDir);
  var xD = xDir / len;
  var yD = yDir / len;
  var vX = this.vX + 10*xD;
  var vY = this.vY + 10*yD;
  var splitBlock = null;
  if (this.hasOwnProperty("damage") && (this.damage > 0)) {
    splitBlock = new Projectile(this.context, x, y, w, h, this.mass/8, this.color, this.damage, vX, vY, 0, 0);
    splitBlock.alive = false;
    splitBlock.timeToDeath = 60;
  }
  else {
    splitBlock = new Projectile(this.context, x, y, w, h, this.mass/8, this.color, 1, vX, vY, 0, 0);
    splitBlock.alive = false;
    splitBlock.timeToDeath = 60;
  }
  return splitBlock;
};

Block.prototype.deathSpawn = function () {
  return [this.split(-1,-1), this.split(0,-1), this.split(1,-1),
	  this.split(-1, 0),                   this.split(1, 0),
	  this.split(-1, 1), this.split(0, 1), this.split(1, 1)];
};

Block.prototype.clear = function () {
  this.context.clearRect(this.x-1, this.y-1, this.w+2, this.h+2);
};

Block.prototype.isOutside = function () {
  return (this.x > 1.5*width || this.x + this.w < -width ||
	  this.y > 1.5*height || this.y + this.h < -height);
};

Block.prototype.isGone = function () {
  return (this.isOutside() || (!this.alive && this.timeToDeath <= 0));
}

Block.prototype.draw = function() {
  if (this.showHit > 0) {
    this.context.fillStyle = "white";
    this.showHit--;
  } else {
    this.context.fillStyle = this.color;
  }
  this.context.fillRect(this.x, this.y, this.w, this.h);
};

Block.prototype.move = function() {

  if (!this.alive && this.timeToDeath > 0) {
    this.timeToDeath--;
  }

  this.x += this.vX;
  this.y += this.vY;  
    
  if (this.solid) {
    if (this.y <= 0) {
      this.y = 0;
      this.vY = -this.vY;
    } else if (this.y + this.h >= height) {
      this.y = height - this.h;
      this.vY = -this.vY;
    }
  
    if (this.x <= 0) {
      this.x = 0;
      this.vX = -this.vX;
    } else if (this.x + this.w >= width) {
      this.x = width - this.w;
      this.vX = -this.vX;
    }  
  }

};

Block.prototype.collide = function(block) {
  return (block.x <= this.x + this.w &&
	  this.x <= block.x + block.w &&
	  block.y <= this.y + this.h &&
	  this.y <= block.y + block.h);
};

Block.prototype.takeDamage = function(damage) {
  this.showHit = 6;
  this.health -= damage;
};


Block.prototype.executeActions = function () {
  if (this.frame > this.cycleLength && this.cycleLength != 0) {
    this.frame = 1;
  }
  if (this.actions.hasOwnProperty(this.frame)) {
    this.execAction(this.actions[this.frame]);
  }
  this.frame++;
}

Block.prototype.spawnEnemies = function(blocks) {
  game.addEnemies(blocks);
}

Block.prototype.spawnProjectiles = function(projectiles) {
  game.addProjectiles(blocks);
}

Block.prototype.spawnEProjectiles = function(projectiles) {
  game.addEProjectiles(projectiles);
}

Block.prototype.spawnMisc = function(misc) {
  game.addMisc(misc);
}

Block.prototype.spawnStraight = function(w, h, vX, vY) {
  var enemy = new Straight(this.context, this.x, this.y, w, h, this.mass, this.color, this.health/10, vX, vY);
  this.spawnEnemies([enemy]);
}

Block.prototype.fireLaser = function(w, h, vX, vY) {
  var ok = Math.floor(Math.random()*2);
  if (ok == 1) {
    var x = this.x + this.w/2 + 1;
    var y = this.y + this.h;
    var laser = new Projectile(this.context, x, y, w, h, 0, "orange", 1, vX, vY, 0, 0);
    this.spawnEProjectiles([laser]);
  }
}

// Player class
function Player(context, x, y, w, h, mass, color, rockets, vX, vY, aX, aY) {
  Block.call(this, context, x, y, w, h, true, mass, color, 0, vX, vY);
  this.aX = aX;
  this.aY = aY;
  this.rockets = rockets;
  this.cd = 10;
  this.cooldowns = {laser: 0, rocket: 0};

  this.reset = function (x, y, rockets) {
    this.x = x;
    this.y = y;
    this.vX = 0;
    this.vY = 0;
    this.rockets = rockets;
    this.cooldowns = {laser: 0, rocket: 0}
  };
}

Player.prototype = Object.create(Block.prototype, {
  aX: {value: 0, writable: true},
  aY: {value: 0, writable: true},
  cd: {value: 10, writable: true},
  cooldowns: {value: {laser: 0, rocket: 0}, writable: true},
  rockets: {value:0, writable: true}
});

Player.prototype.moveOut = function() {
  this.vY -= this.aY;
  this.y += this.vY;  
};

Player.prototype.move = function(xMove, yMove) {
  this.vX += this.aX*xMove - drag*this.vX / this.mass;
  this.vY += this.aY*yMove - drag*this.vY / this.mass;

  Block.prototype.move.call(this);
};

Player.prototype.fire = function(type, xDir) {
  var projectile = null;
  if (type == "rocket") {
    proj = [new Rocket(this.context, this.x, this.y, this.vX, this.vY, 0, -0.3)];//-0.075)];
  } else if (type == "dualLaser") {
    proj = [new Laser(this.context, this.x + 1, this.y - 1, 5*xDir, -10), new Laser(this.context, this.x + this.w - 3, this.y - 1, 5*xDir, -10)];
  } else {
    proj = [new Laser(this.context, this.x + this.w/2 - 1, this.y - 1, 0, -10)];
  }
  return proj;
};

// Enemy class
function Enemy(context, x, y, w, h, mass, color, health, vX, vY) {
  Block.call(this, context, x, y, w, h, true, mass, color, health, vX, vY);
}
Enemy.prototype = Object.create(Block.prototype);

function Straight(context, x, y, w, h, mass, color, health, vX, vY) {
  Enemy.call(this, context, x, y, w, h, mass, color, health, vX, vY);
}
Straight.prototype = Object.create(Enemy.prototype);
Straight.prototype.move = function () {
  this.x += this.vX;
  this.y += this.vY;
};

function Random(context, x, y, w, h, mass, color, health, vX, vY, aX, aY) {
  Enemy.call(this, context, x, y, w, h, mass, color, health, vX, vY);
  this.aX = aX;
  this.aY = aY;
}
Random.prototype = Object.create(Enemy.prototype, {
  aX: {value: 0, writable: true},
  aY: {value: 0, writable: true}
});
Random.prototype.move = function() {
  xMove = Math.floor((Math.random()*3)-1);
  yMove = Math.floor((Math.random()*3)-1);
  
  this.vX += this.aX*xMove - drag*this.vX / this.mass;
  this.vY += this.aY*yMove - drag*this.vY / this.mass;
  Enemy.prototype.move.call(this);
};


function Hydra(context, x, y, w, h, mass, color, health, vX, vY, aX, aY, depth) {
  Random.call(this, context, x, y, w, h, mass, color, health, vX, vY, aX, aY);
  this.depth = depth;
}
Hydra.prototype = Object.create(Random.prototype);
Hydra.prototype.deathSpawn = function () {
  var w = this.w/2;
  var h = this.h/2;
  var d = this.depth - 1;
  var health = this.maxHealth/2;
  if (this.depth <= 0) {
    return [new Random(this.context, this.x, this.y, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY),
	    new Random(this.context, this.x+w, this.y, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY),
	    new Random(this.context, this.x, this.y+h, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY),
	    new Random(this.context, this.x+w, this.y+h, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY)];
  } else {
    return [new Hydra(this.context, this.x, this.y, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY, d),
	    new Hydra(this.context, this.x+w, this.y, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY, d ),
	    new Hydra(this.context, this.x, this.y+h, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY, d),
	    new Hydra(this.context, this.x+w, this.y+h, w, h, this.mass, this.color, health, this.vX, this.vY, this.aX, this.aY, d)];
  }
};


function Mover(context, x, y, w, h, mass, color, health, vX, vY) {
  Enemy.call(this, context, x, y, w, h, mass, color, health, vX, vY);
}
Mover.prototype = Object.create(Enemy.prototype);
Mover.prototype.move = function() {
  this.x += this.vX;
  //this.y += this.vY;  
  
  if (this.y <= 0) {
    this.y = 0;
    this.vY = -this.vY;
  } else if (this.y + this.h >= height) {
    this.y = height - this.h;
    this.vY = -this.vY;
  }
  
  if (this.x <= 0) {
    this.x = 0;
    this.vX = -this.vX;
    this.y += (this.h+1)*this.vY;
  } else if (this.x + this.w >= width) {
    this.x = width - this.w;
    this.vX = -this.vX;
    this.y += (this.h+1)*this.vY;
  }
};


// Projectile class
function Projectile(context, x, y, w, h, mass, color, damage, vX, vY, aX, aY) {
  Block.call(this, context, x, y, w, h, false, mass, color, 0, vX, vY);
  this.aX = aX;
  this.aY = aY;
  this.damage = damage;
}

Projectile.prototype = Object.create(Block.prototype, {
  aX: {value: 0, writable: true},
  aY: {value: 0, writable: true},
  damage: {value: 1, writable: true}
});

Projectile.prototype.deathSpawn = function () {
  return [];
}

// Some projectiles

function Laser(context, x, y, vX, vY) {
  Projectile.call(this, context, x, y, 3, 10, 0, "lightgreen", 1, vX, vY, 0, 0);
}
Laser.prototype = Object.create(Projectile.prototype);
Laser.prototype.deathSpawn = function () {
  return [];
}

function Rocket(context, x, y, vX, vY, aX, aY) {
  Projectile.call(this, context, x, y, 10, 15, 100, "gray", 5, vX, vY, aX, aY);
}
Rocket.prototype = Object.create(Projectile.prototype);
Rocket.prototype.move = function () {
  this.vX += this.aX - drag*this.vX / this.mass;
  this.vY += this.aY - drag*this.vY / this.mass;
  
  Projectile.prototype.move.call(this);
};


Rocket.prototype.deathSpawn = function () {
  /*
  var debris = new Block(this.context, this.x-this.w, this.y-this.h, 3*this.w, 3*this.h, false, this.mass/8, "yellow", 0, 0, 0);
  debris.damage = this.damage;
  return debris.deathSpawn();*/
  var w = 2*this.h;
  var h = w;
  var x = this.x - (this.h-this.w)/2;
  var y = this.y;
  var vX = 0;//0.1*this.vX;
  var vY = 0;//0.1*this.vY;
  var l = Math.sqrt(2);
  var v = 0.5;
  var d = 1/6;
  var tod = 60;
  return [new Explosion(this.context, x-w/2, y-h/2, w, h, d, vX-v, vY-v, tod),
	  new Explosion(this.context, x, y-h/2, w, h, d, vX, vY-v*l, tod),
	  new Explosion(this.context, x+w/2, y-h/2, w, h, d, vX+v, vY-v, tod),
	  new Explosion(this.context, x-w/2, y, w, h, d, vX-v*l, vY, tod),
	  new Explosion(this.context, x, y, w, h, d, vX, vY, tod),
	  new Explosion(this.context, x+w/2, y, w, h, d, vX+v*l, vY, tod),
	  new Explosion(this.context, x-w/2, y+h/2, w, h, d, vX-v, vY+v, tod),
	  new Explosion(this.context, x, y+h/2, w, h, d, vX, vY+v*l, tod),
	  new Explosion(this.context, x+w/2, y+h/2, w, h, d, vX+v, vY+v, tod)];
}

function Explosion(context, x, y, h, w, d, vX, vY, tod) {
  Projectile.call(this, context, x, y, h, w, 0, "yellow", d, vX, vY);
  this.alive = false;
  this.timeToDeath = tod;
}

Explosion.prototype = Object.create(Projectile.prototype);
/***
 ** 
 ** End blargh
 **
 **/
