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

function grayOutSentimentsProgressContainer() {
    const container = document.getElementById('sentiments-progress-container');
    container.innerHTML = '<p>No sentiment analysis data available</p>';
    container.style.opacity = '0.5';
    container.style.backgroundColor = '#f4f5f7';
    container.style.color = '#8898aa';
    container.style.textAlign = 'center';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';
}




// ------------------------------------------

function fetchPaceData() {
    // Adjust to fetch from the new endpoint that serves the latest pace data
    return fetch('/api/latest_pace_data', {
        method: 'GET'
    }) 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        return data; // This is the pace data we will use to plot the graph
    });
}


function populatePaceChartInLessons(paceData) {
    var ctx2 = document.getElementById("wave-placeholder").getContext("2d");
    if (window.paceChart) {
        window.paceChart.destroy(); // Destroy existing chart instance if present
    }

    var gradientStroke1 = ctx2.createLinearGradient(0, 230, 0, 50);
    gradientStroke1.addColorStop(1, 'rgba(203,12,159,0.2)');
    gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke1.addColorStop(0, 'rgba(203,12,159,0)'); // Purple colors

    var gradientStroke2 = ctx2.createLinearGradient(0, 230, 0, 50);
    gradientStroke2.addColorStop(1, 'rgba(20,23,39,0.2)');
    gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); // Purple colors

    paceChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: ["0:00", "0:05", "0:10", "0:15", "0:20", "0:25", "0:30", "0:35", "0:40"],
            datasets: [{
                    label: "Pitch",
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0,
                    borderColor: "#cb0c9f",
                    borderWidth: 3,
                    backgroundColor: gradientStroke1,
                    fill: true,
                    data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                    maxBarThickness: 6
                },
                {
                    label: "Volume",
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0,
                    borderColor: "#575f9a",
                    borderWidth: 3,
                    backgroundColor: gradientStroke2,
                    fill: true,
                    data: [30, 90, 40, 140, 290, 290, 340, 230, 400],
                    maxBarThickness: 6
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
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

// Example usage
document.addEventListener('DOMContentLoaded', function() {
    populatePaceChartInLessons(); // Call this function where it fits in your logic
});
