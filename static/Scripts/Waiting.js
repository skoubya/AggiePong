/* Client-side sockets
 *
 * Client-side socket set-up before the game starts and starts the game when needed
 *
 */

var socket = io();
var pid = -1;
var started = false;
socket.on('playerId', function(id){
	pid = id;
});
socket.on('full', function(msg){
	$("#message").html('Sorry two people are already playing. Come back later');
});

socket.on('quit', function(msg){
	if(pid == -1){
		showMessagePage("One of the players left <br /> Their Game Ended");
	}
	else{
		showMessagePage("The other player left :'( <br /> Game Over");
	}
	socket.disconnect();
});

$(document).off(); //removes previous event handlers for document

$(document).keydown(function(event){
		if(!started && event.which == 13){ //enter
			location.reload();
		}
});
$(document).ready(function(){
	$('.myButton').click(function(){
		if (!started){
			location.reload();
		}
	});
});

socket.on('start', function(msg){
	started = true; //stops enter from refreshing
	$.get('static/Pages/Game.html', function(req, res){
		var headReg = /<head>(.|\n|\r)*<\/head>/m;
		$("head").append(req.match(headReg)[0]);

		var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
		$("body").html(req.match(bodyReg)[0]);
		
		if (pid == 0){
			$("body").append('<script src=\"static/Scripts/MainClient.js\"></script>');
		}
		
		$("body").append('<script src=\"static/Scripts/VisualGame.js\"></script>');
		$("body").append('<script>var theGame = new VisualGame('+ pid + '); \n theGame.start();</script>');
	});

	$(document).keydown(function(event){
		socket.emit('keydown', {id: pid, key: event.which}); 
	});
	$(document).keyup(function(event){
		socket.emit('keyup', {id: pid, key: event.which}); 
	});
});

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
	}
	else{
		showMessagePage('Game Over<br />You lose <br />'+score);
	}
	socket.disconnect();
});