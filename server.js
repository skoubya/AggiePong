var socketNum = 10072

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/Main.html');
});

/* TODO: distinguish sockets & limit number of connections */
io.on('connection', function(socket){
	var leftDown = false;
	var rightDown = false;
	console.log('A user connected');
	socket.on('disconnect', function(){
		console.log("User Disconnected");
	});
	socket.on('keydown', function(msg){
		if(msg == 39 && !leftDown && !rightDown){
			console.log("Moving Left");
			leftDown = true;
		}
		if(msg == 37 && !leftDown && !rightDown){
			console.log("Moving Right");
			rightDown = true;
		}
	});
	socket.on('keyup', function(msg){
		if(msg == 39 && leftDown){
			console.log("Stop Moving Left");
			leftDown = false;
		}
		if(msg == 37 && rightDown){
			console.log("Stop Moving Right");
			rightDown = false;
		}
	});
});

http.listen(socketNum, function(){
	console.log('listening on *:10072');
});