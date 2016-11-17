/* Main Client
 * 
 * Client that does the response calculations for the game
 *
 */
//TODO: Posibly make a class

var gameWidth = 600;
var gameHeight = 800; 

/* Create the Phaser game */
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game', {preload: null, create: create, update: update, render: null });

/* Initialize variables needed for the game */
var leftDown = [false, false];
var rightDown = [false, false];
var aDown = [false, false];
var dDown = [false, false];

var balls;
var paddles;
var squares;

var player_1pts = 0;
var player_2pts = 0;

var stunned = [false, false];

var seconds = '00';
var minutes = '2';

var sec_num = 0;
var min_num = 2;

var bomb;

var ball_direction = 1;
var lockBall = [];
var lockBomb;

var maxVelocity = 30;
var minVelocity = 10;

/* Creates object with render info and sends it to be used by the visual game 
 * Parameters:
 *
 */
function renderEvent(){
	var t = {min:minutes, sec:seconds};
	var b = [];
	for(var i =0; i < balls.children.length; i++){
		b[i] = {x:balls.children[i].x, y:balls.children[i].y};
	}
	var p = [];
	for(var i =0; i < paddles.children.length; i++){
		p[i] = {x:paddles.children[i].x, y:paddles.children[i].y, angle:paddles.children[i].angle};
	}
	var square = squares.children[0];
	var square2 = squares.children[1];
	var s = {x:square.x, y:square.y, a:square.angle};
	var s2 = {x:square2.x, y:square2.y, a:square2.angle};
	var bo = (bomb == undefined) ? null : {x:bomb.x, y:bomb.y};
	var obj= {timer:t, balls:b, players:p, square:s, square2:s2, bomb:bo};
	socket.emit('render', obj);
}


/* Creates a paddle and sets its parameters 
 * Parameters:
 *		init_x - initial x position of the paddle
 * 		init_y - initial y position of the paddle
 */
function createPaddle(init_x, init_y){
	var paddle = paddles.create(init_x, init_y, '');
	paddle.body.setRectangle(160, 17);
	paddle.anchor.setTo(0.5, 0.5);
	paddle.body.kinematic = true;
	paddle.body.setCollisionGroup(paddleCollisionGroup);
	paddle.body.collides([ballCollisionGroup, bombCollisionGroup]);
	paddle.body.collideWorldBounds = true;
}

/* Creates a square obsticle and sets its parameters 
 * Parameters:
 *		init_x - initial x position of the obsticle
 * 		init_y - initial y position of the obsticle
 */
function createSquare(init_x, init_y){
	var square = squares.create(init_x, init_y, '');
	square.body.setRectangle(62, 62);
	square.anchor.setTo(0.5, 0.5);
	square.body.velocity.x = 200;
	square.body.static = true;
	square.body.setCollisionGroup(obsticleCollisionGroup);
	square.body.collides([ballCollisionGroup, bombCollisionGroup]);
}

/* Creates a bomb in a random position along the center line
 * 		with a random initial velocity 
 * Parameters:
 *		
 */
function createBomb(){
	bomb = bombs.create((Math.random() * 595), game.world.centerY - 12, '');
	bomb.body.setCircle(24);
	bomb.anchor.setTo(0.5, 0.5);
	bomb.body.setCollisionGroup(bombCollisionGroup);
	bomb.body.collides([paddleCollisionGroup,  obsticleCollisionGroup]);
	bomb.body.velocity.x = Math.random() * 200 - 100;
	bomb.body.velocity.y = (Math.random() * 200 + 400) * ball_direction;
	bomb.body.collideWorldBounds = true;
	ball_direction *= -1;
}

/* Function called by phaser to create the game objects 
 * Parameters:
 *		
 */
function create() {
	$("canvas").get(0).remove(); //removes image of extra canvas
	
	/* Initialize the physics */
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	game.physics.p2.restitution = 1.0;
	game.physics.p2.gravity.y = 0;
	game.physics.p2.gravity.x = 0;
	game.physics.p2.setBoundsToWorld(true, true, false, false, false);
	game.physics.p2.updateBoundsCollisionGroup();
	
	/* Create collision groups */
	paddleCollisionGroup = game.physics.p2.createCollisionGroup();
	ballCollisionGroup = game.physics.p2.createCollisionGroup();
	bombCollisionGroup = game.physics.p2.createCollisionGroup();
	obsticleCollisionGroup = game.physics.p2.createCollisionGroup();	
	
	/* Create paddles */
	paddles = game.add.group();
	paddles.enableBody = true;
	paddles.physicsBodyType = Phaser.Physics.P2JS;
	createPaddle(game.world.centerX - 60, 730);
	createPaddle(game.world.centerX - 60, 70);

	/* Create ball group */
	balls = game.add.group();
	balls.enableBody = true;	
	balls.physicsBodyType = Phaser.Physics.P2JS;
	
	/* Create bomb group */
	bombs = game.add.group();
	bombs.enableBody = true;	
	bombs.physicsBodyType = Phaser.Physics.P2JS;
	
	/* Create square obstacles */
	squares = game.add.group();
	squares.enableBody = true;
	squares.physicsBodyType = Phaser.Physics.P2JS;
	createSquare(500, game.world.centerY-117);
	createSquare(100, game.world.centerY+117);
	
	/* creation of the bomb */
	game.time.events.add(Phaser.Timer.SECOND * 15, createBomb, this);
	
	/* creation of the balls */
	game.time.events.repeat(Phaser.Timer.SECOND * 3, 4, createBall, this);
	
	game.time.events.repeat(Phaser.Timer.SECOND, 2000, updateTimer, this);
	
	/* Start sending the render events */
	setInterval(renderEvent, 10);
}

