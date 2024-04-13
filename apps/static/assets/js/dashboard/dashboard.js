function getLevelBadge(level) {
    let badgeClass = '';
    let levelText = level.charAt(0).toUpperCase() + level.slice(1); // Capitalize the first letter
    switch (level.toLowerCase()) {
      case 'beginner':
        badgeClass = 'badge-level-beginner'; // Unique class for green
        break;
      case 'intermediate':
        badgeClass = 'badge-level-intermediate'; // Unique class for yellow
        break;
      case 'advanced':
        badgeClass = 'badge-level-advanced'; // Unique class for red/orange
        break;
      default:
        badgeClass = 'badge-level'; // Default badge class for undefined levels
        levelText = 'Undefined';
        break;
    }
    return `<span class="badge-level ${badgeClass}">${levelText}</span>`;
  }
  
function formatTimestampToLocal(utcTimestamp) {
    // Create a Date object using the provided UTC timestamp
    const date = new Date(utcTimestamp);
    // Convert to local time string
    return date.toLocaleString();
  }

function followUser(userId) {
  fetch(`/follow/${userId}`, {
    method: 'POST',
    // You might need to include CSRF tokens or other headers depending on your server setup
  })
  .then(response => {
    if (response.ok) {
      location.reload(); // Reload the page to update the state
    } else {
      throw new Error('Failed to follow the user.');
    }
  })
  .catch(error => {
    console.error('Error following user:', error);
    alert('Error following user.');
  });
}

