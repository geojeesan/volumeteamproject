let lastAccessedLessonId = null;

// document.addEventListener('DOMContentLoaded', function() {
//     fetchLastLesson().then(() => {
//     fetchAllLessons();
//     populatePaceChartInLessons();
//     });
//     // Initialize fetchWaveData if needed
//     const analyzeProgressBtn = document.getElementById('analyze-btn');
//     analyzeProgressBtn.addEventListener('click', function() {
//         fetchWaveData();
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    const analyzeProgressBtn = document.getElementById('analyze-btn');

    fetchLastLesson().then(() => {
        fetchAllLessons();
        updateLessonsCompletion(); // Add this to update the completion percentage
        updateSkillProgressBars();
        analyzeProgressBtn.disabled = false;
        
        analyzeProgressBtn.addEventListener('click', function() {
            fetchPaceData().then(paceData => {
                populatePaceChartInLessons(paceData);
            });
        });
    });
    
    const startLessonBtn = document.getElementById('start-confidence-boost');
    if (startLessonBtn) { // Check if the button exists
        startLessonBtn.addEventListener('click', function() {
            const lessonTitle = 'Confidence Boost';
            window.location.href = `/practice?lesson_title=${encodeURIComponent(lessonTitle)}`;
        });
    }
});


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
    // Your existing code
    // Initialize the pace chart for a lesson after fetching details or when needed
    populatePaceChartInLessons(); // Call this function where it fits in your logic
});

function fetchLastLesson() {
    // Return the promise chain here
    return fetch('/api/lessons/status') // This endpoint should return the last accessed lesson
        .then(response => response.json())
        .then(data => {
            if (data.lastAccessed) {
                updateLastAccessedLessonUI(data.lastAccessed);
                // Set the last accessed lesson ID
                lastAccessedLessonId = data.lastAccessed.id;
            }
        })
        .catch(error => {
            console.error('Error fetching last accessed lesson:', error);
        });
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


function fetchAllLessons() {
    fetch('/api/lessons') // This endpoint returns all lessons
        .then(response => response.json())
        .then(lessons => {
            lessons.forEach(lesson => {
                displayLesson(lesson);
            });
        })
        .catch(error => {
            console.error('Error fetching lessons:', error);
        });
}

function displayLesson(lesson) {
    if (lesson.id === lastAccessedLessonId) {
        // Do not display this lesson in the list
        return;
    }


    const lessonContainer = document.getElementById('lessons-display');
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
    lessonContainer.appendChild(lessonElement);
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

function updateLessonsCompletion() {
    fetch('/api/lessons/completion')
        .then(response => response.json())
        .then(data => {
            const completionElement = document.getElementById('lessons-completion-percentage');
            completionElement.textContent = `${data.completionPercentage.toFixed(0)}%`; // Rounds to nearest whole number
            // Here you can also update a progress bar or similar visual element
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



// function fetchWaveData() {
//     // Your existing logic to fetch wave data
//     console.log('Fetching wave data...');
//     // Simulate fetching wave data
//     setTimeout(() => {
//         console.log('Wave data fetched successfully');
//         // Update your wave graph based on fetched data
//         // updateWaveGraph(waveData); // You'll need to implement updateWaveGraph
//     }, 1000);
// }

// function updateWaveGraph(data) {
//     // Your logic to update the wave graph based on the data
//     console.log('Updating wave graph with data:', data);
//     // Example: document.getElementById('wave-graph').textContent = JSON.stringify(data);
// }
