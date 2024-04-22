function getLevelBadge(level) {
    let badgeClass = '';
    let levelText = '-';
    
    switch (level.toLowerCase()) {
        case 'beginner':
            badgeClass = 'badge-level-beginner';
            levelText = 'Beginner';
            break;
        case 'intermediate':
            badgeClass = 'badge-level-intermediate';
            levelText = 'Intermediate';
            break;
        case 'advanced':
            badgeClass = 'badge-level-advanced';
            levelText = 'Advanced';
            break;
        case '-':
            badgeClass = 'badge-level-undefined';
            levelText = '-';
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
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    // Fetches and displays the leaderboard
    fetch('/leaderboard')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const leaderboardBody = document.getElementById('leaderboard-body');
        // Retrieve the login status from the server's response.
        const isLoggedIn = data.is_logged_in; // Ensure this value is being sent from the server
        const leaderboardData = data.leaderboard; // Assuming leaderboard data is under 'leaderboard' key
        
        for (let i = 0; i < leaderboardData.length; i++) {
            const row = leaderboardBody.insertRow();
            const user = leaderboardData[i];
            
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
            row.insertCell().innerHTML = badgeHTML;

            if (isDarkMode && i >= 3) {
                row.classList.add('dark-text-color');
            }

            const usernameCell = row.insertCell();
            let usernameHtml = user.username || '-';
            if (user.username) {
                usernameHtml = `<a href="/profilepage/${user.username}" class="username-link${isDarkMode ? ' dark-page' : ''}">${user.username}</a>`;
            }
            usernameCell.innerHTML = usernameHtml;

            const scoreCell = row.insertCell();
            scoreCell.textContent = user.score || '-';
            if (isDarkMode) {
                scoreCell.classList.add('score', 'dark-page'); 
            }

            const levelCell = row.insertCell();
            levelCell.innerHTML = user.level && user.level !== '-' 
            ? getLevelBadge(user.level) 
            : '<span class="badge-level badge-level-undefined">Unranked</span>';
        
            const progressCell = row.insertCell();
            progressCell.classList.add('progress-cell');
            const progressValue = user.level_progress || 0;
            let progressHtml = `
                <div class="progress-chart-container">
                    <canvas id="progressChart${i}" class="leaderboard-progress-chart" width="35" height="35"></canvas>
                    <span class="progress-percentage${isDarkMode ? ' dark-page' : ''}">${progressValue}%</span>
                </div>
            `;
            progressCell.innerHTML = progressHtml;

            // Initialize the progress chart if necessary
            if (user.hasOwnProperty('level_progress') && user.level_progress !== null) {
                const ctx = document.getElementById('progressChart' + i).getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [user.level_progress, 100 - user.level_progress],
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
                case 1:
                    rankColorClass = 'rank-gold';
                    break;
                case 2:
                    rankColorClass = 'rank-silver';
                    break;
                case 3:
                    rankColorClass = 'rank-bronze';
                    break;
                default:
                    rankColorClass = 'rank-normal';
                    break;
            }
            rankIcon.classList = `badge-icon ${rankColorClass}`;
        } else {
            console.error('Rank icon not found');
        }
        document.getElementById('user-level-text').textContent = personaData.level.charAt(0).toUpperCase() + personaData.level.slice(1);
        document.getElementById('user-streak-text').textContent = personaData.streak;
        document.getElementById('user-rank-text').textContent = personaData.rank;

        // Check if dark mode is active
        const badgesContainers = document.querySelectorAll('.badges-container');
        const badgeIcons = document.querySelectorAll('.badge-icon');
        const badgeTexts = document.querySelectorAll('.badge-text');

        // Toggle dark mode styles based on isDarkMode flag
        badgesContainers.forEach(container => {
            container.classList.toggle('dark-mode-background', isDarkMode);
        });
        badgeIcons.forEach(icon => {
            icon.classList.toggle('dark-mode-text', isDarkMode);
        });
        badgeTexts.forEach(text => {
            text.classList.toggle('dark-mode-text', isDarkMode);
        });

    })
    .catch(error => {
        console.error('Error fetching user persona data:', error);
    });


    var quillToolbarOptions = [
        [{
            'header': [1, 2, 3, 4, 5, false]
        }],
        [{
            'font': []
        }],
        ['bold', 'italic', 'underline', 'strike'],
        [{
            'list': 'ordered'
        }, {
            'list': 'bullet'
        }],
        [{
            'color': []
        }, {
            'background': []
        }],
        [{
            'align': []
        }],
        ['clean']
    ];

    var quill = new Quill('#editor-container', {
        modules: {
          toolbar: quillToolbarOptions
        },
        theme: 'snow',
        placeholder: 'Write your notes or goals here...' // This sets the placeholder text
      });
      
      // Fetches and populates user notes into the text editor
      fetch('/get-notes')
        .then(response => response.json())
        .then(data => {
          if (data.content && data.content.trim() !== '') {
            quill.root.innerHTML = data.content;
          }
        })
        .catch(error => console.error('Error fetching notes:', error));
      
      const saveNotesButton = document.getElementById('save-notes-btn');
      saveNotesButton.addEventListener('click', function() {
        var content = quill.root.innerHTML;
        fetch('/save-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: content
          })
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
            if (actions.length === 0) {
                const recentActivityCard = document.querySelector('.recent-activity-card');
                recentActivityCard.classList.add('grayed-out');
            }
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
            if (data.datasets[0].data.length === 0) {
                const testScoresCard = document.querySelector('.test-scores-card');
                testScoresCard.classList.add('grayed-out');
            } else {
                new Chart(scoresCtx, {
                    type: 'line',
                    data: data,
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                suggestedMax: 10,

                            }
                      
                        },
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }
        })
        .catch(error => console.error('Error loading test scores:', error));


    
});