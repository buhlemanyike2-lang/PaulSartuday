// registration.js

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const overlay = document.querySelector(".animated-btn .overlay");
    
    // ⚠️ REPLACE THIS WITH YOUR ACTUAL CLOUDFLARE WORKER URL
    const WORKER_URL = "https://uploadform.<your-subdomain>.workers.dev"; 

    // Handle file selection display
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            // Check size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert("File is too large. Max 10MB allowed.");
                fileInput.value = "";
                return;
            }
            fileInfo.textContent = `✓ ${file.name} ready for upload`;
            fileInfo.classList.add('show');
        }
    });

    // Handle the Submit Click
    overlay.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first! ");
            return;
        }

        // Prompt for details
        const firstName = prompt("Enter Student First Name: ");
        const lastName = prompt("Enter Student Surname: ");

        if (!firstName || !lastName) {
            alert("Names are required for registration. ");
            return;
        }

        // Update button text to show progress
        const textElements = document.querySelectorAll(".animated-btn .text ");
        textElements.forEach(el => el.innerHTML = "Uploading... ");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);

        try {
            // Sending to the Cloudflare Worker
            const response = await fetch(`${WORKER_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                textElements.forEach(el => el.innerHTML = "Success! ");
                alert(`File uploaded successfully as: ${result.newName}`);
                location.reload(); // Refresh to clear form
            } else {
                throw new Error(result.error || "Upload failed ");
            }
        } catch (error) {
            alert("Error: " + error.message);
            textElements.forEach(el => el.innerHTML = "Retry ");
        }
    });
});