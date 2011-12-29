__Peer 2 Peer__

Made for peer to peer networks (problably relativly small ones because this isn't the most efficient approach)

__Usage__

````javascript
var P2P = require('p2p');

P2P.on('data', function(name, data) {
  //Use it
  // name is the name of the peer, like 127.0.0.1:626
});

P2P.main({
  port: 626, // port number if left out it will pick a port which you can get like P2P.port
  host: 'localhosr' // The peer to connect to
});

P2P.clients['127.0.0.1'].sendMessage(message); // Send a message to the client the port is the server port
````
