let resultElement
let inputElement
let recordButton
let scenario_data
let user_sentiments
let tone_data;
let user_speech
let scenario_score = 10
let scenario_num;
let lesson_num
let paceChart
let attitudeChart
let audio_length
let pace_val
let diction_val


// Tutorial related elements
var tutContent
var tutTextElement
var tutNextElement
var tutPrevElement
var dialogueCount = 1
var tutData;


document.addEventListener('DOMContentLoaded', function () {
resultElement = document.getElementById("result");
inputElement = document.getElementById("score");
recordButton = document.getElementById("voiceBtn")
lessonNumElement = document.getElementById("lesson-num")
lessonNameElement = document.getElementById("lesson-name")
scenarioNameElement = document.getElementById("scenario-name")
scenarioDetailsElement = document.getElementById("scenario-details")
scenarioViewElement = document.getElementById("scenario-view")
scenarioResultsElement = document.getElementById("scenario-results")
scenarioScoreElement = document.getElementById("scenario-score")
detailsTextElement = document.getElementById("details")
errorTextElement = document.getElementById("error")
preRecordedElement = document.getElementById("pre-recorded")
preRecordedButton = document.getElementById("pre-recorded-button")
scenarioDescElement = document.getElementById("scenario-desc")

// Tutorial related elements 
tutContent = document.getElementById("tut-content")
tutTextElement = document.getElementById("tut-text")
tutNextElement = document.getElementById("tut-next")
tutPrevElement = document.getElementById("tut-prev")

tutData = {1:["Hi, I'm Speako! I'm going to teach you how to use Volume.", scenarioDescElement, 0.5, 0.9], 
2:["This part shows you the specific scenario's details.", scenarioDescElement, 0.8, 0.9],
3:["When recording your voice, you must attempt to respond in the most fitting way you can depending on the scenario.", null],
4:["To record your voice, click this button. Make sure your device allows Volume to record your voice!", recordButton, 1.1, 0.6],
5:["Once clicked, the button will start flashing like so. Click it again to stop and submit your response!", null],
6:["Volume will then process your recording and give you your results!", scenarioDescElement, 0.7, 0.9],
7:["Okay! That's all. You can retry the tutorial again in the lessons page!", null]
}

recordButton.addEventListener('click', handleRecording);
toggleBlinking(recordButton)

preRecordedButton.addEventListener('click', function(event) {
  preRecordedElement.style.display = "flex"
  preRecordedButton.style.display = "none"
});

preRecordedElement.addEventListener('mouseenter', function(event) {
  // Change background color when mouse enters
  event.target.style.opacity = "1";
});
preRecordedElement.addEventListener('mouseleave', function(event) {
  // Change background color when mouse enters
  event.target.style.opacity = "0.5";
});

document.getElementById('next-scenario-btn').addEventListener('click', function() {
  // Increment the scenario number
  scenario_num += 1;
  updateScenario();

  scenario_data_length = Object.keys(scenario_data).length;

  document.getElementById('prev-scenario-btn').style.opacity = 1
  document.getElementById('prev-scenario-btn').style.pointerEvents = 'auto'

  if(scenario_num >= scenario_data_length){
    document.getElementById('next-scenario-btn').textContent = "Back to lessons"
    document.getElementById('scenarios-complete').style.visibility = 'visible'
  }

  console.log("scen num", scenario_num)
});

document.getElementById('prev-scenario-btn').addEventListener('click', function() {
  // Increment the scenario number
  scenario_num -= 1;

  if(scenario_num != 0){
  updateScenario();
  }

  document.getElementById('next-scenario-btn').textContent = "Next Scenario"
  document.getElementById('scenarios-complete').style.visibility = 'hidden'
  
  if(scenario_num - 1 == 0){
    document.getElementById('prev-scenario-btn').style.opacity = 0.5
    document.getElementById('prev-scenario-btn').style.pointerEvents = 'none'
  }

  console.log("scen num", scenario_num)

});

// We will dynamically get the lesson num in the future using Flask's template system
// Fetch the lesson number from the HTML
lessonNumberVar = document.getElementById("lesson-num-var")
lesson_num = parseInt(lessonNumberVar.innerText)

// Same idea as above
scenarioNumberVar = document.getElementById("scenario-num-var")
scenario_num = parseInt(scenarioNumberVar.innerText)

getLesson(lesson_num)

})

function playAudio(elementId) {
  const audioElement = document.getElementById(elementId);
  if (audioElement) {
      audioElement.play();
  }
}


