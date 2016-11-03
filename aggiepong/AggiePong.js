
var game = new Phaser.Game(600, 800, Phaser.AUTO, 'Aggie Pong', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'assets/centerline.png');
	game.load.image('ball', 'assets/ball.png');
	game.load.image('paddle', 'assets/paddle.png');
	
}

var centerline;
var balls;
var paddle;
var cursors;
var counter = 0;
var ball_direction = 1;


function create() {
	
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	centerline = game.add.group();
	centerline.enableBody = true;
	
	for (var x = 0; x < 10; x++){
		
		var dash = centerline.create((x * 100) -37, game.world.centerY, 'centerline');
		//centerline.body.immovable = true;
		
	}
	
	paddle = game.add.sprite(game.world.centerX - 60, 730, 'paddle');
	//paddle.anchor.setTo()
	
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	
	paddle.body.collideWorldBounds = true;
	paddle.body.bounce.set(1);
	paddle.body.immovable = true;
	
	
	balls = game.add.physicsGroup(Phaser.Physics.ARCADE);
	balls.enableBody = true;
	
	//ball = game.add.sprite((Math.random() * 595), game.world.centerY - 12, 'ball');
	//ball.anchor.set(0.5);
	
	game.time.events.loop(Phaser.Timer.SECOND * 3, createBall, this);
	
	cursors = game.input.keyboard.createCursorKeys();
}
	
function update() {
	
	game.physics.arcade.collide(balls, paddle, ballHitPaddle, null, this);
	paddle.body.velocity.x = 0;
	paddle.body.velocity.y = 0;
	
	if(cursors.left.isDown && !cursors.right.isDown){
		paddle.body.velocity.x = -750;
	}
	if(cursors.right.isDown && !cursors.left.isDown){
		paddle.body.velocity.x = 750;
	}
	
	if(cursors.up.isDown){
		paddle.body.bounce.set(1.2);
	}
	if(!cursors.up.isDown){
		paddle.body.bounce.set(1);
	}
	
}
	
function render(){
	
}
	

function ballHitPaddle(_ball, _paddle) {
	
	var diff = 0;
	
	//ball is on left-hand side
	if (_ball.x < _paddle.x){
		
		diff = _paddle.x - _ball.x;
		_ball.body.velocity.x = (diff * -10);
		
	}
	
	//ball is on right-hand side
	else if (_ball.x > _paddle.x){
		
		diff = _ball.x - _paddle.x;
		_ball.body.velocity.x = (diff * 10);
		
	}
	//ball is perfectly in the middles
	else{
		_ball.body.velocity.x = 2 + Math.random() * 6;
	}
	
}

//************create ball function, and ball velocity
function createBall() {
	
	var ball = balls.create((Math.random() * 595), game.world.centerY - 12, 'ball');
	ball.body.velocity.setTo(Math.random() * 200 - 100, (Math.random() * 300 + 400) * ball_direction);
	ball.checkWorldBounds = true;
	ball.body.bounce.set(1);
	ball.body.collideWorldBounds = true;
	ball_direction *= -1;
}


