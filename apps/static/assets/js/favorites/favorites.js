
document.addEventListener('DOMContentLoaded', function() {
    loadFavorites('articles', '/favorites/articles');
    loadFavorites('videos', '/favorites/videos');
    loadFavorites('expert-insights', '/favorites/expert_insights');
});

function loadFavorites(type, apiUrl) {
    const containerId = `favorite-${type}`;  // Ensure this ID is present in your HTML
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found for ${type}`);
        return;
    }
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            console.error(`Error from ${apiUrl}:`, response.statusText);
            throw new Error('Network response was not ok');
        }
        return response.json();

        })
        .then(data => {
            container.innerHTML = ''; // Clear previous content
            if (data.length > 0) {
                data.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'favorite-item';
                    itemElement.innerHTML = `
                        <img src="${item.image_url}" alt="${item.name}" style="width: 100px; height: auto;">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <a href="${item.link}" target="_blank">Learn More</a>
                    `;
                    container.appendChild(itemElement);
                });
            } else {
                container.innerHTML = '<p>No favorites found in this category.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading favorites:', error);
            container.innerHTML = `<p>Error loading favorites: ${error.message}</p>`;
        });
}
