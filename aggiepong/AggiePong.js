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
var paddle_1;
var paddle_2;
var player_1pts = 0;
var player_2pts = 0;
var cursors;
var keyA;
var keyD;

var timer;
var milliseconds = 0;
var seconds = 0;
var minutes = 0;

var score_1;
var score_2;
var counter = 0;
var ball_direction = 1;

var bomb_counter = 4;
var bombs;
var p1_stunned = false;
var p2_stunned = false;


function create() {
	
	timer = game.add.bitmapText(250, 250, 'carrier', '00:00:00');
	score_1 = game.add.bitmapText(32, 16, 'carrier', 'Score: 0');
	score_2 = game.add.bitmapText(600 - 200, 800 - 32, 'carrier', 'Score: 0');
	score_1.scale.setTo(.5, .5);
	score_2.scale.setTo(.5, .5);
	
	
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.checkCollision.down = false;
	game.physics.arcade.checkCollision.up = false;
	
	centerline = game.add.group();
	centerline.enableBody = true;
	
	for (var x = 0; x < 10; x++){
		
		var dash = centerline.create((x * 100) -37, game.world.centerY, 'centerline');
		//centerline.body.immovable = true;
		
	}
	
	paddle_1 = game.add.sprite(game.world.centerX - 60, 730, 'paddle');
	paddle_2 = game.add.sprite(game.world.centerX - 60, 70, 'paddle');
	game.physics.enable(paddle_1, Phaser.Physics.ARCADE);
	game.physics.enable(paddle_2, Phaser.Physics.ARCADE);
	
	paddle_1.body.collideWorldBounds = true;
	paddle_1.body.immovable = true;
	paddle_1.anchor.setTo(.5, .5);
	paddle_2.body.collideWorldBounds = true;
	paddle_2.body.immovable = true;
	paddle_2.anchor.setTo(.5, .5);
	
	balls = game.add.group();
	bombs = game.add.group();
	balls.add(bombs);
	balls.enableBody = true;
	balls.checkWorldBounds = true;
	bombs.enableBody = true;
	bombs.checkWorldBounds = true;
	
	game.time.events.loop(Phaser.Timer.SECOND * 3, createBall, this);
	
	cursors = game.input.keyboard.createCursorKeys();
	keyA = game.input.keyboard.addKey(Phaser.Keyboard.A);
	keyD = game.input.keyboard.addKey(Phaser.Keyboard.D);
	
}
	
function update() {
	
	updateTimer();
	game.physics.arcade.collide(paddle_1, balls, ballHitpaddle, null, this);
	game.physics.arcade.collide(paddle_2, balls, ballHitpaddle, null, this);
	game.physics.arcade.collide(paddle_1, bombs, ballHitpaddle, null, this);
	game.physics.arcade.collide(paddle_2, bombs, ballHitpaddle, null, this);
	paddle_1.body.velocity.x = 0;
	paddle_1.body.velocity.y = 0;
	paddle_2.body.velocity.x = 0;
	paddle_2.body.velocity.y = 0;
	
	if(cursors.left.isDown && !cursors.right.isDown && !p1_stunned){
		paddle_1.body.velocity.x = -750;
	}
	if(cursors.right.isDown && !cursors.left.isDown && !p1_stunned){
		paddle_1.body.velocity.x = 750;
	}
	
	if(keyA.isDown && !keyD.isDown && !p2_stunned){
		paddle_2.body.velocity.x = -750;
	}
	if(keyD.isDown && !keyA.isDown && !p2_stunned){
			paddle_2.body.velocity.x = 750;
	}
	
	//impliment smacking the ball, increasing its velocity
	if(cursors.up.isDown){
	
	}
	if(!cursors.up.isDown){
		
	}
	
}
	
function render(){

}
	

function ballHitpaddle(_paddle, _ball) {
	
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
	
	if(bomb_counter < 4){
		var ball = balls.create((Math.random() * 595), game.world.centerY - 12, 'ball');
		ball.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
		ball.checkWorldBounds = true;
		ball.body.bounce.set(1);
		ball.body.collideWorldBounds = true;
		ball.anchor.setTo(.5, .5);
		ball.events.onOutOfBounds.add(function(){playerScored(ball)}, this);
		ball_direction *= -1;
		bomb_counter++;
	}
	
	else{
		var bomb = bombs.create((Math.random() * 595), game.world.centerY - 12, 'bomb');
		bomb.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 200 + 400) * ball_direction);
		bomb.checkWorldBounds = true;
		bomb.body.bounce.set(1);
		bomb.body.collideWorldBounds = true;
		bomb.anchor.setTo(.5, .5);
		bomb.events.onOutOfBounds.add(function(){bombMissed(bomb)}, this);
		ball_direction *= -1;
		bomb_counter = 0;
	}
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
		score_2.setText('Score: ' + player_2pts);
	}
	else {
		player_1pts++;
		score_1.setText('Score: ' + player_1pts);
	}
	
	_ball.kill();
	
}

function bombMissed(_bomb){
	
	if(_bomb.y < 50){
		p2_stunned = true;
		game.time.events.add(Phaser.Timer.SECOND * 2, this.stunTimer, this, 2);
	}
	else {
		p1_stunned = true;
		game.time.events.add(Phaser.Timer.SECOND * 2, this.stunTimer, this, 1);
	}
}

function stunTimer(player){
	if(player == 1){
		p1_stunned = false;
	}
	else{
		p2_stunned = false;
	}
}

function time(){
	
}
