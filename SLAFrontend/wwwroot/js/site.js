

const canvas = document.getElementById('drawingCanvas');

const ctx = canvas.getContext('2d');


document.getElementById('btn-update').addEventListener('click', async function () {
    const imageData = window.lastImage;
    if (!imageData) {
        alert('No image detected!');
        return;
    }

    try {
        const response = await fetch('/api/SLA', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData
            })
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            alert('Data posted successfully: ' + JSON.stringify(jsonResponse));
        } else {
            alert('Error: ' + response.statusText);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

window.addEventListener('paste', function (event) {
    // Prevent the default paste action
    event.preventDefault();

    // Get the clipboard items
    const items = event.clipboardData.items;

    // Loop through the clipboard items
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Check if the clipboard item is an image
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Clear the canvas before drawing the new image
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw the image onto the canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = event.target.result;
                window.lastImage = img.src;
            };

            // Read the image file as a data URL
            reader.readAsDataURL(file);
            break;
        }
    }
});