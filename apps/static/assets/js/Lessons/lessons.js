let lastAccessedLessonId = null;

document.addEventListener('DOMContentLoaded', function() {
    fetchLastLesson().then(() => { // We don't use 'data' since 'fetchLastLesson' handles updates internally
        fetchAllLessons();
        updateLessonsCompletion();
        updateSkillProgressBars();
    }).catch(error => {
        console.error('Failed to fetch the last lesson:', error);
        grayOutLastAccessedLessonCard();
    });

    const analyzeProgressBtn = document.getElementById('analyze-btn');
    if (analyzeProgressBtn) {
        analyzeProgressBtn.addEventListener('click', function() {
            console.log('Analyze button clicked');
            // Add functionality for analyze progress button here
        });
    }

    const startLessonBtn = document.getElementById('start-confidence-boost');
    if (startLessonBtn) {
        startLessonBtn.addEventListener('click', function() {
            const lessonTitle = 'Confidence Boost';
            window.location.href = `/practice?lesson_title=${encodeURIComponent(lessonTitle)}`;
        });
    }

    const nextScenarioBtn = document.getElementById('next-scenario-btn');
    if (nextScenarioBtn) {
        nextScenarioBtn.addEventListener('click', function() {
            // Add functionality for next scenario button here
            console.log('Next scenario button clicked');
        });
    }
});

