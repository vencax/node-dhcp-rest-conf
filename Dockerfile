FROM ubuntu:14.04

MAINTAINER Vaclav Klecanda <vencax77@gmail.com>

# setup base system
# RUN apt-get update
RUN apt-get update
RUN apt-get install -y nodejs npm python-pip git
RUN pip install git+git://github.com/vencax/py-dhcpd-manipulation
RUN pip install git+git://github.com/vencax/LeaseInfo

# install the app
COPY . /src
RUN cd /src; npm install

EXPOSE 8080

CMD ["nodejs", "/src/server.js"]
