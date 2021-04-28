root.innerHTML = `
<p>Take a selfie an post it as a blob.</p>
<div class="camera">
  <video id="video">Video stream not available.</video>
  <div id="info"></div>
  <button id="startbutton">Take photo</button>
</div>
<canvas id="canvas" style="display: none">
</canvas>
<div class="output">
  <img id="photo" alt="The screen capture will appear here.">
</div>`;

// Code mainly from: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos

var width = 320; // We will scale the photo width to this
var height = 0; // This will be computed based on the input stream

var streaming = false;


var video = null;
var canvas = null;
var photo = null;
var startbutton = null;

function startup() {
  video = root.getElementById('video');
  canvas = root.getElementById('canvas');
  photo = root.getElementById('photo');
  startbutton = root.getElementById('startbutton');

  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function (stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function (err) {
      console.log("An error occurred: " + err);
    });

  video.addEventListener('canplay', function (ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);

      // For firefox bug
      if (isNaN(height)) {
        height = width / (4 / 3);
      }

      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', function (ev) {
    takepicture();
    ev.preventDefault();
  }, false);

}

function takepicture() {
  var context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);
  canvas.toBlob(blob => {
    photo.setAttribute('src', URL.createObjectURL(blob))
    
    blob.arrayBuffer().then((arrayBuffer) => {
      pull(
        pull.values([arrayBuffer]), 
        sbot.blobs.add((err, blobId) => {
        if (err) {
          console.log('err', err)
        } else {
          root.getElementById('info').innerHTML = `
          Created blob with id ${blobId}
          `
        }
      }));
    });
  }, 'image/png');
}

startup()