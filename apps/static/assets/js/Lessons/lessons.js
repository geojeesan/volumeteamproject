document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const wavePlaceholder = document.getElementById('wave-graph-placeholder');
  
    analyzeBtn.addEventListener('click', function() {
      fetchWaveData();
    });
  
    function fetchWaveData() {
      fetch('/fetch-wave-data', {
        method: 'GET' // or 'POST' if you're sending data to the server
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
      })
      .then(data => {
        updateWaveGraph(data);
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
    }
  
    function updateWaveGraph(data) {
      // Assuming 'data' is the necessary information to render the graph
      // You would use a library like Chart.js or similar to create the graph
      // For example, if using Chart.js, you would initialize a new chart here
      // The actual implementation will depend on the data format and the library used
      wavePlaceholder.textContent = JSON.stringify(data); // Placeholder for actual graph rendering
    }
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    // Fetch the lessons data when the document is loaded
    fetch('/api/lessons')
      .then(response => response.json())
      .then(lessonsData => {
        // Assume you have a div with id 'lessons-container' to hold the lessons
        const lessonsContainer = document.getElementById('lessons-container');
        lessonsData.forEach(lesson => {
          const lessonElement = document.createElement('div');
          lessonElement.innerHTML = `
            <h5>${lesson.title}</h5>
            <img src="${lesson.image_path}" alt="Image for ${lesson.title}">
            <p>${lesson.description}</p>
          `;
          lessonsContainer.appendChild(lessonElement);
        });
      })
      .catch(error => console.error('Error fetching lessons:', error));
  });
  