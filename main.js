var net    = require("net"),
    events = require("events"),
		rl     = require("readline");

var clients = new Array(), hosts = {}, server, opts;

function log() {console.log.apply(console, arguments);}

String.prototype.trim = function() {
	return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function EventEmitter(obj) {
	for(key in events.EventEmitter.prototype) {
		obj[key] = events.EventEmitter.prototype[key];
	}
	events.EventEmitter.call(obj);
	return obj;
}

var Client = (function() {
	function Client() {
		var self = this;
		if(false === (this instanceof Client)) return new Client(s);
		EventEmitter(this);
		
		this.csocket = new net.Socket().on('close', function() {
			delete hosts[self.host];
		});
	};

	Client.initFromServer = function initFromServer(ss) {
		var inn = (ss.remoteAddress in hosts);
		var self = inn && clients[hosts[ss.remoteAddress]] ? clients[hosts[ss.remoteAddress]] : new Client();
		
		self.host = ss.remoteAddress;
		self.ssocket = ss;
		
		self.ssocket.on('data', function (d) {
			var ds = d.toString(), split = ds.split(':');
			
			switch(split[0]) {
				case 'port':
					if(!inn && !self.port) {
						self.port = split[1];
						self.initClient(self.ssocket.remoteAddress, self.port);
					}
					break;
				case 'clients?':
					var clis = {};
					clients.forEach(function(v, k) {
						if(v && v.host && v.port) {
							clis[v.host] = v.port;
						}
					});
					self.ssocket.write('clients:' + JSON.stringify(clis));
					break;
				case 'data':
					exports.interface.emit('data', self.host + ':' + self.port, JSON.parse(split.slice(1).join(':')));
					break;
			}
		}).on('close', function() {
			delete hosts[self.host];
		});
		

		if(!inn) hosts[ss.remoteAddress] = clients.push(self) - 1;
		
		return self;
	};

	Client.initFromClient = function initFromClient(host, port) {
		if(!(host in hosts)) {
			var self = new Client();
		
			self.initClient(host, port);
		
			return self;
		}
	}
	
	Client.prototype.initClient = function initClient(host, port) {
		var self = this;
		this.csocket.connect(port, host, function () {
			var s;
			(s = self.csocket).write('port:' + exports.interface.port);
			s.on('data', function(d) {
			
				var ds = d.toString(), split = ds.split(':');
				var data = split.slice(1).join(':');
			
				switch(split[0]) {
					case 'clients':
						var clis = JSON.parse(data);
						process.nextTick(function() {
							Object.keys(clis).forEach(function(host){
								hosts[host] = clients.push(Client.initFromClient(host, parseInt(clis[host]))) - 1;
							});
						});
						break;
				}
			});
			setTimeout(function() {
				s.write('clients?');
				setInterval(arguments.calle, 3000000);
			}, 1000);
		});
		
		return this;
	};
	
	Client.prototype.sendMessage = function sendMessage(m) {
		this.csocket.write('data:' + JSON.stringify(m))
	}

	return Client;
})()

function server(opts, args) {
	server = new net.createServer(connection);

	server.on('error', function() {
		console.error.apply(console, arguments);
	});

	server.listen(opts.port || 0, function() {
		console.log("server bound");
	});
}

function connect(opts, args) {
	if(opts.host === undefined || opts.host === null) {
		console.error('No host! I\'me the main node');
		
		return;
	}
	var hostSplit = opts.host.split(':');
	if(hostSplit.length == 1) hostSplit[1] = 626;
	
	hosts[opts.host] = clients.push(Client.initFromClient(hostSplit[0], parseInt(hostSplit[1]))) - 1;
}

function connection(s) {
	Client.initFromServer(s)
}

exports.main = function(Lopts, args){
	opts = Lopts
	server(Lopts, args);
	connect(Lopts, args);
}

var InterfaceClient = (function() {
	var InterfaceClient = function Client(client) {
		this.client = client;
	};
	
	InterfaceClient.prototype.sendMessage = function sendMessage(m) {
		this.client.sendMessage(m);
	};
	
	return InterfaceClient;
})();

exports.interface = (function() {
	var interface = {
		
	};
	
	Object.defineProperties(interface, {
		clients: {
			get: function() {
				var clis = {};
			
				clients.forEach(function(c, i) {
					if(c && c.host && c.port) {
						clis[c.host + ':' + c.port] = new InterfaceClient(c);
					}
				});
			
				return clis;
			}
		},
		port: {
			get: function() {
				return parseInt(server.address().port);
			}
		}
	});
	
	EventEmitter(interface);
	
	return interface;
})();
