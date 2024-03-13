    resultElement = document.getElementById("result");
    inputElement = document.getElementById("score");

    document.addEventListener('DOMContentLoaded', function() {
        fetchEvents();
    });
    
    function fetchEvents() {
        // Simulate fetching data by directly using the provided JSON data
        const responseData = {
            "pagination": {
                "object_count": 1,
                "page_number": 1,
                "page_size": 50,
                "page_count": 1,
                "has_more_items": false
            },
            "events": [
                {
                    "name": {
                        "text": "FREE Public Speaking with Confidence (Virtual)",
                        "html": "FREE Public Speaking with Confidence (Virtual)"
                    },
                    "description": {
                        "text": "This is a VIRTUAL event.",
                        "html": "This is a VIRTUAL event."
                    },
                    "url": "https://www.eventbrite.ca/e/free-public-speaking-with-confidence-virtual-tickets-859594128177",
                    "start": {
                        "timezone": "America/Edmonton",
                        "local": "2024-03-26T18:00:00",
                        "utc": "2024-03-27T00:00:00Z"
                    },
                    "end": {
                        "timezone": "America/Edmonton",
                        "local": "2024-03-26T19:00:00",
                        "utc": "2024-03-27T01:00:00Z"
                    },
                    "organization_id": "34609854890",
                    "created": "2024-03-08T17:46:49Z",
                    "changed": "2024-03-12T20:32:17Z",
                    "published": "2024-03-09T01:00:14Z",
                    "capacity": null,
                    "capacity_is_custom": null,
                    "status": "live",
                    "currency": "CAD",
                    "listed": true,
                    "shareable": true,
                    "online_event": true,
                    "tx_time_limit": 1200,
                    "hide_start_date": false,
                    "hide_end_date": false,
                    "locale": "en_CA",
                    "is_locked": false,
                    "privacy_setting": "unlocked",
                    "is_series": false,
                    "is_series_parent": false,
                    "inventory_type": "limited",
                    "is_reserved_seating": false,
                    "show_pick_a_seat": false,
                    "show_seatmap_thumbnail": false,
                    "show_colors_in_seatmap_thumbnail": false,
                    "source": "coyote",
                    "is_free": true,
                    "version": null,
                    "summary": "This is a VIRTUAL event.",
                    "facebook_event_id": null,
                    "logo_id": "715023809",
                    "organizer_id": "6507055761",
                    "venue_id": null,
                    "category_id": "101",
                    "subcategory_id": null,
                    "format_id": "9",
                    "id": "859594128177",
                    "resource_uri": "https://www.eventbriteapi.com/v3/events/859594128177/",
                    "is_externally_ticketed": false,
                    "logo": {
                        "crop_mask": {
                            "top_left": {
                                "x": 0,
                                "y": 160
                            },
                            "width": 1078,
                            "height": 539
                        },
                        "original": {
                            "url": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F715023809%2F34609854890%2F1%2Foriginal.20240308-175033?auto=format%2Ccompress&q=75&sharp=10&s=8d7ea318f3b3a3b84c9fc8b06fde6ad6",
                            "width": 1079,
                            "height": 859
                        },
                        "id": "715023809",
                        "url": "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F715023809%2F34609854890%2F1%2Foriginal.20240308-175033?h=200&w=450&auto=format%2Ccompress&q=75&sharp=10&rect=0%2C160%2C1078%2C539&s=4ade8a531e7cc85a2f87ea2756f3c682",
                        "aspect_ratio": "2",
                        "edge_color": "#080808",
                        "edge_color_set": true
                    }
                }
            ]
        };
    
        // Process the static data as if it was fetched
        const eventsContainer = document.getElementById('events-container');
        let eventsHtml = '';
        responseData.events.forEach(event => {
            eventsHtml += `
                <div class="timeline-block mb-3">
                    <span class="timeline-step">
                        <i class="ni ni-bell-55 text-success text-gradient"></i>
                    </span>
                    <div class="timeline-content">
                        <h6 class="text-dark text-sm font-weight-bold mb-0">${event.name.text}</h6>
                        <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">Date: ${event.start.local}, Time: ${event.start.local}</p>
                        <p class="text-secondary text-xs mt-1 mb-0">${event.description.text}</p>
                        <a href="${event.url}" target="_blank">Event Details</a>
                    </div>
                </div>
            `;
        });
        eventsContainer.innerHTML = eventsHtml;
    }
    
      

    Chart.defaults.font.family = 'Roboto'; // Set the font family globally
    Chart.defaults.color = '#353B3C'; // Set the global font color

    const progressCtx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(progressCtx, {
      type: 'bar',
      data: {
        labels: ['Clear Diction', 'Emotional Expression', 'Tone Consistency', 'Pace Regulation'],
        datasets: [{
          label: 'Current Progress',
          data: [65, 59, 80, 81], // Replace these numbers with your actual data
          backgroundColor: '#D56565',
          borderWidth: 0,
          borderRadius: 10, // Rounded corners for the bars (Chart.js 3.x and newer)
        }, {
          label: 'Goal',
          data: [85, 90, 100, 100], // Replace these numbers with your actual data
          backgroundColor: '#BADFF2',
          borderWidth: 0,
          borderRadius: 10, // Rounded corners for the bars (Chart.js 3.x and newer)
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 14, // You can adjust the size here
              },
              color: '#353B3C', // Y-axis ticks color
            }
          },
          x: {
            ticks: {
              font: {
                size: 14, // You can adjust the size here
              },
              color: '#353B3C', // X-axis ticks color
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14, // Legend font size
              },
              color: '#353B3C', // Legend font color
            }
          },
        }
      }
    });

const scoresCtx = document.getElementById('testScoresChart').getContext('2d');
const scoresChart = new Chart(scoresCtx, {
  type: 'line',
  data: {
    labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'],
    datasets: [{
      label: 'Test Scores',
      data: [45, 67, 71, 82, 90],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var images = [
    url_for('static', filename='img/logos/interview.svg'),
    url_for('static', filename='img/logos/microphone.svg'),
    url_for('static', filename='img/logos/speech-bubble.svg'),
    url_for('static', filename='img/logos/agree (1).svg'),
  ];

  // Choose a random image from the array
  var randomImage = images[Math.floor(Math.random() * images.length)];

  // Find the image by ID and change its source to the random one
  var imgElement = document.getElementById('dynamicSticker');
  if(imgElement) {
    imgElement.src = randomImage;
  } else {
    console.error('No element with the ID dynamicSticker was found.');
  }
}); 