let resultElement
let inputElement
let recordButton


document.addEventListener('DOMContentLoaded', function () {
resultElement = document.getElementById("result");
inputElement = document.getElementById("score");
recordButton = document.getElementById("voiceBtn")

recordButton.addEventListener('click', handleRecording);
})



var isRecording = false

var requestData = {
  num: 0,
};

let mediaRecorder;
let chunks = [];



function handleRecording(){
  if (isRecording){
    stopRecording()
  }else{
    startRecording()
  }
}

function startRecording() {
  isRecording = true;
  console.log("Starting");
  recordButton.style.opacity = 0.5;

  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function (stream) {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function (event) {
          chunks.push(event.data);
      };
      mediaRecorder.onstop = function() {
          // Handle the stop event
          sendRecording();
      };
      mediaRecorder.start();
      recordButton.disabled = true;
      // Call a function to monitor volume level during recording
  })
  .catch(function (err) {
      console.error('Error: ', err);
  });
}


function stopRecording() {
  console.log("Recording stopped");
  isRecording = false;
  mediaRecorder.stop();
  recordButton.disabled = false;
}



function sendRecording() {

  const blob = new Blob(chunks, { type: 'audio/mp3' });
  const audioUrl = URL.createObjectURL(blob);

  // const audio = new Audio(audioUrl);
  // audio.play();

  // Do something with audioUrl, like play it or save it to a variable
  console.log('Recording saved:', audioUrl);
  // Clear chunks for the next recording
  chunks = [];
  recordButton.style.opacity = 1

  console.log("chunks", chunks)
  console.log("blob", blob)

  const formData = new FormData();
  formData.append('file', blob, 'output.wav');

  fetch('/analyze_speech', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response data if needed
      console.log('Response:', data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}




var source