function toggleBlinking(element) {
  let opacity = 0.5;
  let intervalId;
  let isBlinking = false;
  let increment = 0.1;

  function blink() {
    intervalId = setInterval(function() {
      opacity += increment;
      if (opacity >= 1 || opacity <= 0.5) {
        increment *= -1;
      }
      element.style.opacity = opacity;
    }, 100);
  }

  function stopBlink() {
    clearInterval(intervalId);
    element.style.opacity = 1;
  }

  element.addEventListener('click', function() {
    if (!isBlinking) {
      blink();
      isBlinking = true;
    } else {
      stopBlink();
      isBlinking = false;
    }
  });
}





var isRecording = false

var requestData = {
  num: 0,
};

let mediaRecorder;
let chunks = [];


 
function handleRecording(){

  console.log("Handling")
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
  updateRecordingStatus("Recording in Progress. Click again to end recording.", true);

  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function (stream) {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function (event) {
          chunks.push(event.data);
      };
      mediaRecorder.onstop = function() {
          // Handle the stop event
          sendRecording();
          updateRecordingStatus("", false); // Hide the status when recording stops
      };
      mediaRecorder.start();
  })
  .catch(function (err) {
      console.error('Error: ', err);
      updateRecordingStatus("", false); // Hide the status on error
  });
}

function stopRecording() {
  console.log("Recording stopped");
  isRecording = false;
  mediaRecorder.stop();
  recordButton.disabled = false;
  updateRecordingStatus("", false); // Hide the status when manually stopped
}

function updateRecordingStatus(message, visible) {
  const statusElement = document.getElementById("recording-status");
  if (statusElement) {
    statusElement.innerText = message;
    statusElement.style.visibility = visible ? "visible" : "hidden";
  }
}


function sendRecording(blob) {

  startLoading()


  if(!blob){
  blob = new Blob(chunks, { type: 'audio/mp3' });
  }
  const audioUrl = URL.createObjectURL(blob);

  console.log('Recording saved:', audioUrl);
  chunks = [];
  recordButton.style.opacity = 1


  const formData = new FormData();
  formData.append('scenario_num', scenario_num)
  formData.append('lesson_num', lesson_num); // Added this line to send the lesson number
  formData.append('file', blob)

  fetch('/analyze_speech', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {

    let error_num = data['code']

    if(!error_num){

      console.log(data)

      stopLoading()
      processData(data)
      endScenario()
    }else{
      stopLoading()

       // Error 209 is a speech recognition error
        if (error_num == 209){
          setError("Error in recognizing your speech, please try again.")
        }
        // Error 309 is a sentiment API issue
        else if (error_num == 309){

          setError("Error in sentiment API, please try again.")
        }
    }
      console.log('Response:', data);

  })
  .catch(error => {
      console.error('Error:', error);
  });
}

// Processes data received from /analyze_speech
function processData(data){
  user_sentiments = data['user_sentiments'][0]
  tone_data = data['tone_data']
  user_speech = data['user_speech']
  scenario_score = data['score']
  audio_length = data['audio_length']
  pace_val = data['pace_val']
  diction_val = data['diction_val']
}


function startLoading(){
  errorTextElement.style.display = "none"
  detailsTextElement.style.visibility = "visible"
  scenarioViewElement.style.opacity = 0.5
  scenarioViewElement.style.pointerEvents = 'none'
}

function stopLoading(){
  detailsTextElement.style.visibility = "hidden"
  scenarioViewElement.style.opacity = 1
  scenarioViewElement.style.pointerEvents = 'all'
}

function setError(error){
  errorTextElement.innerText = error
  errorTextElement.style.display = "block"
}

function destroyAllCharts(){
  if (paceChart) {
    paceChart.destroy();
    paceChart = null; // Clear the reference to fully dispose of the chart
  }
  if (attitudeChart) {
    attitudeChart.destroy();
    attitudeChart = null; // Clear the reference to fully dispose of the chart
  }
}


