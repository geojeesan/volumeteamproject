document.addEventListener('DOMContentLoaded', function() {
  // User Progress: Displays user's learning progress, lessons completed, and current level
  fetch('/user-progress')
      .then(response => response.json())
      .then(data => {
        
          document.getElementById('lessons-completed').textContent = data.lessons_completed;
          document.getElementById('lessons-in-progress').textContent = data.lessons_in_progress;
          document.getElementById('level_progress').textContent = data.level_progress.toFixed(0) + '%';
      })
      .catch(error => {
          console.error('Error fetching user progress:', error);
      });

  fetch('/user-persona')
    .then(response => response.json())
    .then(personaData => {
      // Update the content of each badge with the fetched data
      document.getElementById('user-level-text').textContent += personaData.level;
      document.getElementById('user-streak-text').textContent += personaData.streak;
      document.getElementById('user-rank-text').textContent += personaData.rank;

    })
    .catch(error => {
      console.error('Error fetching user persona data:', error);
    });

  // Personal Notes: Allows users to save and fetch personal notes
  const notesTextarea = document.getElementById('personal-notes');
  const saveNotesButton = document.getElementById('save-notes-btn');

  fetch('/get-notes')
      .then(response => response.json())
      .then(data => {
          notesTextarea.value = data.content;
      })
      .catch(error => console.error('Error fetching notes:', error));

  saveNotesButton.addEventListener('click', function() {
      const content = notesTextarea.value;
      fetch('/save-notes', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: content })
      })
      .then(response => response.json())
      .then(data => {
          console.log(data.message);
      })
      .catch(error => {
          console.error('Error saving notes:', error);
      });
  });

  /// Recent Activity: Shows the user's recent actions within the platform
  fetch('/user-actions')
  .then(response => response.json())
  .then(actions => {
      const recentActivityContainer = document.getElementById('recent-activity-container');
      actions.forEach(action => {
          const actionElement = document.createElement('div');
          actionElement.classList.add('activity-item'); // Personalized class for activity items
          actionElement.innerHTML = `
              <div class="activity-time-indicator"></div> <!-- Personalized class for time indicator -->
              <div class="activity-content">
                  <h6 class="activity-title">${action.action}</h6> <!-- Personalized class for titles -->
                  <p class="activity-time">${action.timestamp}</p> <!-- Personalized class for timestamps -->
              </div>`;
          recentActivityContainer.appendChild(actionElement);
      });
  })
  .catch(error => console.error('Error loading user actions:', error));


  // Test Scores Over Time: Visualizes the user's test scores over a period
  var scoresCtx = document.getElementById('testScoresChart').getContext('2d');
  fetch('/test-scores')
      .then(response => response.json())
      .then(data => {
          new Chart(scoresCtx, {
              type: 'line',
              data: data,
              options: {
                  scales: {
                      y: {
                          beginAtZero: true,
                          suggestedMax: 10
                      }
                  },
                  responsive: true,
                  maintainAspectRatio: false
              }
          });
      })
      .catch(error => console.error('Error loading test scores:', error));

  // Leaderboard: Displays a leaderboard of top users based on scores
  fetch('/leaderboard')
      .then(response => response.json())
      .then(leaderboardData => {
          const leaderboardBody = document.getElementById('leaderboard-body');
          for (let i = 0; i < 10; i++) { // Ensure 6 rows
              const row = leaderboardBody.insertRow();
              const rankCell = row.insertCell();
              rankCell.textContent = leaderboardData[i] ? leaderboardData[i].rank : i + 1;
              const usernameCell = row.insertCell();
              usernameCell.textContent = leaderboardData[i] ? leaderboardData[i].username : '-';
              const scoreCell = row.insertCell();
              scoreCell.textContent = leaderboardData[i] ? leaderboardData[i].score : '-';
              const levelCell = row.insertCell();
              levelCell.textContent = leaderboardData[i] ? leaderboardData[i].level : '-';
              const progressCell = row.insertCell();
              progressCell.textContent = leaderboardData[i] ? `${leaderboardData[i].level_progress}%` : '-';
          }
      })
      .catch(error => {
          console.error('Error loading leaderboard:', error);
      });

  // Upcoming Events: Lists upcoming events that users might be interested in
  fetch('/index/upcoming-events')
      .then(response => response.json())
      .then(events => {
          const eventsContainer = document.getElementById('events-container');
          events.forEach(event => {
              const startDate = new Date(event.start_utc);
              const endDate = new Date(event.end_utc);
              const eventElement = document.createElement('div');
              eventElement.className = 'd-flex align-items-start timeline-event-spacing';
              eventElement.innerHTML = `
              <div class="card-body p-1">
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
                  </div>
              </div>`;
              eventsContainer.appendChild(eventElement);
          });
      })
      .catch(error => console.error('Error loading events:', error));
});
