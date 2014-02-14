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
    this.context.fillText(message, this.width/2, this.height/3);
    this.showing = true;
    this.changed = false;
  };

  this.gameOver = function () {
    if (!this.showingGO) {
      console.log("Drawing message!");
      this.clear();
      this.context.fillStyle="red";
      this.context.textAlign="center";
      this.context.fillText("Game Over!", this.width/2, this.height/2);
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
