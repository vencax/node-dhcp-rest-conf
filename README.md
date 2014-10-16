[![build status](https://travis-ci.org/vencax/node-dhcp-rest-conf.svg)](https://travis-ci.org/vencax/node-dhcp-rest-conf)

# REST server for dhcpd maintainance

Install with:

	npm install git+https://github.com/vencax/node-dhcp-rest-conf.git --save

Offers REST API for maintain dhcpd server as express app that can be hooked just like this:

	var api = express();
	...
	api.use('/dhcpdcfg', require('node-dhcp-rest-conf'))

For example see [node-eduit-server](https://github.com/vencax/node-eduit-server).

If you want to give a feedback, [raise an issue](https://github.com/vencax/node-dhcp-rest-conf/issues).
