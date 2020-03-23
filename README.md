testing one to many video call using media server

## intsallation and running

- git clone `this repo`
- yarn

run media server locally using docker

`docker run --name kms -d -p 8888:8888 kurento/kurento-media-server`

- `yarn start` to run client
- `yarn server` to run server (signaling server using websockets) 

now open two tabs of app

from one tab click on call.

on other tab click 'view';

stream should start now.