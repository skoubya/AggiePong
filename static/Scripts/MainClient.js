/* Main Client
 * 
 * Client that does the response calculations for the game
 *
 */
//TODO: Possibly make a class

function MainClient(gWidth, gHeight){
	var self = this;
	
	/* Initialize variables needed for the game */
	this.game = null;
	
	this.leftDown = [false, false];
	this.rightDown = [false, false];
	this.aDown = [false, false];
	this.dDown = [false, false];
	this.sDown = [false, false];
    
	this.gameWidth = gWidth;
	this.gameHeight = gHeight; 
	
	this.balls;
	this.paddles;
	this.squares;
	this.bombs;
	this.powUps;
	
	this.paddleCollisionGroup;
    this.ballCollisionGroup;
	this.bombCollisionGroup;
	this.obsticleCollisionGroup;
	this.powUpCollisionGroup;
	
	this.player_1pts = 0;
	this.player_2pts = 0;
    
	this.stunned = [false, false];
    
	this.speedUp = [false, false];
	this.paddleSpeed = [1000,1000];
	
	this.seconds = '00';
	this.minutes = '2';
    
	this.sec_num = 0;
	this.min_num = 2;
    
	this.bomb;
    this.powUp;
	
	this.ball_direction = 1;
	this.lockBall = [];
	this.lockBomb;
    this.lockPowUp;
	
	this.maxVelocity = 30;
	this.minVelocity = 15;
	
	this.countingDown = true;
	
	/* Create the Phaser game */
	this.start = function(){
		self.game = new Phaser.Game(self.gameWidth, self.gameHeight, Phaser.AUTO, 'game', {preload: null, create: self.create, update: self.update, render: null });
	}

	/* Creates object with render info and sends it to be used by the visual game 
	 * Parameters:
	 *
	 */
	this.renderEvent = function(){
		var t = {min:self.minutes, sec:self.seconds};
		var b = [];
		for(var i =0; i < self.balls.children.length; i++){
			b[i] = {x:self.balls.children[i].x, y:self.balls.children[i].y};
		}
		var p = [];
		for(var i =0; i < self.paddles.children.length; i++){
			p[i] = {x:self.paddles.children[i].x, y:self.paddles.children[i].y, angle:self.paddles.children[i].angle};
		}
		var square = self.squares.children[0];
		var square2 = self.squares.children[1];
		var s = {x:square.x, y:square.y, a:square.angle};
		var s2 = {x:square2.x, y:square2.y, a:square2.angle};
		var bo = (self.bomb == undefined) ? null : {x:self.bomb.x, y:self.bomb.y};
		var pow = (self.powUp == undefined) ? null : {x:self.powUp.x, y:self.powUp.y};
		var obj= {timer:t, balls:b, players:p, square:s, square2:s2, bomb:bo, powUp:pow};
		socket.emit('render', obj);
	}


	/* Creates a paddle and sets its parameters 
	 * Parameters:
	 *		init_x - initial x position of the paddle
	 * 		init_y - initial y position of the paddle
	 */
	this.createPaddle = function(init_x, init_y){
		var paddle = self.paddles.create(init_x, init_y, '');
		paddle.body.setRectangle(160, 17);
		paddle.anchor.setTo(0.5, 0.5);
		paddle.body.kinematic = true;
		paddle.body.setCollisionGroup(self.paddleCollisionGroup);
		paddle.body.collides([self.ballCollisionGroup, self.bombCollisionGroup, self.powUpCollisionGroup]);
		paddle.body.collideWorldBounds = true;
	}

	/* Creates a square obsticle and sets its parameters 
	 * Parameters:
	 *		init_x - initial x position of the obsticle
	 * 		init_y - initial y position of the obsticle
	 */
	this.createSquare = function(init_x, init_y){
		var square = self.squares.create(init_x, init_y, '');
		square.body.setRectangle(62, 62);
		square.anchor.setTo(0.5, 0.5);
		square.body.velocity.x = 200;
		square.body.static = true;
		square.body.setCollisionGroup(self.obsticleCollisionGroup);
		square.body.collides([self.ballCollisionGroup, self.bombCollisionGroup, self.powUpCollisionGroup]);
	}

	/* Creates a bomb in a random position along the center line
	 * 		with a random initial velocity 
	 * Parameters:
	 *		
	 */
	this.createBomb = function(){
		if(!self.countingDown){
			self.bomb = self.bombs.create((Math.random() * 595), self.game.world.centerY - 12, '');
			self.bomb.body.setCircle(24);
			self.bomb.anchor.setTo(0.5, 0.5);
			self.bomb.body.setCollisionGroup(self.bombCollisionGroup);
			self.bomb.body.collides([self.paddleCollisionGroup,  self.obsticleCollisionGroup]);
			self.bomb.body.velocity.x = Math.random() * 200 - 100;
			self.bomb.body.velocity.y = (Math.random() * 200 + 400) * self.ball_direction;
			self.bomb.body.collideWorldBounds = true;
			self.ball_direction *= -1;
		}
	}
	
	this.createPowUp = function(){
		self.powUp = self.powUps.create((Math.random() * 595), self.game.world.centerY - 12, '');
		self.powUp.body.setCircle(24);
		self.powUp.anchor.setTo(0.5, 0.5);
		self.powUp.body.setCollisionGroup(self.powUpCollisionGroup);
		self.powUp.body.collides([self.obsticleCollisionGroup]);
		self.powUp.body.collides(self.paddleCollisionGroup,self.powUpHit,this);
		self.powUp.body.velocity.x = Math.random() * 200 - 100;
		self.powUp.body.velocity.y = (Math.random() * 200 + 400) * self.ball_direction;
		self.powUp.body.collideWorldBounds = true;
		self.ball_direction *= -1;
	}

	/* Function called by phaser to create the game objects 
	 * Parameters:
	 *		
	 */
	this.create = function() {
		$("canvas").get(0).remove(); //removes image of extra canvas
		
		/* Initialize the physics */
		self.game.physics.startSystem(Phaser.Physics.P2JS);
		self.game.physics.p2.setImpactEvents(true);
		self.game.physics.p2.restitution = 1.0;
		self.game.physics.p2.gravity.y = 0;
		self.game.physics.p2.gravity.x = 0;
		self.game.physics.p2.setBoundsToWorld(true, true, false, false, false);
		self.game.physics.p2.updateBoundsCollisionGroup();
		
		/* Create collision groups */
		self.paddleCollisionGroup = self.game.physics.p2.createCollisionGroup();
		self.ballCollisionGroup = self.game.physics.p2.createCollisionGroup();
		self.bombCollisionGroup = self.game.physics.p2.createCollisionGroup();
		self.obsticleCollisionGroup = self.game.physics.p2.createCollisionGroup();	
		self.powUpCollisionGroup = self.game.physics.p2.createCollisionGroup();
		
		/* Create paddles */
		self.paddles = self.game.add.group();
		self.paddles.enableBody = true;
		self.paddles.physicsBodyType = Phaser.Physics.P2JS;
		self.createPaddle(self.game.world.centerX - 60, 730);
		self.createPaddle(self.game.world.centerX - 60, 70);

		/* Create ball group */
		self.balls = self.game.add.group();
		self.balls.enableBody = true;	
		self.balls.physicsBodyType = Phaser.Physics.P2JS;
		
		/* Create bomb group */
		self.bombs = self.game.add.group();
		self.bombs.enableBody = true;	
		self.bombs.physicsBodyType = Phaser.Physics.P2JS;
		
		/* Create powUp group */
		self.powUps = self.game.add.group();
		self.powUps.enableBody = true;	
		self.powUps.physicsBodyType = Phaser.Physics.P2JS;
		
		/* Create square obstacles */
		self.squares = self.game.add.group();
		self.squares.enableBody = true;
		self.squares.physicsBodyType = Phaser.Physics.P2JS;
		self.createSquare(500, self.game.world.centerY-117);
		self.createSquare(100, self.game.world.centerY+117);
		
		/* game countdown timer */
		self.game.time.events.add(Phaser.Timer.SECOND * 4, function(){self.countingDown = false}, this);
		
		/* creation of the bomb */
		self.game.time.events.add(Phaser.Timer.SECOND * 15, self.createBomb, this);
		
		/* creation of the powUp */
		self.game.time.events.add(Phaser.Timer.SECOND * 15, self.createPowUp, this);
		
		/* creation of the balls */
		self.game.time.events.repeat(Phaser.Timer.SECOND * 3, 4, self.createBall, this);
		
		self.game.time.events.repeat(Phaser.Timer.SECOND, 2000, self.updateTimer, this);
		
		/* Start sending the render events */
		setInterval(self.renderEvent, 10);
	}

	/* Limit an objects velocity 
	 * Parameters:
	 *		sprite - the object whose velocity is being limitted
	 *		maxVelocity - the fastest the object should go
	 */
	this.limitVelocity = function(sprite, maxVelocity){
	  var body = sprite.body;
	  var angle, currVelocitySqr, vx, vy;

	  vx = body.data.velocity[0];
	  vy = body.data.velocity[1];
	  
	  currVelocitySqr = vx * vx + vy * vy;
	  
	  if (currVelocitySqr > maxVelocity * maxVelocity) {
		angle = Math.atan2(vy, vx);
		
		vx = Math.cos(angle) * maxVelocity;
		vy = Math.sin(angle) * maxVelocity;
		
		body.data.velocity[0] = vx;
		body.data.velocity[1] = vy;
	  }
	}

	/* Speeds an object up if it drops below a certain velocity 
	 * Parameters:
	 *		sprite - the object whose velocity is being increased
	 *		minVelocity - the slowest the object should go
	 */
	this.addVelocity = function(sprite, minVelocity){
	  var body = sprite.body;
	  var angle, currVelocitySqr, vx, vy;

	  vx = body.data.velocity[0];
	  vy = body.data.velocity[1];
	  
	  currVelocitySqr = vx * vx + vy * vy;
	  
	  if (currVelocitySqr < minVelocity * minVelocity) {
		angle = Math.atan2(vy, vx);
		
		vx = Math.cos(angle) * minVelocity; //was maxVelocity
		vy = Math.sin(angle) * minVelocity; //was maxVelocity
		
		body.data.velocity[0] = vx;
		body.data.velocity[1] = vy;
	  }

	}

	/* Function called by phaser to update the state of the game objects 
	 * Parameters:
	 *		
	 */
	this.update = function(){
		/* Update square, ball, and bomb motion */
		for(var i = 0; i < self.squares.children.length; i++){
			self.squares.children[i].body.angle++;
			if(self.squares.children[i].body.x > 550 || self.squares.children[i].body.x < 50)
				self.squares.children[i].body.velocity.x *= -1;
		}	
		for(var i = 0; i < self.balls.children.length; i++){
			self.limitVelocity(self.balls.children[i],self.maxVelocity);
			self.addVelocity(self.balls.children[i],self.minVelocity);
			
			/* Check if ball scored */
			if(self.balls.children[i].body.y < 0 || self.balls.children[i].body.y > 800){
				self.playerScored(i);
			}
		}
		for(var i = 0; i < self.bombs.children.length; i++){
			self.limitVelocity(self.bombs.children[i],self.maxVelocity);
			self.addVelocity(self.bombs.children[i],self.minVelocity);
			
			/* Check if bomb should explode */
			if(self.bombs.children[i].body.y < 0 || self.bombs.children[i].body.y > 800){
				self.bombMissed(self.bombs.children[i]);
			}
		}
		for(var i = 0; i < self.powUps.children.length; i++){
			self.limitVelocity(self.powUps.children[i],self.maxVelocity);
			self.addVelocity(self.powUps.children[i],self.minVelocity);
			
			/* Check if bomb should explode */
			if(self.powUps.children[i].body.y < 0 || self.powUps.children[i].body.y > 800){
				self.powUpMissed(self.powUps.children[i]);
			}
		}
		
		/* Update paddle position based off of key presses */
		for (var i =0; i < self.paddles.children.length; i++){
			self.paddles.children[i].body.velocity.x = 0;
			self.paddles.children[i].body.velocity.y = 0;
			
			var vertices = self.paddles.children[i].body.data.shapes[0].vertices;
			// *20 is to get it in pixels
			// Determine farthes left and right points
			var maxX = self.paddles.children[i].body.x + Math.max(vertices[0][0], vertices[1][0], vertices[2][0], vertices[3][0])*20;
			var minX = self.paddles.children[i].body.x + Math.min(vertices[0][0], vertices[1][0], vertices[2][0], vertices[3][0])*20;
			
			if(self.leftDown[i] && !self.rightDown[i] && !self.stunned[i]){
				if(minX >= 0)
					self.paddles.children[i].body.velocity.x = -1*self.paddleSpeed[i];
			}
			if(self.rightDown[i] && !self.leftDown[i] && !self.stunned[i]){
				if(maxX <= 600)
					self.paddles.children[i].body.velocity.x = self.paddleSpeed[i];
			}
			if(self.aDown[i] && !self.dDown[i] && !self.stunned[i] && self.paddles.children[i].body.angle >= -35){
				self.paddles.children[i].body.angle -= 3;
			}
			if(self.dDown[i] && !self.aDown[i] && !self.stunned[i] && self.paddles.children[i].body.angle <= 35){
				self.paddles.children[i].body.angle += 3;
			}
			if(self.sDown[i] && !self.stunned[i] ){
				self.paddles.children[i].body.angle = 0;
			}
		}
		
	}


	/* Creates a ball in a random position along the center line
	 * 		with an initial velocity 
	 * Parameters:
	 *		
	 */
	this.createBall = function(){
		if(!self.countingDown){		
			var invBall = self.balls.create((Math.random() * 595), self.game.world.centerY - 12, '');
			invBall.body.setCircle(24);
			invBall.anchor.setTo(0.5, 0.5);
			invBall.body.setCollisionGroup(self.ballCollisionGroup);
			invBall.body.collides([self.paddleCollisionGroup,  self.obsticleCollisionGroup]);
			invBall.body.velocity.x = 200;
			invBall.body.velocity.y = 200 * self.ball_direction;
			invBall.body.collideWorldBounds = true;
			self.ball_direction *= -1;	
		}
	}

	/* Changes the timers value
	 * Parameters:
	 *		
	 */
	this.updateTimer = function(){
		if(!self.countingDown){
			self.sec_num--;  
			//If any of the digits becomes a single digit number, pad it with a zero    
			
			if (self.sec_num < 0) {
				self.sec_num = 59;
				self.min_num--;
			}		
			if (self.min_num < 0){   
				var scores = {score1:self.player_1pts, score2:self.player_2pts};
				socket.emit('endGame', scores);
				self.game.destroy();
			}
			
			self.seconds = self.sec_num.toString();
			self.minutes = self.min_num.toString();
			
			if (self.sec_num < 10) {
				self.seconds = '0' + self.seconds;
			}
		}
	}

	/* Execute actions that result from a ball scoring
	 * Parameters:
	 *		ballInd - index of the ball that scored
	 */
	this.playerScored = function(ballInd){
		/* Make sure ball doesn't keep scoring while this function executes */
		if(self.lockBall[ballInd] == true)	return;
		self.lockBall[ballInd] = true;
		
		var _ball = self.balls.children[ballInd];
		
		/* Increment score of player that scored */
		if(_ball.y < 50){
			self.player_1pts++;
		}
		else {
			self.player_2pts++;
		}
		
		/* Send score info */
		var obj = {p1Score:self.player_1pts, p2Score:self.player_2pts};
		socket.emit('score', obj);
		
		/* Place the ball back in play (after some time) */
		self.game.time.events.add(Phaser.Timer.SECOND, function(){
			_ball.body.x = (Math.random() * 595);
			_ball.body.y = self.game.world.centerY - 12;
			_ball.body.velocity.x = Math.random() * 200 - 100;
			_ball.body.velocity.y = (Math.random() * 200 + 400) * self.ball_direction;
			self.ball_direction *= -1;
			self.lockBall[ballInd] = false;
		}, this);
	}

	/* Calls stunTimer(), creates another bomb 4 seconds later,
	 * 		also calls explode() for the explosion animation
	 * Parameters:
	 *		_bomb - bomb that was missed
	 */
	this.bombMissed = function(_bomb){
		if(self.lockBomb == true)	return;
		self.lockBomb = true;
		if(_bomb.y < 50){
			self.stunned[1] = true;
			self.game.time.events.add(Phaser.Timer.SECOND * 2, this.stunTimer, this, 2);
		}
		else {
			self.stunned[0] = true;
			self.game.time.events.add(Phaser.Timer.SECOND * 2, this.stunTimer, this, 1);
		}
		
		var obj = {x:_bomb.x, y:_bomb.y};
		socket.emit('explode', obj);
		
		self.game.time.events.add(Phaser.Timer.SECOND * 4, function(){ //wait a little before respawning the ball
			_bomb.body.x = (Math.random() * 595);
			_bomb.body.y = self.game.world.centerY - 12;
			_bomb.body.velocity.x = Math.random() * 200 - 100;
			_bomb.body.velocity.y = (Math.random() * 200 + 400) * self.ball_direction;
			self.ball_direction *= -1;
			self.lockBomb = false;
		}, this);
	}
	this.powUpMissed = function(_powUp){
		if(self.lockPowUp == true)	return;
		self.lockPowUp = true;
		if(_powUp.y < 50){
			
		}else {
			
		}		
		self.game.time.events.add(Phaser.Timer.SECOND * 4, function(){ //wait a little before respawning the ball
			_powUp.body.x = (Math.random() * 595);
			_powUp.body.y = self.game.world.centerY - 12;
			_powUp.body.velocity.x = Math.random() * 200 - 100;
			_powUp.body.velocity.y = (Math.random() * 200 + 400) * self.ball_direction;
			self.ball_direction *= -1;
			self.lockPowUp = false;
		}, this);
	}
	
	this.powUpHit = function(_powUp, body){
		if(self.lockPowUp == true)	return;
		self.lockPowUp = true;
		
		if(_powUp.y < 400){
			_powUp.x=1000;
			_powUp.y=1000;
			_powUp.velocity.x = 0;
			_powUp.velocity.y = 0;
			
			self.speedUp[1] = true;
			self.paddleSpeed[1] = 1500;
			self.game.time.events.add(Phaser.Timer.SECOND * 5, self.speedTimer, this, 2);
		}else {
			_powUp.x=1000;
			_powUp.y=1000;
			_powUp.velocity.x = 0;
			_powUp.velocity.y = 0;
			self.speedUp[0] = true;
			self.paddleSpeed[0] = 1500;
			self.game.time.events.add(Phaser.Timer.SECOND * 5, self.speedTimer, this, 1);
		}		
		
		
		 self.game.time.events.add(Phaser.Timer.SECOND * 5, function(){ //wait a little before respawning the ball
			_powUp.visible = true;
			
			_powUp.x = (Math.random() * 595);
			_powUp.y = self.game.world.centerY - 12;
			_powUp.velocity.x = Math.random() * 200 - 100;
			_powUp.velocity.y = (Math.random() * 200 + 400) * self.ball_direction;
			self.ball_direction *= -1;
			self.lockPowUp = false; 
		}, this);
	}
	
	
	/* Unstuns the specified player
	 * Parameters:
	 *		player - player to be unstunned
	 */
	this.stunTimer = function(player){
		if(player == 1){
			self.stunned[0] = false;
		}
		else{
			self.stunned[1] = false;
		}
	}

	this.speedTimer = function(player){
		if(player == 1){
			self.speedUp[0] = false;
			self.paddleSpeed[0] = 1000;
		}
		else{
			self.speedUp[1] = false;
			self.paddleSpeed[1] = 1000;
		}
	}
	
	/* Handles the key events form the users */
	socket.on('keydown', function(msg){
		var selKey;
		if(msg.key == 37){
			selKey = (msg.id == 0)? "left": "right";
		}else if (msg.key == 39){
			selKey = (msg.id == 0)? "right": "left";
		}
		else if (msg.key == 65){
			selKey = "tLeft";
		}
		else if (msg.key == 68){
			selKey = "tRight";
		}
		else if (msg.key == 83){
			selKey = "center";
		}
		
		
		if(selKey == "left" && !self.leftDown[msg.id]){//left			
			console.log("Player "+msg.id+" Moving Left");
			self.leftDown[msg.id] = true;
		}
		if(selKey == "right" && !self.rightDown[msg.id]){//right			
			console.log("Player "+msg.id+" Moving Right");
			self.rightDown[msg.id] = true;
		}
		if(selKey == "tLeft" && !self.aDown[msg.id]){
			console.log("Player " + msg.id + " Tilting Left");
			self.aDown[msg.id] = true;
		}
		if(selKey == "tRight" && !self.dDown[msg.id]){
			console.log("Player " + msg.id + " Tilting Right");
			self.dDown[msg.id] = true;
		}
		if(selKey == "center" & !self.sDown[msg.id]){
			console.log("Player " + msg.id + "Centering Tilting");
			self.sDown[msg.id] = true;
		}
	});
	socket.on('keyup', function(msg){
		var selKey = "";
		if(msg.key == 37){
			selKey = (msg.id == 0)? "left": "right";
		}else if (msg.key == 39){
			selKey = (msg.id == 0)? "right": "left";
		}
		else if (msg.key == 65){
			selKey = "tLeft";
		}
		else if (msg.key == 68){
			selKey = "tRight";
		}
		else if (msg.key == 83){
			selKey = "center";
		}
		
		if(selKey == "left" && self.leftDown[msg.id]){
			console.log("Player "+msg.id+" Stop Moving Left");
			self.leftDown[msg.id] = false;
		}
		if(selKey == "right" && self.rightDown[msg.id]){
			console.log("Player "+msg.id+" Stop Moving Right");
			self.rightDown[msg.id] = false;
		}
		if(selKey == "tLeft" && self.aDown[msg.id]){
			console.log("Player " + msg.id + " Stop Tilting Left");
			self.aDown[msg.id] = false;
		}
		if(selKey == "tRight" && self.dDown [msg.id]){
			console.log("Player " + msg.id + " Stop Tilting Right");
			self.dDown[msg.id] = false;
		}
		if(selKey == "center" & self.sDown[msg.id]){
			console.log("Player " + msg.id + "Stop Centering Tilting");
			self.sDown[msg.id] = false;
		}
	});
}