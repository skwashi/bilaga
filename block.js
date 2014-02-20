/***
 ** 
 ** Begin blargh
 **
 **/

// Block class
function Block(context, x, y, w, h, solid, mass, color, health, vX, vY) {
  this.context = context;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.cols = [{xoff: 0, yoff: 0, w: w, h: h}];
  this.solid = solid;
  this.mass = mass;
  this.color = color;
  this.health = health;
  this.maxHealth = health;
  this.vX = vX;
  this.vY = vY;
  this.hasSprite = false;
  this.showHit = 0;
  this.hasShield = false;
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

  this.center = function() {
    return {x: (this.x + Math.ceil((this.w+1)/2)), y: (this.y + Math.ceil((this.h+1)/2))};
  }

  this.clearCols = function () {
    this.cols = [];
  }

  this.addCol = function(xoff, yoff, w, h) {
    this.cols.push ({xoff: xoff, yoff: yoff, w: w, h: h});
  }

}

Block.prototype.getSprite = function () {
  return this.sprite;
}

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
  return (this.x > grid.right + cwidth || this.x + this.w < grid.left - cwidth||
	  this.y > 2*grid.height || this.y + this.h < -grid.height);
};

Block.prototype.isGone = function () {
  return (this.isOutside() || (!this.alive && this.timeToDeath <= 0));
}

Block.prototype.isVisible = function () {
  return (this.x < cam.x + cwidth && this.x+this.w > cam.x
	  && this.y < cheight && this.y + this.h > 0);
}

Block.prototype.draw = function() {

  this.drawShadow();

  if (this.showHit > 0) {
    this.context.fillStyle = "white";
    this.showHit--;
  } else {
    this.context.fillStyle = this.color;
  }
  
  if (this.hasSprite == true)
    this.context.drawImage(this.sprite, this.x - cam.x, this.y);      
  else
    this.context.fillRect(this.x-cam.x, this.y, this.w, this.h);

  if (this.hasShield) {
    this.drawShield();
  }
  
};

Block.prototype.drawCon = function(context) {
  var oldStyle = context.fillStyle;
  context.fillStyle = "black";
  if (this.hasSprite == true)
    context.drawImage(this.getSprite(), this.x, this.y, this.w, this.h);
  else
    context.fillRect(this.x, this.y, this.w, this.h);
  context.fillStyle = oldStyle;
}

Block.prototype.drawShield = function() {
  this.context.globalAlpha = 0.3;
  this.context.fillStyle = "#FF55CC"//"rgba(255, 255, 255, 0.5)";
  this.context.beginPath();
  this.context.arc(this.center().x-cam.x, this.center().y, 40, 0, Math.PI*2, true);
  this.context.closePath();
  this.context.fill();
  this.context.globalAlpha = 1;
}

Block.prototype.drawCols = function() {
  this.context.fillStyle = "rgba(55,200,55,0.5)";
  var x, y, w, h;
  for (var i = 0, len = this.cols.length; i < len; i++) {
    x = this.x + this.cols[i].xoff - cam.x;
    y = this.y + this.cols[i].yoff;
    w = this.cols[i].w;
    h = this.cols[i].h;
    this.context.fillRect(x, y, w, h);
    console.log(x); console.log(y); console.log(w); console.log(h);
  }
}

Block.prototype.drawShadow = function() {
  var w = 0.75*this.w;
  var h = 0.75*this.h;
  var x = this.x + this.w/3 - cam.x;
  var y = this.y + this.h/2 ;
  var ctx = bgHandler.bgContext;

  ctx.fillStyle = "rgba(0,0,0,0.5)";

  if (this.hasSprite) {
    var sprite = this.getSprite();
    var sc = this.shadowContext;
    // Draw mask to buffer
    sc.save();
    sc.clearRect(0, 0, sc.canvas.width, sc.canvas.height);
    sc.drawImage(sprite, 0, 0)//, sprite.width, sprite.height, x, y, w, h);//, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);
    // Draw the color only where the mask exists (using source-in)
    sc.fillStyle = "rgba(0,0,0,0.5)";
    sc.globalCompositeOperation = "source-in";
    sc.fillRect(0, 0, sc.canvas.width, sc.canvas.height);
    sc.restore();
    ctx.drawImage(sc.canvas, 0, 0, sc.canvas.width, sc.canvas.height, x, y, w, h);//, sprite.width, sprite.height, x, y, w, h);
  } else
    ctx.fillRect(x, y, w, h);

}

