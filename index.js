var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);


//global variables for the server
var clients = [];
var qtdPlayerReadyLooby = 0;


app.get('/', function(req, res){
	res.send('hey you got back get "/"');

});

io.on('connection', function(socket){


	var currentPlayer = {};
	currentPlayer.name = 'unkown';


	socket.on('player connect', function(data){
		
/*		for (var i = 0; i< clients.lenght; i++){

			var playerConnected = {

				name:clients[i].name,
				position: clients[i].position,
				health:clients[i].health
			}

			//socket.emit('other player connected', playerConnected);
			console.log(currentPlayer.name + 'emit other player connected: ' + JSON.stringify(playerConnected));
		}*/


		currentPlayer = {
			name: data.name,
			idPlayer: data.idPlayer,
			health: 5
		};
		clients.push(currentPlayer);

		if(clients.length >= 2){

			socket.broadcast.emit("start game");
			socket.emit("start game");
			console.log("start game");
		}

		//console.log(currentPlayer.name + ' recv: player connect');
		console.log("Player connected: " + JSON.stringify(currentPlayer));

	});


	socket.on('play', function(data){
		console.log(currentPlayer.name + ' recv play: ' + JSON.stringify(data))

		currentPlayer = {
			name: data.name,
			health: 5
		};
		//clients.push(currentPlayer);
		console.log(currentPlayer.name + ' emit: play ' + JSON.stringify(currentPlayer));
		//socket.emit("play", currentPlayer);
		socket.broadcast.emit('other player connected', currentPlayer);

	});


	socket.on('play2', function(data){

		console.log("Play 2: " + data.name);

		var names = "";
		var idPlayers = "";
		for (var i = 0; i< clients.length; i++){
			names = names + ((i == 0)?"":";") + clients[i].name;
			idPlayers =  idPlayers + ((i == 0)?"":";") + clients[i].idPlayer;
		}


		players = {
			name: names,
			idPlayer: idPlayers,
			health: 5
		};


		//socket.emit('play2', players);
		socket.broadcast.emit('play2', players);

	});


	socket.on('player move', function(data){
			//console.log('recv move: ' + JSON.stringify(data));
			currentPlayer.position = data.position;
			currentPlayer.direction = data.direction;
			socket.broadcast.emit('player move', currentPlayer);

	});

	socket.on('player shoot', function(data){
		//console.log(currentPlayer.name + ' recv: shoot');
		//console.log(currentPlayer.name + ' bcst: shoot: ' + JSON.stringify(data));
		var response = {
			name: currentPlayer.name,
			angle: data.angle
		};
		//console.log(currentPlayer.name + ' bcst: shoot: ' + JSON.stringify(data));
		socket.emit('player shoot', response);
		socket.broadcast.emit('player shoot', response);

	});




	socket.on('player animation', function(data){
		
		var response = {
			playerName: data.playerName,
			variableName: data.variableName,
			value: data.value
		};
		
		
		socket.broadcast.emit('player animation', response);

		//console.log("Change animation " + JSON.stringify(response));

	});




	socket.on('health', function(data){

		
		var idPlayer = 0;

		for (var i = 0; i< clients.length; i++){
			
			if(data.name == clients[i].name){
				idPlayer =  i;
			}

		}

		var response = {
			name: clients[idPlayer].name,
			//health: clients[idPlayer].health
			damage: data.damage
		};

		//console.log("Health: " + response.name);
		console.log("Health: " + JSON.stringify(data));
		socket.broadcast.emit('health', response);

	});


	socket.on('healthOLD', function(data){
		//console.log(currentPlayer.name + ' recv health: ' + JSON.stringify(data));
		var indexDamaged = 0;
		if(data.from == currentPlayer.name){			
			clients	 = clients.map(function(clients, index){
				if(client.name == data.name){
					indexDamaged = index;
					client.health -= data.health;
				}
				return client;
			});
		}

		var response = {
			name: clients[indexDamaged].name,
			health: clients[indexDamaged].health
		};
		
		//console.log(currentPlayer.name + ' bcast health ' + JSON.stringify(response));
		//socket.emit('health', response);
		socket.broadcast.emit('health', response);

	});


	socket.on('gameOver', function(data){

		console.log("Game over");
		qtdPlayerReadyLooby = 0;


		socket.broadcast.emit('gameOver');
		//io.sockets.emit('gameOver');

	});

	socket.on('ready lobby', function(data){

		
		qtdPlayerReadyLooby = qtdPlayerReadyLooby + 1;
		console.log("ready lobby " + qtdPlayerReadyLooby);
		
		if(qtdPlayerReadyLooby == clients.length){
			socket.emit("ready lobby");
			socket.broadcast.emit("ready lobby");
		}

	});	


	socket.on('disconnect', function(){
		console.log(currentPlayer.name + ' recv disconnect ' + currentPlayer.name);
		//socket.broadcast.emit('player disconnect', currentPlayer);
		socket.broadcast.emit('other player disconnect', currentPlayer);
		console.log(currentPlayer.name + ' bcst: other player disconnect ' + JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length;i++){
			if(clients[i].name == currentPlayer.name){
				clients.splice(i,1);				
			}
		}
		console.log("quantidade de player: " + clients.length);


		//se tiver apenas um player, fecha o jogo
		if(clients.length == 1){
			currentPlayer = {};
			clients = [];
		}


	});



});
