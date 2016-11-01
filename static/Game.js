var socket = io();
var pid = -1;
socket.on('playerId', function(id){
	pid = id;
});
socket.on('full', function(msg){
	document.open();
	document.write('Sorry two people are already playing. Come back later');
});
$(document).off(); //removes previous event handlers for document
$(document).keydown(function(event){
	socket.emit('keydown', {id: pid, key: event.which}); 
});
$(document).keyup(function(event){
	socket.emit('keyup', {id: pid, key: event.which}); 
});