resultElement = document.getElementById("result");
inputElement = document.getElementById("feedback");

var requestData = {
  feedback: ""
};


function sendFeedback() {





  requestData.feedback = inputElement.value

  fetch("/send_feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Specify the content type as JSON
    },
    body: JSON.stringify(requestData), // Convert requestData to JSON string
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON response
    })
    .then((data) => {
      resultElement.textContent = data;
    })
    .catch((error) => {
      // Handle any errors that occurred during the fetch
      console.error("Error:", error);
    });
}



