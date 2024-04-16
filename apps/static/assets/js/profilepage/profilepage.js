function toggleFollow(button) {
  if (button.innerHTML === 'Follow') {
      button.innerHTML = 'Unfollow';
  } else {
      button.innerHTML = 'Follow';
  }
}

function viewProfile(username) {
  // Redirect to the profile page of the username
  window.location.href = '/profilepage/' + username;
}



// Function to handle user search
function searchUsers() {
  var searchInput = document.getElementById('searchInput').value.trim();

  // Send AJAX request to Flask endpoint
  $.ajax({
    url: '/profilepage/' + searchInput,  // Assuming you have a '/search' endpoint for searching users
    method: 'POST',
    data: { searchTerm: searchInput },
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
        viewProfileButton.onclick = function() {
          viewProfile(user.username); // Call viewProfile with the username
        };
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
  window.location.href = '/profilepage/' + user.username; // Redirect to user profile page
}

  // Event listener for search button click
  document.getElementById('searchButton').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default form submission
      searchUsers();
  });