// public/js/app.js - Isai Marketing Agency Client Logic

let storeData = null;
let currentCategory = 'all';
let searchQuery = '';
let quoteCart = [];

// Fallback initial data if server API is unavailable
const DEFAULT_DATA = {
  storeInfo: {
    name: "ISAI MARKETING AGENCY",
    subName: "& Yazh City Property Picks / Rewinding Works",
    promoter: "S. Tamilselvan",
    tagline: "Your Trusted Partner in Salem for Home Appliances, RO Purifiers & Electrical Rewinding Works",
    address: "Near Srimaan Theater, Sandhaipettai Main Road, Shevapet, Salem, Tamil Nadu 636002, India",
    phones: ["+91 8248611861", "+91 8124401259", "+91 9443029079", "+91 8270555745"],
    primaryPhone: "+918248611861",
    whatsappNumber: "918248611861",
    email: "enquiry.isaigroups@gmail.com"
  },
  products: [],
  services: [],
  reviews: [],
  properties: [],
  gallery: []
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadQuoteCart();
  fetchStoreData();
  setupEventListeners();
  updateCurrentYear();
});

// Fetch Store Data from backend API
async function fetchStoreData() {
  try {
    const res = await fetch('/api/store');
    if (!res.ok) throw new Error('API request failed');
    storeData = await res.json();
  } catch (err) {
    console.warn('Backend fetch failed, attempting local fallback:', err);
    try {
      const fallbackRes = await fetch('../data/store_data.json');
      storeData = await fallbackRes.json();
    } catch (fErr) {
      console.error('All fetch attempts failed, using default data:', fErr);
      storeData = DEFAULT_DATA;
    }
  }

  // Also check if localStorage has offline updates
  const localSaved = localStorage.getItem('isai_store_data_local');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      storeData = Object.assign({}, storeData, parsed);
    } catch(e) {}
  }

  renderAll();
}

// Render All Sections
function renderAll() {
  if (!storeData) return;

  renderStoreInfo();
  renderOffers();
  renderServices();
  renderProducts();
  renderProperties();
  renderReviews();
  renderGallery();
  renderSchedule();
  updateStoreStatus();
}

// Render Store Info
function renderStoreInfo() {
  const info = storeData.storeInfo || {};
  if (document.getElementById('navStoreName')) document.getElementById('navStoreName').textContent = info.name || 'ISAI MARKETING AGENCY';
  if (document.getElementById('navStoreSub')) document.getElementById('navStoreSub').textContent = info.subName || '& Yazh City Property Picks | Salem';
  if (document.getElementById('heroTitle')) document.getElementById('heroTitle').textContent = info.name || 'ISAI MARKETING AGENCY';
  if (document.getElementById('heroTagline')) document.getElementById('heroTagline').textContent = info.tagline || '';
  if (document.getElementById('aboutHeading')) document.getElementById('aboutHeading').textContent = `${info.name} ${info.subName || ''}`;
  if (document.getElementById('aboutTextEn')) document.getElementById('aboutTextEn').textContent = info.aboutEn || '';
  if (document.getElementById('aboutTextTa')) document.getElementById('aboutTextTa').textContent = info.aboutTa || '';
  if (document.getElementById('storeAddress')) document.getElementById('storeAddress').textContent = info.address || '';
}

// Render Offer & Announcement
function renderOffers() {
  const offer = storeData.offer;
  if (!offer) return;

  const badgeElem = document.getElementById('offerBadge');
  const textElem = document.getElementById('offerText');
  const heroOfferTitle = document.getElementById('heroOfferTitle');
  const heroOfferDesc = document.getElementById('heroOfferDesc');

  if (badgeElem && offer.badge) badgeElem.textContent = offer.badge;
  if (textElem && offer.description) textElem.textContent = offer.description;
  if (heroOfferTitle && offer.title) heroOfferTitle.textContent = offer.title;
  if (heroOfferDesc && offer.description) heroOfferDesc.textContent = offer.description;
}

