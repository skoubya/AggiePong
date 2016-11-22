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
	this.powUp = null;

	this.timer = null;
	this.score_1 = null;
	this.score_2 = null;
	
	this.explosionSound = null;
	this.music = null;
	this.countdownSound = null;
	this.goSound = null;
	this.powerupSound = null;
	this.powUpEmitter = null;
	
	this.countdownNum = 3;
	this.powerupSoundLock = false;

	/* Creates the Phaser game */
	this.start = function(){
		self.game = new Phaser.Game(self.gameWidth, self.gameHeight, Phaser.AUTO, 'game', 
		{preload: self.preload, create: self.create, update: null, render: null });
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
			if(obj.powUp != null){
				if(self.powUp == undefined) {//don't have powUp
					self.powUp = self.game.add.sprite((self.pid==0)? obj.powUp.x: self.gameWidth-obj.powUp.x, (self.pid==0)? obj.powUp.y: self.gameHeight-obj.powUp.y, 'powUp');
					self.powUp.anchor.setTo(.5, .5);
				}
				else{
					self.powUp.x = (self.pid==0)? obj.powUp.x: self.gameWidth-obj.powUp.x;
					self.powUp.y = (self.pid==0)? obj.powUp.y: self.gameHeight-obj.powUp.y;
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
		socket.on('powerup', function(obj){
			self.powerupSound.play();
			self.powUpEmitter.on = true;
			self.paddleShine(obj);
			self.game.time.events.repeat(100, 50, self.paddleShine, this, obj);
			self.game.time.events.add(5000, function(){self.powUpEmitter.on = false;}, this);
		});
	};
	
	/* Functions for Phaser */
	this.preload = function(){
		self.game.load.image('centerline', 'static/Images/centerline.png');
		self.game.load.image('ball', 'static/Images/ball.png');
		self.game.load.image('paddle', 'static/Images/paddle.png');
		self.game.load.image('square', 'static/Images/square.png');
		self.game.load.image('bomb', 'static/Images/bomb.png');
		self.game.load.image('powUp', 'static/Images/powUp.png');
		self.game.load.image('powUpParticle', 'static/Images/powUpParticle.png');
		
		self.game.load.image('number_0', 'static/Images/number_0.png');
		self.game.load.image('number_1', 'static/Images/number_1.png');
		self.game.load.image('number_2', 'static/Images/number_2.png');
		self.game.load.image('number_3', 'static/Images/number_3.png');
		
		self.game.load.audio('music', 'static/Sounds/251461__joshuaempyre__arcade-music-loop.wav');
		self.game.load.audio('boom', 'static/Sounds/Explosion+3.wav');
		self.game.load.audio('countdown', 'static/Sounds/countdown_1.wav');
		self.game.load.audio('go', 'static/Sounds/countdown_0.wav');
		self.game.load.audio('powerUp', 'static/Sounds/220173__gameaudio__spacey-1up-power-up.wav');
		
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
		
		self.explosionSound = self.game.add.audio('boom');
		self.countdownSound = self.game.add.audio('countdown');
		self.goSound = self.game.add.audio('go');
		self.powerupSound = self.game.add.audio('powerUp');
		self.music = self.game.add.audio('music');
		self.music.loop = true;
		
		self.powUpEmitter = self.game.add.emitter(self.game.world.centerX, self.paddles.children[pid].y, 200);
		self.powUpEmitter.makeParticles('powUpParticle');
		self.powUpEmitter.gravity = 175;
		self.powUpEmitter.setAlpha(.3, .6);
		self.powUpEmitter.setScale(0.4, 0, 0.4, 0, 3000);
		self.powUpEmitter.start(false, 200, 50);
		self.powUpEmitter.on = false;
		
		self.cursors = self.game.input.keyboard.createCursorKeys();
		self.countdown();
		self.startGameEvents();
	};
	
	
	this.countdown = function(){
		
		var number = self.game.add.sprite(self.game.world.centerX, self.game.world.centerY, 'number_' + self.countdownNum);
		number.anchor.setTo(0.5, 0.5);
		number.scale.setTo(.01, .01);
		var tween1 = self.game.add.tween(number.scale).to({x: 2, y: 2}, 1000, Phaser.Easing.Quartic.Out);
		var tween2 = self.game.add.tween(number).to({alpha: 0}, 300, Phaser.Easing.Linear.In);
		tween1.chain(tween2);
		if(self.countdownNum>0){
			self.countdownSound.play();
			self.countdownNum--;
			tween2.onComplete.add(self.countdown, this);
		}
		else{
			self.goSound.play();
			self.game.time.events.add(500,function(){self.music.play()}, this);
		}
		tween1.start();
		
	}
	

	/* Explosion animation and blinking paddle */
	this.explode = function(xpos, ypos){
		if(ypos < 100){
			ypos = ypos + 30;
			
			self.game.time.events.repeat(200, 9, function(){self.paddles.children[(self.pid+1)%2].tint = 0x061e1e;}, this);
			self.game.time.events.add(100, function(){self.game.time.events.repeat(200, 9, function(){self.paddles.children[(self.pid+1)%2].tint = 0xffffff;}, this)}, this);
			
			//self.game.time.events.add(2000, function(){self.paddles.children[(self.pid+1)%2].tint = 0xffffff;}, this);
		}
		else{
			ypos = ypos - 30;
			self.game.time.events.repeat(200, 9, function(){self.paddles.children[self.pid].tint = 0x061e1e;}, this);
			self.game.time.events.add(100, function(){self.game.time.events.repeat(200, 9, function(){self.paddles.children[self.pid].tint = 0xffffff;}, this)}, this);
			//self.game.time.events.add(2000, function(){self.paddles.children[self.pid].tint = 0xffffff;}, this);

		}
		
		self.explosionSound.play();
		
		var explosion = self.game.add.sprite(xpos, ypos, 'explosion');
		explosion.anchor.setTo(.5, .5);
		explosion.scale.setTo(4.5, 2.9);
		var animate_explode = explosion.animations.add('explode');
		animate_explode.play('explode', 28, true);
		animate_explode.loop = false;
	};
	
	this.paddleShine = function(pid){
		
		console.log(self.paddles.children[pid].x);
		console.log(self.paddles.children[pid].y);
		self.powUpEmitter.emitX = self.paddles.children[pid].x + (Math.random() - 0.5) * 40;
		self.powUpEmitter.emitY = self.paddles.children[pid].y;
	}
}