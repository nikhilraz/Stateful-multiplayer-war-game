const http = require("http");
const express = require('express');
const { client } = require("websocket");
const app = express();
const httpServer = http.createServer();
const WebSocketServer = require("websocket").server;
const webSocketPort = "8081";
const expressWebServerPort = "8080";
const clients = {};
const games = {};
const gameDuration = 10000; //10 seconds

// // Serve static files (CSS, JavaScript, images, etc.) from a directory
// app.use(express.static('websockets-demo'));



app.listen(expressWebServerPort, ()=> console.log(`Express app server is listening on port ${expressWebServerPort}`))
httpServer.listen(webSocketPort, ()=> console.log(`http server is listening on port ${webSocketPort}`));

const webSocketServer = new WebSocketServer({
    "httpServer": httpServer
});

app.get('/', (req,res)=>{
    res.sendFile(__dirname+'/index.html');
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname+'/style.css');
});

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname+'/script.js');
});



webSocketServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);

    connection.on("open", ()=> console.log("connection opened!"));
    connection.on("close", ()=> console.log("connection closed!"));
    connection.on("message",  message => {
        const res = JSON.parse(message.utf8Data);
        console.log(res);

        if(res.method == 'create'){
            const clientId = res.clientId;
            const gameId = guid();
            const game = {
                id: gameId,
                balls: 20,
                clients: [],
                state: {},
                duration: gameDuration
            };
            games[gameId] = game;
            const payload = {
                method: 'create',
                clientId: clientId,
                gameId: gameId
            };
            clients[clientId].connection.send(JSON.stringify(payload));
        }

        if(res.method == 'join'){
            const clientId = res.clientId;
            const gameId = res.gameId;
            const game = games[gameId];

            if(game.clients.length>=3){
                console.log("Can't join more than 3 gamer!");
                return;
            }
            const color = {'0': 'red', '1': 'green', '2': "blue"}[game.clients.length];
            game.clients.push({clientId: clientId, color: color});

            const payload = {
                method: 'join',
                clientId: clientId,
                game: game
            };
            game.clients.forEach(client=>{
                clients[client.clientId].connection.send(JSON.stringify(payload));
            });
            
        }

        if(res.method == 'play'){
            const gameId = res.gameId;
            const ballNo = res.ballNo;
            const color = res.color;
            const game = games[gameId];

            game.state[ballNo] = color;

           
            const payload = {
                method: 'play',
                game: game
            };
            game.clients.forEach(client=>{
                clients[client.clientId].connection.send(JSON.stringify(payload));
            });
        }

        if(res.method == 'start'){
            const game = games[res.gameId];
            const payload = {
                method: 'start',
                game: game
            };
            setTimeout(function(){
                declareWinner(game);
            },game.duration); // callback will be executed to call declareWinner

            game.clients.forEach(client=>{
                clients[client.clientId].connection.send(JSON.stringify(payload));
            });

        }

    });

    const clientId = guid(); 
    clients[clientId] = {
        "connection": connection
    };
    const payload = {
        "method": "connect",
        "clientId": clientId
    };

    connection.send(JSON.stringify(payload));

});


function declareWinner(game){
   const colorToScoreMap = {};
   const gamerToResultMap = {};
   const winner = {
    clientId: '',
    color:''
   };
   let mxScore = -1;
   for(var key in game.state){
    const color = game.state[key];
    const ballNo = key;
    if(!colorToScoreMap.hasOwnProperty(color)){
        colorToScoreMap[color] = 0;
    }
    colorToScoreMap[color]++;
   }

   game.clients.forEach(x=>{
    const score = colorToScoreMap.hasOwnProperty(x.color) ? colorToScoreMap[x.color] : 0;
    gamerToResultMap[x.clientId] = {color: x.color, score: score};
    if(score >= mxScore){
        mxScore = score;
        winner.clientId = x.clientId;
        winner.color = x.color;
    }
   });
   const payload = {
    method: 'showResult',
    winner: winner,
    gamerToResultMap: gamerToResultMap
   };
   game.clients.forEach(client=>{
    clients[client.clientId].connection.send(JSON.stringify(payload));
   });
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }