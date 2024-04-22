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



// Function to handle search
function searchUsers() {
  var profileSearchInput = document.getElementById('profileSearchInput').value;

  // Check if search input is empty
  // if (!searchInput.trim()) {
  //   var searchResults = document.getElementById('searchResults');
  //   searchResults.innerHTML = '<p style="color: red;">Please enter a search term</p>';
  //   return; // Exit the function early if search input is empty
  // }

  // Send AJAX request to Flask endpoint
  $.ajax({
      url: '/searchUser',  // Dynamically generate URL with the correct user ID
      method: 'POST',
      data: {searchTerm: profileSearchInput},
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
              viewProfileButton.dataset.username = user.username; // Store user ID as a data attribute
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


    
// Event handler for viewing user profile
function viewUserProfile(event) {
  var username = event.target.dataset.username; // Get user ID from data attribute
  window.location.href = '/profilepage/' + username; // Redirect to user profile page
}

  // Event listener for search button click
  document.getElementById('searchButton').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default form submission
      searchUsers();
  });