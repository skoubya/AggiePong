var game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'static/Images/centerline.png');
	game.load.image('ball', 'static/Images/ball.png');
	game.load.image('paddle', 'static/Images/paddle.png');
	game.load.image('inv_ball', 'static/Images/invBall.png');
	game.load.image('inv_paddle', 'static/Images/invPaddle.png');
	game.load.image('square', 'static/Images/square.png');
	
	game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');
	
}

var leftDown = [false, false];
var rightDown = [false, false];
var aDown = [false, false];
var dDown = [false, false];

var game;
var balls;
var paddles;

var invBalls;
var invPaddles;

var timer;
var score;

var player_1pts = 0;
var player_2pts = 0;

var milliseconds = 0;
var seconds = 0;
var minutes = 0;

var counter = 0;
var ball_direction = 1;


function create() {
	timer = game.add.bitmapText(250, 250, 'carrier', '00:00:00');
	score = game.add.bitmapText(32, 32, 'carrier', 'Score: 0 0');
		
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.checkCollision.down = false;
	game.physics.arcade.checkCollision.up = false;
	
	square = game.add.sprite(700,game.world.centerY-117,'square');
	game.physics.enable(square, Phaser.Physics.ARCADE);
	square.body.collideWorldBounds = true;
	square.body.checkCollision.up = true;
	square.body.checkCollision.down = true;
	square.body.checkCollision.right = true;
	square.body.checkCollision.left = true;
	square.body.bounce.setTo(1, 1);
	square.body.velocity.x=200;
	square.anchor.setTo(0.5,0.5);
	square.body.immovable = true;

	square2 = game.add.sprite(100,game.world.centerY+117,'square');
	game.physics.enable(square2, Phaser.Physics.ARCADE);
	square2.body.collideWorldBounds = true;
	square2.body.checkCollision.up = true;
	square2.body.checkCollision.down = true;
	square2.body.checkCollision.right = true;
	square2.body.checkCollision.left = true;
	square2.body.bounce.setTo(1, 1);
	square2.body.velocity.x=200;
	square2.anchor.setTo(0.5,0.5);
	square2.body.immovable = true;
	
	centerline = game.add.group();
	centerline.enableBody = true;
	
	for (var x = 0; x < 10; x++){
		
		var dash = centerline.create((x * 100) -37, game.world.centerY, 'centerline');
		//centerline.body.immovable = true;
		
	}
	
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.checkCollision.down = false;
	game.physics.arcade.checkCollision.up = false;
	
	paddles =  game.add.group();
	invPaddles =  game.add.group();
	
	createPaddle(game.world.centerX - 60, 730);
	
	createPaddle(game.world.centerX - 60, 70);
	
	balls = game.add.group();
	balls.enableBody = true;
	balls.checkWorldBounds = true;
	
	invBalls = game.add.group();
	invBalls.enableBody = true;
	invBalls.checkWorldBounds = true;
	
	//createBall();
	game.time.events.repeat(Phaser.Timer.SECOND * 3, 4, createBall, this);
	
	cursors = game.input.keyboard.createCursorKeys();
	
	setInterval(function(){
		var t = {min:minutes, sec:seconds, msec:milliseconds};
		var b = [];
		for(var i =0; i < invBalls.children.length; i++){
			b[i] = {x:invBalls.children[i].x, y:invBalls.children[i].y};
		}
		var p = [];
		for(var i =0; i < invPaddles.children.length; i++){
			p[i] = {x:invPaddles.children[i].x, y:invPaddles.children[i].y, angle:invPaddles.children[i].angle};
		}
		var obj= {timer:t, balls:b, players:p};
		socket.emit('render', obj);
	}, 20);
}
	
function update() {
	square.angle++;
	square2.angle++;		
	
	updateTimer();
	game.physics.arcade.collide(invPaddles, invBalls, ballHitPaddle, null, this);
	game.physics.arcade.collide(invBalls,square);
	game.physics.arcade.collide(invBalls,square2);
	for (var i =0; i < invPaddles.children.length; i++){
		invPaddles.children[i].body.velocity.x = 0;
		invPaddles.children[i].body.velocity.y = 0;
		
		if(leftDown[i] && !rightDown[i]){
			invPaddles.children[i].body.velocity.x = -750;
		}
		if(rightDown[i] && !leftDown[i]){
			invPaddles.children[i].body.velocity.x = 750;
		}
		if(aDown[i] && !dDown[i]){
			invPaddles.children[i].angle++;
		}
		if(dDown[i] && !aDown[i]){
			invPaddles.children[i].angle--;
		}
	}
	
	//impliment smacking the ball, increasing its velocity
	/*if(cursors.up.isDown){
	
	}
	if(!cursors.up.isDown){
		
	}*/
}
	