// Render Services
function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  const services = storeData.services || [];
  container.innerHTML = services.map(s => `
    <div class="col-lg-4 col-md-6">
      <div class="card h-100 border-0 shadow-sm p-4 service-card bg-white">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="service-icon-box bg-primary-subtle text-primary">
            <i class="bi ${s.icon || 'bi-wrench-adjustable'}"></i>
          </div>
          <div>
            <h5 class="fw-bold mb-1">${s.title}</h5>
            ${s.highlight ? `<span class="badge bg-success-subtle text-success small">${s.highlight}</span>` : ''}
          </div>
        </div>
        <p class="text-secondary small mb-3 flex-grow-1">${s.description}</p>
        <div>
          <a href="https://wa.me/918248611861?text=Hi%20Isai%20Marketing%2C%20I%20need%20service%20for%3A%20${encodeURIComponent(s.title)}" 
             target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3">
            <i class="bi bi-whatsapp me-1"></i> Book Service
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Products
function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  let products = storeData.products || [];

  // Filter by category
  if (currentCategory !== 'all') {
    products = products.filter(p => p.category === currentCategory);
  }

  // Filter by search query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <h5 class="fw-bold mt-2">No appliances found</h5>
        <p class="text-muted small">Try searching for other terms like 'Fan', 'Cooler', or 'Stove'.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(p => {
    const discount = p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
    const isCarted = quoteCart.some(item => item.id === p.id);

    return `
      <div class="col-xl-3 col-lg-4 col-md-6">
        <div class="card h-100 product-card shadow-sm bg-white">
          <div class="product-img-box">
            ${p.badge ? `<span class="position-absolute top-0 start-0 m-2 badge bg-primary">${p.badge}</span>` : ''}
            ${discount > 0 ? `<span class="position-absolute top-0 end-0 m-2 badge badge-discount">${discount}% OFF</span>` : ''}
            <img src="${p.image || 'https://placehold.co/240x200/f8f9fa/333?text=Appliance'}" 
                 alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/240x200/f8f9fa/333?text=Isai+Marketing'">
          </div>
          <div class="card-body p-3 d-flex flex-column">
            <div class="small text-muted mb-1">${p.category || 'Home Appliance'}</div>
            <h6 class="fw-bold product-title mb-2 text-dark" title="${p.name}">${p.name}</h6>
            <p class="small text-secondary mb-3 flex-grow-1 text-truncate-2">${p.description || ''}</p>
            
            <div class="price-section mb-3">
              <span class="price-offer">₹${p.price ? p.price.toLocaleString('en-IN') : 'N/A'}</span>
              ${p.mrp && p.mrp > p.price ? `<span class="strike-mrp ms-2">MRP: ₹${p.mrp.toLocaleString('en-IN')}</span>` : ''}
            </div>

            <div class="d-grid gap-2">
              <a href="https://wa.me/918248611861?text=${encodeURIComponent(`Hi Isai Marketing Agency, I would like to order/enquire about:\n*${p.name}*\nPrice: ₹${p.price}\nPlease confirm availability and delivery in Salem.`)}" 
                 target="_blank" class="btn btn-success btn-sm rounded-pill fw-semibold">
                <i class="bi bi-whatsapp me-1"></i> Order on WhatsApp
              </a>
              <button class="btn ${isCarted ? 'btn-secondary' : 'btn-outline-primary'} btn-sm rounded-pill" onclick="toggleCartItem('${p.id}')">
                <i class="bi ${isCarted ? 'bi-check2' : 'bi-plus-lg'} me-1"></i> ${isCarted ? 'Added to Quote' : 'Add to Quote'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Real Estate Properties
function renderProperties() {
  const container = document.getElementById('propertiesGrid');
  if (!container) return;

  const properties = storeData.properties || [];
  container.innerHTML = properties.map(prop => `
    <div class="col-lg-4 col-md-6">
      <div class="card h-100 property-card border-0 shadow-sm bg-white">
        <div class="property-img-box">
          <span class="position-absolute top-0 start-0 m-2 badge bg-success">${prop.type}</span>
          <img src="${prop.image || 'https://placehold.co/400x250/28a745/white?text=Real+Estate'}" alt="${prop.title}" loading="lazy">
        </div>
        <div class="card-body p-3">
          <h5 class="fw-bold mb-1">${prop.title}</h5>
          <p class="small text-muted mb-2"><i class="bi bi-geo-alt me-1 text-danger"></i>${prop.location}</p>
          <p class="small text-secondary mb-3">${prop.description}</p>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top">
            <span class="fw-bold text-success">${prop.price}</span>
            <a href="https://wa.me/918248611861?text=${encodeURIComponent(`Hi S. Tamilselvan sir, I am interested in property:\n*${prop.title}* (${prop.location})\nPrice: ${prop.price}`)}" 
               target="_blank" class="btn btn-sm btn-outline-success rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Customer Reviews
function renderReviews() {
  const container = document.getElementById('reviewsGrid');
  if (!container) return;

  const reviews = storeData.reviews || [];
  container.innerHTML = reviews.map(r => `
    <div class="col-lg-4 col-md-6">
      <div class="card h-100 review-card p-4 shadow-sm bg-white">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.2rem;">
            ${r.name ? r.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h6 class="fw-bold mb-0">${r.name}</h6>
            <small class="text-muted">${r.date || 'Verified Customer'}</small>
          </div>
        </div>
        <div class="star-rating mb-2">
          ${'⭐'.repeat(r.rating || 5)}
        </div>
        <p class="small text-secondary mb-0 fst-italic">"${r.comment}"</p>
      </div>
    </div>
  `).join('');
}

// Render Photo Gallery
function renderGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  const gallery = storeData.gallery || [];
  container.innerHTML = gallery.slice(0, 8).map(imgUrl => `
    <div class="col-lg-3 col-md-4 col-6">
      <div class="gallery-item shadow-sm" onclick="openImageModal('${imgUrl}')">
        <img src="${imgUrl}" alt="Isai Marketing Workshop" loading="lazy">
        <div class="gallery-overlay">
          <i class="bi bi-zoom-in"></i>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Weekly Schedule
function renderSchedule() {
  const container = document.getElementById('scheduleList');
  if (!container) return;

  const schedule = (storeData.storeInfo && storeData.storeInfo.schedule) || {
    monday: "09:00 AM - 09:00 PM (Lunch: 01:00 PM - 02:00 PM)",
    tuesday: "09:00 AM - 09:00 PM (Lunch: 01:00 PM - 02:00 PM)",
    wednesday: "09:00 AM - 09:00 PM (Lunch: 01:00 PM - 02:00 PM)",
    thursday: "09:00 AM - 09:00 PM (Lunch: 01:00 PM - 02:00 PM)",
    friday: "09:00 AM - 09:00 PM (Lunch: 01:00 PM - 02:00 PM)",
    saturday: "09:00 AM - 09:00 PM (Lunch: 01:00 PM - 02:00 PM)",
    sunday: "Closed"
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  container.innerHTML = days.map(d => {
    const key = d.toLowerCase();
    const time = schedule[key] || '09:00 AM - 09:00 PM';
    const isClosed = time.toLowerCase().includes('closed');

    return `
      <li class="list-group-item d-flex justify-content-between align-items-center px-3 py-2 small">
        <span class="fw-semibold">${d}</span>
        <span class="${isClosed ? 'text-danger fw-bold' : 'text-secondary'}">${time}</span>
      </li>
    `;
  }).join('');
}

// Update Store Status based on local Indian Time
function updateStoreStatus() {
  const now = new Date();
  // IST is UTC+5:30
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));

  const day = istDate.getDay(); // 0 is Sunday
  const hour = istDate.getHours();
  const minute = istDate.getMinutes();
  const timeVal = hour + (minute / 60);

  let isOpen = false;
  let statusText = 'Closed Now';
  let badgeClass = 'bg-danger-subtle text-danger border-danger-subtle';

  if (day !== 0) { // Mon-Sat
    if (timeVal >= 9 && timeVal < 21) {
      if (timeVal >= 13 && timeVal < 14) {
        statusText = 'Lunch Break (01:00 PM - 02:00 PM)';
        badgeClass = 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
      } else {
        isOpen = true;
        statusText = 'Open Now (09:00 AM - 09:00 PM)';
        badgeClass = 'bg-success-subtle text-success border-success-subtle';
      }
    }
  } else {
    statusText = 'Closed Today (Sunday)';
  }

  const badgeElem = document.getElementById('storeStatusBadge');
  const pillElem = document.getElementById('scheduleStatusPill');

  if (badgeElem) {
    badgeElem.className = `badge ${badgeClass} border px-2 py-1`;
    badgeElem.innerHTML = `<i class="bi bi-clock-fill me-1"></i> ${statusText}`;
  }

  if (pillElem) {
    pillElem.className = `badge ${isOpen ? 'bg-success' : 'bg-danger'}`;
    pillElem.textContent = isOpen ? 'Open Now' : 'Closed';
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Category tabs
  const categoryTabs = document.querySelectorAll('#categoryTabs button');
  categoryTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryTabs.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      renderProducts();
    });
  });

  // Product search
  const searchInput = document.getElementById('productSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      const phone = document.getElementById('contactPhone').value;
      const email = document.getElementById('contactEmail').value;
      const service = document.getElementById('contactService').value;
      const message = document.getElementById('contactMessage').value;
      const submitBtn = document.getElementById('contactSubmitBtn');
      const alertBox = document.getElementById('contactAlert');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

      try {
        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, service, message, type: 'Customer Booking' })
        });
        const data = await res.json();

        alertBox.className = 'alert alert-success d-block';
        alertBox.innerHTML = `<strong>Success!</strong> ${data.message || 'Enquiry submitted successfully!'}`;
        contactForm.reset();
      } catch (err) {
        // Fallback: direct WhatsApp
        alertBox.className = 'alert alert-info d-block';
        alertBox.innerHTML = `Connecting you directly to WhatsApp...`;
        const waMsg = `Hi Isai Marketing Agency, My name is ${name} (${phone}). I need: ${service}. Message: ${message}`;
        window.open(`https://wa.me/918248611861?text=${encodeURIComponent(waMsg)}`, '_blank');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send-fill me-1"></i> Send Enquiry to Store';
      }
    });
  }

  // Review Submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = document.getElementById('reviewAuthor').value;
      const rating = parseInt(document.getElementById('reviewRating').value, 10);
      const text = document.getElementById('reviewText').value;
      const alertBox = document.getElementById('reviewAlert');

      const newRev = {
        id: 'rev-' + Date.now(),
        name: author,
        rating,
        date: 'Today',
        comment: text
      };

      if (!storeData.reviews) storeData.reviews = [];
      storeData.reviews.unshift(newRev);
      renderReviews();

      alertBox.className = 'alert alert-success d-block';
      alertBox.textContent = 'Thank you! Your review has been added successfully.';

      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('addReviewModal'));
        if (modal) modal.hide();
        reviewForm.reset();
        alertBox.className = 'd-none';
      }, 1500);
    });
  }

  // Cart WhatsApp send
  const cartWABtn = document.getElementById('sendCartWhatsAppBtn');
  if (cartWABtn) {
    cartWABtn.addEventListener('click', sendCartWhatsApp);
  }

  // Clear cart
  const clearCartBtn = document.getElementById('clearCartBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      quoteCart = [];
      saveQuoteCart();
      renderCart();
      renderProducts();
    });
  }
}

