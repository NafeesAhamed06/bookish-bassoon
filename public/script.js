const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const role = ROLE


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


const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
  const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
  }, {});

if(cookies.username){
  document.getElementById('usernameTEXT').textContent = cookies.username
  document.getElementById('nameee').textContent = "Your Name: "+ cookies.username
}
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

socket.on('Bname', (data) => {
  document.getElementById('HOST').textContent = 'Hosted By ' + data
})

myPeer.on('open', id => {
   if(role == 'Viewer'){
    socket.emit('join-room', ROOM_ID, id, 'watcher', cookies.username);
    startWatching();
  }
});




socket.on('Vimg', (data) => {
  if(data == false){
    document.getElementById('videoOFF').style.display = 'block'
  }else if(data == true){
    document.getElementById('videoOFF').style.display = 'none'
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

function startWatching() {
  myPeer.on('call', call => {
    call.answer();

    call.on('stream', userVideoStream => {
      addVideoStream(myVideo, userVideoStream)
    });
  });

}
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
  }
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

function leave(){
  location.href = "/Leave"
}
// document.getElementById('userIMG').addEventListener('click', () => {
//   document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//   location.href='/new-user'
// })

document.getElementById('change').addEventListener('click', () => {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  location.href='/new-user'
})

document.getElementById('Fvideo').addEventListener('click', () => {
  openFullscreen()
})

function openFullscreen() {
  if (myVideo.requestFullscreen) {
    myVideo.requestFullscreen();
  } else if (myVideo.webkitRequestFullscreen) { /* Safari */
    myVideo.webkitRequestFullscreen();
  } else if (myVideo.msRequestFullscreen) { /* IE11 */
    myVideo.msRequestFullscreen();
  }
}



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