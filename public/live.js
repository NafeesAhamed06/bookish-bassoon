const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const role = ROLE
let Broadcasterr;
let screenStream;
let isScreenSharing = false;
const myPeer = new Peer({
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      
      {
        urls: 'turn:relay1.expressturn.com:3478',
        username: 'efADGMNVZSVLG2J0BR',
        credential: 'm77YmDCrUlS7FPLR'
      }
    ]
  }
});

if(NAME){
  console.log(NAME)
  document.getElementById('adminNAME').textContent = NAME
  document.getElementById('nameee').textContent = 'Name: '+ NAME
  
}
console.log(NAME)

const audioimg = document.getElementById("audio-img");
const videoimg = document.getElementById("video-img");

let isAudio = true
let isVideo = true

if(role == null){
  window.location.href = '/'
}
// const myVideo = document.createElement('video');
const myVideo = document.getElementById('test-v');
localStorage.setItem('previousROOM', ROOM_ID)
myVideo.muted = true;
const peers = {};
let localStream;
myPeer.on('error', function(err) { console.log(err) });

function startBroadcasting() {
  navigator.mediaDevices.getUserMedia({ video: {
    frameRate: {
      max: 24
    },
    width: { min: 1280 },
    height: { min: 720 },
  },
   audio: true })
  .then(stream => {
    
    socket.emit('initiateReload')
    localStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
      call.answer(stream);
    });
  })
  .catch(error => console.error("Error accessing media devices.", error));

  if(Broadcasterr){
    return
  }

}

document.getElementById('close').addEventListener('click', () => {
  if(document.getElementById('people-grid').style.display == 'flex'){
    document.getElementById('people-grid').style.display = 'none'
  }
  if(document.getElementById('video-grid').style.display == 'none'){
    document.getElementById('video-grid').style.display = 'flex'
  }
})

window.addEventListener('resize', () => {
  if(window.innerWidth > '420'){
    if(document.getElementById('video-grid').style.display == 'none'){
      document.getElementById('video-grid').style.display = 'flex'
    }
    if(document.getElementById('people-grid').style.display == 'none'){
      document.getElementById('people-grid').style.display = 'flex'
    }
  }
  if(window.innerWidth < '420'){
    if(document.getElementById('video-grid').style.display == 'flex'){
      document.getElementById('people-grid').style.display = 'none'
    }
  }
})

document.getElementById('view-BTN').addEventListener('click', () => {
  document.getElementById('video-grid').style.display = 'none'
  document.getElementById('people-grid').style.display = 'flex'
})

function muteA(){
    console.log("turned off audio")
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
    socket.emit('audioOFF', isAudio)
    if (isAudio) {
        audioimg.src = "/img/mic.png";
      } else {
        audioimg.src = "/img/mic_off.png";
      }
}

function muteV(){
    console.log("turned off video")
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
    socket.emit('videoOFF', isVideo)
    if (isVideo) {
        videoimg.src = "/img/videocam.png";
      } else {
        // socket.emit('videoOFF', true)
        videoimg.src = "/img/videocam_off.png";
      }
}


myPeer.on('open', id => {
  if(role == 'Broadcaster'){
    socket.emit('join-room', ROOM_ID, id, 'broadcaster',NAME);
    Broadcasterr = true;
    startBroadcasting();
  }else if(role == 'Viewer'){
    socket.emit('join-room', ROOM_ID, id, 'watcher');
    startWatching();
  }
});


// for (const [userId, user] of Object.entries(users))
const Nholder = document.getElementById('names-HOLDER')
socket.on('usersCount', (data) => {
  console.log(data)
  Nholder.innerHTML = ''
  data.forEach(name => {
    const div = document.createElement('div')
      div.setAttribute('class','names')
      div.setAttribute('id',name)
      div.textContent = name
      Nholder.appendChild(div)
  });
    document.getElementById('viewerCOUNT').textContent = `Viewers: ${data.length}`
})

socket.on('Vimg', (data) => {
  if(Broadcasterr){
    return
  }else{
    if(data == false){
      document.getElementById('videoOFF').style.display = 'block'
    }else if(data == true){
      document.getElementById('videoOFF').style.display = 'none'
    }
  }
})
socket.on('Aimg', (data) => {
  if(Broadcasterr){
    return
  }else{
    if(data == false){
      document.getElementById('audioOFF').style.display = 'block'
    }else if(data == true){
      document.getElementById('audioOFF').style.display = 'none'
    }

    document.getElementById('audioOFF').addEventListener('click', () => {
      document.getElementById('audioOFF').style.display = 'none'
    })
  }
})

socket.on('Bstats', (data) => {
  console.log(data)
  if(data == false){
    // document.getElementById('Details').textContent = 'Broadcast Not Availbale Now'
    document.getElementById('Details').style.display = 'flex'
    document.getElementById('video-grid').style.display = 'none'
  }else{
    // document.getElementById('Details').style.display = 'none'
    // document.getElementById('video-grid').style.display = 'grid'
    return;
  }
})

socket.on('Freload', () => {
  location.reload();
})


socket.on('user-connected', (userId, role) => {
  if (role === 'watcher' && localStream) {
    connectToNewUser(userId, localStream);
  }
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
  
  const call = myPeer.call(userId, stream);
  
  call.on('stream', userVideoStream => {
    
    addVideoStream(myVideo, userVideoStream);
  });

  
  call.on('close', () => {
    
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  if(video.style.display == 'none'){
    video.style.display = 'block'
    document.getElementById('controls').style.pointerEvents = 'all'
  }
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}


document.getElementById('change').addEventListener('click', () => {
  location.href = '/admin/change-credentials'
})




//testnig










// const screenShareButton = document.getElementById('screen-BTN');
// screenShareButton.addEventListener('click', toggleScreenShare);

// function toggleScreenShare() {
//   if (isScreenSharing) {
//     // Stop screen sharing and revert to camera
//     if (screenStream) {
//       screenStream.getTracks().forEach(track => track.stop());
//       screenStream = null;
//     }
//     const videoTrack = localStream.getVideoTracks()[0];
//     console.log(videoTrack)
//     replaceVideoTrack(videoTrack);
//     isScreenSharing = false;
//     screenShareButton.textContent = "Share Screen";
//     // Stop the screen-sharing stream entirely
//   } else {
//     // Start screen sharing
//     navigator.mediaDevices.getDisplayMedia({ video: true })
//       .then(screenStreams => {
//         screenStream = screenStreams
//         isScreenSharing = true;
//         screenShareButton.textContent = "Stop Sharing";
//         const screenTrack = screenStream.getVideoTracks()[0];

//         // Listen for screen share end
//         screenTrack.onended = () => {
//           toggleScreenShare(); // Automatically revert to the camera when screen sharing stops
//         };

//         replaceVideoTrack(screenTrack);
//       })
//       .catch(error => console.error("Error sharing screen.", error));
//   }
// }

// Replace the video track in the peer connection
// function replaceVideoTrack(newTrack) {
//   Object.values(peers).forEach(call => {
//     const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
//     if (sender) {
//       sender.replaceTrack(newTrack);
//     }
//   });

  // Update the local stream for new connections
  // const oldTrack = localStream.getVideoTracks()[0];
  // if (oldTrack) {
  //   localStream.removeTrack(oldTrack);
  // }
  // localStream.addTrack(newTrack);
// }








//testnig