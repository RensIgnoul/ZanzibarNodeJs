sensorBtn = document.getElementById("sensorBtn");
boardBtn = document.getElementById("boardBtn");
weatherStationBtn = document.getElementById("weatherStationBtn");
sensorBtn.addEventListener("click", (event) => {
  submitForm(event);
});
boardBtn.addEventListener("click", (event) => {
  submitForm(event);
});
weatherStationBtn.addEventListener("click", (event) => {
  submitForm(event);
});

function submitForm(event) {
  // Get form data
  const forms = [
    document.getElementById("sensorForm"),
    document.getElementById("boardForm"),
    document.getElementById("stationForm"),
  ];

  // Create an object to store the form data
  const formData = {};

  let excecuted = false;
  // Store the form data in the object
  if (event.target == sensorBtn && !excecuted) {
    formData.boardId = document.getElementById("boardIdS").value;
    formData.sensorId = document.getElementById("sensorId").value;
    formData.sensorName = document.getElementById("sensorName").value;
    excecuted = true;
  }
  if (event.target == boardBtn && !excecuted) {
    formData.boardId = document.getElementById("boardId").value;
    formData.boardName = document.getElementById("boardName").value;
    formData.boardLat = document.getElementById("boardLat").value;
    formData.boardLong = document.getElementById("boardLong").value;
    excecuted = true;
  }
  if (!excecuted) {
    formData.stationId = document.getElementById("stationId").value;
    formData.stationName = document.getElementById("stationName").value;
    formData.stationLat = document.getElementById("stationLat").value;
    formData.stationLong = document.getElementById("stationLong").value;
    µ;
    excecuted = true;
  }

  // Check if all form fields are filled
  const formFields = Object.values(formData);
  if (formFields.some((field) => field.length <= 0)) {
    alert("All fields in a given form need to be filled");
    return;
  }

  // Send the form data to the server
  fetch("/submit-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Form data sent successfully");
        // Clear the form fields
        forms.forEach((form) => form.reset());
      } else {
        throw new Error("Form data failed to send");
      }
    })
    .catch((error) => {
      console.error(error);
      alert("An error occurred while sending form data");
    });
}
