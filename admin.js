// ===== Admin Portal JavaScript =====
document.addEventListener('DOMContentLoaded', function() {
    // ===== Mobile Toggle =====
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // ===== Initialize empty submissions array =====
    let submissions = [];

    // ===== DOM Elements =====
    const submissionsBody = document.getElementById('submissionsBody');
    const totalSubmissionsEl = document.getElementById('totalSubmissions');
    const todaySubmissionsEl = document.getElementById('todaySubmissions');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');
    const fileViewerModal = document.getElementById('fileViewerModal');
    const fileViewer = document.getElementById('fileViewer');
    const downloadFromViewerBtn = document.getElementById('downloadFromViewerBtn');

    // ===== Current selected file for download =====
    let currentFileUrl = '';
    let currentFileName = '';

    // ===== Initialize Dashboard =====
    function initDashboard() {
        // In production, you would fetch data from your backend here
        fetchSubmissions();
        setupEventListeners();
    }

    // ===== Fetch Submissions from Backend =====
    function fetchSubmissions() {
        loadingSpinner.classList.add('show');
        
        // TODO: Replace with your actual API endpoint
        // Example:
        // fetch('/api/admin/submissions')
        //     .then(response => response.json())
        //     .then(data => {
        //         submissions = data;
        //         updateStats();
        //         renderTable();
        //         loadingSpinner.classList.remove('show');
        //     })
        //     .catch(error => {
        //         console.error('Error fetching submissions:', error);
        //         loadingSpinner.classList.remove('show');
        //         showError('Failed to load submissions. Please try again.');
        //     });
        
        // For now, just show empty state after loading
        setTimeout(() => {
            loadingSpinner.classList.remove('show');
            updateStats();
            renderTable();
        }, 800);
    }

    // ===== Update Statistics =====
    function updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        const total = submissions.length;
        const todayCount = submissions.filter(s => s.dateSubmitted.split('T')[0] === today).length;

        totalSubmissionsEl.textContent = total;
        todaySubmissionsEl.textContent = todayCount;
    }

    // ===== Render Table =====
    function renderTable() {
        if (submissions.length === 0) {
            submissionsBody.innerHTML = '';
            noResults.classList.add('show');
            return;
        }

        noResults.classList.remove('show');
        
        // Sort by date (latest first)
        const sortedSubmissions = [...submissions].sort((a, b) => 
            new Date(b.dateSubmitted) - new Date(a.dateSubmitted)
        );
        
        submissionsBody.innerHTML = sortedSubmissions.map(sub => {
            const date = new Date(sub.dateSubmitted);
            const formattedDate = date.toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            return `
                <tr>
                    <td>
                        <div style="font-weight: 500;">${formattedDate}</div>
                        <small style="color: var(--text-grey);">Ref: ${sub.id}</small>
                    </td>
                    <td>
                        <div class="file-info">
                            <i class="fas fa-file-pdf file-icon"></i>
                            <div>
                                <div class="file-name">${sub.fileName}</div>
                                <small style="color: var(--text-grey);">${sub.fileSize || 'N/A'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewFile('${sub.id}')" title="View File">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn download-btn" onclick="downloadFile('${sub.id}')" title="Download">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteSubmission('${sub.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ===== View File =====
    window.viewFile = function(id) {
        const submission = submissions.find(s => s.id === id);
        if (!submission) return;

        currentFileUrl = submission.fileUrl;
        currentFileName = submission.fileName;
        
        // Set the iframe source to view the PDF
        if (submission.fileUrl && submission.fileUrl !== '#') {
            fileViewer.src = 'https://docs.google.com/viewer?url=' + encodeURIComponent(submission.fileUrl) + '&embedded=true';
        } else {
            fileViewer.src = 'about:blank';
            alert('File URL not available. Please check the file path.');
        }
        
        // Update download button
        downloadFromViewerBtn.onclick = function() {
            downloadFile(id);
        };
        
        fileViewerModal.classList.add('show');
    };

    // ===== Download File =====
    window.downloadFile = function(id) {
        const submission = submissions.find(s => s.id === id);
        if (!submission) return;

        if (submission.fileUrl && submission.fileUrl !== '#') {
            const link = document.createElement('a');
            link.href = submission.fileUrl;
            link.download = submission.fileName;
            link.click();
        } else {
            alert('File not available for download. Please check the file path.');
        }
    };

    // ===== Delete Submission =====
    window.deleteSubmission = function(id) {
        if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            // TODO: Implement actual delete API call
            // fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' })
            //     .then(response => {
            //         if (response.ok) {
            //             submissions = submissions.filter(s => s.id !== id);
            //             updateStats();
            //             renderTable();
            //             if (fileViewerModal.classList.contains('show')) {
            //                 closeFileViewer();
            //             }
            //         }
            //     });
            
            // For now, just remove from local array
            submissions = submissions.filter(s => s.id !== id);
            updateStats();
            renderTable();
            
            if (fileViewerModal.classList.contains('show')) {
                closeFileViewer();
            }
            
            alert('Submission deleted successfully.');
        }
    };

    // ===== Refresh Submissions =====
    window.refreshSubmissions = function() {
        fetchSubmissions();
    };

    // ===== Close File Viewer =====
    window.closeFileViewer = function() {
        fileViewerModal.classList.remove('show');
        fileViewer.src = '';
    };

    // ===== Show Error Message =====
    function showError(message) {
        // You can implement a toast notification here
        alert(message);
    }

    // ===== Setup Event Listeners =====
    function setupEventListeners() {
        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                // TODO: Implement actual logout
                // fetch('/api/admin/logout', { method: 'POST' })
                //     .then(() => {
                //         window.location.href = 'registration.html';
                //     });
                
                window.location.href = 'registration.html';
            }
        });

        // Close modal when clicking outside
        fileViewerModal.addEventListener('click', function(e) {
            if (e.target === fileViewerModal) {
                closeFileViewer();
            }
        });

        // Add keyboard support for closing modal (ESC key)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && fileViewerModal.classList.contains('show')) {
                closeFileViewer();
            }
        });
    }

    // ===== Initialize =====
    initDashboard();
});