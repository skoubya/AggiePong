/* Server-side code
 *
 * Recieves signals from the clients and sends them to the proper locations
 *
 */
 

var socketNum = 10071;

/* Server variables */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/static', express.static('static')); //gives access to our other files

/* Makes root of our page '/static/Pages/Menu.html' */
app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/Pages/Menu.html');
});

var playerSockets = [];

/* Socket message creation and recieving */
io.on('connection', function(socket){
	if (playerSockets.length >1){
		socket.emit('full', "");
	}
	else{
		playerSockets.push(socket);
		socket.emit('playerId', playerSockets.length-1); //gives players index
		if(playerSockets.length == 2){ //both players connected
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
	
	/* Repeat messages it recieves to proper client */
	socket.on('keydown', function(msg){
		playerSockets[0].emit('keydown', msg);
	});
	socket.on('keyup', function(msg){
		playerSockets[0].emit('keyup', msg);
	});
	socket.on('render', function(msg){
		io.sockets.emit('render', msg);
	});
	socket.on('score', function(obj){
		io.sockets.emit('score', obj);
	});
	socket.on('explode', function(obj){
		io.sockets.emit('explode', obj);
	});
	socket.on('endGame', function(obj){
		io.sockets.emit('endGame', obj);
	});
});

/* Start listening on the server */
http.listen(socketNum, function(){
	console.log('listening on *:'+socketNum);
});
