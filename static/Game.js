var socket = io();
var pid = -1;
socket.on('playerId', function(id){
	pid = id;
});
socket.on('full', function(msg){
	location.reload();
	$("document").ready(function(){
		$("#message").html('Sorry two people are already playing. Come back later');
	});
});

socket.on('quit', function(msg){
	location.reload();
	//some message
});

$(document).off(); //removes previous event handlers for document

socket.on('start', function(msg){
	$(document).keydown(function(event){
		socket.emit('keydown', {id: pid, key: event.which}); 
	});
	$(document).keyup(function(event){
		socket.emit('keyup', {id: pid, key: event.which}); 
	});
});