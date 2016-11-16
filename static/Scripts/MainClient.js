var game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: null, create: create, update: update, render: null });

var leftDown = [false, false];
var rightDown = [false, false];
var aDown = [false, false];
var dDown = [false, false];

var invBalls;
var invPaddles;

var player_1pts = 0;
var player_2pts = 0;

var stunned = [false, false];

var milliseconds = '00';
var seconds = '00';
var minutes = '2';

var sec_num = 0;
var min_num = 2;

var bomb;
//var explosion;
//var animate_explode;

var ball_direction = 1;
var lockBall= [];

function renderEvent(){
	var t = {min:minutes, sec:seconds, msec:milliseconds};
	var b = [];
	for(var i =0; i < invBalls.children.length; i++){
		b[i] = {x:invBalls.children[i].x, y:invBalls.children[i].y};
	}
	var p = [];
	for(var i =0; i < invPaddles.children.length; i++){
		p[i] = {x:invPaddles.children[i].x, y:invPaddles.children[i].y, angle:invPaddles.children[i].angle};
	}
	var invSquare = invSquares.children[0];
	var invSquare2 = invSquares.children[1];
	var s = {x:invSquare.x, y:invSquare.y, a:invSquare.angle};
	var s2 = {x:invSquare2.x, y:invSquare2.y, a:invSquare2.angle};
	var bo = (bomb == undefined) ? null : {x:bomb.x, y:bomb.y};
	var obj= {timer:t, balls:b, players:p, square:s, square2:s2, bomb:bo};
	socket.emit('render', obj);
}

function createPaddle(init_x, init_y){
	var invPaddle = invPaddles.create(init_x, init_y, '');
	invPaddle.body.setRectangle(160, 17);
	invPaddle.anchor.setTo(0.5, 0.5);
	invPaddle.body.static = true;
	invPaddle.body.setCollisionGroup(paddleCollisionGroup);
	invPaddle.body.collides(ballCollisionGroup);
	invPaddle.body.collideWorldBounds = true;
}

function hitBall(body1, body2){

}

function createSquare(init_x, init_y){
	var invSquare = invSquares.create(init_x, init_y, '');
	invSquare.body.setRectangle(62, 62);
	invSquare.anchor.setTo(0.5, 0.5);
	invSquare.body.velocity.x = 200;
	invSquare.body.static = true;
	invSquare.body.setCollisionGroup(obsticleCollisionGroup);
	invSquare.body.collides(ballCollisionGroup);
}

function createBomb(){
	bomb = game.add.sprite((Math.random() * 595), game.world.centerY - 12, 'bomb');
	game.physics.enable(bomb, Phaser.Physics.ARCADE);
	bomb.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
	bomb.checkWorldBounds = true;
	bomb.body.bounce.set(1);
	bomb.body.collideWorldBounds = true;
	bomb.anchor.setTo(.5, .5);
	bomb.events.onOutOfBounds.add(function(){bombMissed(bomb)}, this);
	ball_direction *= -1;
}

function create() {
	$("canvas").get(0).remove(); //removes image of extra canvas
	var theGame = new VisualGame();
	theGame.start();
	
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	game.physics.p2.restitution = 1.0;
	game.physics.p2.gravity.y = 0;
	game.physics.p2.gravity.x = 0;
	paddleCollisionGroup = game.physics.p2.createCollisionGroup();
	ballCollisionGroup = game.physics.p2.createCollisionGroup();
	obsticleCollisionGroup = game.physics.p2.createCollisionGroup();	
	
	game.physics.p2.setBoundsToWorld(true, true, false, false, false);
	game.physics.p2.updateBoundsCollisionGroup();
	
	invPaddles = game.add.group();
	invPaddles.enableBody = true;
	invPaddles.physicsBodyType = Phaser.Physics.P2JS;

	createPaddle(game.world.centerX - 60, 730);
	createPaddle(game.world.centerX - 60, 70);

	invBalls = game.add.group();
	invBalls.enableBody = true;	
	invBalls.physicsBodyType = Phaser.Physics.P2JS;
	
	invSquares = game.add.group();
	invSquares.enableBody = true;
	invSquares.physicsBodyType = Phaser.Physics.P2JS;
	createSquare(500, game.world.centerY-117);
	createSquare(100, game.world.centerY+117);
	
	//creation of the bomb
	game.time.events.add(Phaser.Timer.SECOND * 15, createBomb, this);
	
	game.time.events.repeat(Phaser.Timer.SECOND * 3, 4, createBall, this);
	game.time.events.repeat(Phaser.Timer.SECOND, 2000, updateTimer, this);
	
	setInterval(renderEvent, 10);
}


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

function addVelocity(sprite, minVelocity) {
  var body = sprite.body
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];
  
  currVelocitySqr = vx * vx + vy * vy;
  
  if (currVelocitySqr < minVelocity * minVelocity) {
    angle = Math.atan2(vy, vx);
    
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    
    body.data.velocity[0] = vx;
    body.data.velocity[1] = vy;
  }

}

