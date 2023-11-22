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

  console.log(endpoint)
  
  // Making a GET request without a body
  fetch(endpoint)
  .then(response => {
      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
  })
  .then(data => {
      console.log('Success:', data);
      // Here you would typically show your modal with the returned data.
      showModal(data);
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

function showModal(data) {
  // Create your modal here using the data returned from the endpoint
  alert(JSON.stringify(data, null, 2));
}

// Existing functions omitted for brevity

function showModal(response) {
  var data = response.data; // Access the nested 'data' object
  var cardContainer = document.getElementById('card-container');
  cardContainer.innerHTML = ''; // Clear previous cards

  var card = document.createElement('div');
  card.className = 'card';

  var cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  var storeName = document.createElement('h5');
  storeName.className = 'card-title';
  storeName.textContent = data.store_name;
  cardBody.appendChild(storeName);

  function addProperty(name, value) {
      var property = document.createElement('h6');
      property.className = 'card-subtitle mb-2 text-muted';
      property.textContent = name;

      var valueElement = document.createElement('p');
      valueElement.className = 'card-text';
      valueElement.textContent = value;

      cardBody.appendChild(property);
      cardBody.appendChild(valueElement);
  }

  // Add properties
  addProperty('Bling ID', data.bling_id);
  addProperty('Bling Order ID', data.bling_order_id);
  addProperty('Merchant Package', data.merchant_package);
  addProperty('Order Number', data.order_number);
  addProperty('SHEIN Status', data.shein_status);
  addProperty('Bling Status', data.bling_status);
  addProperty('Account ID', data.account_id);

  card.appendChild(cardBody);
  cardContainer.appendChild(card);
}

