var game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'static/Images/centerline.png');
	game.load.image('ball', 'static/Images/ball.png');
	game.load.image('paddle', 'static/Images/paddle.png');
	game.load.image('inv_paddle', 'static/Images/invPaddle.png');
	game.load.image('hex2', 'static/Images/hexagon_sm2.png');
	
	game.load.physics('physicsData', 'static/Images/hex.json');
	
	game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');
}

var leftDown = [false, false];
var rightDown = [false, false];

var game;
var balls;
var paddles;
var hex;

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
	
	game.physics.startSystem(Phaser.Physics.P2JS);
	hex = game.add.sprite(300,game.world.centerY-117,'hex2'); 
	game.physics.p2.enable(hex, true);
	hex.body.clearShapes();
	//hex.body.loadPolygon('physicsData', 'hex2');
	
	/* hex.enableBody = true;
	hex.body.immovable = true;
	hex.body.collideWorldBounds = true;
	hex.body.checkCollision.up = true;
	hex.body.checkCollision.down = true;
	hex.body.checkCollision.left = true;
	hex.body.checkCollision.right = true
	hex.body.bounce.setTo(1, 1);
	hex.body.velocity.x = 100; */
	
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
	
	
	
	
	
	var paddle = paddles.create(game.world.centerX - 60, 730, 'paddle');
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	paddle.body.collideWorldBounds = true;
	paddle.body.immovable = true;
	paddle.anchor.setTo(.5, .5);
	
	var invPaddle = invPaddles.create(game.world.centerX - 60, 730, 'inv_paddle');
	game.physics.enable(invPaddle, Phaser.Physics.ARCADE);
	invPaddle.body.collideWorldBounds = true;
	invPaddle.body.immovable = true;
	invPaddle.anchor.setTo(.5, .5);
	//invPaddle.visible = false;
	
	
	paddle = paddles.create(game.world.centerX - 60, 70, 'paddle');
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	paddle.body.collideWorldBounds = true;
	paddle.body.immovable = true;
	paddle.anchor.setTo(.5, .5);
	
	invPaddle = invPaddles.create(game.world.centerX - 60, 70, 'inv_paddle');
	game.physics.enable(invPaddle, Phaser.Physics.ARCADE);
	invPaddle.body.collideWorldBounds = true;
	invPaddle.body.immovable = true;
	invPaddle.anchor.setTo(.5, .5);
	//invPaddle.visible = false;
	
	
	balls = game.add.group();
	balls.enableBody = true;
	balls.checkWorldBounds = true;
	
	invBalls = game.add.group();
	invBalls.enableBody = true;
	invBalls.checkWorldBounds = true;
	
	createBall();
	//game.time.events.loop(Phaser.Timer.SECOND * 3, createBall, this);
	
	cursors = game.input.keyboard.createCursorKeys();
	
	setInterval(function(){
		var t = {min:minutes, sec:seconds, msec:milliseconds};
		var b = [];
		for(var i =0; i < invBalls.children.length; i++){
			b[i] = {x:invBalls.children[i].x, y:invBalls.children[i].y};
		}
		var p = [];
		for(var i =0; i < invPaddles.children.length; i++){
			p[i] = {x:invPaddles.children[i].x, y:invPaddles.children[i].y};
		}
		var obj= {timer:t, balls:b, players:p};
		socket.emit('render', obj);
	}, 20);
}
	
function update() {
	
	
	updateTimer();
	game.physics.arcade.collide(invPaddles, invBalls, ballHitPaddle, null, this);
	//game.physics.arcade.collide(invBalls,hex);
	for (var i =0; i < invPaddles.children.length; i++){
		invPaddles.children[i].body.velocity.x = 0;
		invPaddles.children[i].body.velocity.y = 0;
		
		if(leftDown[i] && !rightDown[i]){
			invPaddles.children[i].body.velocity.x = -750;
		}
		if(rightDown[i] && !leftDown[i]){
			invPaddles.children[i].body.velocity.x = 750;
		}
	}
	
	//impliment smacking the ball, increasing its velocity
	/*if(cursors.up.isDown){
	
	}
	if(!cursors.up.isDown){
		
	}*/
}
	
function render(){
game.debug.bodyInfo(hex,16,24);
}

function updateHex(){
	
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

//create ball function, and ball velocity
function createBall() {	
	var invBall = invBalls.create((Math.random() * 595), game.world.centerY - 12, 'ball');
	invBall.visibility =false;
	ball = balls.create(invBall.x, invBall.y);
	
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
	
	_ball.x = (Math.random() * 595);
	_ball.y = game.world.centerY - 12;
	_ball.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
	ball_direction *= -1;
	var obj = {ball:{ind:invBalls.children.indexOf(_ball), x:_ball.x, y:_ball.y}, p1Score:player_1pts, p2Score:player_2pts};
	socket.emit('score', obj);
}

socket.on('keydown', function(msg){
	if(msg.key == 37 && !leftDown[msg.id] && !rightDown[msg.id]){//left			
		console.log("Player "+msg.id+" Moving Left");
		leftDown[msg.id] = true;
	}
	if(msg.key == 39 && !leftDown[msg.id] && !rightDown[msg.id]){//right			
		console.log("Player "+msg.id+" Moving Right");
		rightDown[msg.id] = true;
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
});


socket.on('render', function(obj){
	timer.setText(obj.timer.min + ':' + obj.timer.sec + ':' + obj.timer.msec);
	
	paddles.children[0].position.x = obj.players[0].x;
	paddles.children[0].position.y = obj.players[0].y;
	paddles.children[1].position.x = obj.players[1].x;
	paddles.children[1].position.y = obj.players[1].y;
	
	for(var i =0; i <obj.balls.length; i++){
		balls.children[i].x = obj.balls[i].x;
		balls.children[i].y = obj.balls[i].y;
	}
});

socket.on('score', function(obj){
	var ball = balls.children[obj.ball.ind];
	ball.x = obj.ball.x;
	ball.y = obj.ball.y;
	
	score.setText('Score: ' + obj.p1Score + ' ' + obj.p2Score);
});