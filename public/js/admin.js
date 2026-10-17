// public/js/admin.js - Isai Marketing Admin Portal

const ADMIN_USER_DEFAULT = 'isai@1991';
const ADMIN_PASS_DEFAULT = 'Tamil@1991';
const ADMIN_TOKEN_KEY = 'isai_admin_token';
let adminStoreData = null;

// Initialize Admin Portal
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupAdminEvents();
});

// Check if authenticated
function checkAuth() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const loginScreen = document.getElementById('loginScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');

  if (token) {
    loginScreen.classList.add('d-none');
    dashboardScreen.classList.remove('d-none');
    loadAdminData();
  } else {
    loginScreen.classList.remove('d-none');
    dashboardScreen.classList.add('d-none');
  }
}

// Handle Login
function setupAdminEvents() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUser').value.trim();
      const pass = document.getElementById('loginPass').value.trim();
      const alertBox = document.getElementById('loginAlert');
      const submitBtn = document.getElementById('loginSubmitBtn');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verifying...';

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          localStorage.setItem(ADMIN_TOKEN_KEY, data.token || 'isai_auth_secure_token_1991');
          checkAuth();
          return;
        } else {
          throw new Error(data.error || 'Invalid credentials');
        }
      } catch (err) {
        // Fallback client check if standalone or offline
        if (
          (user === ADMIN_USER_DEFAULT || user === 'isai') &&
          pass === ADMIN_PASS_DEFAULT
        ) {
          localStorage.setItem(ADMIN_TOKEN_KEY, 'isai_auth_secure_token_1991');
          checkAuth();
          return;
        }

        alertBox.textContent = 'Invalid credentials! Please use username: isai@1991 and password: Tamil@1991';
        alertBox.classList.remove('d-none');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Access Admin Dashboard';
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out from the Admin Portal?')) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        checkAuth();
      }
    });
  }

  // Navigation tab switcher
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Quick Git Push Button
  const quickPushBtn = document.getElementById('quickGitPushBtn');
  if (quickPushBtn) {
    quickPushBtn.addEventListener('click', () => triggerManualGitPush());
  }

  // Offer Form
  const offerForm = document.getElementById('offerForm');
  if (offerForm) {
    offerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!adminStoreData.offer) adminStoreData.offer = {};
      adminStoreData.offer.badge = document.getElementById('adminOfferBadge').value;
      adminStoreData.offer.title = document.getElementById('adminOfferTitle').value;
      adminStoreData.offer.description = document.getElementById('adminOfferDesc').value;
      adminStoreData.offer.image = document.getElementById('adminOfferImg').value;
      saveAllChanges(true, 'Updated Offer & Announcement Bar');
    });
  }

  // Store Info Form
  const storeInfoForm = document.getElementById('storeInfoForm');
  if (storeInfoForm) {
    storeInfoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!adminStoreData.storeInfo) adminStoreData.storeInfo = {};
      const info = adminStoreData.storeInfo;
      info.name = document.getElementById('adminStoreName').value;
      info.subName = document.getElementById('adminStoreSub').value;
      info.promoter = document.getElementById('adminStorePromoter').value;
      info.whatsappNumber = document.getElementById('adminStoreWhatsapp').value;
      info.email = document.getElementById('adminStoreEmail').value;
      info.address = document.getElementById('adminStoreAddress').value;
      info.aboutEn = document.getElementById('adminStoreAboutEn').value;
      info.aboutTa = document.getElementById('adminStoreAboutTa').value;

      const phonesStr = document.getElementById('adminStorePhones').value;
      info.phones = phonesStr.split(',').map(p => p.trim()).filter(Boolean);

      saveAllChanges(true, 'Updated Store Profile & Contact details');
    });
  }

  // Product Add/Edit Form
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('prodEditId').value;
      const name = document.getElementById('prodName').value;
      const category = document.getElementById('prodCategory').value;
      const price = parseFloat(document.getElementById('prodPrice').value);
      const mrp = parseFloat(document.getElementById('prodMrp').value) || price;
      const image = document.getElementById('prodImage').value;
      const badge = document.getElementById('prodBadge').value;
      const description = document.getElementById('prodDesc').value;
      const inStock = document.getElementById('prodInStock').checked;

      if (!adminStoreData.products) adminStoreData.products = [];

      if (editId) {
        // Edit existing
        const idx = adminStoreData.products.findIndex(p => p.id === editId);
        if (idx > -1) {
          adminStoreData.products[idx] = {
            id: editId,
            name,
            category,
            price,
            mrp,
            image,
            badge,
            description,
            inStock
          };
        }
      } else {
        // Add new
        adminStoreData.products.unshift({
          id: 'prod-' + Date.now(),
          name,
          category,
          price,
          mrp,
          image: image || 'https://placehold.co/240x200/f8f9fa/333?text=Appliance',
          badge,
          description,
          inStock
        });
      }

      const modalElem = document.getElementById('productModal');
      const modal = bootstrap.Modal.getInstance(modalElem);
      if (modal) modal.hide();

      saveAllChanges(true, editId ? `Updated appliance: ${name}` : `Added new appliance: ${name}`);
      renderAdminProducts();
    });
  }

  // Service Add/Edit Form
  const serviceForm = document.getElementById('serviceForm');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('serviceEditId').value;
      const title = document.getElementById('srvTitle').value;
      const highlight = document.getElementById('srvHighlight').value;
      const icon = document.getElementById('srvIcon').value || 'bi-wrench';
      const description = document.getElementById('srvDesc').value;

      if (!adminStoreData.services) adminStoreData.services = [];

      if (editId) {
        const idx = adminStoreData.services.findIndex(s => s.id === editId);
        if (idx > -1) {
          adminStoreData.services[idx] = { id: editId, title, highlight, icon, description };
        }
      } else {
        adminStoreData.services.push({
          id: 'srv-' + Date.now(),
          title,
          highlight,
          icon,
          description
        });
      }

      const modalElem = document.getElementById('serviceModal');
      const modal = bootstrap.Modal.getInstance(modalElem);
      if (modal) modal.hide();

      saveAllChanges(true, editId ? `Updated service: ${title}` : `Added service: ${title}`);
      renderAdminServices();
    });
  }
}

