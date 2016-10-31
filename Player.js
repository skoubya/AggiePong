//TODO: make in namespace

var PowerUp = {
	//TODO: Decide on power-ups
	NONE: "None",
	GROW: "Grow",
	FASTER: "Faster",
	REVERSE: "Reverse"
}

function Player(start_x_pos, start_y_pos, start_speed){
	/* Member Variables */
	this.score = 0;
	
	/* These three may be unecessary because of phaser */
	this.x_pos = start_x_pos;
	this.y_pos = start_y_pos;
	this.speed = start_speed;
	
	this.stunned = false;
	this.powerup = PowerUp.NONE;
	this.power_time = 0;
	
	/*Member functions*/
	this.missBomb = function(){
		document.getElementById("demo").innerHTML += "missed Bomb </br>";
	};
	
	this.hitPowerup = function(){
	};

	this.scored = function(){
	};
}