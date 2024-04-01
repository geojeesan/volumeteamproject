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

    console.log('Fetching URL:', url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            data.forEach(item => {
                const element = document.createElement('div');
                element.className = 'scroll-item';
                
                // Creating and appending the image element
                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.name;
                img.style.width = '100%'; // Ensure the image fits the container
                img.style.height = 'auto';
                element.appendChild(img);

                // Creating and appending the link element
                const link = document.createElement('a');
                link.href = item.link;
                link.target = "_blank";
                link.textContent = item.name;
                element.appendChild(link);

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