/* Limit an objects velocity 
 * Parameters:
 *		sprite - the object whose velocity is being limitted
 *		maxVelocity - the fastest the object should go
 */
function limitVelocity(sprite, maxVelocity) {
  var body = sprite.body
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];
  
  currVelocitySqr = vx * vx + vy * vy;
  
  if (currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx);
    
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    
    body.data.velocity[0] = vx;
    body.data.velocity[1] = vy;
  }
}

/* Speeds an object up if it drops below a certain velocity 
 * Parameters:
 *		sprite - the object whose velocity is being increased
 *		minVelocity - the slowest the object should go
 */
function addVelocity(sprite, minVelocity) {
  var body = sprite.body
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];
  
  currVelocitySqr = vx * vx + vy * vy;
  
  if (currVelocitySqr < minVelocity * minVelocity) {
    angle = Math.atan2(vy, vx);
    
    vx = Math.cos(angle) * minVelocity; //was maxVelocity
    vy = Math.sin(angle) * minVelocity; //was maxVelocity
    
    body.data.velocity[0] = vx;
    body.data.velocity[1] = vy;
  }

}

/* Function called by phaser to update the state of the game objects 
 * Parameters:
 *		
 */
function update() {
	/* Update square, ball, and bomb motion */
	for(var i = 0; i < squares.children.length; i++){
		squares.children[i].body.angle++;
		if(squares.children[i].body.x > 550 || squares.children[i].body.x < 50)
			squares.children[i].body.velocity.x *= -1;
	}	
	for(var i = 0; i < balls.children.length; i++){
		limitVelocity(balls.children[i],maxVelocity);
		addVelocity(balls.children[i],minVelocity);
		
		/* Check if ball scored */
		if(balls.children[i].body.y < 0 || balls.children[i].body.y > 800){
			playerScored(i);
		}
	}
	for(var i = 0; i < bombs.children.length; i++){
		limitVelocity(bombs.children[i],maxVelocity);
		addVelocity(bombs.children[i],minVelocity);
		
		/* Check if bomb should explode */
		if(bombs.children[i].body.y < 0 || bombs.children[i].body.y > 800){
			bombMissed(bombs.children[i]);
		}
	}
	
	/* Update paddle position based off of key presses */
	for (var i =0; i < paddles.children.length; i++){
		paddles.children[i].body.velocity.x = 0;
		paddles.children[i].body.velocity.y = 0;
		
		var vertices = paddles.children[i].body.data.shapes[0].vertices;
		// *20 is to get it in pixels
		// Determine farthes left and right points
		var maxX = paddles.children[i].body.x + Math.max(vertices[0][0], vertices[1][0], vertices[2][0], vertices[3][0])*20;
		var minX = paddles.children[i].body.x + Math.min(vertices[0][0], vertices[1][0], vertices[2][0], vertices[3][0])*20;
		
		if(leftDown[i] && !rightDown[i] && !stunned[i]){
			if(minX >= 0)
				paddles.children[i].body.velocity.x = -1000;
		}
		if(rightDown[i] && !leftDown[i] && !stunned[i]){
			if(maxX <= 600)
				paddles.children[i].body.velocity.x = 1000;
		}
		if(aDown[i] && !dDown[i] && !stunned[i] && paddles.children[i].body.angle >= -35){
			paddles.children[i].body.angle -= 3;
		}
		if(dDown[i] && !aDown[i] && !stunned[i] && paddles.children[i].body.angle <= 35){
			paddles.children[i].body.angle += 3;
		}
	}
	
}


/* Creates a ball in a random position along the center line
 * 		with an initial velocity 
 * Parameters:
 *		
 */
function createBall() {	
	var invBall = balls.create((Math.random() * 595), game.world.centerY - 12, '');
	invBall.body.setCircle(24);
	invBall.anchor.setTo(0.5, 0.5);
	invBall.body.setCollisionGroup(ballCollisionGroup);
	invBall.body.collides([paddleCollisionGroup,  obsticleCollisionGroup]);
	invBall.body.velocity.x = 200;
	invBall.body.velocity.y = 200 * ball_direction;
	invBall.body.collideWorldBounds = true;
	ball_direction *= -1;	
}

/* Changes the timers value
 * Parameters:
 *		
 */
