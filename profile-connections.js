// Profile and Connection Management System
class ProfileManager {
  constructor() {
    this.currentUser = null;
    this.connections = { accepted: [], pending: [], sent: [] };
    this.init();
  }

  init() {
    // Load current user from session storage
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
      alert('Please log in to access your profile');
      window.location.href = 'loginpage.html';
      return;
    }
    
    this.currentUser = JSON.parse(userData);
    this.loadProfile();
    this.loadConnections();
    this.setupEventListeners();
    this.setupTabs();
  }

  loadProfile() {
    // Update profile display
    document.getElementById('user-name').textContent = this.currentUser.name;
    document.getElementById('user-bio').textContent = this.currentUser.skills || 'No skills listed';
  }

  async loadConnections() {
    try {
      const response = await fetch(`/user/${this.currentUser.id}/connections`);
      const data = await response.json();
      
      if (response.ok) {
        this.connections = {
          accepted: data.connections || [],
          pending: data.pendingRequests || [],
          sent: data.sentRequests || []
        };
        this.renderConnections();
        this.updateNotificationBadge();
        this.updateFindConnectionsButton();
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  }

  setupTabs() {
    // Create tabs for connections
    const connectionsCard = document.querySelector('.teams-card');
    const connectionsHeader = connectionsCard.querySelector('.teams-header');
    
    // Update header
    connectionsHeader.innerHTML = `
      <h2>Connections</h2>
      <div class="notification-container">
        <span id="connection-count" style="color: rgba(255,255,255,0.8); margin-right: 10px;">0/5</span>
        <span id="notification-badge" class="notification-badge" style="display: none;">0</span>
      </div>
    `;

    // Add tab navigation
    const tabNav = document.createElement('div');
    tabNav.className = 'tab-navigation';
    tabNav.innerHTML = `
      <button class="tab-btn active" data-tab="accepted">Connected</button>
      <button class="tab-btn" data-tab="pending">Requests <span id="pending-count" class="tab-count">0</span></button>
      <button class="tab-btn" data-tab="sent">Sent <span id="sent-count" class="tab-count">0</span></button>
    `;
    
    connectionsCard.insertBefore(tabNav, connectionsCard.querySelector('.team-member-list'));

    // Add tab event listeners
    tabNav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
        
        // Update active tab
        tabNav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.renderConnections();
  }

  renderConnections() {
    const container = document.getElementById('team-list');
    const currentTab = this.currentTab || 'accepted';
    const connectionsList = this.connections[currentTab] || [];
    
    container.innerHTML = '';

    if (connectionsList.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-state';
      emptyMessage.innerHTML = `
        <p style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">
          ${this.getEmptyStateMessage(currentTab)}
        </p>
      `;
      container.appendChild(emptyMessage);
      return;
    }

    connectionsList.forEach(user => {
      const connectionDiv = document.createElement('div');
      connectionDiv.className = 'member-placeholder';
      
      const buttonsHtml = this.getConnectionButtons(currentTab, user);
      
      connectionDiv.innerHTML = `
        <div class="member-info">
          <div class="member-avatar">👤</div>
          <div>
            <strong>${user.name}</strong><br>
            <span>${user.skills || 'No skills listed'}</span>
          </div>
        </div>
        <div class="connection-actions">
          ${buttonsHtml}
        </div>
      `;
      
      container.appendChild(connectionDiv);
    });

    // Update counts
    document.getElementById('pending-count').textContent = this.connections.pending.length;
    document.getElementById('sent-count').textContent = this.connections.sent.length;
    document.getElementById('connection-count').textContent = `${this.connections.accepted.length}/5`;
    
    // Update connection count color based on limit
    const connectionCountEl = document.getElementById('connection-count');
    if (this.connections.accepted.length >= 5) {
      connectionCountEl.style.color = '#ff4444';
      connectionCountEl.textContent = '5/5 (FULL)';
    } else {
      connectionCountEl.style.color = 'rgba(255,255,255,0.8)';
    }
  }

  getEmptyStateMessage(tab) {
    switch(tab) {
      case 'accepted': return 'No connections yet. Start by sending connection requests!';
      case 'pending': return 'No pending requests.';
      case 'sent': return 'No sent requests.';
      default: return 'No data available.';
    }
  }

  getConnectionButtons(tab, user) {
    switch(tab) {
      case 'accepted':
        return `<button class="btn btn-danger btn-sm" onclick="profileManager.removeConnection(${user.id})">Remove</button>`;
      case 'pending':
        return `
          <button class="btn btn-success btn-sm" onclick="profileManager.acceptConnection(${user.id})">Accept</button>
          <button class="btn btn-danger btn-sm" onclick="profileManager.rejectConnection(${user.id})">Reject</button>
        `;
      case 'sent':
        return `<span class="status-pending">Pending...</span>`;
      default:
        return '';
    }
  }

  async acceptConnection(requesterId) {
    try {
      const response = await fetch('/connections/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser.id, requesterId })
      });
      
      const result = await response.json();
      if (response.ok) {
        this.loadConnections(); // Refresh connections
        this.showNotification(result.message, 'success');
      } else {
        this.showNotification(result.message, 'error');
      }
    } catch (error) {
      this.showNotification('Error accepting connection', 'error');
    }
  }

  async rejectConnection(requesterId) {
    try {
      const response = await fetch('/connections/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser.id, requesterId })
      });
      
      const result = await response.json();
      if (response.ok) {
        this.loadConnections(); // Refresh connections
        this.showNotification(result.message, 'success');
      } else {
        this.showNotification(result.message, 'error');
      }
    } catch (error) {
      this.showNotification('Error rejecting connection', 'error');
    }
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const pendingCount = this.connections.pending.length;
    
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Edit profile functionality
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('editProfileModal');
    const editProfileForm = document.getElementById('edit-profile-form');
    
    if (editProfileBtn && editProfileModal && editProfileForm) {
      editProfileBtn.onclick = () => {
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editSkills').value = this.currentUser.skills || '';
        editProfileModal.style.display = 'block';
      };

      editProfileForm.onsubmit = (event) => {
        event.preventDefault();
        const updatedProfile = {
          name: document.getElementById('editName').value,
          skills: document.getElementById('editSkills').value
        };
        this.updateProfile(updatedProfile);
        editProfileModal.style.display = 'none';
      };
    }

    // Close modal functionality
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.onclick = function() {
        btn.closest('.modal').style.display = 'none';
      };
    });

    // Add team member button (now "Find Connections")
    const addBtn = document.getElementById('add-team-member-btn');
    if (addBtn) {
      this.updateFindConnectionsButton();
    }
  }

  updateProfile(profileData) {
    // Update current user data
    this.currentUser.name = profileData.name;
    this.currentUser.skills = profileData.skills;
    
    // Update session storage
    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    // Update display
    this.loadProfile();
    this.showNotification('Profile updated successfully!', 'success');
  }

  async openConnectionsModal() {
    try {
      const response = await fetch('/users');
      const allUsers = await response.json();
      
      // Filter out current user and existing connections
      const availableUsers = allUsers.filter(user => 
        user.id !== this.currentUser.id && 
        !this.connections.accepted.some(conn => conn.id === user.id) &&
        !this.connections.pending.some(req => req.id === user.id) &&
        !this.connections.sent.some(sent => sent.id === user.id)
      );

      this.showConnectionsModal(availableUsers);
    } catch (error) {
      this.showNotification('Error loading users', 'error');
    }
  }

  showConnectionsModal(users) {
    // Create and show a modal with available users
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Find New Connections</h2>
        <div class="users-list" style="max-height: 400px; overflow-y: auto;">
          ${users.map(user => `
            <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <div>
                <strong>${user.name}</strong><br>
                <span style="color: rgba(255,255,255,0.7);">${user.skills || 'No skills listed'}</span>
              </div>
              <button class="btn btn-sm" onclick="profileManager.sendConnectionRequest(${user.id}); this.closest('.modal').remove();">
                Send Request
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  }

  async sendConnectionRequest(toUserId) {
    try {
      const response = await fetch('/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: this.currentUser.id, toUserId })
      });
      
      const result = await response.json();
      if (response.ok) {
        this.loadConnections(); // Refresh connections
        this.showNotification(result.message, 'success');
      } else {
        this.showNotification(result.message, 'error');
      }
    } catch (error) {
      this.showNotification('Error sending connection request', 'error');
    }
  }

  updateFindConnectionsButton() {
    const addBtn = document.getElementById('add-team-member-btn');
    if (!addBtn) return;

    if (this.connections.accepted.length >= 5) {
      addBtn.textContent = 'Connections Full (5/5)';
      addBtn.style.background = '#6c757d';
      addBtn.style.cursor = 'not-allowed';
      addBtn.onclick = () => this.showNotification('You have reached the maximum limit of 5 connections', 'error');
    } else {
      addBtn.textContent = 'Find New Connections';
      addBtn.style.background = 'linear-gradient(135deg, #00f2fe, #4facfe)';
      addBtn.style.cursor = 'pointer';
      addBtn.onclick = () => this.openConnectionsModal();
    }
  }

  showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize profile manager when DOM is loaded
let profileManager;
document.addEventListener('DOMContentLoaded', function() {
  profileManager = new ProfileManager();
});

// Add CSS for tabs and notifications
const style = document.createElement('style');
style.textContent = `
  .tab-navigation {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 10px;
  }
  
  .tab-btn {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }
  
  .tab-btn:hover {
    background: rgba(255,255,255,0.2);
  }
  
  .tab-btn.active {
    background: linear-gradient(135deg, #00f2fe, #4facfe);
    border-color: transparent;
  }
  
  .tab-count {
    background: #ff4444;
    color: white;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 0.8em;
    margin-left: 5px;
  }
  
  .notification-badge {
    background: #ff4444;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    font-weight: bold;
  }
  
  .connection-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .btn-sm {
    padding: 4px 8px;
    font-size: 0.8em;
  }
  
  .btn-success {
    background: linear-gradient(135deg, #4CAF50, #45a049);
  }
  
  .btn-danger {
    background: linear-gradient(135deg, #f44336, #da190b);
  }
  
  .status-pending {
    color: rgba(255,255,255,0.6);
    font-style: italic;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);