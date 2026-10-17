const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'store_data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Admin Credentials
const ADMIN_USER = 'isai@1991';
const ADMIN_PASS = 'Tamil@1991';
const ADMIN_TOKEN = 'isai_auth_secure_token_1991';

// Read store data helper
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file:', err);
    return {};
  }
}

// Write store data helper
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data file:', err);
    return false;
  }
}

// Git commit & push helper
function gitCommitAndPush(message = 'Store data update via Admin') {
  return new Promise((resolve) => {
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const fullMsg = `${message} [${timestamp}]`;
    const cmd = `git add . && git commit -m "${fullMsg}" && git push origin main`;

    exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.warn('Git sync warning/error:', error.message);
        resolve({
          success: false,
          output: stdout || stderr || error.message,
          error: error.message
        });
      } else {
        console.log('Git commit & push successful:\n', stdout);
        resolve({
          success: true,
          output: stdout
        });
      }
    });
  });
}

// Middleware: Verify Admin
function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === ADMIN_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
}

// --- API ROUTES ---

// 1. Get Store Data
app.get('/api/store', (req, res) => {
  const data = readData();
  res.json(data);
});

// 2. Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (
    (username === ADMIN_USER || username === 'isai') &&
    password === ADMIN_PASS
  ) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      user: {
        name: 'Isai Admin',
        email: ADMIN_USER
      }
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// 3. Update Entire Store Data (with optional automatic git push)
app.post('/api/store', verifyAdmin, async (req, res) => {
  const updatedData = req.body;
  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ error: 'Invalid store data' });
  }

  const success = writeData(updatedData);
  if (!success) {
    return res.status(500).json({ error: 'Failed to write data file' });
  }

  // Trigger background git commit & push
  let gitResult = { success: false, output: 'Git push skipped' };
  try {
    gitResult = await gitCommitAndPush('Admin update: Store data updated');
  } catch (e) {
    console.error('Git push exception:', e);
  }

  res.json({
    success: true,
    message: 'Store data updated successfully!',
    git: gitResult,
    data: updatedData
  });
});

// 4. Update specific section (products, services, storeInfo, offer, reviews)
app.put('/api/store/:section', verifyAdmin, async (req, res) => {
  const section = req.params.section;
  const sectionData = req.body;
  const currentData = readData();

  currentData[section] = sectionData;
  const success = writeData(currentData);

  if (!success) {
    return res.status(500).json({ error: 'Failed to write data file' });
  }

  // Background git commit & push
  let gitResult = { success: false, output: 'Git push pending' };
  try {
    gitResult = await gitCommitAndPush(`Admin updated ${section}`);
  } catch (e) {
    console.error('Git push error:', e);
  }

  res.json({
    success: true,
    message: `${section} updated successfully`,
    git: gitResult,
    data: currentData[section]
  });
});

// 5. Customer Enquiries
app.post('/api/enquiries', (req, res) => {
  const { name, phone, email, message, product, service, type } = req.body;
  if (!name || (!phone && !email)) {
    return res.status(400).json({ error: 'Name and phone or email are required' });
  }

  const currentData = readData();
  if (!Array.isArray(currentData.enquiries)) {
    currentData.enquiries = [];
  }

  const newEnquiry = {
    id: 'enq-' + Date.now(),
    name,
    phone: phone || '',
    email: email || '',
    message: message || '',
    product: product || '',
    service: service || '',
    type: type || 'General Enquiry',
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    status: 'New'
  };

  currentData.enquiries.unshift(newEnquiry);
  writeData(currentData);

  res.json({
    success: true,
    message: 'Thank you! Your enquiry has been received. Our team will contact you soon.',
    enquiry: newEnquiry
  });
});

// 6. Manual Git Push Trigger for Admin
app.post('/api/admin/git-push', verifyAdmin, async (req, res) => {
  const { commitMessage } = req.body;
  const result = await gitCommitAndPush(commitMessage || 'Manual admin sync to GitHub');
  res.json(result);
});

// 7. Get Git Status
app.get('/api/admin/git-status', verifyAdmin, (req, res) => {
  exec('git status -s && git log -1 --pretty=format:"%h - %s (%ci)"', { cwd: __dirname }, (error, stdout) => {
    if (error) {
      return res.json({ clean: false, message: error.message });
    }
    res.json({
      clean: stdout.trim() === '',
      details: stdout.trim()
    });
  });
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ISAI MARKETING AGENCY - Web Store & Admin Portal`);
  console.log(`  Live URL: http://localhost:${PORT}`);
  console.log(`  Admin URL: http://localhost:${PORT}/admin.html`);
  console.log(`  Admin Credentials: ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log(`=======================================================`);
});
