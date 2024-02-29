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
  isRecording = true
console.log("Starting")
recordButton.style.opacity = 0.5


navigator.mediaDevices.getUserMedia({ audio: true })
.then(function (stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = function (event) {
        chunks.push(event.data);
    };
    mediaRecorder.start();
    recordButton.disabled = true;
    // Call a function to monitor volume level during recording
    monitorVolume(stream);
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
  saveRecording();
  sendRecording(); // Call sendRecording to send the recording to the server
}


function saveRecording() {
  const blob = new Blob(chunks, { type: 'audio/wav; codecs=pcm' });
  const audioUrl = URL.createObjectURL(blob);
  // Do something with audioUrl, like play it or save it to a variable
  console.log('Recording saved:', audioUrl);
  // Clear chunks for the next recording
  chunks = [];
  recordButton.style.opacity = 1
}


function sendRecording() {
  const blob = new Blob(chunks, { type: 'audio/wav; codecs=pcm' });
  const formData = new FormData();
  formData.append('audio', blob);

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

function monitorVolume(stream) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();

  source = audioContext.createMediaStreamSource(stream);

  source.connect(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function updateVolume() {
    if (isRecording) {
        analyser.getByteFrequencyData(dataArray);
        let volume = 0;
        for (let i = 0; i < bufferLength; i++) {
            volume += dataArray[i];
        }
        volume /= bufferLength; // Calculate average volume
        // Normalize volume to range between 0 and 1
        volume /= 255;
        // Set opacity based on volume, ensuring minimum opacity of 0.5
        recordButton.style.opacity = Math.max(0.1, volume*3);
        
        requestAnimationFrame(updateVolume); // Continue monitoring volume if recording
    }
}

  updateVolume();
}