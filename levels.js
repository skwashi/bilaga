/** 
 * Level class and levels.
 */

function Wave () {
  this.init = function (type, content) {
    this.type = type;
    this.content = content;
  };
}

function EWave (enemies) {
  this.type = "enemies";
  this.content = enemies;
}

function MWave(message, time) {
  this.type = "message";
  this.content = {message: message, time: time};
}

function DWave() {
  this.type = "done";
  this.content = {};
}

function Level(waves, delay, drag) {
  this.waves = waves;
  this.numWaves = waves.length;  
  this.delay = delay; // delay before wave in milliseconds.
  this.drag = drag;
}

/*
function downers(xmod) {
  var down = [];
  var space = (width-100)/10;
  var w = 0.7*space;
  var h = space;
  for (var x = space+xmod; x <= width - space; x += space+w) {
      down.push(new Straight(context, x, -3.5*h, w, h, 100, colors.gradient, 6, 0, 7));
  }
  for (var x = space+xmod; x <= width - space; x += space+w) {
      down.push(new Straight(context, x, -1.5*h, w, h, 100, colors.gradient, 6, 0, 7));
  }
  return down;
}
*/
function downers(xmod, health) {
  var num = 10;
  var down = [];
  var space = width/(2*num+1);
  var w = space;
  var h = 1.5*space;
  var x = space;
  for (var i = 0; i < num; i++) {
    down.push(new Straight(context, x+xmod+i*(w+space), -3.5*h, w, h, 100, colors.gradient, health, 0, 7));
  }
  x = space;
  for (var i = 0; i < num; i++) {
    down.push(new Straight(context, x+xmod+i*(w+space), -1.5*h, w, h, 100, colors.gradient, health, 0, 7));
  }
  return down;
}

function xMod(num) {
  return width/(2*num + 1);
}

function field(w, h, vY, space, health) {
  var down = [];
  var rand = 0;
  for (var y = 0; y <= height; y = y + h + space) {
    for (var x = 0; x <= width; x = x + w + space) {
      rand = Math.floor(Math.random()*8);
      if (rand == 0) {
	down.push(new Straight(context, x, -y, w, h, 100, "red", 100, 0, vY));
      } else {
	down.push(new Straight(context, x, -y, w, h, 100, colors.gradient, health, 0, vY));
      }
    }
  }
  return down;
}

function timeField(num, w, h, vY, space, health) {
  var tField = {};
  var delay = 2*height/vY;
  var t = 60;
  for (var i = 0; i < num; i++) {
    tField[t] = new EWave(field(w, h, vY, space, health));
    t += delay;
  }
  tField[t] = new DWave();
  return tField;
}

function timedWave() {
  return {
    60: (new EWave(downers(0, 6))),
    120: (new EWave(downers(xMod(10), 6))),
    180: (new EWave(downers(0, 6))),
    240: (new EWave(downers(-xMod(10), 6))),
    300: (new EWave(downers(0, 6))),
    360: (new EWave(downers(0, 6))),
    420: (new EWave(downers(xMod(10), 6))),
    480: (new EWave(downers(0, 6))),
    540: (new EWave(downers(-xMod(10), 6))),
    600: (new EWave(downers(0, 6))),
    660: (new EWave(downers(0, 6))),
    720: (new EWave(downers(xMod(10), 6))),
    780: (new EWave(downers(0, 6))),
    840: (new EWave(downers(-xMod(10), 6))),
    900: (new EWave(downers(0, 6))),
    960: (new EWave(downers(0, 6))),
    1560: (new DWave())
  };
}

function levelMessage(level) {
  return {1:(new MWave("Level "+level, 120)), 2:(new DWave())};
}

