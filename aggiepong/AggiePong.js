var game = new Phaser.Game(600, 800, Phaser.AUTO, 'Aggie Pong', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'assets/centerline.png');
	game.load.image('ball', 'assets/ball.png');
	game.load.image('paddle', 'assets/paddle.png');
	
	game.load.bitmapFont('carrier', 'assets/carrier_command.png', 'assets/carrier_command.xml');
	
}

//var textStyle = {font: '64px Carrier', align: 'center'};

var centerline;
var balls;
var paddle;
var player_1pts = 0;
var player_2pts = 0;
var cursors;

var timer;
var milliseconds = 0;
var seconds = 0;
var minutes = 0;

var score;
var counter = 0;
var ball_direction = 1;


function create() {
	
	timer = game.add.bitmapText(250, 250, 'carrier', '00:00:00');
	score = game.add.bitmapText(32, 32, 'carrier', '0');
	
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.checkCollision.down = false;
	
	centerline = game.add.group();
	centerline.enableBody = true;
	
	for (var x = 0; x < 10; x++){
		
		var dash = centerline.create((x * 100) -37, game.world.centerY, 'centerline');
		//centerline.body.immovable = true;
		
	}
	
	paddle = game.add.sprite(game.world.centerX - 60, 730, 'paddle');
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	
	paddle.body.collideWorldBounds = true;
	paddle.body.immovable = true;
	paddle.anchor.setTo(.5, .5);
	
	
	balls = game.add.group();
	balls.enableBody = true;
	balls.checkWorldBounds = true;
	

	game.time.events.loop(Phaser.Timer.SECOND * 3, createBall, this);
	
	
	
	cursors = game.input.keyboard.createCursorKeys();
	
}
	
function update() {
	
	updateTimer();
	game.physics.arcade.collide(paddle, balls, ballHitPaddle, null, this);
	paddle.body.velocity.x = 0;
	paddle.body.velocity.y = 0;
	
	if(cursors.left.isDown && !cursors.right.isDown){
		paddle.body.velocity.x = -750;
	}
	if(cursors.right.isDown && !cursors.left.isDown){
		paddle.body.velocity.x = 750;
	}
	
	//impliment smacking the ball, increasing its velocity
	if(cursors.up.isDown){
	
	}
	if(!cursors.up.isDown){
		
	}
	
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
	
	timer.setText(minutes + ':' + seconds + ':' + milliseconds);
	
}

function playerScored(_ball){
	
	if(_ball.y < 50){
		player_2pts++;
	}
	else {
		player_1pts++;
	}
	
	score.setText('Score: ' + player_1pts + ' ' + player_2pts);
	
	_ball.kill();
	
}