// Switch Tab
function switchTab(tabId) {
  const tabs = document.querySelectorAll('main .tab-pane');
  tabs.forEach(t => t.classList.add('d-none'));

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('d-none');
}

// Load data into Admin Dashboard
async function loadAdminData() {
  try {
    const res = await fetch('/api/store');
    if (!res.ok) throw new Error('API failed');
    adminStoreData = await res.json();
  } catch (err) {
    console.warn('API fetch failed, loading local JSON:', err);
    try {
      const fallback = await fetch('../data/store_data.json');
      adminStoreData = await fallback.json();
    } catch (fErr) {
      adminStoreData = {};
    }
  }

  // Overlay any localStorage updates
  const localSaved = localStorage.getItem('isai_store_data_local');
  if (localSaved) {
    try {
      adminStoreData = Object.assign({}, adminStoreData, JSON.parse(localSaved));
    } catch(e) {}
  }

  populateAdminDashboard();
}

// Populate Admin Fields
function populateAdminDashboard() {
  if (!adminStoreData) return;

  // Stats
  document.getElementById('statProducts').textContent = (adminStoreData.products || []).length;
  document.getElementById('statServices').textContent = (adminStoreData.services || []).length;
  document.getElementById('statReviews').textContent = (adminStoreData.reviews || []).length;
  document.getElementById('statEnquiries').textContent = (adminStoreData.enquiries || []).length;
  document.getElementById('enquiryCountBadge').textContent = (adminStoreData.enquiries || []).length;

  // Store Info Fields
  const info = adminStoreData.storeInfo || {};
  document.getElementById('adminStoreName').value = info.name || '';
  document.getElementById('adminStoreSub').value = info.subName || '';
  document.getElementById('adminStorePromoter').value = info.promoter || '';
  document.getElementById('adminStoreWhatsapp').value = info.whatsappNumber || '';
  document.getElementById('adminStoreEmail').value = info.email || '';
  document.getElementById('adminStorePhones').value = (info.phones || []).join(', ');
  document.getElementById('adminStoreAddress').value = info.address || '';
  document.getElementById('adminStoreAboutEn').value = info.aboutEn || '';
  document.getElementById('adminStoreAboutTa').value = info.aboutTa || '';

  // Offers Fields
  const offer = adminStoreData.offer || {};
  document.getElementById('adminOfferBadge').value = offer.badge || '';
  document.getElementById('adminOfferTitle').value = offer.title || '';
  document.getElementById('adminOfferDesc').value = offer.description || '';
  document.getElementById('adminOfferImg').value = offer.image || '';

  // Render Lists
  renderAdminProducts();
  renderAdminServices();
  renderAdminProperties();
  renderAdminReviews();
  renderAdminEnquiries();
}

