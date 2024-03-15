// Events widget 
document.addEventListener('DOMContentLoaded', function() {

  fetch('/index/upcoming-events')
    .then(response => response.json())
    .then(events => {
      const eventsContainer = document.getElementById('events-container');
      eventsContainer.innerHTML = ''; // Clear previous events
      events.forEach(event => {
        const startDate = new Date(event.start_utc);
        const endDate = new Date(event.end_utc);
      
        const eventElement = document.createElement('div');
        eventElement.className = 'd-flex.align-items-start.mb-3'; // This class is now more specific in the CSS
        eventElement.innerHTML = `
        <div class="card-body p-3">
          <div class="timeline timeline-one-side">
            <div class="timeline-block mb-0">
              <span class="timeline-step">
                <i class="ni ni-bell-55 text-success text-gradient"></i>
              </span>
              <div class="timeline-content">
                <h6 class="text-dark text-sm font-weight-bold mb-0">${event.name}</h6>
                <p class="text-secondary font-weight-bold text-xs mt-1 mb-0"> Date: ${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}, Time: ${startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <p class="text-secondary text-xs mt-1 mb-0">${event.description}</p>
          </div>
        </div>
        `;
        eventsContainer.appendChild(eventElement);
      });
    })
    .catch(error => console.error('Error loading events:', error));
});



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
      data: [0, 2, 3, 5, 10],
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
