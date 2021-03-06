var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

var clients =[];

io.on("connection", function(socket){

	var currentUser;

	socket.on("USER_CONNECT", function(){
		console.log("User connected");
		for(var i = 0; i < clients.length; i++){
			socket.emit("USER_CONNECTED", { name: clients[i].name, position: clientes[i].position });

			console.log("User name " + clients[i].name + " is connected");
		}

	});

	socket.on("PLAY", function(data){

		console.log(data);

		currentUser = {
			name: data.name,
			position: data.position
		};

		clients.push(currentUser);
		socket.emit("PLAY", currentUser);
		socket.broadcast.emit("USER_CONNECTED", currentUser);

	});

	socket.on("MOVE", function(data){

		currentUser.position = data.position;
		socket.emit("MOVE", currentUser);
		socket.broadcast.emit("MOVE",currentUser);
		console.log(currentUser.name + " move to " + currentUser.position);

	});


	socket.on("disconnect", function(){

		socket.broadcast.emit("USER_DISCONNECTED", currentUser);
		for (var i = clients.length - 1; i >= 0; i--) {
			if(clients[i].name == currentUser.name){
				console.log("User " + clients[i].name + " disconnect");
				clients.splice(i,1);
			}
		}

	});


});



server.listen(app.get('port'), function(){
	console.log("------------ Server is running -------------");

});