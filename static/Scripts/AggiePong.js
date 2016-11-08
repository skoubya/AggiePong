var game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'static/Images/centerline.png');
	game.load.image('ball', 'static/Images/ball.png');
	game.load.image('paddle', 'static/Images/paddle.png');
	
	game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');
	
}

var centerline;
var balls;
var paddles;
var cursors;

var timer;
var score;

var counter = 0;
var ball_direction = 1;

function create() {
	timer = game.add.bitmapText(250, 250, 'carrier', '00:00:00');
	score = game.add.bitmapText(32, 32, 'carrier', 'Score: 0 0');
		
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.physics.arcade.checkCollision.down = false;
	game.physics.arcade.checkCollision.up = false;
		
	centerline = game.add.group();
	centerline.enableBody = true;
	
	for (var x = 0; x < 10; x++){
		
		var dash = centerline.create((x * 100) -37, game.world.centerY, 'centerline');
		//centerline.body.immovable = true;
		
	}
		
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
	
}
	
function render(){

}

function createBall() {	
	var ball = balls.create((Math.random() * 595), game.world.centerY - 12, 'ball');
	ball.checkWorldBounds = true;
	ball.body.bounce.set(1);
	ball.body.collideWorldBounds = true;
	ball.anchor.setTo(.5, .5);
}
	
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