// Quote Cart Logic
function loadQuoteCart() {
  try {
    const raw = localStorage.getItem('isai_quote_cart');
    if (raw) quoteCart = JSON.parse(raw);
  } catch (e) {
    quoteCart = [];
  }
  updateCartBadge();
}

function saveQuoteCart() {
  localStorage.setItem('isai_quote_cart', JSON.stringify(quoteCart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) {
    const totalQty = quoteCart.reduce((sum, i) => sum + (i.qty || 1), 0);
    badge.textContent = totalQty;
  }
}

function toggleCartItem(productId) {
  const existingIndex = quoteCart.findIndex(i => i.id === productId);
  if (existingIndex > -1) {
    quoteCart.splice(existingIndex, 1);
  } else {
    const product = (storeData.products || []).find(p => p.id === productId);
    if (product) {
      quoteCart.push({
        id: product.id,
        name: product.name,
        price: product.price || 0,
        qty: 1
      });
    }
  }
  saveQuoteCart();
  renderProducts();
  renderCart();
}

function updateCartQty(productId, delta) {
  const item = quoteCart.find(i => i.id === productId);
  if (item) {
    item.qty = Math.max(1, (item.qty || 1) + delta);
    saveQuoteCart();
    renderCart();
  }
}

function removeCartItem(productId) {
  quoteCart = quoteCart.filter(i => i.id !== productId);
  saveQuoteCart();
  renderProducts();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const totalElem = document.getElementById('cartTotalVal');
  if (!container) return;

  if (quoteCart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-cart-x fs-1 mb-2"></i>
        <p class="mb-0">Your quotation cart is empty.</p>
        <small>Browse appliances and click "Add to Quote"!</small>
      </div>
    `;
    if (totalElem) totalElem.textContent = '₹0';
    return;
  }

  let total = 0;
  container.innerHTML = quoteCart.map(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    return `
      <div class="card mb-2 border shadow-xs p-2">
        <div class="d-flex justify-content-between align-items-start">
          <div class="fw-semibold small pe-2">${item.name}</div>
          <button class="btn btn-sm text-danger p-0 border-0" onclick="removeCartItem('${item.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2 small">
          <span class="text-primary fw-bold">₹${item.price.toLocaleString('en-IN')}</span>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="updateCartQty('${item.id}', -1)">-</button>
            <span class="fw-bold">${item.qty}</span>
            <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="updateCartQty('${item.id}', 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (totalElem) totalElem.textContent = `₹${total.toLocaleString('en-IN')}`;
}

function sendCartWhatsApp() {
  if (quoteCart.length === 0) {
    alert('Please add at least one appliance to the quote cart first!');
    return;
  }

  let msg = `*Quotation Request - Isai Marketing Agency*\n----------------------------------------\n`;
  let total = 0;

  quoteCart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    msg += `${idx + 1}. *${item.name}*\n   Qty: ${item.qty} x ₹${item.price} = ₹${subtotal}\n`;
  });

  msg += `----------------------------------------\n*Estimated Total: ₹${total.toLocaleString('en-IN')}*\n\nPlease confirm availability, delivery charge, and EMI options in Salem. Thank you!`;

  window.open(`https://wa.me/918248611861?text=${encodeURIComponent(msg)}`, '_blank');
}

// Lightbox Modal
function openImageModal(imgUrl) {
  const modalImg = document.getElementById('modalImg');
  if (modalImg) modalImg.src = imgUrl;
  const modal = new bootstrap.Modal(document.getElementById('imageModal'));
  modal.show();
}

function updateCurrentYear() {
  const yElem = document.getElementById('currentYear');
  if (yElem) yElem.textContent = new Date().getFullYear();
}
