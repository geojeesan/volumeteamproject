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
        resourceType = "expert_insights";
    }

    const category = element.getAttribute('data-content-type') || element.getAttribute('data-content-level');
    const containerId = `${baseSectionId.replace("-section", "")}-scroll-container`;

    const currentlyActiveButton = element.closest('.category-buttons').querySelector('.category-button.active');
    const isDifferentButton = currentlyActiveButton && currentlyActiveButton !== element;
    const wasAlreadyActive = element.classList.contains('active');

    // If clicking a different button or the first time clicking this button
    if (isDifferentButton || !wasAlreadyActive) {
        if (currentlyActiveButton) {
            currentlyActiveButton.classList.remove('active'); // Remove active class from previously active button
        }
        element.classList.add('active'); // Set current button as active
        fetchAndDisplayResources(resourceType, containerId, category);
    } else if (wasAlreadyActive) {
        // If the same button is clicked again, clear the data
        element.classList.remove('active'); // Remove active class as we're toggling off
        clearLinksForSubsection(containerId);
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

//function to scroll to the "Featured" section
function scrollToFeatured() {
    document.getElementById('featured-section').scrollIntoView({
        behavior: 'smooth'
    });
}

//function to scroll to the "Article" section
function scrollToArticle() {
    document.getElementById('articles-section').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToVideos() {
    document.getElementById('videos-section').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToExpertInsights() {
    document.getElementById('expert-section').scrollIntoView({
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.category-buttons button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const wasActiveBeforeClick = this.classList.contains('active');
            // setCategoryActive(this); // removing this solved the problem

            const isActiveAfterClick = this.classList.contains('active');
            const section = this.closest('div[id$="-section"]');
            let resourceType = section.id.split('-')[0]; // 'articles', 'videos', or 'expert'
            let containerId = `${resourceType}-links`;

            // Check if the button is still active after the click
            if (isActiveAfterClick) {
                let filter = this.getAttribute('data-content-level') || this.getAttribute('data-content-type') || this.textContent.toLowerCase().replace(/\s+/g, '-');
                if (resourceType === 'expert') {
                    resourceType = 'expert_insights';
                }
                fetchAndDisplayResources(resourceType, containerId, filter);
            } else if (wasActiveBeforeClick && !isActiveAfterClick) {
                // The button was active before and now is not, clear the displayed data
                clearLinksForSubsection(this);
            }
        });
    });
});

function fetchAndDisplayResources(resourceType, containerId, filter) {
    let url = `/api/${resourceType}`;
    if (filter) {
        const queryParam = resourceType === 'expert_insights' ? 'content_type' : 'content_level';
        url += `?${queryParam}=${filter}`;
    }

    console.log('Fetching URL:', url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            data.forEach(item => {
                const element = document.createElement('div');
                element.className = 'scroll-item';
                element.innerHTML = `<a href="${item.link}" target="_blank">${item.name}</a>`;
                container.appendChild(element);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
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
