let lastAccessedLessonId = null;

document.addEventListener('DOMContentLoaded', function() {
    fetchLastLesson().then(() => {
        fetchAllLessons();
        updateLessonsCompletion();
        updateSkillProgressBars();
    });

    const analyzeProgressBtn = document.getElementById('analyze-btn');
    if (analyzeProgressBtn) {
        analyzeProgressBtn.addEventListener('click', function() {
            // Placeholder for functionality, e.g., submitting audio for analysis
            console.log('Analyze button clicked');
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
            // Logic to go to the next scenario or complete the lesson
            goToNextScenario();
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
        if (data.lastAccessed && Object.keys(data.lastAccessed).length !== 0) {
            updateLastAccessedLessonUI(data.lastAccessed);
        } else if (data.message) {
            // Handle the case with no last accessed lesson more gracefully
            console.log(data.message);
            // Optionally, update the UI to reflect that no last lesson is available
            // showNoLastAccessedLessonMessage();
        }
    } catch (error) {
        console.error('Error fetching last accessed lesson:', error);
        // showErrorFetchingLastAccessedLesson(); for handling unexpected errors
    }
}


function updateLastAccessedLessonUI(lesson) {
    lastAccessedLessonId = lesson.id;
    const lessonTitle = document.getElementById('lesson-title');
    const lessonImage = document.getElementById('lesson-image');
    const lessonDescriptionText = document.getElementById('lesson-description'); // Add this line
    const lessonProgress = document.getElementById('lesson-progress'); // Add this line
    const lessonDifficulty = document.getElementById('lesson-difficulty'); // Add this line
    const continueLessonBtn = document.getElementById('continue-lesson');
    lessonTitle.textContent = lesson.title;
    lessonImage.src = lesson.image_path;
    lessonImage.alt = `Image for ${lesson.title}`;
    lessonDescriptionText.textContent = lesson.description; // Add this line
    lessonProgress.textContent = `Progress: ${lesson.progress}%`; // Add this line
    lessonDifficulty.textContent = lesson.difficulty; // Add this line
    lessonDifficulty.className = `badge badge-${lesson.difficulty}`; // Add this line
    continueLessonBtn.textContent = 'Continue Lesson';
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
    // The check to not display the last accessed lesson is removed
    const lessonElement = document.createElement('div');
    lessonElement.className = 'lesson';
    lessonElement.innerHTML = `
    <div class="lesson-card">
        <h5>${lesson.title}</h5>
        <img src="${lesson.image_path}" alt="Image for ${lesson.title}" style="max-width: 100px; max-height: 100px; height: auto; width: auto; display: block; margin: 0 auto;">
        <p>${lesson.description}</p>
        <span class="badge badge-${lesson.difficulty}">${lesson.difficulty}</span>
        <p>Progress: ${lesson.progress}%</p>
        <button class="btn ${lesson.in_progress ? 'btn-primary' : 'btn-secondary'}" data-lesson-id="${lesson.id}">
        ${lesson.in_progress ? 'Continue Lesson' : `Start ${lesson.title} Lesson`}
        </button>
    </div>
`;
    lessonsContainer.appendChild(lessonElement);
    const button = lessonElement.querySelector('button');
    button.addEventListener('click', () => {
        window.location.href = `/practice/${lesson.num}`;
    });
}

function updateProgressBars(lessonDetails) {
    // Your logic to update the progress bars goes here
    console.log('Updating progress bars with data:', lessonDetails);
    // Example: document.getElementById('confidence-progress').style.width = `${lessonDetails.confidenceScore}%`;
}

function updateLastAccessedLessonUI(lesson) {
    // Implement how you want to display the last accessed lesson
    console.log('Last Accessed Lesson:', lesson);
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
            if (completionPercentageElement && typeof data.completionPercentage === 'number') {
                completionPercentageElement.textContent = `Lessons Completed: ${data.completionPercentage}%`;
            } else {
                console.error('Invalid completion percentage data.');
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
            Object.entries(skillProgress).forEach(([skill, progress]) => {
                const progressBar = document.getElementById(`${skill}-progress`);
                if (progressBar) {
                    progressBar.style.width = `${progress}%`; // Ensure this line works
                    progressBar.setAttribute('aria-valuenow', progress); // Accessibility
                    progressBar.textContent = `${progress}%`; // Optional: Shows text inside the bar
                }
            });
        })
        .catch(error => {
            console.error('Error fetching skill progress:', error);
        });
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