function getLesson(lessonNum){

  const formData = new FormData();
  formData.append('lesson_num', lessonNum);

  fetch('/get_lesson', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response data if needed
      console.log('Response:', data);

      if (data['error_num'] == 404){
        setLessonNotFound()
      }else{

      lesson_num = data['lesson_num']
      lesson_name = data['lesson_name']

      scenario_data = data['scenarios']

      populateLessonDetails(lesson_num, lesson_name)

      // updateScenario() can only be called after scenario_data is populated, which
      // is done in this function.
      updateScenario()


      // Update the pre-recorded voice files based on the scenario
      getPreRecorded()

      
      // Lesson 0 is tutorial
      if (lessonNum == 0){
        startTutorialSequence()
      }

      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function setLessonNotFound(){
  scenarioViewElement.style.opacity = "0"
  detailsTextElement.style.visibility = "visible"
  detailsTextElement.innerText = "Lesson not found"
}

function populateLessonDetails(lesson_num, lesson_name){
  lessonNameElement.innerText = lesson_name
  lessonNumElement.innerText = "Lesson " + lesson_num
}

function populateScenarioDetails(scenario_name, scenario_details){
  scenarioNameElement.innerText = scenario_name
  scenarioDetailsElement.innerText = scenario_details
}

function endScenario(){

  //completeScenario();

  destroyAllCharts(); // Ensure any existing charts are destroyed before creating new ones
  scenarioViewElement.style.display = "none";
  scenarioResultsElement.style.display = "block";
  scenarioScoreElement.innerText = scenario_score.toFixed(1).toString() + "/10";
  

  // These functions should create new chart instances with the latest data
  populateAttitudeChart(user_sentiments);
  populateToneChart(tone_data); // Make sure this function is updated to use the latest data
  populatePaceBar(pace_val)
  populateDictionBar(diction_val)
}


function updateScenario() {

  console.log("Updating scenario to ", scenario_num)

  // Update the URL to reflect the new scenario number
  history.pushState({}, '', `/practice/${lesson_num}-${scenario_num}`);

  var nextScenario = scenario_data[scenario_num.toString()];


        // Get the first scenario's name & details
        scenario_name = scenario_data['1']['scenario_name']
        scenario_details = scenario_data['1']['scenario_details']
        populateScenarioDetails(scenario_name, scenario_details)

  if (nextScenario) {
    // Populate the scenario details using the next scenario data
    populateScenarioDetails(nextScenario['scenario_name'], nextScenario['scenario_details']);
    // Ensure the main scenario view is visible and the results are hidden
    scenarioViewElement.style.display = "block";
    scenarioResultsElement.style.display = "none";
  } else {
    window.location.href = "/lessons"
  }
}


function displayCongratulationsPage() {
  // Clear the main content area
  document.body.innerHTML = '';

  // Create the congratulatory message
  var congratsMessage = document.createElement('h2');
  congratsMessage.textContent = 'Congratulations! You have completed the lesson.';
  document.body.appendChild(congratsMessage);

  // Create the return button
  var returnButton = document.createElement('button');
  returnButton.textContent = 'Return to Lessons';
  returnButton.onclick = function() {
    window.location.href = '/lessons'; // Replace with the correct path
  };
  document.body.appendChild(returnButton);

  // Apply some basic styles
  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.alignItems = 'center';
  document.body.style.justifyContent = 'center';
  document.body.style.height = '100vh';

  returnButton.style.marginTop = '20px';
  returnButton.style.padding = '10px 20px';
  returnButton.style.fontSize = '1.2em';
  returnButton.style.cursor = 'pointer';
}




function retryScenario(){
  scenarioViewElement.style.display = "block"
  scenarioResultsElement.style.display = "none"
  destroyAllCharts()
}

// Populates the attitude chart by the Top 3 sentiments that the user showed during their speech
function populateAttitudeChart(sentiments){


  // Get top 3 sentiments
  sentiment_values = []
  sentiment_words = []
  for (let i = 0; i < 3; i++) {
    sentiment_values.push(sentiments[i]['score'] * 100)

    // Capitalize first letter
    let word = sentiments[i]['label']
    word = word.charAt(0).toUpperCase() + word.slice(1);

    sentiment_words.push(word)
  }



  var ctx = document.getElementById('chart-bar').getContext('2d');
  var data = {
      labels: sentiment_words,
      datasets: [{
          label: 'Sentiment',
          tension: 0.4,
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
          backgroundColor: [
            "#3A416F",
            "#7571AD", 
            "#C0BEDA"
        ],
          data: sentiment_values
      }]
  };
  var config = {
      type: 'bar',
      data: data,
      options: {
        plugins:{
        legend: {
          display: false,
      }
    },
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  };
  attitudeChart = new Chart(ctx, config);
}


function movingAverage(values, windowSize) {
  let smoothedValues = [];
  for (let i = 0; i < values.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(values.length - 1, i + Math.floor(windowSize / 2)); j++) {
          sum += values[j];
          count++;
      }
      smoothedValues.push(sum / count);
  }
  return smoothedValues;
}


function populateToneChart(tone_data){

  // times = tone_data[0]
  // values = tone_data[1]
  values = tone_data

  values = values.filter(element => element !== 0);



  // NEED TO DO A LOT OF THIS PROCESSING IN PYTHON INSTEAD. 


  let windowSize = 25; // Example window size
  values = movingAverage(values, windowSize);


  console.log("AUDIO LENGTH:", audio_length)

  // for tutorial
  if (audio_length === null || audio_length === undefined){
    console.log("here")
    audio_length = 25
  }


// Calculate the interval length between segments
let interval_length = audio_length / values.length;

// Create an array to store the resulting time points
let time_points = [];


    // Iterate to generate time points
    for (let i = 0; i < values.length; i++) {
      // Calculate the time point for the current segment
      let seconds = Math.floor(i * interval_length);
      let minutes = Math.floor(seconds / 60);
      seconds %= 60;

      // Format the time point as "mm:ss"
      let time_point = minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
      time_points.push(time_point);
  }
  
  var ctx2 = document.getElementById("chart-line").getContext("2d");

  var gradientStroke1 = ctx2.createLinearGradient(0, 230, 0, 50);

  gradientStroke1.addColorStop(1, '#C0BEDA');
  gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
  gradientStroke1.addColorStop(0, 'rgba(203,12,159,0)'); //purple colors

  var gradientStroke2 = ctx2.createLinearGradient(0, 230, 0, 50);

  gradientStroke2.addColorStop(1, 'rgba(20,23,39,0.2)');
  gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
  gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); //purple colors

  paceChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: time_points,
      datasets: [{
          label: "Pitch",
          tension: 0.2,
          borderWidth: 0,
          pointRadius: 0,
          borderColor: "#cb0c9f",
          borderWidth: 3,
          backgroundColor: gradientStroke1,
          fill: true,
          data: values,
          maxBarThickness: 6

        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5]
          },
          ticks: {
            display: true,
            padding: 10,
            color: '#b2b9bf',
            font: {
              size: 11,
              family: "Open Sans",
              style: 'normal',
              lineHeight: 2
            },
          }
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
            borderDash: [5, 5]
          },
          ticks: {
            display: true,
            color: '#b2b9bf',
            padding: 20,
            font: {
              size: 11,
              family: "Open Sans",
              style: 'normal',
              lineHeight: 2
            },
          }
        },
      },
    },
  });

}

