var socketNum = 10072

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/static', express.static('static'));
app.use('/', express.static('aggiepong')); //TODO: posibly change

app.get('/', function(req, res){
	res.sendFile(__dirname + '/Menu.html');
});

var playerSockets = [];

io.on('connection', function(socket){
	if (playerSockets.length >1){
		socket.emit('full', "");
	}
	else{
		playerSockets.push(socket);
		socket.emit('playerId', playerSockets.length-1); //gives playes index
		if(playerSockets.length == 2){
			io.sockets.emit('start', '');
		}
	}

	
	var leftDown = false;
	var rightDown = false;
	console.log('A user connected');
	socket.on('disconnect', function(){
		console.log("User Disconnected");
		var playerInd = playerSockets.indexOf(socket);
		if(playerInd != -1) {
			playerSockets.splice(playerInd, 1);
			io.sockets.emit('quit', "");
		}
	});
	socket.on('keydown', function(msg){
		if(msg.key == 39 && !leftDown && !rightDown){
			console.log("Player "+msg.id+" Moving Left");
			leftDown = true;
		}
		if(msg.key == 37 && !leftDown && !rightDown){
			console.log("Player "+msg.id+" Moving Right");
			rightDown = true;
		}
	});
	socket.on('keyup', function(msg){
		if(msg.key == 39 && leftDown){
			console.log("Player "+msg.id+" Stop Moving Left");
			leftDown = false;
		}
		if(msg.key == 37 && rightDown){
			console.log("Player "+msg.id+" Stop Moving Right");
			rightDown = false;
		}
	});
});

http.listen(socketNum, function(){
	console.log('listening on *:'+socketNum);
});