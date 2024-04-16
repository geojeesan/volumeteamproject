function toggleFollow(button) {
  if (button.innerHTML === 'Follow') {
      button.innerHTML = 'Unfollow';
  } else {
      button.innerHTML = 'Follow';
  }
}

function viewProfile(username) {
  // Assuming you're using AJAX to send a POST request to the Flask route
  fetch('/viewProfile/' + username, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      window.location.href = response.url; // Redirect to the profile page URL
    } else {
      console.error('Error:', response.status);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}



// Function to handle search
function searchUsers() {
  var searchInput = document.getElementById('searchInput').value;
  var userId = 2;

  // Send AJAX request to Flask endpoint
  $.ajax({
      url: '/profilepage/' + userId,  // Dynamically generate URL with the correct user ID
      method: 'POST',
      data: {searchTerm: searchInput},
      success: function(response) {
          var searchResults = document.getElementById('searchResults');
          searchResults.innerHTML = ''; // Clear previous search results

          // Append search results to the list
          response.forEach(function(user) {
              var listItem = document.createElement('li');
              listItem.className = 'list-group-item';
              listItem.textContent = '@' + user.username;
              listItem.style.height = '50px';

              // Create button to view user profile
              var viewProfileButton = document.createElement('button');
              viewProfileButton.textContent = 'View Profile';
              viewProfileButton.className = 'btn btn-secondary btn-sm ml-2';
              viewProfileButton.dataset.userId = user.id; // Store user ID as a data attribute
              viewProfileButton.addEventListener('click', viewUserProfile);
              viewProfileButton.style.float = 'right'; // Align to the right side

              // Append button to list item
              listItem.appendChild(viewProfileButton);

              // Append list item to search results
              searchResults.appendChild(listItem);
          });
      }
  });
}

// document.addEventListener('DOMContentLoaded', function() {
//   fetch('/profile-user-progress')
//       .then(response => response.json())
//       .then(data => {
        
//           document.getElementById('user-lessons-completed').textContent = data.user_lessons_completed;
//           document.getElementById('user-lessons-in-progress').textContent = data.user_lessons_in_progress;
//           document.getElementById('user-level_progress').textContent = data.user_level_progress.toFixed(0) + '%';
//       })
//       .catch(error => {
//           console.error('Error fetching user progress:', error);
//       });
//     });
    
// Event handler for viewing user profile
function viewUserProfile(event) {
  var userId = event.target.dataset.userId; // Get user ID from data attribute
  window.location.href = '/profilepage/' + userId; // Redirect to user profile page
}

  // Event listener for search button click
  document.getElementById('searchButton').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default form submission
      searchUsers();
  });