let audioElement

function getPreRecorded() {

  var audioFiles = [`/static/assets/audio_files/${lesson_num}/${scenario_num}/1.mp3`, `/static/assets/audio_files/${lesson_num}/${scenario_num}/2.mp3`, `/static/assets/audio_files/${lesson_num}/${scenario_num}/3.mp3`];

  for (var i = 0; i < audioFiles.length; i++) {
      // var audioElement = document.getElementById('pre-' + (i + 1) + '-audio');
      var buttonElement = document.getElementById('pre-' + (i + 1));
      if (buttonElement) {
          buttonElement.srcsrc = audioFiles[i];
      }
    }

var small_buttons = document.getElementsByClassName('small-button');

// Loop through each button and attach the click event listener
Array.from(small_buttons).forEach(function(button) {
  var url = button.srcsrc;

  var audio = new Audio();
  audio.src = url;

  console.log(url)

    button.addEventListener('click', function() {
      console.log("Adding event listener for", button)
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                sendRecording(blob)
                audio.currentTime = 0
            })
            .catch(error => console.error('Error fetching image blob:', error));
    });

    button.addEventListener('mouseenter', function() {
      audio.play();
    });
    
    button.addEventListener('mouseleave', function() {
      audio.pause();
    });


});
    
}






function checkScrollTopChange(initialScrollTop) {
  return new Promise((resolve, reject) => {
      // Check scrollTop in an interval
      var intervalId = setInterval(() => {
          if (document.documentElement.scrollTop !== 1234) {
            setTimeout(function() {
              clearInterval(intervalId); // Clear the interval
              resolve(); // Resolve the promise when scrollTop changes
          }, 500); // 1000 milliseconds = 1 second
    
          }
      }, 100); // Interval time in milliseconds
  });
}




