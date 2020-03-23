testing one to many video call using media server

## intsallation and running

- git clone `this repo`
- yarn

run media server locally using docker

`docker run --name kms -d -p 8888:8888 kurento/kurento-media-server`

- yarn start
- open another tab of http://localhost:3000/

from one tab click on call.

on other tab click 'view';

stream should start now.