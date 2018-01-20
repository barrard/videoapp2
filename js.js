/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var errorElement = document.querySelector('#errorMsg');
var video = document.querySelector('video');
var canvas, context;
var draw_timeout, reader_interval;
var box_top = 500
var box_left = 400
var box_width = 225
var box_height = 300

///////////////
var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');
var red_result = document.getElementById('red_result')
var green_result = document.getElementById('green_result')
var blue_result = document.getElementById('blue_result')
var alpha_result = document.getElementById('alpha_result')
var combined_color = document.getElementById('combined_color');

document.addEventListener('DOMContentLoaded', function(){
    canvas = document.getElementById('canvas_reader');
    context = canvas.getContext('2d');

    // var cw = Math.floor(canvas.clientWidth / 100);
    // var ch = Math.floor(canvas.clientHeight / 100);
    var cw = 1000;
    var ch = 1000;
    canvas.width = cw;
    canvas.height = ch;



    video.addEventListener('play', function(){
        draw(this,context,cw,ch);
    },false);

},false);

function draw(v,c,w,h) {
    if(v.paused || v.ended) return false;
    c.drawImage(v,0,0,w,h);
    c.beginPath();
    c.moveTo(box_left, box_top+box_height);
    c.lineTo(box_left, box_top);
    c.lineTo(box_left+box_width, box_top);
    c.lineTo(box_left+box_width, box_top+box_height);
    c.lineTo(box_left, box_top+box_height)
    c.lineWidth = 5;
    c.stroke();
    // c.fillStyle = "red";
    // c.fillRect(10, 10, 100, 50);
    draw_timeout = setTimeout(draw,20,v,c,w,h);
}

function stop_draw(){
  clearInterval(draw_timeout)
}

function restart_draw(){
  draw(video,context,1000,1000);
}

function read_box(){
  console.log('READ BOX START')
  var imageData = context.getImageData(box_left, box_top, box_width, box_height);
  var data = imageData.data
  var red_array=[]
  var green_array = []
  var blue_array = []
  var alpha_array = []
  for(let x = 0; x<data.length; x+=4){
    red_array.push(data[x]);
    green_array.push(data[x+1]);
    blue_array.push(data[x+2]);
    alpha_array.push(data[x+3]);

  }
  var red = Math.floor(return_avg(red_array))
  var green = Math.floor(return_avg(green_array))
  var blue = Math.floor(return_avg(blue_array))
  var alpha = Math.floor(return_avg(alpha_array))

  console.log(red)
  console.log(green)
  console.log(blue)
  console.log(alpha)
  red_result.innerText = red;
  green_result.innerText=green;
  blue_result.innerText=blue;
  alpha_result.innerText=alpha;
  combined_color.style.background = "rgba("+red+", "+green+", "+blue+", "+alpha+")"
  console.log('DONE READ BOX?')


}

function return_avg(arry){
  var sum = 0;
  for (let x = 0; x< arry.length; x++){
    sum+=arry[x]
  }
  sum = sum/arry.length

  return sum
}

function start_reader(){
  var intervals = document.getElementById('reader_interval').value
  reader_interval=setInterval(function(){ read_box() }, intervals)
}

function stop_reader(){
  clearInterval(reader_interval)
}

navigator.mediaDevices.enumerateDevices()
  .then(gotDevices).then(getStream).catch(handleError);

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;
//////////////

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
};



/////////////////////////

function gotDevices(deviceInfos) {
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label ||
        'microphone ' + (audioSelect.length + 1);
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' +
        (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Found one other kind of source/device: ', deviceInfo);
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  var constraints = {
    // audio: {
    //   deviceId: {exact: audioSelect.value}
    // },
    video: {
      deviceId: {exact: videoSelect.value}
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);
}




///////////////////////////






function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}



// navigator.mediaDevices.getUserMedia(constraints).
//     then(handleSuccess).catch(handleError);
