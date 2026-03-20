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

  // ===== Check Admin Auth =====
  const authToken = sessionStorage.getItem('pmi_admin_auth');
  if (!authToken) {
    window.location.href = 'login.html';
    return;
  }

  // ===== WORKER API URL - UPDATE THIS TO YOUR ADMIN WORKER =====
  const WORKER_URL = 'https://admin-portal.buhlemanyike2.workers.dev'; // ← CHANGE THIS!

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
    fetchSubmissions();
    setupEventListeners();
  }

  // ===== Fetch Submissions from Worker API =====
  async function fetchSubmissions() {
    loadingSpinner.classList.add('show');
    
    try {
      console.log('Fetching from:', `${WORKER_URL}/admin/submissions`);
      
      const response = await fetch(`${WORKER_URL}/admin/submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - clearing auth');
          sessionStorage.removeItem('pmi_admin_auth');
          window.location.href = 'login.html';
          return;
        }
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to fetch: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.success) {
        submissions = data.submissions;
        console.log(`Loaded ${submissions.length} submissions`);
        updateStats();
        renderTable();
      } else {
        throw new Error(data.error || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      showError('Failed to load submissions: ' + error.message);
      noResults.classList.add('show');
      noResults.querySelector('h3').textContent = 'Connection Error';
      noResults.querySelector('p').textContent = 'Could not connect to admin server. Please check your internet or contact support.';
    } finally {
      loadingSpinner.classList.remove('show');
    }
  }

  // ===== Update Statistics =====
  function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const total = submissions.length;
    const todayCount = submissions.filter(s => 
      s.dateSubmitted && s.dateSubmitted.split('T')[0] === today
    ).length;

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
        minute: '2-digit'
      });

      return `
        <tr>
          <td>
            <div style="font-weight: 500;">${formattedDate}</div>
            <small style="color: var(--text-grey);">Ref: ${sub.id} | Grade ${sub.grade}</small>
          </td>
          <td>
            <div class="file-info">
              <i class="fas fa-file-pdf file-icon"></i>
              <div>
                <div class="file-name">${sub.studentName || 'Unknown'}</div>
                <small style="color: var(--text-grey);">${sub.fileName || 'No file'} (${sub.fileSize || 'N/A'})</small>
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
    const submission = submissions.find(s => s.id == id);
    if (!submission) return;
    
    currentFileUrl = submission.fileUrl;
    currentFileName = submission.fileName;

    // ✅ Remove download parameter for viewing (ensure inline display)
    let viewUrl = submission.fileUrl;
    viewUrl = viewUrl.replace(/[?&]download=true/g, '');

    if (viewUrl && viewUrl !== '#') {
      fileViewer.src = viewUrl;
    } else {
      fileViewer.src = 'about:blank';
      alert('File URL not available.');
    }

    downloadFromViewerBtn.onclick = function() {
      downloadFile(id);
    };

    fileViewerModal.classList.add('show');
  };

  // ===== Download File =====
  window.downloadFile = function(id) {
    const submission = submissions.find(s => s.id == id);
    if (!submission) return;
    
    if (submission.fileUrl && submission.fileUrl !== '#') {
      // ✅ Add download=true parameter to force file download
      let downloadUrl = submission.fileUrl;
      if (!downloadUrl.includes('download=')) {
        downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + 'download=true';
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = submission.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('File not available for download.');
    }
  };

  // ===== Delete Submission =====
  window.deleteSubmission = async function(id) {
    if (confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
      try {
        const response = await fetch(`${WORKER_URL}/admin/submissions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (response.ok) {
          submissions = submissions.filter(s => s.id != id);
          updateStats();
          renderTable();
          
          if (fileViewerModal.classList.contains('show')) {
            closeFileViewer();
          }
          
          alert('Submission deleted successfully.');
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete submission.');
      }
    }
  };

  // ===== Refresh =====
  window.refreshSubmissions = function() {
    fetchSubmissions();
  };

  // ===== Close Modal =====
  window.closeFileViewer = function() {
    fileViewerModal.classList.remove('show');
    fileViewer.src = '';
  };

  // ===== Show Error =====
  function showError(message) {
    alert('⚠️ ' + message);
  }

  // ===== Event Listeners =====
  function setupEventListeners() {
    document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Logout?')) {
        sessionStorage.removeItem('pmi_admin_auth');
        sessionStorage.removeItem('pmi_admin_email');
        window.location.href = 'login.html';
      }
    });

    fileViewerModal.addEventListener('click', function(e) {
      if (e.target === fileViewerModal) closeFileViewer();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && fileViewerModal.classList.contains('show')) {
        closeFileViewer();
      }
    });
  }

  // ===== Initialize =====
  initDashboard();
});
