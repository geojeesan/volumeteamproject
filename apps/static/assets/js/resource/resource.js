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
    // Remove 'active' class from all category buttons
    document.querySelectorAll('.category-button').forEach(item => {
        item.classList.remove('active');
    });

    // Add 'active' class to clicked category button
    element.classList.add('active');
}


// New function to scroll to the "Featured" section
function scrollToFeatured() {
    document.getElementById('featured-section').scrollIntoView({
      behavior: 'smooth'
    });
}

// New function to scroll to the "Article" section
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

    //click event listeners for the category buttons
    const buttons = document.querySelectorAll('.category-buttons button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.category-buttons button').forEach(btn => btn.classList.remove('button-active'));
            this.classList.add('button-active');

            const section = this.closest('div[id$="-section"]');
            let resourceType = section.id.split('-')[0]; // 'articles', 'videos', or 'expert'

            let containerId = `${resourceType}-links`;

            let filter = this.getAttribute('data-content-level') || this.getAttribute('data-content-type');
            if (!filter) {
                filter = this.textContent.toLowerCase().replace(/\s+/g, '-'); // Normalize the filter text
            }

            // Separate handling for "expert" to match the correct API endpoint "expert_insights"
            if (resourceType === 'expert') {
                resourceType = 'expert_insights';
            }

            fetchAndDisplayResources(resourceType, containerId, filter);
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