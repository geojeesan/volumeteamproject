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
    fetch('/user-progress')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);

            document.getElementById('lessons-completed').textContent = data.lessons_completed;
            document.getElementById('lessons-in-progress').textContent = data.lessons_in_progress;
            document.getElementById('level_progress').textContent = data.level_progress.toFixed(0) + '%';

            // Clear previous content and create level badge
            const levelBadgeContainer = document.getElementById('user-level-badge');
            levelBadgeContainer.innerHTML = '';
            const levelBadge = document.createElement('span');
            levelBadge.className = `badge-card badge-card-${data.current_level}`;
            levelBadge.textContent = data.current_level.charAt(0).toUpperCase() + data.current_level.slice(1);
            levelBadgeContainer.appendChild(levelBadge);

            // Clear previous content and create streak badge with icon
            const streakBadgeContainer = document.getElementById('user-streak-badge');
            streakBadgeContainer.innerHTML = '';
            const streakBadge = document.createElement('span');
            streakBadge.className = 'badge-card badge-card-streak';
            streakBadgeContainer.appendChild(streakBadge);

          

            // Create and append streak text to streak badge
            const streakText = document.createTextNode(` Streak: ${data.streak}`);
            streakBadge.appendChild(streakText);

            const fireIcon = document.createElement('i');
            fireIcon.className = 'fas fa-fire';
            streakBadge.appendChild(fireIcon);
        })
        .catch(error => {
            console.error('Error fetching user progress:', error);
        });
});


document.addEventListener('DOMContentLoaded', function() {
  fetch('/leaderboard')
    .then(response => response.json())
    .then(leaderboardData => {
      const leaderboardBody = document.getElementById('leaderboard-body');
      leaderboardBody.innerHTML = ''; // Clear previous content

      // Ensure we always have 6 rows in the leaderboard
      const numberOfRows = 6;
      for (let i = 0; i < numberOfRows; i++) {
        const row = leaderboardBody.insertRow();

        // Assign rank to the rankCell
        const rankCell = row.insertCell();
        const rankText = leaderboardData[i] ? leaderboardData[i].rank : i + 1;
        rankCell.textContent = rankText;

        // Assign username to the usernameCell
        const usernameCell = row.insertCell();
        usernameCell.textContent = leaderboardData[i] ? leaderboardData[i].username : '-';

        // Assign score to the scoreCell
        const scoreCell = row.insertCell();
        scoreCell.textContent = leaderboardData[i] ? leaderboardData[i].score : '-';

        // Assign level to the levelCell
        const levelCell = row.insertCell();
        levelCell.textContent = leaderboardData[i] ? leaderboardData[i].level : '-';

        // Assign progress to the progressCell
        const progressCell = row.insertCell();
        progressCell.textContent = leaderboardData[i] ? `${leaderboardData[i].level_progress}%` : '-';
      }
    })
    .catch(error => {
      console.error('Error loading leaderboard:', error);
    });
});


document.addEventListener('DOMContentLoaded', function() {
  // Fetch user progress and leaderboard data simultaneously
  Promise.all([
    fetch('/user-progress').then(response => response.json()),
    fetch('/leaderboard').then(response => response.json())
  ]).then(([userData, leaderboardData]) => {
    // ... (handle the userData as before, including level and streak badges)
    
    // Process leaderboard data to find the current user's rank
    const currentUserRankEntry = leaderboardData.find(entry => entry.username === userData.current_username);
    const currentUserRank = currentUserRankEntry ? currentUserRankEntry.rank : '-';
    
    // Display rank badge
    const rankBadgeContainer = document.getElementById('user-rank-badge');
    rankBadgeContainer.innerHTML = ''; // Clear previous content

    const rankBadge = document.createElement('span');
    rankBadge.className = 'badge-card badge-card-rank';
    rankBadge.textContent = `Rank: ${currentUserRank}`;
    rankBadgeContainer.appendChild(rankBadge);

    // Additional code for displaying 1st and 2nd rank badges, if applicable
    if (currentUserRankEntry && currentUserRank <= 3) {
      const rankBadgeImage = document.createElement('img');
      rankBadgeImage.src = `/static/assets/img/${['gold', 'silver', 'bronze'][currentUserRank - 1]}Badge.svg`;
      rankBadgeImage.alt = `Rank ${currentUserRank}`;
      rankBadgeImage.className = 'badge-icon';
      rankBadgeContainer.insertBefore(rankBadgeImage, rankBadge);
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
});

// dashboard.js

document.addEventListener('DOMContentLoaded', function() {
  const notesTextarea = document.getElementById('personal-notes');
  const saveNotesButton = document.getElementById('save-notes-btn');

  // Function to fetch notes and display them
  function fetchNotes() {
    fetch('/get-notes')
      .then(response => response.json())
      .then(data => {
        notesTextarea.value = data.content;
      })
      .catch(error => console.error('Error fetching notes:', error));
  }

  // Function to save notes
  function saveNotes() {
    const content = notesTextarea.value;
    fetch('/save-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other necessary headers like authentication tokens
      },
      body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      // Show a success message to the user if needed
    })
    .catch(error => {
      console.error('Error saving notes:', error);
      // Show an error message to the user if needed
    });
  }

  // Load the notes when the page is loaded
  fetchNotes();

  // Add event listener to the save button
  saveNotesButton.addEventListener('click', saveNotes);
});

document.addEventListener('DOMContentLoaded', function() {
  fetchAndDisplayUserActions();
});

function fetchAndDisplayUserActions() {
  fetch('/user-actions') // Adjust the endpoint as necessary
      .then(response => response.json())
      .then(actions => {
          const recentActivityContainer = document.getElementById('recent-activity-container');
          recentActivityContainer.innerHTML = ''; // Clear previous content
          actions.forEach(action => {
              const actionElement = document.createElement('div');
              actionElement.classList.add('d-flex', 'align-items-start', 'mb-2'); // Add spacing between items
              actionElement.innerHTML = `
            <div class="card-body p-3">
              <div class="timeline timeline-one-side">
                  <div class="timeline-block mb-0">
                      <span class="timeline-step">
                          <i class="fas fa-user-edit text-info"></i> <!-- Adjust icon as necessary -->
                      </span>
                      <div class="timeline-content">
                          <h6 class="text-dark text-sm font-weight-bold mb-0">${action.action}</h6>
                          <p class="text-secondary text-xs mt-1 mb-0">${action.timestamp}</p>
                      </div>
                  </div>
                </div>
              </div>
              `;
              recentActivityContainer.appendChild(actionElement);
          });
      })
      .catch(error => console.error('Error loading user actions:', error));
}
