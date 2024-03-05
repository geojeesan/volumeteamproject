

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

function scrollToFavorites() {
    document.getElementById('favorites-section').scrollIntoView({
      behavior: 'smooth'
    });
}

function scrollToExpertInsights() {
    document.getElementById('expert-insights-section').scrollIntoView({
      behavior: 'smooth'
    });
}

document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      this.src = 'path/to/placeholder-image.jpg'; // Fallback image
    };
});

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.category-buttons button');

    // Clear active class from all buttons and set for the clicked one
    const updateActiveButton = (activeButton) => {
        buttons.forEach(btn => {
            if (btn === activeButton) {
                btn.classList.add('button-active');
            } else {
                btn.classList.remove('button-active');
            }
        });
    };

    // Define category links
    const links = {
        beginner: [
            '<a href="https://www.latrobe.edu.au/nest/5-public-speaking-tips-to-persuade-any-audience/">Public Speaking Tips</a>',
            '<a href="https://www.calm.com/blog/how-to-overcome-social-anxiety">Overcome Social Anxiety</a>'
        ],
        intermediate: [
            '<a href="https://www.simplypsychology.org/overcoming-social-anxiety.html">Overcoming Social Anxiety</a>',
            '<a href="https://medium.com/sketchit/visual-tips-for-online-public-speaking-9a24203b3393">Visual Tips for Public Speaking</a>'
        ],
        advanced: [
            '<a href="https://www.mocktrialstrategies.com/advanced-public-speaking-skills/">Advanced Public Speaking Skills</a>',
            '<a href="https://www.healthline.com/health/anxiety/social-phobia/">Social Anxiety Disorder</a>'
        ]
    };

    // Function to display links based on category
    const displayLinks = (category) => {
        const linksContainer = document.getElementById('category-links');
        linksContainer.innerHTML = links[category].join('<br>');
    };

    // Attach event listeners to buttons
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            updateActiveButton(this); // Mark the clicked button as active
            displayLinks(this.getAttribute('data-category')); // Display corresponding links
        });
    });
});