function updateTimer() {
	sec_num--;  
	//If any of the digits becomes a single digit number, pad it with a zero    
	
	if (sec_num < 0) {
		sec_num = 59;
		min_num--;
	}		
	if (minutes < 0){   
		var scores = {score1:player_1pts, score2:player_2pts};
		socket.emit('endGame', scores);
		game.destroy();
	}
	
	seconds = sec_num.toString();
	minutes = min_num.toString();
	
	if (sec_num < 10) {
		seconds = '0' + seconds;
	}
}

/* Execute actions that result from a ball scoring
 * Parameters:
 *		ballInd - index of the ball that scored
 */
function playerScored(ballInd){
	/* Make sure ball doesn't keep scoring while this function executes */
	if(lockBall[ballInd] == true)	return;
	lockBall[ballInd] = true;
	
	var _ball = balls.children[ballInd];
	
	/* Increment score of player that scored */
	if(_ball.y < 50){
		player_1pts++;
	}
	else {
		player_2pts++;
	}
	
	/* Send score info */
	var obj = {p1Score:player_1pts, p2Score:player_2pts};
	socket.emit('score', obj);
	
	/* Place the ball back in play (after some time) */
	game.time.events.add(Phaser.Timer.SECOND, function(){
		_ball.body.x = (Math.random() * 595);
		_ball.body.y = game.world.centerY - 12;
		_ball.body.velocity.x = Math.random() * 200 - 100;
		_ball.body.velocity.y = (Math.random() * 200 + 400) * ball_direction;
		ball_direction *= -1;
		lockBall[ballInd] = false;
	}, this);
}

//calls stunTimer(), creates another bomb 4 seconds later,
//also calls explode() for the explosion animation
function bombMissed(_bomb){
	if(lockBomb == true)	return;
	lockBomb = true;
	if(_bomb.y < 50){
		stunned[1] = true;
		game.time.events.add(Phaser.Timer.SECOND * 2, this.stunTimer, this, 2);
	}
	else {
		stunned[0] = true;
		game.time.events.add(Phaser.Timer.SECOND * 2, this.stunTimer, this, 1);
	}
	
	var obj = {x:_bomb.x, y:_bomb.y};
	socket.emit('explode', obj);
	
	game.time.events.add(Phaser.Timer.SECOND * 4, function(){ //wait a little before respawning the ball
		_bomb.body.x = (Math.random() * 595);
		_bomb.body.y = game.world.centerY - 12;
		_bomb.body.velocity.x = Math.random() * 200 - 100;
		_bomb.body.velocity.y = (Math.random() * 200 + 400) * ball_direction;
		ball_direction *= -1;
		lockBomb = false;
	}, this);
}

//removes the stun from the player
function stunTimer(player){
	if(player == 1){
		stunned[0] = false;
	}
	else{
		stunned[1] = false;
	}
}

socket.on('keydown', function(msg){
	var selKey;
	if(msg.key == 37){
		selKey = (msg.id == 0)? "left": "right";
	}else if (msg.key == 39){
		selKey = (msg.id == 0)? "right": "left";
	}
	else if (msg.key == 65){
		selKey = "tLeft";
	}
	else if (msg.key == 68){
		selKey = "tRight";
	}
	
	
	if(selKey == "left" && !leftDown[msg.id]){//left			
		console.log("Player "+msg.id+" Moving Left");
		leftDown[msg.id] = true;
	}
	if(selKey == "right" && !rightDown[msg.id]){//right			
		console.log("Player "+msg.id+" Moving Right");
		rightDown[msg.id] = true;
	}
	if(selKey == "tLeft" && !aDown[msg.id]){
		console.log("Player " + msg.id + " Tilting Left");
		aDown[msg.id] = true;
	}
	if(selKey == "tRight" && !dDown[msg.id]){
		console.log("Player " + msg.id + " Tilting Right");
		dDown[msg.id] = true;
	}
});
socket.on('keyup', function(msg){
	var selKey = "";
	if(msg.key == 37){
		selKey = (msg.id == 0)? "left": "right";
	}else if (msg.key == 39){
		selKey = (msg.id == 0)? "right": "left";
	}
	else if (msg.key == 65){
		selKey = "tLeft";
	}
	else if (msg.key == 68){
		selKey = "tRight";
	}
	
	if(selKey == "left" && leftDown[msg.id]){
		console.log("Player "+msg.id+" Stop Moving Left");
		leftDown[msg.id] = false;
	}
	if(selKey == "right" && rightDown[msg.id]){
		console.log("Player "+msg.id+" Stop Moving Right");
		rightDown[msg.id] = false;
	}
	if(selKey == "tLeft" && aDown[msg.id]){
		console.log("Player " + msg.id + " Stop Tilting Left");
		aDown[msg.id] = false;
	}
	if(selKey == "tRight" && dDown [msg.id]){
		console.log("Player " + msg.id + " Stop Tilting Right");
		dDown[msg.id] = false;
	}
});