/**
 * Paul Morutse Institute · Admin Portal JS
 * Handles fetching from D1 database and streaming from R2 storage
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== Configuration =====
    // Ensure this matches the URL of your deployed Cloudflare Worker
    const WORKER_URL = 'https://admin.buhlemanyike2.workers.dev';
    
    // Auth Token from your worker.js: 'pmi_admin_token_2025_secure'
    const authToken = sessionStorage.getItem('pmi_admin_auth');

    // ===== Redirect if not logged in =====
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

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
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    /**
     * Fetch all registration data from the D1 Database via the Worker
     */
    async function fetchSubmissions() {
        loadingSpinner.classList.add('show');
        noResults.classList.remove('show');
        
        try {
            const response = await fetch(`${WORKER_URL}/admin/submissions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    sessionStorage.removeItem('pmi_admin_auth');
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                submissions = data.submissions || [];
                updateStats();
                renderTable();
            } else {
                throw new Error(data.error || 'Failed to load data');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showNotification('Error connecting to the server', 'error');
            noResults.classList.add('show');
        } finally {
            loadingSpinner.classList.remove('show');
        }
    }

    /**
     * Updates Dashboard Counters
     * Uses UTC date comparison to match SQLite CURRENT_TIMESTAMP
     */
    function updateStats() {
        const todayStr = new Date().toISOString().split('T')[0];
        const total = submissions.length;
        const todayCount = submissions.filter(s => 
            s.dateSubmitted && s.dateSubmitted.startsWith(todayStr)
        ).length;
        
        if (totalSubmissionsEl) totalSubmissionsEl.textContent = total;
        if (todaySubmissionsEl) todaySubmissionsEl.textContent = todayCount;
    }

    /**
     * Renders the HTML Table Rows
     */
    function renderTable() {
        if (!submissionsBody) return;
        
        if (submissions.length === 0) {
            submissionsBody.innerHTML = '';
            noResults.classList.add('show');
            return;
        }
        
        noResults.classList.remove('show');

        submissionsBody.innerHTML = submissions.map(sub => {
            const date = new Date(sub.dateSubmitted);
            const formattedDate = date.toLocaleDateString('en-ZA', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            // Determine Icon based on file type
            const isPdf = sub.fileType === 'application/pdf';
            const icon = isPdf ? 'fa-file-pdf' : 'fa-file-image';
            const iconColor = isPdf ? '#c4262e' : '#1e4a76';

            return `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${escapeHtml(formattedDate)}</div>
                        <small style="color: #666;">ID: ${sub.id} | Grade ${sub.grade}</small>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas ${icon}" style="color: ${iconColor}; font-size: 1.4rem;"></i>
                            <div>
                                <div style="font-weight: 500;">${escapeHtml(sub.studentName)}</div>
                                <small style="color: #666;">${escapeHtml(sub.fileName)} (${sub.fileSize})</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewFile('${sub.r2_key}')" title="View File">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn download-btn" onclick="downloadFile('${sub.r2_key}', '${sub.fileName}')" title="Download">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteSubmission(${sub.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Opens Modal and streams file from R2
     * Passes token via query string for iframe access
     */
    window.viewFile = function(r2Key) {
        const fileUrl = `${WORKER_URL}/admin/file/${encodeURIComponent(r2Key)}?token=${authToken}`;
        
        if (fileViewer) {
            fileViewer.src = fileUrl;
        }
        
        if (downloadFromViewerBtn) {
            downloadFromViewerBtn.onclick = () => window.downloadFile(r2Key, 'document');
        }
        
        fileViewerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    /**
     * Triggers file download with attachment header
     */
    window.downloadFile = function(r2Key, fileName) {
        const downloadUrl = `${WORKER_URL}/admin/file/${encodeURIComponent(r2Key)}?token=${authToken}&download=true`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * Deletes from both D1 and R2
     */
    window.deleteSubmission = async function(id) {
        if (!confirm('⚠️ Permanently delete this submission and file?')) return;
        
        try {
            const response = await fetch(`${WORKER_URL}/admin/submissions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (response.ok) {
                showNotification('Record deleted successfully', 'success');
                fetchSubmissions();
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Delete failed');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    // ===== UI Helpers =====

    window.closeFileViewer = function() {
        fileViewerModal.classList.remove('show');
        fileViewer.src = '';
        document.body.style.overflow = '';
    };

    window.refreshSubmissions = () => fetchSubmissions();

    function showNotification(message, type) {
        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: ${type === 'error' ? '#c4262e' : '#0a2c4b'};
            color: white; padding: 1rem 1.5rem; border-radius: 8px;
            z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Navigation & Events =====

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => navLinks.classList.toggle('show'));
    }

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeFileViewer();
    });

    // Initialize
    fetchSubmissions();
});
