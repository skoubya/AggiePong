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

socket.on('start', function(msg){
	started = true; //stops enter from refreshing
	$.get('static/Pages/Game.html', function(req, res){
		var headReg = /<head>(.|\n|\r)*<\/head>/m;
		$("head").append(req.match(headReg)[0]);
	});
	$.get('static/Pages/Game.html', function(req, res){
		var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
		$("body").html(req.match(bodyReg)[0]);
	});
	/*$.get('static/Pages/Main.html', function(req, res){
		var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
		$("body").html(req.match(bodyReg)[0]);
	});*/
	$(document).keydown(function(event){
		socket.emit('keydown', {id: pid, key: event.which}); 
	});
	$(document).keyup(function(event){
		socket.emit('keyup', {id: pid, key: event.which}); 
	});
});