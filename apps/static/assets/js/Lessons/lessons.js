document.addEventListener('DOMContentLoaded', function() {
    const analyzeProgressBtn = document.getElementById('analyze-btn'); // Use the correct ID for the "Analyze Progress" button
    const wavePlaceholder = document.getElementById('wave-placeholder'); // Use the correct ID for the wave placeholder
  
    analyzeProgressBtn.addEventListener('click', function() {
      fetchWaveData();
    });
  
    function fetchWaveData() {
      fetch('/fetch-wave-data')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          updateWaveGraph(data);
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    }
  
    function updateWaveGraph(data) {
      // Code to render the wave graph goes here
      // This is a placeholder and should be replaced with actual graph rendering code
      wavePlaceholder.textContent = JSON.stringify(data);
    }
  
    const continueLessonBtn = document.getElementById('continue-lesson'); // Use the correct ID for the "Continue" button
  
    continueLessonBtn.addEventListener('click', function() {
      fetchLessonData();
    });
  
    function fetchLessonData() {
      fetch('/get-lessons')
        .then(response => response.json())
        .then(lessonData => {
            console.log(lessonData)
          updateLessonUI(lessonData);
          
        })
        .catch(error => console.error('Error fetching current lesson:', error));
    }
  
    function updateLessonUI(lesson) {
      // Code to update the UI with the current lesson details goes here
      // Replace the placeholder content with actual lesson data
      const lessonTitle = document.getElementById('lesson-title');
      const lessonImage = document.getElementById('lesson-image');
      const lessonDescription = document.getElementById('lesson-description');
  
      lessonTitle.textContent = lesson.title;
      lessonImage.src = lesson.image_path;
      lessonImage.alt = `Image for ${lesson.title}`;
      lessonDescription.textContent = lesson.description;
    }
  });
  