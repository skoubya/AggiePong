function VisualGame(){
	var self = this;
	var gameWidth = 600;
	var gameHeight = 800; 
	//take in pid???
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
		self.game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game', {preload: self.preload, create: self.create, update: null, render: null });
	};
	
	/* Starts listening for game events */
	this.startGameEvents = function(){
		socket.on('render', function(obj){
			self.timer.setText('Time: ' + obj.timer.min + ':' + obj.timer.sec);
			
			self.paddles.children[0].x = (pid==0)? obj.players[0].x: gameWidth-obj.players[0].x;
			self.paddles.children[0].y = (pid==0)? obj.players[0].y: gameHeight-obj.players[0].y;
			self.paddles.children[0].angle = obj.players[0].angle;
			self.paddles.children[1].x = (pid==0)? obj.players[1].x: gameWidth-obj.players[1].x;
			self.paddles.children[1].y = (pid==0)? obj.players[1].y: gameHeight-obj.players[1].y;
			self.paddles.children[1].angle = obj.players[1].angle;

			for(var i =0; i <obj.balls.length; i++){
				if (i < self.balls.children.length) {
					self.balls.children[i].x = (pid==0)? obj.balls[i].x: gameWidth-obj.balls[i].x;
					self.balls.children[i].y = (pid==0)? obj.balls[i].y: gameHeight-obj.balls[i].y;
				}
				else{
					var ball = self.balls.create((pid==0)? obj.balls[i].x: gameWidth-obj.balls[i].x, (pid==0)? obj.balls[i].y: gameHeight-obj.balls[i].y, 'ball');
					ball.anchor.setTo(.5, .5);
				}
			}
			self.squares.children[0].x = (pid==0)? obj.square.x: gameWidth-obj.square.x;
			self.squares.children[0].y = (pid==0)? obj.square.y: gameHeight-obj.square.y;
			self.squares.children[0].angle = obj.square.a;
			
			self.squares.children[1].x = (pid==0)? obj.square2.x: gameWidth-obj.square2.x;
			self.squares.children[1].y = (pid==0)? obj.square2.y: gameHeight-obj.square2.y;
			self.squares.children[1].angle = obj.square2.a;
			
			if(obj.bomb != null){
				if(self.bomb == undefined) {//don't have bomb
					self.bomb = self.game.add.sprite((pid==0)? obj.bomb.x: gameWidth-obj.bomb.x, (pid==0)? obj.bomb.y: gameHeight-obj.bomb.y, 'bomb');
					self.bomb.anchor.setTo(.5, .5);
				}
				else{
					self.bomb.x = (pid==0)? obj.bomb.x: gameWidth-obj.bomb.x;
					self.bomb.y = (pid==0)? obj.bomb.y: gameHeight-obj.bomb.y;
				}
			}
		});

		socket.on('score', function(obj){
			self.score_1.setText('You: ' + ((pid==0)? obj.p1Score: obj.p2Score));
			self.score_2.setText('Them: ' + ((pid==0)? obj.p2Score: obj.p1Score));
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
		self.score_1 = self.game.add.bitmapText(600 - 300, 800 - 32, 'carrier', 'You: 0');
		self.score_2 = self.game.add.bitmapText(600 - 150, 800 - 32, 'carrier', 'Them: 0');
		self.score_1.scale.setTo(.4, .4);
		self.score_2.scale.setTo(.4, .4);
		self.timer.scale.setTo(.4, .4);
		
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