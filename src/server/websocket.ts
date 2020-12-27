import WebSocketServer from 'ws';
import express from 'express';
import * as http from 'http';
import { PlayerManager } from './playermanager.js';
import { DEFAULT_PLAYER, Player } from './player.js';
import { AddressInfo } from 'net';
import * as path from 'path';
import * as MessageTypeConstants from '../app/constants/messageTypeConstants.js';

const app = express();
var PORT: number;
var myArgs = process.argv.slice(3);
console.log('myArgs: ', myArgs);
if (myArgs[0] == 'dev') {
   PORT = 8081;
   // const fakePlayer: Player = {
   //    ...DEFAULT_PLAYER,
   //    name: 'Fake player',
   //    remoteAddress: 'localhost:1234'
   // };
   // console.log(`Adding fake player: ${JSON.stringify(fakePlayer)}`);
   // PlayerManager.getInstance().addPlayer(fakePlayer);
   // setInterval(() => {
   //    PlayerManager.getInstance().updatePlayerLocation({
   //       "player" : fakePlayer.name,
   //       "location" : fakePlayer.location == 'PanHall.jpg' ? 'PointHallPainting1.jpg' : 'PanHall.jpg'
   //    });
   // },3000);
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
   if (message[MessageTypeConstants.USERNAME]) {
      const player = PlayerManager.getInstance().findPlayer(request.connection.remoteAddress);
      if (player) {
         if (PlayerManager.getInstance().usernameAlreadyExists(message.username)) {
            player.webSocketClient.send(`{ "${MessageTypeConstants.ERROR}" : "Someone with username ${message[MessageTypeConstants.USERNAME]} is already connected." }`);
            player.webSocketClient.close();
         } else {
            player.name = message[MessageTypeConstants.USERNAME];
            PlayerManager.getInstance().updateAllPlayerDetails();
            player.webSocketClient.send(`{ "${MessageTypeConstants.STATUS}" : "UsernameAccepted" }`);
         }
      }
   } else if (message[MessageTypeConstants.PLAYER_LOCATION_UPDATED]) {
      PlayerManager.getInstance().updatePlayerLocation(message[MessageTypeConstants.PLAYER_LOCATION_UPDATED]);
   }
}

const webSocketHttpServer = http.createServer(app);
const webSocketServer = new WebSocketServer.Server({ server: webSocketHttpServer });
webSocketServer.on('connection', (webSocketClient, request) => {
   console.log(`Connection request from: ${request.connection.remoteAddress}`);
   const playerToAdd: Player = {
      ...DEFAULT_PLAYER,
      remoteAddress: request.connection.remoteAddress,
      webSocketClient: webSocketClient
   };
   const canAddPlayer = PlayerManager.getInstance().addPlayer(playerToAdd);
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
      PlayerManager.getInstance().removePlayer(request.connection.remoteAddress);
      PlayerManager.getInstance().updateAllPlayerDetails();
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
         "name" : player.name//,
         // "gameBeingPlayed" : player.gameBeingPlayed
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