function loadLevel(number) {
  if (number == 1) {
    var enemy1 = new Enemy(context, 10, 20, 10, 10, 100, "purple", 1, 2, 2);
    var enemy2 = new Enemy(context, width-10, 20, 10, 10, 100, "purple", 1, -2, 2);
    var enemy3 = new Enemy(context, 30, 20, 20, 20, 100, "blue", 1, 2, 0);
    var enemy4 = new Enemy(context, width-30, 20, 20, 20, 100, "blue", 1, -2, 0);
    
    var eRand1 = new Random(context, 20, 40, 20, 20, 100, "red", 3, 5, 5, 0.4, 0.4);
    var eRand2 = new Random(context, width-20, 40, 20, 20, 100, "red", 3, -5, 5, 0.4, 0.4);
    var eRand3 = new Random(context, width/2, 50, 50, 50, 100, "red", 30, -5, 5, 0.4, 0.4);
    var eRand4 = new Random(context, width/2, 50, 50, 50, 100, "red", 30, 5, 5, 0.4, 0.4);
    var eRandS = new Random(context, width-20, 40, 20, 20, 20, "white", 3, -5, 5, 1, 1);
    
    var movers = [];
    for (var x = 10; x <= width-40; x += (width-50)/10) {
      movers.push(new Mover(context, x, 5, 30, 30, 100, colors.gradient, 5, 3, 1.5));
    }
   
    var waves = [];
    waves.push({1:(new MWave("Level 1", 120)), 2:(new DWave())});
    waves.push({1:(new EWave(movers)), 2:(new DWave())});//.push(new Hydra(context, width/2, 50, 100, 100, 100, "red", 5, 0,5, 0.4, 0.4))));
    waves.push({1:new EWave([enemy1, enemy2, enemy3, enemy4, eRand1, eRand2, eRand3, eRand4, eRandS]), 2:new DWave()});
    waves.push(timedWave());
    waves.push({1:new MWave("Warning: Large enemy approaching!", 240), 2:new DWave()});
    waves.push({1:new EWave([new Random(context, width/2-110, 5, 50, 75, 100, "purple", 30, 0,5, 0.4, 0.4), new Random(context, width/2+60, 5, 50, 75, 100, "purple", 30, 0, 5, 0.4, 0.4), new Hydra(context, width/2-50, 20, 100, 100, 100, colors.gradient, 50, 0,5, 0.4, 0.4, 1)]), 2:new DWave()});
      
    return new Level(waves, [0, 120, 240, 240, 60, 240], 0.5);
  } 
  /*
  else if (number == 2) {
    var waves = [];
    var e3 = new Hydra(context, 10, 20, 100, 100, 100, "red", 10, 5,5, 0.2, 0.2, 1);
    waves.push(new EWave([e3]));
    return new Level(waves, [0], 0.5);
  } else if (number == 3) {
    return new Level([timedWave()], [0], 0.5);    
  } else if (number == 4) {
    return new Level([{1:(new MWave("Warning: Incoming enemies!", 120)), 2:(new DWave())}], [0], 0.5);
  }
  */
  else if (number == 2) {
    return new Level([{1:(new MWave("Level 2", 120)), 2:(new DWave())},
		      timeField(5, 60, 80, 3, 2, 1),
		      {1:(new MWave("Warning: Speed increased!", 120)), 2:(new DWave())},
		      timeField(5, 60, 80, 6, 2, 1)], [0, 120, 60, 60], 0.5);
  }
  else if (number == 3) {
    var enemy = new Enemy(context, 5, 5, 100, 100, 100, colors.gradient, 100, 3, 0);
    enemy.cycleLength = 720;
    enemy.addAction(180, ["setVal", "vY", 20]);
    enemy.addAction(360, ["setVal", "vY", -3]);
    enemy.addAction(540, ["setVal", "vX", 20]);
    enemy.addAction(720, ["setVal", "vX", -3]);
    console.log(enemy.actions);
    return new Level([levelMessage(3), {1:(new EWave([enemy])), 2:(new DWave())}]
		     , [1,1], 0.5);
  }
  else {
    return new Level([], [], 0.5);
  }
}
