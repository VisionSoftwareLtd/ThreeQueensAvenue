import WebSocketServer from 'ws';
import express from 'express';
import * as http from 'http';
import { PlayerManager } from './playermanager.js';
import { Player } from './player.js';
import { AddressInfo } from 'net';
import * as path from 'path';
import * as MessageTypeConstants from './messageTypeConstants.js';

// Beginning panoramic: P1010118.jpg

const app = express();
var PORT: number;
var myArgs = process.argv.slice(3);
console.log('myArgs: ', myArgs);
if (myArgs[0] == 'dev') {
   PORT = 8081;
} else {
   PORT = 8080;
   var __dirname = path.resolve(path.dirname(''));

   console.log(`Serving ${__dirname}/dist/ThreeQueensAvenue`);

   // Serve only the static files form the dist directory
   app.use(express.static(__dirname + '/dist/ThreeQueensAvenue'));
}

/**
 * Web Socket
 */

function processIncomingMessage(request, message) {
   console.log(`Incoming message: ${JSON.stringify(message)} from ${request.connection.remoteAddress}`);
   if (message.username) {
      const player = PlayerManager.getInstance().findPlayer(request.connection.remoteAddress);
      if (player) {
         player.setName(message.username);
         var playerNamesConcat = PlayerManager.getInstance().getPlayers().map(player => '"' + player.getName() + '"').join(',');
         PlayerManager.getInstance().updateAllPlayers(`{ "${MessageTypeConstants.PLAYER_NAMES}" : [${playerNamesConcat}] }`);
      }
   }
}

const webSocketHttpServer = http.createServer(app);
const webSocketServer = new WebSocketServer.Server({ server: webSocketHttpServer });
webSocketServer.on('connection', (webSocketClient, request) => {
   console.log(`Connection request from: ${request.connection.remoteAddress}`);
   //  webSocketClient.send(<The initial data, like the player list perhaps>);
   const canAddPlayer = PlayerManager.getInstance().addPlayer(new Player(request.connection.remoteAddress, webSocketClient));
   if (!canAddPlayer) {
      webSocketClient.send(`{ "${MessageTypeConstants.ERROR}" : "Connection already established from ${request.connection.remoteAddress}.  If the problem persists, try refreshing the page." }`)
      webSocketClient.close();
   }
   webSocketClient.on('message', (data) => {
      console.log(`Message from client: ${data}`);
      processIncomingMessage(request, JSON.parse(data));
   });
   webSocketClient.on('close', () => {
      console.log(`Stopping client connection.`);
      PlayerManager.getInstance().removePlayer(webSocketClient);
   });
});

/**
 * Express
 */
const httpHeaders = {
   'Content-Type' : 'text/plain',
   'Access-Control-Allow-Origin' : '*'
};

app.get('/players', function (req, res) {
   var playersReturned = [];
   const players = PlayerManager.getInstance().getPlayers();
   for (const player of players) {
      playersReturned.push({
         "name" : player.getName(),
         "gameBeingPlayed" : player.getGameBeingPlayed()
      });
   }
   res.set(httpHeaders);
   res.send(JSON.stringify(playersReturned));
});

var httpServer = webSocketHttpServer.listen(process.env.PORT || PORT, function () {
   var host = (httpServer.address() as AddressInfo).address;
   var port = (httpServer.address() as AddressInfo).port;
   
   console.log(`Three Queen's Avenue app listening at ${host}:${port}`);//  http://%s:%s", host, port)
});