// Render Products Table
function renderAdminProducts() {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;

  const products = adminStoreData.products || [];
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.image || 'https://placehold.co/60x60'}" class="admin-table-img" alt="${p.name}">
      </td>
      <td>
        <div class="fw-bold text-dark">${p.name}</div>
        <small class="text-muted">${p.inStock ? '<span class="text-success">In Stock</span>' : '<span class="text-danger">Out of Stock</span>'}</small>
      </td>
      <td><span class="badge bg-light text-dark border">${p.category || 'General'}</span></td>
      <td><strong class="text-primary">₹${p.price ? p.price.toLocaleString('en-IN') : 0}</strong></td>
      <td><span class="text-muted">₹${p.mrp ? p.mrp.toLocaleString('en-IN') : 0}</span></td>
      <td>${p.badge ? `<span class="badge bg-info text-dark">${p.badge}</span>` : '-'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary rounded-circle p-1 me-1" onclick="openEditProductModal('${p.id}')" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger rounded-circle p-1" onclick="deleteProduct('${p.id}')" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Open Add Product Modal
function openAddProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('prodEditId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add New Appliance';
  document.getElementById('prodInStock').checked = true;

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

// Open Edit Product Modal
function openEditProductModal(id) {
  const product = (adminStoreData.products || []).find(p => p.id === id);
  if (!product) return;

  document.getElementById('prodEditId').value = product.id;
  document.getElementById('prodName').value = product.name || '';
  document.getElementById('prodCategory').value = product.category || 'Ceiling Fans';
  document.getElementById('prodPrice').value = product.price || '';
  document.getElementById('prodMrp').value = product.mrp || '';
  document.getElementById('prodImage').value = product.image || '';
  document.getElementById('prodBadge').value = product.badge || '';
  document.getElementById('prodDesc').value = product.description || '';
  document.getElementById('prodInStock').checked = product.inStock !== false;

  document.getElementById('productModalTitle').textContent = 'Edit Appliance';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

// Delete Product
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this appliance?')) {
    adminStoreData.products = (adminStoreData.products || []).filter(p => p.id !== id);
    saveAllChanges(true, 'Deleted appliance item');
    renderAdminProducts();
  }
}

// Render Services in Admin
function renderAdminServices() {
  const container = document.getElementById('adminServicesGrid');
  if (!container) return;

  const services = adminStoreData.services || [];
  container.innerHTML = services.map(s => `
    <div class="col-md-6">
      <div class="card p-3 border shadow-xs h-100 bg-white">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h6 class="fw-bold mb-0 text-primary">${s.title}</h6>
          <div>
            <button class="btn btn-sm btn-outline-primary rounded-circle p-1 me-1" onclick="openEditServiceModal('${s.id}')"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger rounded-circle p-1" onclick="deleteService('${s.id}')"><i class="bi bi-trash"></i></button>
          </div>
        </div>
        <p class="small text-muted mb-2">${s.description}</p>
        <div>${s.highlight ? `<span class="badge bg-success-subtle text-success small">${s.highlight}</span>` : ''}</div>
      </div>
    </div>
  `).join('');
}

function openAddServiceModal() {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceEditId').value = '';
  document.getElementById('serviceModalTitle').textContent = 'Add New Service';

  const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
  modal.show();
}

function openEditServiceModal(id) {
  const service = (adminStoreData.services || []).find(s => s.id === id);
  if (!service) return;

  document.getElementById('serviceEditId').value = service.id;
  document.getElementById('srvTitle').value = service.title || '';
  document.getElementById('srvHighlight').value = service.highlight || '';
  document.getElementById('srvIcon').value = service.icon || '';
  document.getElementById('srvDesc').value = service.description || '';

  document.getElementById('serviceModalTitle').textContent = 'Edit Service';

  const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
  modal.show();
}

function deleteService(id) {
  if (confirm('Delete this service?')) {
    adminStoreData.services = (adminStoreData.services || []).filter(s => s.id !== id);
    saveAllChanges(true, 'Deleted service item');
    renderAdminServices();
  }
}

// Render Properties
function renderAdminProperties() {
  const container = document.getElementById('adminPropertiesGrid');
  if (!container) return;

  const properties = adminStoreData.properties || [];
  container.innerHTML = properties.map(p => `
    <div class="col-md-4">
      <div class="card p-3 border shadow-xs h-100 bg-white">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h6 class="fw-bold mb-0 text-success">${p.title}</h6>
          <button class="btn btn-sm btn-outline-danger rounded-circle p-1" onclick="deleteProperty('${p.id}')"><i class="bi bi-trash"></i></button>
        </div>
        <small class="text-muted mb-2 d-block"><i class="bi bi-geo-alt"></i> ${p.location}</small>
        <span class="badge bg-light text-dark border align-self-start mb-2">${p.price}</span>
        <p class="small text-secondary mb-0">${p.description}</p>
      </div>
    </div>
  `).join('');
}

function openAddPropertyModal() {
  const title = prompt('Property Title (e.g. 1500 Sq.Ft Individual House):');
  if (!title) return;
  const location = prompt('Location in Salem (e.g. Shevapet / Ammapet):') || 'Salem';
  const price = prompt('Price (e.g. ₹45 Lakhs):') || 'Contact for Price';
  const description = prompt('Description:') || '';

  if (!adminStoreData.properties) adminStoreData.properties = [];
  adminStoreData.properties.push({
    id: 'prop-' + Date.now(),
    title,
    location,
    price,
    type: 'Property',
    description,
    image: 'https://placehold.co/400x250/28a745/white?text=Yazh+City+Property'
  });

  saveAllChanges(true, `Added property: ${title}`);
  renderAdminProperties();
}

function deleteProperty(id) {
  if (confirm('Delete this property listing?')) {
    adminStoreData.properties = (adminStoreData.properties || []).filter(p => p.id !== id);
    saveAllChanges(true, 'Deleted property listing');
    renderAdminProperties();
  }
}

// Render Reviews
function renderAdminReviews() {
  const tbody = document.getElementById('adminReviewsTableBody');
  if (!tbody) return;

  const reviews = adminStoreData.reviews || [];
  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td class="fw-bold">${r.name}</td>
      <td class="text-warning">${'⭐'.repeat(r.rating || 5)}</td>
      <td class="small text-muted">${r.date || 'Recent'}</td>
      <td class="small text-secondary text-truncate" style="max-width: 300px;">${r.comment}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger rounded-circle p-1" onclick="deleteReview('${r.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openAddReviewAdminModal() {
  const name = prompt('Customer Name:');
  if (!name) return;
  const comment = prompt('Customer Testimonial:');
  if (!comment) return;
  const rating = parseInt(prompt('Rating (1-5):') || '5', 10);

  if (!adminStoreData.reviews) adminStoreData.reviews = [];
  adminStoreData.reviews.unshift({
    id: 'rev-' + Date.now(),
    name,
    comment,
    rating,
    date: 'Today'
  });

  saveAllChanges(true, `Added review from ${name}`);
  renderAdminReviews();
}

function deleteReview(id) {
  if (confirm('Delete this customer review?')) {
    adminStoreData.reviews = (adminStoreData.reviews || []).filter(r => r.id !== id);
    saveAllChanges(true, 'Deleted customer review');
    renderAdminReviews();
  }
}

// Render Enquiries
function renderAdminEnquiries() {
  const tbody = document.getElementById('adminEnquiriesTableBody');
  if (!tbody) return;

  const enquiries = adminStoreData.enquiries || [];
  if (enquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No customer inquiries yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = enquiries.map(e => `
    <tr>
      <td class="small text-muted">${e.date || 'Recent'}</td>
      <td class="fw-bold text-dark">${e.name}</td>
      <td>
        <div class="small fw-semibold"><i class="bi bi-phone"></i> ${e.phone}</div>
        ${e.email ? `<small class="text-muted">${e.email}</small>` : ''}
      </td>
      <td><span class="badge bg-primary-subtle text-primary">${e.service || 'General'}</span></td>
      <td class="small text-secondary" style="max-width: 250px;">${e.message || '-'}</td>
      <td>
        <a href="https://wa.me/${(e.phone || '').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(e.name)}%2C%20regarding%20your%20inquiry%20at%20Isai%20Marketing" 
           target="_blank" class="btn btn-sm btn-success rounded-pill px-2">
          <i class="bi bi-whatsapp"></i> Reply
        </a>
      </td>
    </tr>
  `).join('');
}

function clearAllEnquiries() {
  if (confirm('Are you sure you want to clear all customer inquiries?')) {
    adminStoreData.enquiries = [];
    saveAllChanges(true, 'Cleared inquiries inbox');
    renderAdminEnquiries();
  }
}

// SAVE ALL CHANGES & AUTO GIT SYNC
async function saveAllChanges(autoPush = true, commitMsg = 'Admin update: Store data updated') {
  // Save locally first
  localStorage.setItem('isai_store_data_local', JSON.stringify(adminStoreData));

  showAdminAlert('Saving changes to server and syncing...', 'info');

  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY) || 'isai_auth_secure_token_1991';
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adminStoreData)
    });

    const result = await res.json();
    if (res.ok) {
      let gitMsg = '';
      if (result.git && result.git.success) {
        gitMsg = ' & Pushed to GitHub repository!';
        logGitTerminal(`[Success] Changes pushed to GitHub: ${result.git.output}`);
        updateGitSyncBadge(true);
      } else {
        gitMsg = ' (Local changes saved)';
      }
      showAdminAlert(`Success! Changes saved${gitMsg}`, 'success');
    } else {
      throw new Error(result.error || 'Failed to save');
    }
  } catch (err) {
    console.warn('Backend save failed, saved to client localStorage:', err);
    showAdminAlert('Saved changes in local storage! (Server offline or static mode)', 'warning');
  }

  // Refresh counters
  document.getElementById('statProducts').textContent = (adminStoreData.products || []).length;
  document.getElementById('statServices').textContent = (adminStoreData.services || []).length;
  document.getElementById('statReviews').textContent = (adminStoreData.reviews || []).length;
}

