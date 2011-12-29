var cli = require('cli'),
    p2p = require('./main');

cli.parse({
	host: ['h', 'The host to connect to', 'string'],
	name: ['n', 'The name of this client', 'string'],
	port: ['p', 'The port to listen on', 'number', 626]
});

cli.main(function(args, opts) {
	p2p.main(opts, args);
});
