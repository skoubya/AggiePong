var socketNum = 10072

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/Menu.html');
});

var playerNum = 0;

io.on('connection', function(socket){
	if (playerNum >1){
	socket.emit('full', "");
	socket.disconnect();
	}
	else{
		socket.emit('playerId', playerNum);
		playerNum++;
	}
	
	var leftDown = false;
	var rightDown = false;
	console.log('A user connected');
	socket.on('disconnect', function(){
		playerNum--;
		console.log("User Disconnected");
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
	console.log('listening on *:10072');
});