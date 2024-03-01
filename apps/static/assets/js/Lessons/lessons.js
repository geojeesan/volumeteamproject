document.addEventListener('DOMContentLoaded', function() {
    fetchAllLessons();
    fetchLastLesson();
    // Initialize fetchWaveData if needed
    const analyzeProgressBtn = document.getElementById('analyze-btn');
    analyzeProgressBtn.addEventListener('click', function() {
        fetchWaveData();
    });
});

function fetchLastLesson() {
    fetch('/api/lessons/status') // This endpoint should return the last accessed lesson
        .then(response => response.json())
        .then(data => {
            if (data.lastAccessed) {
                updateLastAccessedLessonUI(data.lastAccessed);
            }
        })
        .catch(error => {
            console.error('Error fetching last accessed lesson:', error);
        });
}

function updateLastAccessedLessonUI(lesson) {
    const lessonTitle = document.getElementById('lesson-title');
    const lessonImage = document.getElementById('lesson-image');
    const lessonDescription = document.querySelector('.card.mb-4.text-center .card-body p');
    const continueLessonBtn = document.getElementById('continue-lesson');

    lessonTitle.textContent = lesson.title;
    lessonImage.src = lesson.image_path;
    lessonImage.alt = `Image for ${lesson.title}`;
    lessonDescription.textContent = `Lesson ${lesson.progress}/12`; // Update the lesson progress text as needed
    continueLessonBtn.textContent = 'Continue';
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
    const lessonContainer = document.getElementById('lessons-display');
    const lessonElement = document.createElement('div');
    lessonElement.className = 'lesson';
    lessonElement.innerHTML = `
        <div class="lesson-card">
            <h5>${lesson.title}</h5>
            <img src="${lesson.image_path}" alt="Image for ${lesson.title}" style="max-width: 100%; height: auto;">
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

function fetchWaveData() {
    // Your existing logic to fetch wave data
    console.log('Fetching wave data...');
    // Simulate fetching wave data
    setTimeout(() => {
        console.log('Wave data fetched successfully');
        // Update your wave graph based on fetched data
        // updateWaveGraph(waveData); // You'll need to implement updateWaveGraph
    }, 1000);
}

function updateWaveGraph(data) {
    // Your logic to update the wave graph based on the data
    console.log('Updating wave graph with data:', data);
    // Example: document.getElementById('wave-graph').textContent = JSON.stringify(data);
}
