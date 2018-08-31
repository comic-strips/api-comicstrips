FROM node:8.9.4
MAINTAINER dev@comicstrips.nyc
WORKDIR ./app
ADD . ./app/
RUN apt-get update && \ 
apt-get install vim -y 
EXPOSE 8080
ENTRYPOINT /bin/bash
