var socketNum = 10072

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var phaser = require(__dirname + '/static/Scripts/phaser.min.js');
//TODO: Phaser needs window which node.js doesn't have for server

app.use('/static', express.static('static'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/Pages/Menu.html');
});

var playerSockets = [];

var leftDown = [false, false];
var rightDown = [false, false];

var game;
var balls;
var paddles;
var player_1pts = 0;
var player_2pts = 0;

var milliseconds = 0;
var seconds = 0;
var minutes = 0;

var counter = 0;
var ball_direction = 1;

function startGame(){
	new Phaser.Game(600, 800, Phaser.AUTO, '', {preload: preload, create: create, update: update, render: render });
	
	setInterval(function(){
		var t = {min:minutes, sec:seconds, msec:milliseconds};
		var b = [];
		for(var i =0; i < balls.children.length; i++){
			b[i] = {x:balls.children[i].x, y:balls.children[i].y};
		}
		var p = [];
		for(var i =0; i < paddles.children.length; i++){
			p[i] = {x:paddles.children[i].x, y:paddles.children[i].y};
		}
		var obj= {timer:t, balls:b, players:p};
		io.sockets.emit('render', obj);
	}, 10);

}

function preload() {
	
	game.load.image('centerline', 'static/Images/centerline.png');
	game.load.image('ball', 'static/Images/ball.png');
	game.load.image('paddle', 'static/Images/paddle.png');
	
	game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');
	
}


function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.checkCollision.down = false;
	game.physics.arcade.checkCollision.up = false;
	
	paddles =  game.add.group();
	var paddle = paddles.create(game.world.centerX - 60, 730, 'paddle');
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	
	paddle.body.collideWorldBounds = true;
	paddle.body.immovable = true;
	paddle.anchor.setTo(.5, .5);
	
	paddle = paddles.create(game.world.centerX - 60, 70, 'paddle');
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	
	paddle.body.collideWorldBounds = true;
	paddle.body.immovable = true;
	paddle.anchor.setTo(.5, .5);
	
	
	balls = game.add.group();
	balls.enableBody = true;
	balls.checkWorldBounds = true;
	
	createBall();
	//game.time.events.loop(Phaser.Timer.SECOND * 3, createBall, this);
	
	cursors = game.input.keyboard.createCursorKeys();
}
	
function update() {
	
	updateTimer();
	game.physics.arcade.collide(paddles, balls, ballHitPaddle, null, this);
	for (var i =0; i < paddles.children.length; i++){
		paddles.children[i].body.velocity.x = 0;
		paddles.children[i].body.velocity.y = 0;
		
		if(leftDown[i] && !rightDown[i]){
			paddles.children[i].body.velocity.x = -750;
		}
		if(rightDown[i] && !leftDown[i]){
			paddles.children[i].body.velocity.x = 750;
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

//create ball function, and ball velocity
function createBall() {	
	var ball = balls.create((Math.random() * 595), game.world.centerY - 12, 'ball');
	ball.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
	ball.checkWorldBounds = true;
	ball.body.bounce.set(1);
	ball.body.collideWorldBounds = true;
	ball.anchor.setTo(.5, .5);
	ball.events.onOutOfBounds.add(function(){playerScored(ball)}, this);
	ball_direction *= -1;
	console.log(balls.children[0].position.x);
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
	var obj = {ball:{ind:balls.children.indexOf(_ball), x:_ball.x, y:_ball.y}, p1Score:player_1pts, p2Score:player_2pts};
	io.sockets.emit('score', obj);
}

io.on('connection', function(socket){
	if (playerSockets.length >1){
		socket.emit('full', "");
	}
	else{
		playerSockets.push(socket);
		socket.emit('playerId', playerSockets.length-1); //gives playes index
		if(playerSockets.length == 2){
			io.sockets.emit('start', '');
			//startGame();
		}
	}
	
	console.log('A user connected');
	socket.on('disconnect', function(){
		console.log("User Disconnected");
		var playerInd = playerSockets.indexOf(socket);
		if(playerInd != -1) {
			playerSockets.splice(playerInd, 1);
			io.sockets.emit('quit', "");
		}
	});
	socket.on('keydown', function(msg){
		if(msg.key == 39 && !leftDown[msg.id] && !rightDown[msg.id]){//left			
			console.log("Player "+msg.id+" Moving Left");
			leftDown[msg.id] = true;
		}
		if(msg.key == 37 && !leftDown[msg.id] && !rightDown[msg.id]){//right			
			console.log("Player "+msg.id+" Moving Right");
			rightDown[msg.id] = true;
		}
	});
	socket.on('keyup', function(msg){
		if(msg.key == 39 && leftDown[msg.id]){
			console.log("Player "+msg.id+" Stop Moving Left");
			leftDown[msg.id] = false;
		}
		if(msg.key == 37 && rightDown[msg.id]){
			console.log("Player "+msg.id+" Stop Moving Right");
			rightDown[msg.id] = false;
		}
	});
});

http.listen(socketNum, function(){
	console.log('listening on *:'+socketNum);
});