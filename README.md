[![build status](https://travis-ci.org/vencax/node-dhcp-rest-conf.svg)](https://travis-ci.org/vencax/node-dhcp-rest-conf)

# REST server for dhcpd maintainance

Install with:

	npm install git+https://github.com/vencax/node-dhcp-rest-conf.git --save

Offers REST API for maintain dhcpd server as express app that can be hooked just like this:

	var api = express();
	...
	api.use('/dhcpdcfg', require('node-dhcp-rest-conf'))

For example see [node-eduit-server](https://github.com/vencax/node-eduit-server).

## Docker deployment

Idea is to mount host volume with dhcp server related files (DATADIR).

```
# build le image
git clone https://github.com/vencax/node-dhcp-rest-conf dhcp-rest
docker build -t vencax/dhcp-restconf dhcp-rest

# start le image
export DATADIR=$PWD/run
docker run -d -p 49160:8080 \
	-e SERVER_SECRET=supersecretstring \
	-e DHCPD_CONF_FILE=/data/dhcpd.conf \
	-e DHCPD_LEASES_FILE=/data/dhcpd.leases \
	-v $DATADIR:/data \
	vencax/dhcp-restconf
```

If you want to give a feedback, [raise an issue](https://github.com/vencax/node-dhcp-rest-conf/issues).
