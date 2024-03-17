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
        eventElement.className = 'd-flex align-items-start timeline-event-spacing';
        eventElement.innerHTML = `
        <div class="card-body p-3">
          <div class="timeline timeline-one-side">
            <div class="timeline-block mb-0">
              <span class="timeline-step">
                <i class="ni ni-bell-55 text-success text-gradient"></i>
              </span>
              <div class="timeline-content">
                <h6 class="text-dark text-sm font-weight-bold mb-0">${event.name}</h6>
                <p class="text-secondary font-weight-bold text-xs mt-0 mb-0"> Date: ${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}, Time: ${startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <p class="text-secondary text-xs mt-0 mb-0">${event.description}</p>
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

    document.addEventListener('DOMContentLoaded', function() {
      var scoresCtx = document.getElementById('testScoresChart').getContext('2d');
      var scoresChart;
  
      // Fetch the scores data from the Flask route
      fetch('/test-scores')
          .then(response => response.json())
          .then(data => {
              scoresChart = new Chart(scoresCtx, {
                  type: 'line',
                  data: data,
                  options: {
                      scales: {
                          y: {
                              beginAtZero: true,
                              suggestedMax: 10 // Ensure y-axis goes from 0 to 10

                          }
                      },
                      responsive: true,
                      maintainAspectRatio: false
                  }
              });
          })
          .catch(error => console.error('Error loading test scores:', error));
  });
  

document.addEventListener('DOMContentLoaded', function() {
  // Fetch user progress after DOM content is loaded
  fetch('/user-progress')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {

      // Update placeholders with user progress data
      console.log(data)

      document.getElementById('lessons-completed').textContent = data.lessons_completed;
      document.getElementById('lessons-in-progress').textContent = data.lessons_in_progress;
      //document.getElementById('current-level').textContent = data.current_level;
      document.getElementById('level_progress').textContent = data.level_progress.toFixed(0) + '%'; // toFixed(0) for no decimal places
      // If total practice hours is implemented, update it here
      // document.getElementById('total-practice-hours').textContent = data.total_practice_hours;
    })
    .catch(error => {
      console.error('Error fetching user progress:', error);
      // Handle errors by showing user feedback or a placeholder
    });
});

document.addEventListener('DOMContentLoaded', function() {
  fetch('/leaderboard')
  .then(response => response.json())
  .then(leaderboardData => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = ''; // Clear previous content

    const badges = [
      '/static/assets/img/goldBadge.svg',   // For 1st place
      '/static/assets/img/silverBadge.svg', // For 2nd place
      '/static/assets/img/bronzeBadge.svg'  // For 3rd place
    ];

    // Ensure we always have 6 rows in the leaderboard
    const numberOfRows = 6;
    for (let i = 0; i < numberOfRows; i++) {
      const row = leaderboardBody.insertRow();
      
      const rankCell = row.insertCell();
      // Check if the entry exists and if it's in the top 3 to assign a badge
      if (leaderboardData[i] && i < 3) {
        rankCell.innerHTML = `<div class="badge-container">
                                <img src="${badges[i]}" alt="Badge" class="badge-icon">
                                <span class="badge-number">${i + 1}</span>
                              </div>`;
      } else {
        rankCell.textContent = leaderboardData[i] ? leaderboardData[i].rank : i + 1;
      }

      const usernameCell = row.insertCell();
      usernameCell.textContent = leaderboardData[i] ? leaderboardData[i].username : '-';

      const scoreCell = row.insertCell();
      scoreCell.textContent = leaderboardData[i] ? leaderboardData[i].score : '-';

      const levelCell = row.insertCell();
      levelCell.textContent = leaderboardData[i] ? leaderboardData[i].level : '-';

      const progressCell = row.insertCell();
      progressCell.textContent = leaderboardData[i] ? leaderboardData[i].level_progress + '%' : '-';
    }
  })
  .catch(error => console.error('Error loading leaderboard:', error));
});
