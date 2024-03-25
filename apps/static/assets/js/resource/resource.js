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
    // Find all buttons in the same subsection
    const sameSectionButtons = element.closest('.category-buttons').querySelectorAll('.category-button');

    // Check if the clicked button is already active
    const currentlyActive = element.classList.contains('active');

    // Deactivate all buttons in the same subsection
    sameSectionButtons.forEach(btn => btn.classList.remove('active'));

    // If the clicked button was not already active, activate it
    if (!currentlyActive) {
        element.classList.add('active');
    } else {
        // If it was active, it has been deactivated. Clear links.
        clearLinksForSubsection(element);
    }
}

function clearLinksForSubsection(button) {
    const section = button.closest('div[id$="-section"]');
    const containerId = `${section.id.split('-')[0]}-links`;
    document.getElementById(containerId).innerHTML = '';
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
    document.getElementById('expert-insights-section').scrollIntoView({
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
        // to determine the query parameter based on the resource type
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
                element.innerHTML = `<a href="${item.link}" target="_blank" class="resource-link">${item.name}</a>`;
                container.appendChild(element);
            });
        })
        .catch(error => console.error(`Error fetching ${resourceType}:`, error));
}