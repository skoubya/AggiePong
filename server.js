var socketNum = 10071

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/static', express.static('static'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/Pages/Menu.html');
});

var playerSockets = [];

var leftDown = [false, false];
var rightDown = [false, false];

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
		io.sockets.emit('keydown', msg);
	});
	socket.on('keyup', function(msg){
		io.sockets.emit('keyup', msg);
	});
	socket.on('render', function(msg){
		io.sockets.emit('render', msg);
	});
	socket.on('score', function(obj){
		io.sockets.emit('score', obj);
	});
});

http.listen(socketNum, function(){
	console.log('listening on *:'+socketNum);
});