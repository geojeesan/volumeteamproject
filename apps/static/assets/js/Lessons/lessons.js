let lastAccessedLessonId = null;

document.addEventListener('DOMContentLoaded', function() {
    fetchLastLesson().then(() => {
    fetchAllLessons();
    });
    // Initialize fetchWaveData if needed
    const analyzeProgressBtn = document.getElementById('analyze-btn');
    analyzeProgressBtn.addEventListener('click', function() {
        fetchWaveData();
    });
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
            <button class="btn ${lesson.in_progress ? 'btn-primary' : 'btn-secondary'}">
                ${lesson.in_progress ? 'Continue Lesson' : 'Start Lesson'}
            </button>
        </div>
    `;
    lessonContainer.appendChild(lessonElement);
}

function updateProgressBars(lessonDetails) {
    // Your logic to update the progress bars goes here
    console.log('Updating progress bars with data:', lessonDetails);
    // Example: document.getElementById('confidence-progress').style.width = `${lessonDetails.confidenceScore}%`;
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