Block.prototype.move = function() {

  if (!this.alive && this.timeToDeath > 0) {
    this.timeToDeath--;
  }

  this.x += this.vX;
  this.y += this.vY;

  var leftlim = grid.left; // game.player.w/2;
  var rightlim = grid.right; // - game.player.w;
  
  if (this.solid) {
    if (this.y <= 0) {
      this.y = 0;
      this.vY = -this.vY;
    } else if (this.y + this.h >= grid.height) {
      this.y = grid.height - this.h;
      this.vY = -this.vY;
    }
  
    if (this.x <= leftlim) {
      this.x = leftlim;
      this.vX = -this.vX;
    } else if (this.x + this.w >= rightlim) {
      this.x = rightlim - this.w;
      this.vX = -this.vX;
    }  
  }

};

Block.prototype.collide = function(block) {
  var x, y, w, h, bx, by, bw, bh;
  var collision = false;
  
  /*
  x = this.x; y = this.y; w = this.w; h = this.h;
  bx = block.x; by = block.y; bw = block.w; bh = block.h;
  collision = (bx <= x + w &&
	       x <= bx + bw &&
	       by <= y + h &&
	       y <= by + bh);
  
  if (collision == true)
    return true;
  else
    return false;
  */

  for (var i = 0, len = this.cols.length; i < len; i++) {
    for (var j = 0, blen = block.cols.length; j < blen; j++) {
      x = this.x + this.cols[i].xoff;
      y = this.y + this.cols[i].yoff;
      w = this.cols[i].w;
      h = this.cols[i].h;
      bx = block.x + block.cols[j].xoff;
      by = block.y + block.cols[j].yoff;
      bw = block.cols[j].w;
      bh = block.cols[j].h;
      collision = collision || (bx <= x + w &&
				x <= bx + bw &&
				by <= y + h &&
				y <= by + bh);
      if (collision == true)
	break;
    }
    if (collision == true)
      break;
  }

  return collision;
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
function Player(context, x, y, w, h, mass, color, rockets, vX, vY, aX, aY, lives) {
  Block.call(this, context, x, y, w, h, true, mass, color, 0, vX, vY);
  this.initial = {x: x, y: y};
  this.aX = aX;
  this.aY = aY;
  this.rockets = rockets;
  this.cd = 10;
  this.cooldowns = {laser: 0, rocket: 0};
  this.hasSprite = false;
  this.hasShield = true;
  this.lives = lives;
  this.time = 0;
  this.sprites = {};
  this.angle = 0;
  this.angleInc = 5;
  this.angleMax = 45;

  this.reset = function (rockets) {
    this.x = this.initial.x;
    this.y = this.initial.y;
    this.vX = 0;
    this.vY = 0;
    this.time = 0;
    this.rockets = rockets;
    this.cooldowns = {laser: 0, rocket: 0}
    this.hasShield = true;
  };

  this.addSprite = function (angle, sprite) {
    this.hasSprite = true;
    if (angle == 0) {
      this.sprite = sprite;
      var shadow = document.createElement("canvas");
      shadow.width = sprite.width;
      shadow.height = sprite.height;
      this.shadowContext = shadow.getContext("2d");
      /*
      this.x += (sprite.width - this.width)/2;
      this.y += (sprite.width - this.width)/2;
      this.w = sprite.width;
      this.h = sprite.height;
      */
    }
    this.sprites[angle] = sprite;
  }
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
  this.y += this.vY; // cam.vY;  
};

Player.prototype.mouseMove = function() {
  var dx = 0.1*(mouse.x - this.x);
  var dy = 0.1*(mouse.y - this.y);
  this.x += dx;
  this.y += dy;

  cam.vX = cam.pan*dx;
  cam.x += cam.vX;

  if (this.y <= 0) {
    this.y = 0;
    this.vY = -this.vY;
  } else if (this.y + this.h >= grid.height) {
    this.y = grid.height - this.h;
    this.vY = -this.vY;
  }
  
  if (this.x <= grid.left) {
    this.x = grid.left;
    this.vX = -this.vX;
    cam.x = grid.left;
    cam.vX = 0;
  } else if (this.x + this.w >= grid.right) {
    this.x = grid.right - this.w;
    this.vX = -this.vX;
    cam.x = cam.len;
    cam.vX = 0;
  }
  
}

Player.prototype.move = function(xMove, yMove) {
  
  var sign = (this.angle == 0) ? 0 : ((this.angle > 0) ? 1 : -1);
  var inc = 4;
  
  if (sign*this.angle < inc)
    this.angle = 0;
  else
    this.angle -= inc*sign;

  this.angle += (5+inc)*xMove;

  
  if (this.angle*sign > this.angleMax)
    this.angle = sign*this.angleMax;

  var len = 1;
  if (xMove != 0 && yMove != 0)
    len = Math.sqrt(xMove*xMove + yMove*yMove);
  var xM = xMove / len;
  var yM = yMove / len;

  /*
  this.vX = Math.min(15, this.vX + this.aX*xM);// - drag*this.vX / this.mass;
  this.vY = Math.min(15, this.vY + this.aY*yM);// - drag*this.vY / this.mass;
  this.vX *= 0.9;
  this.vY *= 0.9;
  */
  this.vX += this.aX*xM - drag*this.vX / this.mass;
  this.vY += this.aY*yM - drag*this.vY / this.mass;

  this.x += this.vX;
  this.y += this.vY;
    
  cam.vX = cam.pan*this.vX;
  cam.x += cam.vX;

  if (this.solid) {
    if (this.y <= 0) {
      this.y = 0;
      this.vY = -this.vY;
    } else if (this.y + this.h >= grid.height) {
      this.y = grid.height - this.h;
      this.vY = -this.vY;
    }
  
    if (this.x <= grid.left) {
      this.x = grid.left;
      this.vX = -this.vX;
      cam.x = grid.left;
      cam.vX = 0;
    } else if (this.x + this.w >= grid.right) {
      this.x = grid.right - this.w;
      this.vX = -this.vX;
      cam.x = cam.len;
      cam.vX = 0;
    }  
  }

  if (cam.x < grid.left) {
    console.log("Shouldn't happen! -- " + (grid.left - cam.x));
    cam.x = grid.left;
  }
  if (cam.x > cam.len) {
    console.log("Shouldn't happen! -- " + (cam.x - cam.len));
    cam.x = cam.len;
  }
  
};

Player.prototype.getSprite = function () {
  var angle = Math.floor(this.angle/this.angleInc) * this.angleInc;
  var sprite = this.sprites[angle];
  if (typeof(sprite) === "undefined") {
    return this.sprite;
  }
  else {
    return sprite;
  }
}


Player.prototype.draw = function() {
  this.context.fillStyle = this.color;
  var sprite = this.getSprite();

  this.drawShadow();

  if (this.hasSprite == true) {
    this.context.drawImage(sprite, this.x - cam.x, this.y);
  }
  else
    this.context.fillRect(this.x-cam.x, this.y, this.w, this.h);

  if (this.hasShield) {
    this.drawShield();
  }

};


Player.prototype.fire = function(type, xDir) {
  var projectile = null;
  var center = this.center().x;
  if (type == "rocket") {
    proj = [new Rocket(this.context, center, this.y, this.vX, this.vY + cam.vY, 0, -0.3)];//-0.075)];
  } else if (type == "dualLaser") {
    proj = [new Laser(this.context, center-5, this.y - 1, 5*xDir, -10), new Laser(this.context, center+5, this.y - 1, 5*xDir, -10)];
  } else if (type == "quadLaser") {
    proj = [new Laser(this.context, center-5, this.y - 1, 5*xDir, -10), new Laser(this.context, center+5, this.y - 1, 5*xDir, -10),
	    new Laser(this.context, center-21, this.y + 20, 0, -10), new Laser(this.context, center+21, this.y + 20, 0, -10)];
  } else if (type == "bomb") {
    proj = [new Bomb(this.context, center, this.y, this.vX, this.vY-5, 0, 0)];      
  } else {
    proj = [new Laser(this.context, center, this.y - 1, 0, -10)];
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
  var jump = (this.h+1)*this.vY;
  
  /*
  if (this.y <= 0) {
    this.y = 0;
    this.vY = -this.vY;
  } else if (this.y + this.h >= grid.height) {
    this.y = grid.height - this.h;
    this.vY = -this.vY;
    console.log(this.y);
    console.log(this.vY);
  }
  */
  var dojump = false;
  
  if (this.x <= grid.left) {
    this.x = grid.left;
    this.vX = -this.vX;
    dojump = true;
  } else if (this.x + this.w >= grid.right) {
    this.x = grid.right - this.w;
    this.vX = -this.vX;
    dojump = true;
  }

  if (dojump) {
    if (this.y + jump < 0 || this.y + jump + this.h > grid.height) {
      jump = -jump;
      this.vY = - this.vY;
    }
    this.y += jump;
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

Projectile.prototype.move = function () {
// this.x += cam.vX;
  Block.prototype.move.call(this);
}

Projectile.prototype.drawShadow = function () {
}

// Some projectiles

function Laser(context, c, y, vX, vY) {
  Projectile.call(this, context, c-2, y, 3, 10, 0, "lightgreen", 1, vX, vY, 0, 0);
}
Laser.prototype = Object.create(Projectile.prototype);
Laser.prototype.deathSpawn = function () {
  return [];
}

Laser.prototype.draw = function () {
  this.context.fillStyle = this.color;
  this.context.fillRect(this.x-cam.x, this.y, this.w, this.h);
}

function Rocket(context, c, y, vX, vY, aX, aY) {
  Projectile.call(this, context, c-6, y, 11, 15, 100, "gray", 5, vX, vY, aX, aY);
}
Rocket.prototype = Object.create(Projectile.prototype);
Rocket.prototype.move = function () {
  this.vX += this.aX - drag*this.vX / this.mass;
  this.vY += this.aY - drag*this.vY / this.mass;

  this.x += this.vX;
  this.y += this.vY - cam.vY;
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
  Projectile.call(this, context, x, y, h, w, 0, "yellow", d, vX, vY-cam.vY);
  this.alive = false;
  this.timeToDeath = tod;
}

Explosion.prototype = Object.create(Projectile.prototype);

function Bomb(context, c, y, vX, vY, aX, aY) {
  Projectile.call(this, context, c-10, y, 21, 30, 20, "white", 100, vX, vY, aX, aY);
  this.alive = false;
  this.timeToDeath = 60;
}
Bomb.prototype = Object.create(Projectile.prototype);
Bomb.prototype.drawShadow = Block.prototype.drawShadow;

Bomb.prototype.move = function () {
  var f = 89/90;

  this.vX += this.aX - drag*this.vX / this.mass;
  this.vY += this.aY - drag*this.vY / this.mass;

  this.x += this.vX;
  this.y += this.vY;

  this.x += (1-f)*this.w / 2;
  this.y += (1-f)*this.h / 2;
  this.w *= f;
  this.h *= f;

  this.timeToDeath--;
};

Bomb.prototype.deathSpawn = function () {
  map.context.fillStyle = "rgba(0,0,0,0.8)";
  var x = this.x - 15 + cam.len;
  var y = this.y - 15 + map.height - cheight + cam.y;

  while (y < 0) {
    y+=map.height;
  }

  map.context.fillRect(x, y, this.w+30, this.h+30);

  return (Rocket.prototype.deathSpawn.call(this));
}

function House(context, x, y, w, h, mass, color, health) {
  Block.call(this, context, x, y, w, h, true, mass, color, health, 0, -cam.vY);
}



/***
 ** 
 ** End blargh
 **
 **/
