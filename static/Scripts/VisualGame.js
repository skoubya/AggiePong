/* Visual Game
 * 
 * The visual display of the game
 *
 */

function VisualGame(playerID, gWidth, gHeight){
	var self = this;
	
	this.gameWidth = gWidth;
	this.gameHeight = gHeight;
	
	/* Member Variables */
	this.pid = playerID;
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

	/* Creates the Phaser game */
	this.start = function(){
		self.game = new Phaser.Game(self.gameWidth, self.gameHeight, Phaser.AUTO, 'game', {preload: self.preload, create: self.create, update: null, render: null });
	};
	
	/* Starts listening for game events */
	this.startGameEvents = function(){
		socket.on('render', function(obj){
			self.timer.setText('Time: ' + obj.timer.min + ':' + obj.timer.sec);
			
			self.paddles.children[0].x = (self.pid==0)? obj.players[0].x: self.gameWidth-obj.players[0].x;
			self.paddles.children[0].y = (self.pid==0)? obj.players[0].y: self.gameHeight-obj.players[0].y;
			self.paddles.children[0].angle = obj.players[0].angle;
			self.paddles.children[1].x = (self.pid==0)? obj.players[1].x: self.gameWidth-obj.players[1].x;
			self.paddles.children[1].y = (self.pid==0)? obj.players[1].y: self.gameHeight-obj.players[1].y;
			self.paddles.children[1].angle = obj.players[1].angle;

			for(var i =0; i <obj.balls.length; i++){
				if (i < self.balls.children.length) {
					self.balls.children[i].x = (self.pid==0)? obj.balls[i].x: self.gameWidth-obj.balls[i].x;
					self.balls.children[i].y = (self.pid==0)? obj.balls[i].y: self.gameHeight-obj.balls[i].y;
				}
				else{
					var ball = self.balls.create((self.pid==0)? obj.balls[i].x: self.gameWidth-obj.balls[i].x, (self.pid==0)? obj.balls[i].y: self.gameHeight-obj.balls[i].y, 'ball');
					ball.anchor.setTo(.5, .5);
				}
			}
			self.squares.children[0].x = (self.pid==0)? obj.square.x: self.gameWidth-obj.square.x;
			self.squares.children[0].y = (self.pid==0)? obj.square.y: self.gameHeight-obj.square.y;
			self.squares.children[0].angle = obj.square.a;
			
			self.squares.children[1].x = (self.pid==0)? obj.square2.x: self.gameWidth-obj.square2.x;
			self.squares.children[1].y = (self.pid==0)? obj.square2.y: self.gameHeight-obj.square2.y;
			self.squares.children[1].angle = obj.square2.a;
			
			if(obj.bomb != null){
				if(self.bomb == undefined) {//don't have bomb
					self.bomb = self.game.add.sprite((self.pid==0)? obj.bomb.x: self.gameWidth-obj.bomb.x, (self.pid==0)? obj.bomb.y: self.gameHeight-obj.bomb.y, 'bomb');
					self.bomb.anchor.setTo(.5, .5);
				}
				else{
					self.bomb.x = (self.pid==0)? obj.bomb.x: self.gameWidth-obj.bomb.x;
					self.bomb.y = (self.pid==0)? obj.bomb.y: self.gameHeight-obj.bomb.y;
				}
			}
		});

		socket.on('score', function(obj){
			self.score_1.setText('You: ' + ((self.pid==0)? obj.p1Score: obj.p2Score));
			self.score_2.setText('Them: ' + ((self.pid==0)? obj.p2Score: obj.p1Score));
		});
		socket.on('explode', function(obj){
			self.explode((self.pid==0)? obj.x: self.gameWidth-obj.x, (self.pid==0)? obj.y: self.gameHeight-obj.y);
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

	/* Explosion animation */
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