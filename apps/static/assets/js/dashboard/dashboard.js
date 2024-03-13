    resultElement = document.getElementById("result");
    inputElement = document.getElementById("score");

    document.addEventListener('DOMContentLoaded', function() {
        fetchEvents();
    });
    
function fetchEvents() {
    fetch('/api/index/events')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const eventsContainer = document.getElementById('events-container');
        let eventsHtml = '';
        data.events.forEach(event => {
            eventsHtml += `
                <div class="timeline-block mb-3">
                    <span class="timeline-step">
                        <i class="ni ni-bell-55 text-success text-gradient"></i>
                    </span>
                    <div class="timeline-content">
                        <h6 class="text-dark text-sm font-weight-bold mb-0">${event.name.text}</h6>
                        <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">Date: ${event.start.local}, Time: ${event.start.local}</p>
                        <p class="text-secondary text-xs mt-1 mb-0">${event.description.text}</p>
                        <a href="${event.url}" target="_blank">Event Details</a>
                    </div>
                </div>
            `;
        });
        eventsContainer.innerHTML = eventsHtml;
    })
    .catch(error => {
        console.error('Error fetching events:', error);
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = '<p>Error fetching events. Please try again later.</p>';
    });
}

    
    Chart.defaults.font.family = 'Roboto'; // Set the font family globally
    Chart.defaults.color = '#353B3C'; // Set the global font color

    const progressCtx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(progressCtx, {
      type: 'bar',
      data: {
        labels: ['Clear Diction', 'Emotional Expression', 'Tone Consistency', 'Pace Regulation'],
        datasets: [{
          label: 'Current Progress',
          data: [65, 59, 80, 81], // Replace these numbers with your actual data
          backgroundColor: '#D56565',
          borderWidth: 0,
          borderRadius: 10, // Rounded corners for the bars (Chart.js 3.x and newer)
        }, {
          label: 'Goal',
          data: [85, 90, 100, 100], // Replace these numbers with your actual data
          backgroundColor: '#BADFF2',
          borderWidth: 0,
          borderRadius: 10, // Rounded corners for the bars (Chart.js 3.x and newer)
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 14, // You can adjust the size here
              },
              color: '#353B3C', // Y-axis ticks color
            }
          },
          x: {
            ticks: {
              font: {
                size: 14, // You can adjust the size here
              },
              color: '#353B3C', // X-axis ticks color
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14, // Legend font size
              },
              color: '#353B3C', // Legend font color
            }
          },
        }
      }
    });

const scoresCtx = document.getElementById('testScoresChart').getContext('2d');
const scoresChart = new Chart(scoresCtx, {
  type: 'line',
  data: {
    labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'],
    datasets: [{
      label: 'Test Scores',
      data: [45, 67, 71, 82, 90],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var images = [
    url_for('static', filename='img/logos/interview.svg'),
    url_for('static', filename='img/logos/microphone.svg'),
    url_for('static', filename='img/logos/speech-bubble.svg'),
    url_for('static', filename='img/logos/agree (1).svg'),
  ];

  // Choose a random image from the array
  var randomImage = images[Math.floor(Math.random() * images.length)];

  // Find the image by ID and change its source to the random one
  var imgElement = document.getElementById('dynamicSticker');
  if(imgElement) {
    imgElement.src = randomImage;
  } else {
    console.error('No element with the ID dynamicSticker was found.');
  }
}); 