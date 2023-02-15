FROM ubuntu:18.04
RUN apt update; apt install -y gnupg2

MAINTAINER pratik upadhyay
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 8080

CMD [ "node", "app.js" ]