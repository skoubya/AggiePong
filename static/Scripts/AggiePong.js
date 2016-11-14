var game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render });

function preload() {
	
	game.load.image('centerline', 'static/Images/centerline.png');
	game.load.image('ball', 'static/Images/ball.png');
	game.load.image('paddle', 'static/Images/paddle.png');
	game.load.image('square', 'static/Images/square.png');
	game.load.image('bomb', 'static/Images/bomb.png');
	
	game.load.spritesheet('explosion', 'static/Images/explosion.png', 319, 60, 22);

	game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');
	
}

var centerline;
var balls;
var bomb;
var paddles;
var cursors;
var square;
var square2;

var timer;
var score_1;
var score_2;

function create() {
	timer = game.add.bitmapText(32, 800-32, 'carrier', '00:00:00');
	score_1 = game.add.bitmapText(32, 16, 'carrier', 'Score: 0');
	score_2 = game.add.bitmapText(600 - 200, 800 - 32, 'carrier', 'Score: 0');
	score_1.scale.setTo(.5, .5);
	score_2.scale.setTo(.5, .5);
	timer.scale.setTo(.5, .5);
		
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
	
	square = game.add.sprite(700,game.world.centerY-117,'square');
	square.anchor.setTo(0.5,0.5);
	square2 = game.add.sprite(100,game.world.centerY+117,'square');
	square2.anchor.setTo(0.5,0.5);
	
	cursors = game.input.keyboard.createCursorKeys();
	
	socket.on('render', function(obj){
		timer.setText('Time: ' + obj.timer.min + ':' + obj.timer.sec);
		
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
		
		if(obj.bomb != null){
			if(bomb == undefined) {//don't have bomb
				bomb = game.add.sprite(obj.bomb.x, obj.bomb.y, 'bomb');
				bomb.anchor.setTo(.5, .5);
			}
			else{
				bomb.x = obj.bomb.x;
				bomb.y = obj.bomb.y;
			}
		}
	});

	socket.on('score', function(obj){
		score_1.setText('Score: ' + obj.p1Score);
		score_2.setText('Score: ' + obj.p2Score);
	});
	socket.on('explode', function(obj){
		explode(obj.x, obj.y);
	});
	
}
	
//explosion animation 
function explode(xpos, ypos) {
	
	if(ypos < 100){
		ypos = ypos + 30;
	}
	else{
		ypos = ypos - 30;
	}
	
	explosion = game.add.sprite(xpos, ypos, 'explosion');
	explosion.anchor.setTo(.5, .5);
	explosion.scale.setTo(4.5, 2.9);
	animate_explode = explosion.animations.add('explode');
	animate_explode.play('explode', 28, true);
	animate_explode.loop = false;
	
}

	
function update() {
}
	
function render(){

}