async function fetchLastLesson() {
    try {
        const response = await fetch('/api/lessons/status', { method: 'GET' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.lastAccessed) {
            const isInProgress = data.lastAccessed.progress > 0 && data.lastAccessed.progress < 100;
            updateLastAccessedLessonUI(data.lastAccessed, isInProgress);
        } else {
            grayOutLastAccessedLessonCard();
        }
    } catch (error) {
        console.error('Error fetching last accessed lesson:', error);
        grayOutLastAccessedLessonCard();
    }
}




function updateLastAccessedLessonUI(lesson, isInProgress) {
    const lessonTitle = document.getElementById('lesson-title');
    const lessonImage = document.getElementById('lesson-image');
    const lessonDescription = document.getElementById('lesson-description');
    const lessonDifficulty = document.getElementById('lesson-difficulty');
    const lessonProgress = document.getElementById('lesson-progress');
    const continueLessonBtn = document.getElementById('continue-lesson');
    const card = document.querySelector('.card.mb-4.text-center');

    if (lesson) {
        // Update the UI with the lesson details
        lastAccessedLessonId = lesson.id;
        lessonTitle.textContent = lesson.title;
        lessonImage.src = lesson.image_path;
        lessonImage.alt = `Image for ${lesson.title}`;
        lessonImage.style.display = 'block';
        lessonDescription.textContent = lesson.description;
        lessonDescription.style.display = 'block';
        lessonProgress.textContent = `Progress: ${lesson.progress}%`;
        lessonProgress.style.display = 'block';
        lessonDifficulty.textContent = lesson.difficulty;
        lessonDifficulty.className = `badge badge-${lesson.difficulty}`;
        lessonDifficulty.style.display = 'inline-block';

        if (isInProgress) {
            continueLessonBtn.classList.add('btn-primary');
            continueLessonBtn.classList.remove('btn-secondary');
            continueLessonBtn.textContent = 'Continue Lesson';
            continueLessonBtn.onclick = function() {
                // Fetch the next incomplete scenario
                fetch(`/api/lessons/${lastAccessedLessonId}/next_scenario_after_last_completed`)
                    .then(response => response.json())
                    .then(data => {
                        if(data.lesson_num && data.scenario_id) {
                            // If we have an ID, redirect to the scenario

                            window.location.href = `/practice/${data.lesson_num}-${data.scenario_id}`;
                        } else {
                            // Handle the case where no more scenarios are incomplete
                            console.log(data.message);
                            // Optionally, redirect to the lesson summary or another appropriate place
                            // window.location.href = `/lesson_summary/${lastAccessedLessonId}`;
                        }
                    })
                    .catch(error => console.error('Error fetching the next scenario:', error));
            };
        } else {
            continueLessonBtn.classList.add('btn-secondary');
            continueLessonBtn.classList.remove('btn-primary');
            continueLessonBtn.textContent = 'Start Lesson';
            continueLessonBtn.onclick = function() {
                window.location.href = `/practice/${lastAccessedLessonId}`;
            };
        }
        continueLessonBtn.style.display = 'block';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        card.style.filter = 'none';
        card.style.background = '#fff';
    } else {
        // Gray out the card to indicate no lesson is ongoing
        grayOutLastAccessedLessonCard();
    }
}

function grayOutLastAccessedLessonCard() {
    const card = document.querySelector('.card.mb-4.text-center'); // Add a more specific selector if necessary
    const lessonTitle = document.getElementById('lesson-title');
    const lessonImage = document.getElementById('lesson-image');
    const lessonDescription = document.getElementById('lesson-description');
    const lessonDifficulty = document.getElementById('lesson-difficulty');
    const lessonProgress = document.getElementById('lesson-progress');
    const continueLessonBtn = document.getElementById('continue-lesson');

    // Update the UI to show that no lesson is ongoing
    lessonTitle.textContent = 'No ongoing lessons';
    lessonImage.style.display = 'none';
    lessonDescription.style.display = 'none';
    lessonDifficulty.style.display = 'none';
    lessonProgress.style.display = 'none';
    continueLessonBtn.style.display = 'none';

    // Gray out the card
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
    card.style.filter = 'grayscale(100%)';
    card.style.background = '#f4f5f7'; // This sets the background color to a light grey
}

async function fetchAllLessons() {
    try {
        const response = await fetch('/api/lessons', { method: 'GET' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lessons = await response.json();
        if (Array.isArray(lessons)) {
            displayLessons(lessons);
        } else {
            console.error('Fetched lessons data is not an array.');
        }
    } catch (error) {
        console.error('Error fetching lessons:', error);
    }
}


function displayLessons(lessons) {
    const lessonsContainer = document.getElementById('lessons-display');
    lessonsContainer.innerHTML = ''; // Clear previous lessons
    lessons.forEach(lesson => { // Iterate through each lesson
        displayLesson(lesson, lessonsContainer);
    });
}

function displayLesson(lesson, lessonsContainer) {
  // Assume that you want to link to the first scenario for simplicity
  // You should implement the logic to find the next incomplete scenario if required
  const firstScenarioId = lesson.scenarios && lesson.scenarios.length > 0 ? lesson.scenarios[0].id : 1;

  const lessonElement = document.createElement('div');
  lessonElement.className = 'lesson';
  lessonElement.innerHTML = `
      <div class="lesson-card">
          <h5>${lesson.title}</h5>
          <img src="${lesson.image_path}" alt="Image for ${lesson.title}" style="max-width: 100px; max-height: 100px; height: auto; width: auto; display: block; margin: 0 auto;">
          <p>${lesson.description}</p>
          <span class="badge badge-${lesson.difficulty}">${lesson.difficulty}</span>
          <p>Progress: ${lesson.progress}%</p>
          <button class="btn ${lesson.in_progress ? 'btn-primary' : 'btn-secondary'}" data-lesson-id="${lesson.id}" data-lesson-num="${lesson.num}" data-scenario-id="${firstScenarioId}">
              ${lesson.in_progress ? 'Continue Lesson' : `Start ${lesson.title} Lesson`}
          </button>
      </div>
  `;
  lessonsContainer.appendChild(lessonElement);

  const button = lessonElement.querySelector('button');
  button.addEventListener('click', () => {
      // Redirect to the first scenario of this lesson
      window.location.href = `/practice/${lesson.num}-${firstScenarioId}`;
  });
}




function updateSkillProgressBars() {
    fetch('/api/skill_progress')
        .then(response => response.json())
        .then(skillProgress => {
            // Clear existing bars
            const progressBarContainer = document.getElementById('progress-bar-container');
            progressBarContainer.innerHTML = ''; // Adjust this to your actual container for progress bars

            // Create a progress bar for each top sentiment
            Object.entries(skillProgress).forEach(([sentiment, progress]) => {
                const bar = document.createElement('div');
                bar.className = 'progress-bar';
                bar.style.width = `${progress}%`; // Adjust styles as needed
                bar.textContent = `${sentiment}: ${progress.toFixed(2)}%`;
                progressBarContainer.appendChild(bar); // Append the new bar to the container
            });
        })
        .catch(error => {
            console.error('Error fetching skill progress:', error);
        });
}



function updateLessonsCompletion() {
    fetch('/api/lessons/completion', { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const completionPercentageElement = document.getElementById('lessons-completion-percentage');
            // Check if completionPercentageElement exists, without checking the value
            if (completionPercentageElement) {
                completionPercentageElement.textContent = `Lessons Completed: ${data.completionPercentage}%`;
            } else {
                // Log an error if the element is not found
                console.error('Completion percentage element not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching lessons completion:', error);
        });
}



function updateSkillProgressBars() {
    fetch('/api/skill_progress')
        .then(response => response.json())
        .then(skillProgress => {
            const container = document.getElementById('sentiments-progress-container');
            container.innerHTML = ''; // Clear any existing content

            const entries = Object.entries(skillProgress);
            if (entries.length === 0) {
                // Handle the case where there's no sentiment data
                grayOutSentimentsProgressContainer();
            } else {
                entries.forEach(([sentiment, progress]) => {
                    // Create and append sentiment progress bars as before
                    const label = document.createElement('div');
                    label.textContent = `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}:`;
                    label.className = 'progress-label';
                    container.appendChild(label);

                    const progressBarContainer = document.createElement('div');
                    progressBarContainer.className = 'progress';

                    const progressBar = document.createElement('div');
                    progressBar.className = 'progress-bar';
                    progressBar.style.width = `${progress}%`;
                    progressBar.setAttribute('aria-valuenow', progress);
                    progressBar.setAttribute('aria-valuemin', '0');
                    progressBar.setAttribute('aria-valuemax', '100');
                    progressBar.textContent = `${progress.toFixed(2)}%`;

                    progressBarContainer.appendChild(progressBar);
                    container.appendChild(progressBarContainer);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching skill progress:', error);
            grayOutSentimentsProgressContainer();
        });
}


// ------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    fetchSentimentSkillDataAndPopulateChart();
});

function fetchSentimentSkillDataAndPopulateChart() {
    fetch('/api/skill_progress', {
        method: 'GET',
        credentials: 'include', // Ensure cookies for session management are included with the request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => populateSentimentSkillChart(data))
    .catch(error => console.error('Failed to fetch sentiment skill data:', error));
}

function populateSentimentSkillChart(sentimentData) {
    var ctx = document.getElementById("sentimentSkillChart").getContext("2d");
    var labels = Object.keys(sentimentData);
    var data = Object.values(sentimentData);

    // Check if data is not available and gray out the chart
    if (labels.length === 0 || data.every(value => value === 0)) {
        // If there are no labels or all data points are 0, consider it as no data
        grayOutChartArea();
        return; // Exit the function early as there's nothing to draw on the chart
    }

    // Check if the chart instance already exists and has the destroy method
    if (window.sentimentSkillChart && typeof window.sentimentSkillChart.destroy === 'function') {
        window.sentimentSkillChart.destroy();
    }

    window.sentimentSkillChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sentiment Skill Level',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                data: data
            }]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 100 // Assuming the skill level is scaled up to 100
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function grayOutChartArea() {
    const canvas = document.getElementById("sentimentSkillChart");
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement; // Get the parent container of the canvas

    // Match the canvas dimensions to the parent container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Fill the canvas with a light gray color
    ctx.fillStyle = '#f4f5f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the text style
    ctx.font = "16px Arial";
    ctx.fillStyle = '#8898aa';
    ctx.textAlign = "center";

    // Display the 'no data' message
    ctx.fillText("No sentiment analysis data available", canvas.width / 2, canvas.height / 2);
}

function grayOutSentimentsProgressContainer() {
    const container = document.getElementById('sentiments-progress-container');
    container.innerHTML = '<p>No sentiment analysis data available</p>';
    
    // Set container styles
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.opacity = '0.5';
    container.style.backgroundColor = '#f4f5f7';
    container.style.color = '#8898aa';
    container.style.textAlign = 'center';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';

    // Center the content vertically
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
}

