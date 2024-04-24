let popupElement;
let items;
let selectedIndex
let popupVisibility = false
var searchInput
var optionsList
var sidenavCard
let filteredItems = [];

function isUserOnPC() {
    // Get the user agent string
    var userAgent = navigator.userAgent;

    // Check if the user agent string contains "Windows", "Macintosh", or "Linux"
    return /Windows|Macintosh|Linux/.test(userAgent);
}


document.addEventListener('DOMContentLoaded', function() {
    // Get the popup element
    popupElement = document.getElementById("popup");
    items = document.querySelectorAll('[role="option"]');
    selectedIndex = 0; // Current selected index
   searchInput = document.getElementById('searchInput');
   optionsList = document.getElementById('optionsList').getElementsByTagName('li');
   sidenavCard = document.getElementById("sidenavCard")


   if (!isUserOnPC()) {
    sidenavCard.style.display = "none"
   }

   // Event listener for input events on the search bar
searchInput.addEventListener('input', filterOptions);

filterOptions()


});


document.addEventListener('keydown', function(event) {
    // Check if ctrl/cmd key and 'k' key are pressed
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        // Call your function here
        togglePopup();
    }

    if (popupVisibility){
    if (event.key === 'ArrowUp') {
        event.preventDefault(); // Prevent default behavior (scrolling)
        if (filteredItems.includes(selectedIndex-1)) {
            selectItem(selectedIndex - 1);
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault(); // Prevent default behavior (scrolling)
        if (filteredItems.includes(selectedIndex+1)) {
            selectItem(selectedIndex + 1);
        }
    }
    else if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default behavior (form submission)
        if (selectedIndex !== -1) {
            var selectedOption = items[selectedIndex].getAttribute('details');
            if(selectedOption == "dashboard"){
                selectedOption = "index"
            }
            goTo(selectedOption)
        }
    }else if (event.key === "Escape"){
        togglePopup();
    }
}



});






function goTo(option){
    window.location.href = "/" + option
}


   // Function to filter options based on search input
   function filterOptions() {
    filteredItems = []

    var searchText = searchInput.value.toLowerCase();
    for (var i = 0; i < optionsList.length; i++) {
        var option = optionsList[i];
        var details = option.getAttribute('details').toLowerCase();
        if (details.includes(searchText)) {
            option.style.display = 'block';
            filteredItems.push(i)
        } else {
            option.style.display = 'none';
        }
        
    }

    
    if(filteredItems.length != 0){
        document.getElementById("shortcut-desc").textContent = "Try navigating to"
    selectItem(filteredItems[0]);
    }
    else{
        document.getElementById("shortcut-desc").textContent = "No results found"
    }
}




function selectItem(index) {
    if (selectedIndex !== -1) {
        items[selectedIndex].setAttribute('aria-selected', 'false');
    }
    selectedIndex = index;
    items[selectedIndex].setAttribute('aria-selected', 'true');
}



function togglePopup() {

    if (popupElement.style.visibility === "hidden" || popupElement.style.visibility === "") {
        // Show the popup
        popupElement.style.visibility = "visible";
        document.body.style.overflow = "hidden";
        popupVisibility = true
        searchInput.focus();
    } else {
        // Hide the popup
        popupElement.style.visibility = "hidden";
        document.body.style.overflow = "auto";
        popupVisibility = false
    }
}