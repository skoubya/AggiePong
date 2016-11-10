var game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'static/Images/centerline.png');
	game.load.image('ball', 'static/Images/ball.png');
	game.load.image('paddle', 'static/Images/paddle.png');
	game.load.image('square', 'static/Images/square.png');
	game.load.image('square2', 'static/Images/square.png');	


	game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');
	
}

var centerline;
var balls;
var paddles;
var cursors;
var square;
var square2;

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
	
	square = game.add.sprite(700,game.world.centerY-117,'square');
	square.anchor.setTo(0.5,0.5);
	square2 = game.add.sprite(100,game.world.centerY+117,'square');
	square2.anchor.setTo(0.5,0.5);
	
	cursors = game.input.keyboard.createCursorKeys();
	
	socket.on('render', function(obj){
		timer.setText(obj.timer.min + ':' + obj.timer.sec + ':' + obj.timer.msec);
		
		square.x = obj.square.x;
		square.y = obj.square.y;
		square.angle = obj.square.a;
		
		square2.x = obj.square2.x;
		square2.y = obj.square2.y;
		square2.angle = obj.square2.a;
		
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
	
}
	
function update() {
	square.angle++;
<<<<<<< HEAD
	//square2.angle++;
=======
	square2.angle++;
>>>>>>> 051561fbb6e166c909b5f9d71a797f030be0528c
}
	
function render(){

}