var overlay
function startTutorialSequence() {
  // Set document background to black with 50% opacity
  // document.body.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    // Create overlay element
    overlay = document.createElement('div');
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor =  "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "9999";
    
    document.body.appendChild(overlay);


  tutContent.style.position = "fixed";
  tutContent.style.top = "50%" //targetRect.top + 50 + 'px';
  tutContent.style.left = "50%"
  tutContent.style.width = 300 + "px";
  tutContent.style.height = 200 + "px";
  tutContent.style.backgroundColor = "white";
  tutContent.style.zIndex = "9999";
  tutContent.style.visibility = "visible"
  tutContent.style.transform = "translateY(-50%)"; // Move the element up by 50% of its own height
  tutContent.style.transform += "translateX(-50%)"; // Move the element left by 50% of its own width

  
  document.body.appendChild(tutContent);
  updateTutData(1)

  initialScroll = document.documentElement.scrollTop
  document.documentElement.scrollTop = 1234;

  

//   checkScrollTopChange(initialScroll).then(() => {

// });

}


function simulateBlink() {

  let opacity = 0.5;
  let intervalId;
  let increment = 0.1;

  intervalId = setInterval(function() {
    opacity += increment;
    if (opacity >= 1 || opacity <= 0.5) {
      increment *= -1;
    }
    recordButton.style.opacity = opacity;
  }, 100);

  return intervalId
}


  function simulateStopBlink(intervalId) {
    clearInterval(intervalId);
    recordButton.style.opacity = 1;
  }

  function requestMicAccess(){
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Request access to the user's microphone
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
          // Access granted, do something with the stream (e.g., record audio)
          console.log("Microphone access granted");
      })
      .catch(function(error) {
          // Access denied or error occurred
          console.error("Error accessing microphone:", error);
      });
  } else {
      console.error("getUserMedia is not supported in this browser");
  }
  }

let intervalIdSimulate
function updateTutData(num){

    tutTextElement.textContent = tutData[num][0]
    
    if(tutData[num][1] !== null){
      targetElem = tutData[num][1]
      targetElemPos = targetElem.getBoundingClientRect()
      offsetWidthFactor = tutData[num][2]
      offsetHeightFactor = tutData[num][3]
      tutContent.style.top = targetElemPos.top + (targetElem.offsetHeight * offsetHeightFactor) + "px"
      tutContent.style.left = targetElemPos.left + (targetElem.offsetWidth * offsetWidthFactor) + "px"
    }
  
    

    tutDataLength = Object.keys(tutData).length;


    // if (dialogueCount == tutDataLength){
    //   tutNextElement.style.opacity = 0.5
    //   tutNextElement.style.pointerEvents = "none"
    // }else{
    //   tutNextElement.style.opacity = 1
    //   tutNextElement.style.pointerEvents = "all"
    // }

    if (dialogueCount - 1== 0){
      tutPrevElement.style.opacity = 0.5
      tutPrevElement.style.pointerEvents = "none"
    }else{
      tutPrevElement.style.opacity = 1
      tutPrevElement.style.pointerEvents = "all"
    }


    if (dialogueCount == 4){
      requestMicAccess()
    }

    if (dialogueCount == 5){
      intervalIdSimulate = simulateBlink()
    }
    else{
      simulateStopBlink(intervalIdSimulate);
    }

    if (dialogueCount == 6){
      exampleResults()
      scenarioViewElement.style.display = 'none'
      scenarioResultsElement.style.display = 'block'
    }

    if (dialogueCount == tutDataLength){


// Get the button element
var button = tutNextElement

button.textContent = "Super!"

// Clone the button without its event listeners
var newButton = button.cloneNode(true);

// Replace the original button with the cloned one
button.parentNode.replaceChild(newButton, button);

// Add a new event listener to the button
newButton.addEventListener('click', function() {
    scenarioResultsElement.style.display = "none"
    scenarioViewElement.style.display = 'block'
    tutContent.style.display = 'none'
    overlay.style.display = "none"
});


        tutNextElement.style.display = "none"
        tutPrevElement.style.display = "none"
    }

}

function exampleResults(){
  populateAttitudeChart(example_sentiments);
  populateToneChart(example_tone_data);
}


function nextTut(){
    dialogueCount += 1
    updateTutData(dialogueCount)
}

function prevTut(){
  dialogueCount -= 1
  updateTutData(dialogueCount)
}


function populatePaceBar(value) {
  // Calculate the percentage
  var percentage = value * 100;

  // Update the progress bar width and text
  var progressBar = document.getElementById('progress-bar-pace');
  progressBar.style.width = percentage + '%';
  progressBar.innerText = (percentage/10).toFixed(1) + '/10';  // Display value out of 10
}


function populateDictionBar(value) {
  // Calculate the percentage
  var percentage = value * 100;

  // Update the progress bar width and text
  var progressBar = document.getElementById('progress-bar-diction');
  progressBar.style.width = percentage + '%';
  progressBar.innerText = (percentage/10).toFixed(1) + '/10';  // Display value out of 10
}

