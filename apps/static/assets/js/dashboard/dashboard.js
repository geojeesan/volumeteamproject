function getLevelBadge(level) {
  let badgeClass = '';
  let levelText = level.charAt(0).toUpperCase() + level.slice(1);
  switch (level.toLowerCase()) {
      case 'beginner':
          badgeClass = 'badge-level-beginner';
          break;
      case 'intermediate':
          badgeClass = 'badge-level-intermediate';
          break;
      case 'advanced':
          badgeClass = 'badge-level-advanced';
          break;
      default:
          badgeClass = 'badge-level';
          levelText = 'Undefined';
          break;
  }
  return `<span class="badge-level ${badgeClass}">${levelText}</span>`;
}

function formatTimestampToLocal(utcTimestamp) {
  const date = new Date(utcTimestamp);
  return date.toLocaleString();
}

document.addEventListener('DOMContentLoaded', function() {
  // Fetches and displays user's learning progress
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

  // Fetches and displays user's persona information
  fetch('/user-persona')
      .then(response => response.json())
      .then(personaData => {
          console.log(personaData);
          let levelColorClass = `level-${personaData.level.toLowerCase()}`;
          let levelIcon = document.getElementById('user-level-icon');
          levelIcon ? levelIcon.classList = `badge-icon ${levelColorClass}` : console.error('Level icon not found');
          let streakIcon = document.getElementById('user-streak-icon');
          streakIcon ? streakIcon.classList = 'badge-icon streak-orange' : console.error('Streak icon not found');
          let rankIcon = document.getElementById('user-rank-icon');
          if (rankIcon) {
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
          document.getElementById('user-level-text').textContent = personaData.level.charAt(0).toUpperCase() + personaData.level.slice(1);
          document.getElementById('user-streak-text').textContent = personaData.streak;
          document.getElementById('user-rank-text').textContent = personaData.rank;
      })
      .catch(error => {
          console.error('Error fetching user persona data:', error);
      });
    
  var quillToolbarOptions = [
      [{ 'header': [1, 2, 3, 4, 5, false] }],
      [{ 'font': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
  ];
    
  var quill = new Quill('#editor-container', {
      modules: { toolbar: quillToolbarOptions },
      theme: 'snow'
  });

  // Fetches and populates user notes into the text editor
  fetch('/get-notes')
      .then(response => response.json())
      .then(data => {
          if (data.content) {
              quill.root.innerHTML = data.content;
          }
      })
      .catch(error => console.error('Error fetching notes:', error));
  
  const saveNotesButton = document.getElementById('save-notes-btn');
  saveNotesButton.addEventListener('click', function() {
      var content = quill.root.innerHTML;
      fetch('/save-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content })
      })
      .then(response => response.json())
      .then(data => {
          console.log(data.message);
      })
      .catch(error => console.error('Error saving notes:', error));
  });

  // Fetches and displays user's recent actions
  fetch('/user-actions')
      .then(response => response.json())
      .then(actions => {
          const recentActivityContainer = document.getElementById('recent-activity-container');
          recentActivityContainer.innerHTML = '';
          actions.forEach(action => {
              const localTime = formatTimestampToLocal(action.timestamp);
              const actionElement = document.createElement('div');
              actionElement.classList.add('activity-item');
              actionElement.innerHTML = `
                  <div class="activity-time-indicator"></div>
                  <div class="activity-content">
                      <h6 class="activity-title">${action.action}</h6>
                      <p class="activity-time">${localTime}</p>
                  </div>`;
              recentActivityContainer.appendChild(actionElement);
          });
      })
      .catch(error => console.error('Error loading user actions:', error));

  // Fetches and visualizes user's test scores over time
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

  // Fetches and displays the leaderboard
  fetch('/leaderboard')
      .then(response => response.json())
      .then(leaderboardData => {
          console.log(leaderboardData);  // Add this line to log the data
          const leaderboardBody = document.getElementById('leaderboard-body');
          for (let i = 0; i < 10; i++) {
              const row = leaderboardBody.insertRow();
              const rankCell = row.insertCell();
              const user = leaderboardData[i];
              if (user) {
                  let badgeHTML;
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
                  usernameCell.innerHTML = user.username ? `<a href="/profilepage/${user.user_id}">${user.username}</a>` : '-';
                  const scoreCell = row.insertCell();
                  scoreCell.textContent = user.score || '-';
                  const levelCell = row.insertCell();
                  levelCell.innerHTML = user.level ? getLevelBadge(user.level) : '<span class="badge-level badge-level-undefined">-</span>';
                  const progressCell = row.insertCell();
                  progressCell.classList.add('progress-cell');
                  const progressValue = user.level_progress || 0;
                  progressCell.innerHTML = `
                      <div class="progress-chart-container">
                          <canvas id="progressChart${i}" class="leaderboard-progress-chart" width="35" height="35"></canvas>
                          <span class="progress-percentage">${progressValue}%</span>
                      </div>
                  `;
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

  // Fetches and lists upcoming events
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
      .catch(error => {
          console.error('Error loading events:', error);
      });
});
