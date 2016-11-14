function VisualGame(){
	var self = this;
	/* Member Variables */
	this.game = null;

	this.centerline = null;
	this.balls = null;
	this.bomb = null;
	this.paddles = null;
	this.squares = null;
	this.cursors = null;

	this.timer = null;
	this.score_1 = null;
	this.score_2 = null;

	this.start = function(){
		console.log("Start");
		self.game = new Phaser.Game(600, 800, Phaser.AUTO, 'game', {preload: self.preload, create: self.create, update: null, render: null });
	};
	
	/* Starts listening for game events */
	this.startGameEvents = function(){
		socket.on('render', function(obj){
			self.timer.setText('Time: ' + obj.timer.min + ':' + obj.timer.sec);
			
			self.paddles.children[0].x = obj.players[0].x;
			self.paddles.children[0].y = obj.players[0].y;
			self.paddles.children[0].angle = obj.players[0].angle;
			self.paddles.children[1].x = obj.players[1].x;
			self.paddles.children[1].y = obj.players[1].y;
			self.paddles.children[1].angle = obj.players[1].angle;	

			for(var i =0; i <obj.balls.length; i++){
				if (i < self.balls.children.length) {
					self.balls.children[i].x = obj.balls[i].x;
					self.balls.children[i].y = obj.balls[i].y;
				}
				else{
					var ball = self.balls.create(obj.balls[i].x, obj.balls[i].y, 'ball');
					ball.anchor.setTo(.5, .5);
				}
			}
			self.squares.children[0].x = obj.square.x;
			self.squares.children[0].y = obj.square.y;
			self.squares.children[0].angle = obj.square.a;
			
			self.squares.children[1].x = obj.square2.x;
			self.squares.children[1].y = obj.square2.y;
			self.squares.children[1].angle = obj.square2.a;
			
			if(obj.bomb != null){
				if(self.bomb == undefined) {//don't have bomb
					self.bomb = self.game.add.sprite(obj.bomb.x, obj.bomb.y, 'bomb');
					self.bomb.anchor.setTo(.5, .5);
				}
				else{
					self.bomb.x = obj.bomb.x;
					self.bomb.y = obj.bomb.y;
				}
			}
		});

		socket.on('score', function(obj){
			self.score_1.setText('Score: ' + obj.p1Score);
			self.score_2.setText('Score: ' + obj.p2Score);
		});
		socket.on('explode', function(obj){
			self.explode(obj.x, obj.y);
		});
	};
	
	/* Functions for Phaser */
	this.preload = function(){
		self.game.load.image('centerline', 'static/Images/centerline.png');
		self.game.load.image('ball', 'static/Images/ball.png');
		self.game.load.image('paddle', 'static/Images/paddle.png');
		self.game.load.image('square', 'static/Images/square.png');
		self.game.load.image('bomb', 'static/Images/bomb.png');
		
		self.game.load.spritesheet('explosion', 'static/Images/explosion.png', 319, 60, 22);

		self.game.load.bitmapFont('carrier', 'static/Images/carrier_command.png', 'static/Images/carrier_command.xml');	
	};

	this.create = function(){
		self.timer = self.game.add.bitmapText(32, 800-32, 'carrier', '00:00:00');
		self.score_2 = self.game.add.bitmapText(32, 16, 'carrier', 'Score: 0');
		self.score_1 = self.game.add.bitmapText(600 - 200, 800 - 32, 'carrier', 'Score: 0');
		self.score_2.scale.setTo(.5, .5);
		self.score_1.scale.setTo(.5, .5);
		self.timer.scale.setTo(.5, .5);
		
		self.centerline = self.game.add.group();
		self.centerline.enableBody = true;
		
		for (var x = 0; x < 10; x++){
			var dash = self.centerline.create((x * 100) -37, self.game.world.centerY, 'centerline');
		}
		
		self.paddles = self.game.add.group();
		self.balls = self.game.add.group();
		self.squares = self.game.add.group();
		
		var paddle = self.paddles.create(self.game.world.centerX - 60, 730, 'paddle');
		paddle.anchor.setTo(.5, .5);
		paddle = self.paddles.create(self.game.world.centerX - 60, 70, 'paddle');
		paddle.anchor.setTo(.5, .5);	
		
		var square = self.squares.create(700,self.game.world.centerY-117,'square');
		square.anchor.setTo(0.5,0.5);
		var square2 = self.squares.create(100,self.game.world.centerY+117,'square');
		square2.anchor.setTo(0.5,0.5);
		
		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.startGameEvents();
	};

	//explosion animation 
	this.explode = function(xpos, ypos){
		if(ypos < 100){
			ypos = ypos + 30;
		}
		else{
			ypos = ypos - 30;
		}
		
		var explosion = self.game.add.sprite(xpos, ypos, 'explosion');
		explosion.anchor.setTo(.5, .5);
		explosion.scale.setTo(4.5, 2.9);
		var animate_explode = explosion.animations.add('explode');
		animate_explode.play('explode', 28, true);
		animate_explode.loop = false;
	};
}