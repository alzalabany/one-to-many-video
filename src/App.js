import { WebRtcPeer } from 'kurento-utils';
import React from 'react';
import './App.css';
import logo from './logo.svg';

var ws = new WebSocket('wss://localhost:8443/one2many');

window.onbeforeunload = function() {
	ws.close();
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Sending message: ' + jsonMessage);
	ws.send(jsonMessage);
}
function onIceCandidate(candidate) {
  console.log('Local candidate' + JSON.stringify(candidate));

  var message = {
     id : 'onIceCandidate',
     candidate : candidate
  }
  sendMessage(message);
}
function onOfferViewer(error, offerSdp) {
	if (error) return console.warn(error)

	var message = {
		id : 'viewer',
		sdpOffer : offerSdp
	}
	sendMessage(message);
}

const onError = console.warn.bind(console);
function onOfferPresenter(error, offerSdp) {
  if (error) return onError(error);

var message = {
  id : 'presenter',
  sdpOffer : offerSdp
};
sendMessage(message);
}
function App() {
  const [loading, toggle] = React.useState(false);
  const ref = React.createRef();
  const webRtc = React.useRef(null);
  const video = ref.current; 
  
  const showSpinner = () => toggle(true)
  const hideSpinner = () => toggle(false)
  const stop = React.useCallback(function stop() {
    const webRtcPeer = webRtc.current;
    if (webRtcPeer) {
      webRtcPeer.dispose();
      webRtc.current = null;
      var message = {
        id : 'stop'
      }
      sendMessage(message);
    }
    hideSpinner(video);
  },[video] );
  function viewer() {
    if (!webRtc.current) {
      showSpinner( );
      console.log('setting options',   ref.current);
      var options = {
        remoteVideo: ref.current,
        onicecandidate : onIceCandidate
      }
  
      webRtc.current = WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
        if(error) return onError(error);
  
        this.generateOffer(onOfferViewer);
      });
    }
  }
  function presenter() {
    if (!webRtc.current) {
      showSpinner(video);
      console.log('setting options',   ref.current);
      var options = { 
        localVideo: ref.current,
        onicecandidate : onIceCandidate
        }
  
        webRtc.current = WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
        if(error) return onError(error);
  
        this.generateOffer(onOfferPresenter);
      });
    }
  }
  function viewerResponse(message) {
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      stop();
    } else {
      webRtc.current.processAnswer(message.sdpAnswer);
    }
  }
  function presenterResponse(message) {
    if (message.response != 'accepted') {
      var errorMsg = message.message ? message.message : 'Unknow error';
      console.warn('Call not accepted for the following reason: ' + errorMsg);
      stop();
    } else {
      webRtc.current.processAnswer(message.sdpAnswer);
    }
  }

  React.useEffect(()=>{
    ws.onmessage = function(message) {
      var parsedMessage = JSON.parse(message.data);
      console.info('Received message: ' + parsedMessage.id + `[${parsedMessage.response}]`);
    
      switch (parsedMessage.id) {
      case 'presenterResponse':
        presenterResponse(parsedMessage);
        break;
      case 'viewerResponse':
        viewerResponse(parsedMessage);
        break;
      case 'stopCommunication':
        stop();
        break;
      case 'iceCandidate':
        webRtc.current.addIceCandidate(parsedMessage.candidate)
        break;
      default:
        console.error('Unrecognized message', parsedMessage);
      }
    }
  },[presenterResponse, stop, viewerResponse])

  const onCall = React.useCallback(presenter,[] );
  const onView = React.useCallback(viewer,[] );
  const onStop = React.useCallback(stop,[] );

  return (
    <div className="App">
      <header className="App-header">
      <video ref={ref} id="video" autoPlay width="640px" height="480px" poster={logo} ></video>
        {loading &&
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Loading
        </a>}
      </header>
      <div>
        <button onClick={onCall}>call</button>
        <button onClick={onView}>view</button>
        <button onClick={onStop}>Stop</button>
      </div>
    </div>
  );
}

export default App;
