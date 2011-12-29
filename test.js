var p2p = require('./main'),
    cli = require('cli');

cli.parse({
	host: ['h', 'Host', 'string']
});

cli.main(function(args, opts) {
	p2p.interface.on('data', function(name, data) {
		console.log('data:', name + ':', data);
	});
	var optss = {port: 626};
	if(opts.host !== undefined && opts.host !== null) {
		optss.port = null;
		optss.host = opts.host;
	}
	p2p.main(optss);
	
	console.log(p2p.interface.port);
	
	setTimeout(function() {
		for(key in p2p.interface.clients) {
			p2p.interface.clients[key].sendMessage('hi');
		}
	}, 10000);
});