var maxVelocity = 30;
var minVelocity = 10;
function update() {
	for(var i = 0; i < invSquares.children.length; i++){
		invSquares.children[i].body.angle++;
		if(invSquares.children[i].body.x > 550 || invSquares.children[i].body.x < 50)
			invSquares.children[i].body.velocity.x *= -1;
	}	
	for(var i = 0; i < invBalls.children.length; i++){
		limitVelocity(invBalls.children[i],maxVelocity);
		addVelocity(invBalls.children[i],minVelocity);
		if(invBalls.children[i].body.y < 0 || invBalls.children[i].body.y > 800)
			playerScored(i);
	}

	milliseconds = Math.floor(game.time.time) % 100; 
	
	for (var i =0; i < invPaddles.children.length; i++){
		invPaddles.children[i].body.velocity.x = 0;
		invPaddles.children[i].body.velocity.y = 0;
		
		if(leftDown[i] && !rightDown[i] && !stunned[i]){
			if(invPaddles.children[i].body.x < 0)
				invPaddles.children[i].body.velocity.x = 0;
			else
				invPaddles.children[i].body.velocity.x = -1000;
		}
		if(rightDown[i] && !leftDown[i] && !stunned[i]){
			if(invPaddles.children[i].body.x > 600)
				invPaddles.children[i].body.velocity.x = 0;
			else
				invPaddles.children[i].body.velocity.x = 1000;
		}
		if(aDown[i] && !dDown[i] && !stunned[i] && invPaddles.children[i].body.angle <= 35){
			invPaddles.children[i].body.angle += 3;
		}
		if(dDown[i] && !aDown[i] && !stunned[i] && invPaddles.children[i].body.angle >= -35){
			invPaddles.children[i].body.angle -= 3;
		}
	}
	
}


//create ball function, and ball velocity
function createBall() {	
	//var ball = balls.create(invBall.x, invBall.y, 'ball');
	var invBall = invBalls.create((Math.random() * 595), game.world.centerY - 12, '');
	invBall.body.setCircle(24);
	invBall.anchor.setTo(0.5, 0.5);
	invBall.body.setCollisionGroup(ballCollisionGroup);
	invBall.body.collides([paddleCollisionGroup,  obsticleCollisionGroup]);
	invBall.body.velocity.x = 200
	invBall.body.velocity.y = 200 * ball_direction;
	invBall.events.onOutOfBounds.add(function(){playerScored(invBall)}, this);
	invBall.body.collideWorldBounds = true;
	ball_direction *= -1;	
}


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

function playerScored(i){
	if(lockBall[i] == true)	return;
	lockBall[i] = true;
	var _ball = invBalls.children[i];
	
	if(_ball.y < 50){
		player_1pts++;
	}
	else {
		player_2pts++;
	}
	
	var obj = {p1Score:player_1pts, p2Score:player_2pts};
	socket.emit('score', obj);
	
	game.time.events.add(Phaser.Timer.SECOND, function(){ //wait a little before respawnning the ball
		_ball.body.x = (Math.random() * 595);
		_ball.body.y = game.world.centerY - 12;
		_ball.body.velocity.x = Math.random() * 200 - 100;
		_ball.body.velocity.y = (Math.random() * 200 + 400) * ball_direction;
		ball_direction *= -1;
		lockBall[i] = false;
	}, this);
}

//calls stunTimer(), creates another bomb 4 seconds later,
//also calls explode() for the explosion animation
function bombMissed(_bomb){
	
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
	
	game.time.events.add(Phaser.Timer.SECOND * 4, function(){ //wait a little before respawnning the ball
		_bomb.x = (Math.random() * 595);
		_bomb.y = game.world.centerY - 12;
		_bomb.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
		ball_direction *= -1;
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
	if(msg.key == 37 && !leftDown[msg.id]){//left			
		console.log("Player "+msg.id+" Moving Left");
		leftDown[msg.id] = true;
	}
	if(msg.key == 39 && !rightDown[msg.id]){//right			
		console.log("Player "+msg.id+" Moving Right");
		rightDown[msg.id] = true;
	}
	if(msg.key == 65 && !aDown[msg.id]){
		console.log("Player " + msg.id + " Tilting Left");
		aDown[msg.id] = true;
	}
	if(msg.key == 68 && !dDown[msg.id]){
		console.log("Player " + msg.id + " Tilting Right");
		dDown[msg.id] = true;
	}
});
socket.on('keyup', function(msg){
	if(msg.key == 37 && leftDown[msg.id]){
		console.log("Player "+msg.id+" Stop Moving Left");
		leftDown[msg.id] = false;
	}
	if(msg.key == 39 && rightDown[msg.id]){
		console.log("Player "+msg.id+" Stop Moving Right");
		rightDown[msg.id] = false;
	}
	if(msg.key == 65 && aDown[msg.id]){
		console.log("Player " + msg.id + " Stop Tilting Left");
		aDown[msg.id] = false;
	}
	if(msg.key == 68 && dDown [msg.id]){
		console.log("Player " + msg.id + " Stop Tilting Right");
		dDown[msg.id] = false;
	}
});