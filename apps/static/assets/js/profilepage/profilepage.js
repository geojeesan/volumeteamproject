document.addEventListener('DOMContentLoaded', function() {
    fetch('/user-progress2')
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
    const followButtons = document.querySelectorAll('.follow-btn');
  
    followButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const followedId = button.dataset.userId;
        const followerId = button.dataset.currentUserId;
        const action = button.dataset.action;
  
        const response = await fetch('/' + action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ followed_id: followedId, follower_id: followerId })
        });
  
        if (response.ok) {
          if (action === 'follow') {
            button.dataset.action = 'unfollow';
            button.textContent = 'Unfollow';
          } else {
            button.dataset.action = 'follow';
            button.textContent = 'Follow';
          }
        } else {
          console.error('Error:', response.statusText);
        }
      });
    });
  });

  document.addEventListener('DOMContentLoaded', async function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
  
    // Function to fetch search results
    async function searchUsers(query) {
      const response = await fetch(`/search?query=${query}`);
      const data = await response.json();
      return data;
    }
  
    // Function to display search results or no users found message
    function renderSearchResults(users) {
      searchResults.innerHTML = '';
      if (users.length === 0) {
        searchResults.innerHTML = '<li class="list-group-item">No users found</li>';
      } else {
        users.forEach(user => {
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
          listItem.innerHTML = `
            <span>${user.username}</span>
            <button class="btn btn-primary follow-btn" data-user-id="${user.id}" data-action="follow">Follow</button>
          `;
          searchResults.appendChild(listItem);
        });
      }
    }
  
    // Handle search button click
    searchButton.addEventListener('click', async function() {
      const query = searchInput.value.trim();
      if (query !== '') {
        const users = await searchUsers(query);
        renderSearchResults(users);
      }
    });
  
    // Follow/unfollow action
    searchResults.addEventListener('click', async function(event) {
      if (event.target.classList.contains('follow-btn')) {
        const button = event.target;
        const followedId = button.dataset.userId;
        const followerId = 5;/* Retrieve current user's ID */
        const action = button.dataset.action;
  
        const response = await fetch('/' + action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ followed_id: followedId, follower_id: followerId })
        });
  
        if (response.ok) {
          if (action === 'follow') {
            button.dataset.action = 'unfollow';
            button.textContent = 'Unfollow';
          } else {
            button.dataset.action = 'follow';
            button.textContent = 'Follow';
          }
        } else {
          console.error('Error:', response.statusText);
        }
      }
    });
  });