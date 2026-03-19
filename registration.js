// registration.js

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const overlay = document.querySelector(".animated-btn .overlay");
    
    // YOUR CLOUDFLARE WORKER URL
    const WORKER_URL = "https://registration-uploader.buhlemanyike2.workers.dev"; // Replace with your actual worker URL

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

    // Handle drag & drop
    const dropZone = document.getElementById('dropZone');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            const file = files[0];
            
            // Check size
            if (file.size > 10 * 1024 * 1024) {
                alert("File is too large. Max 10MB allowed.");
                fileInput.value = "";
                return;
            }
            
            fileInfo.textContent = `✓ ${file.name} ready for upload`;
            fileInfo.classList.add('show');
        }
    });

    // Browse button
    document.getElementById('browseBtn').addEventListener('click', () => {
        fileInput.click();
    });

    // Handle the Submit Click
    overlay.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        // Prompt for details
        const firstName = prompt("Enter Student First Name:");
        if (!firstName) {
            alert("First name is required.");
            return;
        }

        const lastName = prompt("Enter Student Surname:");
        if (!lastName) {
            alert("Surname is required.");
            return;
        }

        // Prompt for grade
        let grade;
        while (true) {
            grade = prompt("Enter Student Grade (8, 9, 10, 11, or 12):");
            if (!grade) {
                alert("Grade is required.");
                return;
            }
            
            // Validate grade
            const validGrades = [8, 9, 10, 11, 12];
            if (validGrades.includes(parseInt(grade))) {
                break;
            } else {
                alert("Please enter a valid grade: 8, 9, 10, 11, or 12");
            }
        }

        // Update button text to show progress
        const textElements = document.querySelectorAll(".animated-btn .text");
        textElements.forEach(el => el.innerHTML = "Uploading...");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('grade', grade);

        try {
            // Sending to the Cloudflare Worker
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                textElements.forEach(el => el.innerHTML = "Success!");
                alert(`✅ Registration successful!\n\nName: ${firstName} ${lastName}\nGrade: ${grade}\nFile: ${result.newName}\nRegistration ID: ${result.registrationId}`);
                
                // Clear the form
                fileInput.value = "";
                fileInfo.classList.remove('show');
                
                // Reset button text after 2 seconds
                setTimeout(() => {
                    textElements.forEach(el => el.innerHTML = "Submit");
                }, 2000);
                
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (error) {
            alert("❌ Error: " + error.message);
            textElements.forEach(el => el.innerHTML = "Retry");
        }
    });
});
