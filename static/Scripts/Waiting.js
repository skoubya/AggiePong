/* Client-side sockets
 *
 * Client-side socket set-up before the game starts and starts the game when needed
 *
 */

/* Data needed to set up the game */
var socket = io();
var pid = -1;
var started = false;

var gameWidth = 600;
var gameHeight = 800; 

/* Recieve and set the player's ID */
socket.on('playerId', function(id){
	pid = id;
});

/* Display full message because 2 players already connected */
socket.on('full', function(msg){
	$("#message").html('Sorry two people are already playing. Come back later');
});

/* Display quit message */
socket.on('quit', function(msg){
	if(pid == -1){
		showMessagePage("One of the players left <br /> Their Game Ended");
	}
	else{
		showMessagePage("The other player left :'( <br /> Game Over");
		theGame.music.stop();
	}
	socket.disconnect();
});


$(document).off(); //removes previous event handlers for document

/* Starts the game */
socket.on('start', function(msg){
	started = true; //stops enter from refreshing
	$.get('static/Pages/Game.html', function(req, res){
		var headReg = /<head>(.|\n|\r)*<\/head>/m;
		$("head").append(req.match(headReg)[0]);

		var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
		$("body").html(req.match(bodyReg)[0]);
		
		if (pid == 0){
			$("body").append('<script src=\"static/Scripts/MainClient.js\"></script>');
			$("body").append('<script>var host = new MainClient('+ gameWidth +', '+gameHeight+'); \n host.start();</script>');
		}
		
		$("body").append('<script src=\"static/Scripts/VisualGame.js\"></script>');
		$("body").append('<script>var theGame = new VisualGame('+ pid + ', ' + gameWidth +', '+gameHeight+'); \n theGame.start();</script>');
	});

	$(document).keydown(function(event){
		socket.emit('keydown', {id: pid, key: event.which}); 
	});
	$(document).keyup(function(event){
		socket.emit('keyup', {id: pid, key: event.which}); 
	});
});

/* Ends the game */
socket.on('endGame', function(obj){
	var score = obj.score1 + "-" + obj.score2;
	if(pid == -1){
		showMessagePage('Game Over<br />'+score);
	}
	else if(obj.score1 == obj.score2){
		showMessagePage('Game Over<br />Draw <br />'+score);
	}
	else if((obj.score1 > obj.score2 && pid == 0) || (obj.score1 < obj.score2 && pid == 1)){
		showMessagePage('Game Over<br />You win <br />'+score);
		theGame.music.stop();
		var sound = document.createElement('audio');
		sound.setAttribute('src', 'static/Sounds/yeehaw.wav');
		sound.play()
	}
	else{
		showMessagePage('Game Over<br />You lose <br />'+score);
		theGame.music.stop();
		var sound = document.createElement('audio');
		sound.setAttribute('src', 'static/Sounds/336998__corsica-s__awww-01.wav');
		sound.play()
	}
	socket.disconnect();
});