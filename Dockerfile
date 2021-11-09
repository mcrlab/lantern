FROM node:12

RUN apt-get update

RUN apt-get install -y postgresql-client

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

ADD . /usr/src/app/

RUN npm run build

EXPOSE 8080