function render(){

}
	
function ballHitPaddle(_paddle, _ball) {
	
	var diff = 0;
	
	
	//ball is on left-hand side
	if (_ball.x < _paddle.x){
		
		diff = _paddle.x - _ball.x;
		_ball.body.velocity.x -= (diff);
		
	}
	
	//ball is on right-hand side
	else if (_ball.x > _paddle.x){
		
		diff = _ball.x - _paddle.x;
		_ball.body.velocity.x += (diff);
		
	}
	//ball is perfectly in the middle
	else{
		_ball.body.velocity.x = 2 + Math.random() * 6;
	}
	
}

/* Creates a paddle in the specified location */
function createPaddle(initX, initY){
	var paddle = paddles.create(initX, initY, 'paddle');
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	paddle.body.collideWorldBounds = true;
	paddle.body.immovable = true;
	paddle.anchor.setTo(.5, .5);
	
	var invPaddle = invPaddles.create(initX, initY, 'inv_paddle');
	game.physics.enable(invPaddle, Phaser.Physics.ARCADE);
	invPaddle.body.collideWorldBounds = true;
	invPaddle.body.immovable = true;
	invPaddle.anchor.setTo(.5, .5);
}

//create ball function, and ball velocity
function createBall() {	
	//var ball = balls.create(invBall.x, invBall.y, 'ball');
	var invBall = invBalls.create((Math.random() * 595), game.world.centerY - 12, 'inv_ball');
	invBall.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
	invBall.checkWorldBounds = true;
	invBall.body.bounce.set(1);
	invBall.body.collideWorldBounds = true;
	invBall.anchor.setTo(.5, .5);
	invBall.events.onOutOfBounds.add(function(){playerScored(invBall)}, this);
	ball_direction *= -1;	
}


function updateTimer() {
	minutes = Math.floor(game.time.time / 60000) % 60;    
	seconds = Math.floor(game.time.time / 1000) % 60;    
	milliseconds = Math.floor(game.time.time) % 100;    
	
	//If any of the digits becomes a single digit number, pad it with a zero    
	
	if (milliseconds < 10){     
		milliseconds = '0' + milliseconds;  
	}
	if (seconds < 10) {
		seconds = '0' + seconds;  
	}		
	if (minutes < 10){       
		minutes = '0' + minutes; 
	}
}

function playerScored(_ball){
	
	if(_ball.y < 50){
		player_2pts++;
	}
	else {
		player_1pts++;
	}
	
	var obj = {p1Score:player_1pts, p2Score:player_2pts};
	socket.emit('score', obj);
	
	game.time.events.add(Phaser.Timer.SECOND, function(){ //wait a little before respawnning the ball
		_ball.x = (Math.random() * 595);
		_ball.y = game.world.centerY - 12;
		_ball.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
		ball_direction *= -1;
	}, this);
	
	
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


socket.on('render', function(obj){
	timer.setText(obj.timer.min + ':' + obj.timer.sec + ':' + obj.timer.msec);
	
	paddles.children[0].position.x = obj.players[0].x;
	paddles.children[0].position.y = obj.players[0].y;
	paddles.children[0].angle = obj.players[0].angle;
	paddles.children[1].position.x = obj.players[1].x;
	paddles.children[1].position.y = obj.players[1].y;
	paddles.children[1].angle = obj.players[1].angle;	

	for(var i =0; i <obj.balls.length; i++){
		if (i < balls.children.length) {
			balls.children[i].x = obj.balls[i].x;
			balls.children[i].y = obj.balls[i].y;
		}
		else{
			var ball = balls.create(obj.balls[i].x, obj.balls[i].y, 'ball');
			ball.anchor.setTo(.5, .5);
		}
	}
});

socket.on('score', function(obj){
	score.setText('Score: ' + obj.p1Score + ' ' + obj.p2Score);
});