function unfollowUser(userId) {
  fetch(`/unfollow/${userId}`, {
    method: 'POST',
    // You might need to include CSRF tokens or other headers depending on your server setup
  })
  .then(response => {
    if (response.ok) {
      location.reload(); // Reload the page to update the state
    } else {
      throw new Error('Failed to unfollow the user.');
    }
  })
  .catch(error => {
    console.error('Error unfollowing user:', error);
    alert('Error unfollowing user.');
  });
}

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
        // Debug the received data
        console.log(personaData);
      
        // Handle the level icon color
        let levelColorClass = `level-${personaData.level.toLowerCase()}`;
        let levelIcon = document.getElementById('user-level-icon');
        if(levelIcon) {
          levelIcon.classList = `badge-icon ${levelColorClass}`;
        } else {
          console.error('Level icon not found');
        }
      
        // Handle the streak icon color (always orange)
        let streakIcon = document.getElementById('user-streak-icon');
        if(streakIcon) {
          streakIcon.classList = 'badge-icon streak-orange';
        } else {
          console.error('Streak icon not found');
        }
      
        // Handle the rank icon color
        let rankIcon = document.getElementById('user-rank-icon');
        if(rankIcon) {
          let rankColorClass;
          switch (personaData.rank) {
            case 1: rankColorClass = 'rank-gold'; break;
            case 2: rankColorClass = 'rank-silver'; break;
            case 3: rankColorClass = 'rank-bronze'; break;
            default: rankColorClass = 'rank-normal'; break;
          }
          rankIcon.classList = `badge-icon ${rankColorClass}`;
        } else {
          console.error('Rank icon not found');
        }
      
        // Update the text contents
        if(personaData.level) {
          document.getElementById('user-level-text').textContent = personaData.level.charAt(0).toUpperCase() + personaData.level.slice(1);
        }
        if(personaData.streak !== undefined) {
          document.getElementById('user-streak-text').textContent = personaData.streak;
        }
        if(personaData.rank !== undefined) {
          document.getElementById('user-rank-text').textContent = personaData.rank;
        }
      })
      .catch(error => {
        console.error('Error fetching user persona data:', error);
      });
      
      var quillToolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, false] }],  // Heading dropdown with defaults
        [{ 'font': [] }],                             // Font dropdown
        ['bold', 'italic', 'underline', 'strike'],  // Bold, italic, underline, and strike toggle buttons
        [{'list': 'ordered'}, { 'list': 'bullet' }], // Numbered and bullet list toggles
        [{ 'color': [] }, { 'background': [] }],     // Color and background color pickers
        [{ 'align': [] }],                            // Text align toggles
        ['clean']                                     // Remove formatting button
      ];
      
      var quill = new Quill('#editor-container', {
        modules: { toolbar: quillToolbarOptions },
        theme: 'snow'
      });
    

    
      // Load content from server and save it back
      const saveNotesButton = document.getElementById('save-notes-btn');
      
    fetch('/get-notes')
      .then(response => response.json())
      .then(data => {
        if (data.content) {
          // If there are saved notes, set them in the Quill editor
          quill.root.innerHTML = data.content;
        }
      })
      .catch(error => console.error('Error fetching notes:', error));
     
    saveNotesButton.addEventListener('click', function() {
            var content = quill.root.innerHTML; // Get the HTML content from Quill editor
            fetch('/save-notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: content })
            })
            .then(response => response.json())
            .then(data => {
              console.log(data.message); // Log the response for debugging
              // You might want to give user feedback that the notes were saved successfully.
            })
            .catch(error => console.error('Error saving notes:', error));
          });
          
        

  /// Recent Activity: Shows the user's recent actions within the platform
  fetch('/user-actions')
  .then(response => response.json())
  .then(actions => {
      const recentActivityContainer = document.getElementById('recent-activity-container');
      // Clear existing activities
      recentActivityContainer.innerHTML = '';
      actions.forEach(action => {
          // Convert the UTC timestamp to the user's local time
          const localTime = formatTimestampToLocal(action.timestamp);
          const actionElement = document.createElement('div');
          actionElement.classList.add('activity-item');
          actionElement.innerHTML = `
              <div class="activity-time-indicator"></div>
              <div class="activity-content">
                  <h6 class="activity-title">${action.action}</h6>
                  <p class="activity-time">${localTime}</p> <!-- Now shows local time -->
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
  for (let i = 0; i < 10; i++) { // Loop to display 10 ranks
    const row = leaderboardBody.insertRow();
    const rankCell = row.insertCell();
    const user = leaderboardData[i];

    // Check if user data exists for the current rank
    if (user) {
      let badgeHTML; // Define the HTML for the badge or number
      if (i === 0) {
        badgeHTML = '<span class="badge-wrapper"><img src="static/assets/img/goldBadge.svg" class="leaderboard-badge-icon" /><span class="badge-number">1</span></span>';
      } else if (i === 1) {
        badgeHTML = '<span class="badge-wrapper"><img src="static/assets/img/silverBadge.svg" class="leaderboard-badge-icon" /><span class="badge-number">2</span></span>';
      } else if (i === 2) {
        badgeHTML = '<span class="badge-wrapper"><img src="static/assets/img/bronzeBadge.svg" class="leaderboard-badge-icon" /><span class="badge-number">3</span></span>';
      } else {
        badgeHTML = `<span class="centered-rank-number">${i + 1}</span>`;
      }
      rankCell.innerHTML = badgeHTML;

      const usernameCell = row.insertCell();
      usernameCell.textContent = user.username || '-';
      const scoreCell = row.insertCell();
      scoreCell.textContent = user.score || '-';
      const levelCell = row.insertCell();
      levelCell.innerHTML = user.level ? getLevelBadge(user.level) : '<span class="badge-level badge-level-undefined">-</span>';
      const progressCell = row.insertCell();
      progressCell.classList.add('progress-cell'); // Add the class for styling
      const progressValue = user.level_progress || 0;
      progressCell.innerHTML = `
        <div class="progress-chart-container">
          <canvas id="progressChart${i}" class="leaderboard-progress-chart" width="35" height="35"></canvas>
          <span class="progress-percentage">${progressValue}%</span>
        </div>
      `;
      
      // Initialize the progress chart for each user
      const progress = user.level_progress || 0;
      const ctx = document.getElementById('progressChart' + i).getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [progress, 100 - progress],
            backgroundColor: ['#FF6384', '#EEEEEE'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          cutoutPercentage: 70,
          tooltips: { enabled: false },
          hover: { mode: null },
          maintainAspectRatio: false,
          animation: {
            animateRotate: false,
            animateScale: true
          }
        }
      });

    } else {
      rankCell.innerHTML = `<span class="centered-rank-number">${i + 1}</span>`;
      row.insertCell().textContent = '-';
      row.insertCell().textContent = '-';
      row.insertCell().textContent = '-';
      row.insertCell().textContent = '-';
      
    }
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