// Trigger Manual Git Push
async function triggerManualGitPush() {
  const customMsg = document.getElementById('customCommitMsg') ? document.getElementById('customCommitMsg').value.trim() : '';
  const token = localStorage.getItem(ADMIN_TOKEN_KEY) || 'isai_auth_secure_token_1991';
  const pushBtn = document.getElementById('quickGitPushBtn');

  if (pushBtn) {
    pushBtn.disabled = true;
    pushBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Pushing...';
  }

  logGitTerminal(`[Trigger] Initiating git commit & push to https://github.com/sanjayalok2222-pixel/isai...`);

  try {
    const res = await fetch('/api/admin/git-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ commitMessage: customMsg || 'Manual Admin push to GitHub' })
    });
    const data = await res.json();

    if (data.success) {
      showAdminAlert('Git Push Successful to GitHub repository!', 'success');
      logGitTerminal(`[Git Push Output]:\n${data.output}`);
      updateGitSyncBadge(true);
    } else {
      showAdminAlert('Git notice: ' + (data.output || data.error), 'warning');
      logGitTerminal(`[Git Output/Notice]:\n${data.output || data.error}`);
    }
  } catch (err) {
    logGitTerminal(`[Error]: ${err.message}`);
    showAdminAlert('Git sync error: ' + err.message, 'danger');
  } finally {
    if (pushBtn) {
      pushBtn.disabled = false;
      pushBtn.innerHTML = '<i class="bi bi-cloud-arrow-up-fill me-1"></i> Push to GitHub';
    }
  }
}

// Helpers
function showAdminAlert(msg, type = 'info') {
  const alertBox = document.getElementById('adminGlobalAlert');
  const alertMsg = document.getElementById('adminAlertMsg');
  if (!alertBox) return;

  alertBox.className = `alert alert-${type} shadow-sm alert-dismissible fade show d-block`;
  alertMsg.textContent = msg;

  setTimeout(() => {
    alertBox.classList.add('d-none');
  }, 5000);
}

function logGitTerminal(text) {
  const term = document.getElementById('gitTerminalLog');
  if (term) {
    const time = new Date().toLocaleTimeString();
    term.innerHTML += `\n[${time}] ${text}`;
    term.scrollTop = term.scrollHeight;
  }
}

function updateGitSyncBadge(synced) {
  const badge = document.getElementById('gitSyncBadge');
  if (badge) {
    badge.className = `badge ${synced ? 'bg-success-subtle text-success border-success-subtle' : 'bg-warning-subtle text-warning border-warning-subtle'} small border d-none d-md-inline`;
    badge.innerHTML = `<i class="bi bi-github me-1"></i> ${synced ? 'GitHub Synced' : 'Sync Pending'}`;
  }
}
