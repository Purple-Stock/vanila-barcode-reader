// Assuming QuaggaJS is already loaded via <script> tag in your HTML
document.addEventListener('DOMContentLoaded', function () {
  Quagga.init({
      inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector('#interactive'),
          constraints: {
              width: 480,
              height: 320,
              facingMode: "environment"
          },
      },
      decoder: {
          readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "code_39_reader",
              "code_39_vin_reader",
              "codabar_reader",
              "upc_reader",
              "upc_e_reader",
              "i2of5_reader"
          ],
          debug: {
              drawBoundingBox: true,
              showFrequency: true,
              drawScanline: true,
              showPattern: true
          }
      },
  }, function (err) {
      if (err) {
          console.error(err);
          return;
      }
      console.log("Initialization finished. Ready to start");
      Quagga.start();
  });

  Quagga.onDetected(function (result) {
      var code = result.codeResult.code;
      // Stop Quagga scanner
      Quagga.stop();
      
      // Send the barcode to your endpoint
      sendDataToEndpoint(code);
  });
});

// Scanner initialization omitted for brevity - it's the same as before

// Event listener for file upload
document.getElementById('barcode-input').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Create a FileReader to read the file
        var reader = new FileReader();
        reader.onload = function(e) {
            Quagga.decodeSingle({
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"] // specify readers as needed
                },
                locate: true, // try to locate the barcode in the image
                src: e.target.result // the file reader result
            }, function(result){
                if(result.codeResult) {
                    console.log("result", result.codeResult.code);
                    sendDataToEndpoint(result.codeResult.code);
                } else {
                    console.log("not detected");
                }
            });
        };
        reader.readAsDataURL(file);
    }
}

// sendDataToEndpoint function omitted for brevity - it's the same as before


function sendDataToEndpoint(barcode) {
  // Assuming barcode is part of the URL path and not a query string
  var endpoint = `https://web.purplestock.com.br/api/v1/account/1/checkout_orders/${barcode}`;
  // var endpoint = `http://localhost:3000/api/v1/account/1/checkout_orders/${barcode}`;
  
  // Making a GET request without a body
  fetch(endpoint)
  .then(response => {
      if (!response.ok) {
          if (response.status === 404) {
              // Handle not found case without throwing an error
              return { message: "Order not found" };
          }
          throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
  })
  .then(jsonResponse => {
      showModal(jsonResponse);
  })
  .catch(error => {
      console.error('Error:', error);
      showModal({ message: "An error occurred" });
  });


}

function showModal(data) {
  var modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = ''; // Clear previous content

  // Check if the data contains a message (for error or 'not found' scenarios)
  if (data.message) {
      var messageParagraph = document.createElement('p');
      messageParagraph.textContent = data.message;
      modalBody.appendChild(messageParagraph);
  } else {
      // Function to add property to the modal
      function addProperty(name, value) {
          var propertyParagraph = document.createElement('p');
          propertyParagraph.innerHTML = `<strong>${name}:</strong> ${value}`;
          modalBody.appendChild(propertyParagraph);
      }

      // Add properties from the data object
      addProperty('Bling ID', data.data.bling_id);
      addProperty('Bling Order ID', data.data.bling_order_id);
      addProperty('Merchant Package', data.data.merchant_package);
      addProperty('Order Number', data.data.order_number);
      addProperty('SHEIN Status', data.data.shein_status);
      addProperty('Bling Status', data.data.bling_status);
      addProperty('Account ID', data.data.account_id);
  }

  // Show the modal
  $('#resultModal').modal('show');
}

