function setActive(element) {
    // Remove 'active' class from all elements
    document.querySelectorAll('.menu-item').forEach(item => {
        if (!item.classList.contains('static')) {
            item.classList.remove('active');
        }
    });

    // Add 'active' class to clicked element
    element.classList.add('active');
}

function setCategoryActive(element) {
    const baseSectionId = element.closest('div[id$="-section"]').id;
    let resourceType = baseSectionId.replace("-section", "");
    if (baseSectionId === "expert-section") {
        resourceType = "expert_insights"; // Ensure correct endpoint
    }
    const category = element.getAttribute('data-content-type') || element.getAttribute('data-content-level');
    const containerIdMap = {
        'articles-section': 'articles-scroll-container',
        'videos-section': 'videos-scroll-container',
        'expert-section': 'expert-scroll-container' // Ensure this matches your HTML ID
    };
    const containerId = containerIdMap[baseSectionId];

    const sameSectionButtons = element.closest('.category-buttons').querySelectorAll('.category-button');
    sameSectionButtons.forEach(btn => btn.classList.remove('active'));

    element.classList.toggle('active');
    const isActive = element.classList.contains('active');

    if (isActive) {
        fetchAndDisplayResources(resourceType, containerId, category);
    } else {
        clearLinksForSubsection(containerId); // Adjust to use containerId directly
    }
}


function clearLinksForSubsection(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    } else {
        console.error('Container not found:', containerId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Define default categories for each section
    const defaultCategories = [
        { section: 'articles', category: 'beginner', type: 'data-content-level' },
        { section: 'videos', category: 'beginner', type: 'data-content-level' },
        { section: 'expert', category: 'article', type: 'data-content-type' }
    ];

    // Load and highlight default categories for each section
    defaultCategories.forEach(({ section, category, type }) => {
        const resourceType = section === 'expert' ? 'expert_insights' : section;
        const containerId = `${section}-scroll-container`;
        const selector = `[${type}="${category}"][data-section="${section}"]`;
        const defaultButton = document.querySelector(selector);

        if (defaultButton) {
            defaultButton.classList.add('active');
            fetchAndDisplayResources(resourceType, containerId, category);
        } else {
            console.error('Default button not found:', selector);
        }
    });

    // Setup event listeners for buttons
    setupButtonListeners();
});

function setupButtonListeners() {
    const buttons = document.querySelectorAll('.category-buttons button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Do not proceed if the button is already active
            if (this.classList.contains('active')) {
                return;
            }

            const section = this.getAttribute('data-section');
            const resourceType = section === 'expert' ? 'expert_insights' : section;
            const containerId = `${section}-scroll-container`;
            const category = this.getAttribute('data-content-level') || this.getAttribute('data-content-type');

            // Clear active states and set current button as active
            const currentActiveButton = this.closest('.category-buttons').querySelector('.category-button.active');
            if (currentActiveButton) {
                currentActiveButton.classList.remove('active');
            }
            this.classList.add('active');

            // Fetch and display the content
            fetchAndDisplayResources(resourceType, containerId, category);
        });
    });
}


function fetchAndDisplayResources(resourceType, containerId, filter) {
    let url = `/api/${resourceType}`;
    if (filter) {
        const queryParam = resourceType === 'expert_insights' ? 'content_type' : 'content_level';
        url += `?${queryParam}=${filter}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            data.forEach(item => {
                const element = document.createElement('div');
                element.className = 'scroll-item';

                // Image Element
                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.name;
                img.style.width = '100%';
                img.style.height = 'auto';
                element.appendChild(img);

                // Link Element
                const link = document.createElement('a');
                link.href = item.link;
                link.target = "_blank";
                link.textContent = item.name;
                element.appendChild(link);

                // Time to Complete
                if (item.time_to_completion) {
                    const timeElement = document.createElement('div');
                    timeElement.className = 'time-to-complete';
                    timeElement.textContent = `${item.time_to_completion}`;
                    element.appendChild(timeElement);
                }

                // Favorite Container
                const favoriteContainer = document.createElement('div');
                favoriteContainer.className = 'favorite-container';
                favoriteContainer.style = 'position: absolute; bottom: 10px; right: 10px; display: flex; align-items: center;';

                const favoriteCount = document.createElement('span');
                favoriteCount.className = 'favorite-count';
                favoriteCount.textContent = item.favorite_count + ' ';
                favoriteContainer.appendChild(favoriteCount);

                const favoriteButton = document.createElement('button');
                favoriteButton.className = 'favorite-button';
                favoriteButton.innerHTML = item.is_favorited ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'; // Set initial heart icon based on favorite status
                favoriteButton.onclick = function() {
                    const isActive = this.classList.contains('active');
                    if (isActive) {
                        this.classList.remove('active');
                        this.innerHTML = '<i class="far fa-heart"></i>'; // Change to non-favorite icon
                    } else {
                        this.classList.add('active');
                        this.innerHTML = '<i class="fas fa-heart"></i>'; // Change to favorite icon
                    }

                    // Call backend to toggle favorite
                    fetch(`/api/toggle_favorite/${item.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ resource_type: resourceType }) // Ensure you send resource type
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            favoriteCount.textContent = data.favorite_count + ' ';
                            // Update class based on new favorite status
                            if (data.is_favorited) {
                                this.classList.add('active');
                                this.innerHTML = '<i class="fas fa-heart"></i>'; // Ensure icon is correct
                            } else {
                                this.classList.remove('active');
                                this.innerHTML = '<i class="far fa-heart"></i>'; // Ensure icon is correct
                            }
                        } else {
                            console.error('Failed to toggle favorite');
                        }
                    })
                    .catch(error => {
                        console.error('Error toggling favorite:', error);
                    });
                };


                favoriteContainer.appendChild(favoriteButton);

                element.appendChild(favoriteContainer);

                container.appendChild(element);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function toggleFavorite(resourceId, resourceType, element) {
    fetch(`/api/toggle_favorite/${resourceId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resource_type: resourceType })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the favorite count and icon based on the response
            const favCount = element.querySelector('.favorite-count');
            favCount.textContent = data.favorite_count + ' ';
            const favIcon = element.querySelector('i');
            if (data.is_favorited) {
                element.querySelector('.favorite-button').classList.add('active');
                favIcon.classList.remove('far');
                favIcon.classList.add('fas');
            } else {
                element.querySelector('.favorite-button').classList.remove('active');
                favIcon.classList.add('far');
                favIcon.classList.remove('fas');
            }
        } else {
            console.error('Failed to toggle favorite:', data.error);
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
    });
}




function scrollHorizontal(direction, containerId) {
    const container = document.getElementById(containerId);
    const scrollAmount = 600; // Adjust this value as needed

    if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
    } else if (direction === 'right') {
        container.scrollLeft += scrollAmount;
    }
}
