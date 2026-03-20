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

  // ✅ UPDATE THIS TO YOUR ACTUAL WORKER URL
  const WORKER_URL = 'https://admin-portal.buhlemanyike2.workers.dev';

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

  let currentFileUrl = '';
  let currentFileName = '';

  // ===== Initialize Dashboard =====
  function initDashboard() {
    fetchSubmissions();
    setupEventListeners();
  }

  // ===== Fetch Submissions =====
  async function fetchSubmissions() {
    loadingSpinner.classList.add('show');
    noResults.classList.remove('show');
    
    try {
      console.log('🔍 Fetching from:', `${WORKER_URL}/admin/submissions`);
      
      const response = await fetch(`${WORKER_URL}/admin/submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        if (response.status === 401) {
          sessionStorage.removeItem('pmi_admin_auth');
          window.location.href = 'login.html';
          return;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Received data:', data);
      
      if (data.success) {
        submissions = data.submissions || [];
        console.log(`📦 Loaded ${submissions.length} submissions`);
        updateStats();
        renderTable();
      } else {
        throw new Error(data.error || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('💥 Error fetching submissions:', error);
      showError('Failed to load: ' + error.message);
      noResults.classList.add('show');
      noResults.querySelector('h3').textContent = 'Connection Error';
      noResults.querySelector('p').textContent = 'Check console for details or contact support.';
    } finally {
      loadingSpinner.classList.remove('show');
    }
  }

  // ===== Update Statistics =====
  function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const total = submissions.length;
    const todayCount = submissions.filter(s => 
      s.dateSubmitted && s.dateSubmitted.startsWith(today)
    ).length;
    totalSubmissionsEl.textContent = total;
    todaySubmissionsEl.textContent = todayCount;
  }

  // ===== Render Table =====
  function renderTable() {
    if (!submissions || submissions.length === 0) {
      submissionsBody.innerHTML = '';
      noResults.classList.add('show');
      return;
    }
    noResults.classList.remove('show');

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
              <button class="action-btn view-btn" onclick="viewFile('${sub.id}')" title="View">
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

    // Remove download param for viewing
    let viewUrl = submission.fileUrl.replace(/[?&]download=true/g, '');
    
    if (viewUrl && viewUrl !== '#') {
      fileViewer.src = viewUrl;
    } else {
      fileViewer.src = 'about:blank';
      alert('File URL not available.');
    }

    downloadFromViewerBtn.onclick = () => downloadFile(id);
    fileViewerModal.classList.add('show');
  };

  // ===== Download File =====
  window.downloadFile = function(id) {
    const submission = submissions.find(s => s.id == id);
    if (!submission) return;
    
    if (submission.fileUrl && submission.fileUrl !== '#') {
      // Add download=true to force download
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
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${WORKER_URL}/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      
      if (response.ok) {
        submissions = submissions.filter(s => s.id != id);
        updateStats();
        renderTable();
        if (fileViewerModal.classList.contains('show')) closeFileViewer();
        alert('✅ Deleted successfully');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Failed to delete submission');
    }
  };

  // ===== Refresh =====
  window.refreshSubmissions = fetchSubmissions;

  // ===== Close Modal =====
  window.closeFileViewer = function() {
    fileViewerModal.classList.remove('show');
    fileViewer.src = '';
  };

  // ===== Show Error =====
  function showError(message) {
    console.error('⚠️', message);
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

    document.getElementById('refreshBtn')?.addEventListener('click', fetchSubmissions);

    fileViewerModal.addEventListener('click', (e) => {
      if (e.target === fileViewerModal) closeFileViewer();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fileViewerModal.classList.contains('show')) {
        closeFileViewer();
      }
    });
  }

  // ===== Initialize =====
  initDashboard();
});
