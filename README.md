# ISAI MARKETING AGENCY & YAZH CITY PROPERTY PICKS

Modern, high-converting Home Appliances Store & Rewinding Services Web Portal with an integrated dynamic Admin Management Dashboard and automatic GitHub sync.

Developed based on original business details from [vkno.in/isaimarketing](https://vkno.in/isaimarketing).

---

## 🌟 Key Features

### 🛍️ Customer Storefront (`public/index.html`)
- **Branding & Profile**: Promoted by **S. Tamilselvan**, Salem. Shevapet address, phone numbers (+91 8248611861, 8124401259, 9443029079, 8270555745).
- **Home Appliances Catalog**: Crompton, Bajaj, Havells, Usha, V-Guard, Preeti, Rally, Symphony, Orient fans, desert/tower air coolers, induction cooktops, and iron boxes.
- **Price Transparency**: Original MRP vs Discounted Offer Price with instant discount percentage badges.
- **Direct WhatsApp Ordering**: One-click WhatsApp checkout pre-fills appliance name, model, and price.
- **Interactive Quotation Cart**: Add multiple appliances to the quote drawer, adjust quantities, and generate an automated WhatsApp quotation message.
- **Core Services Showcase**:
  1. Home Appliance Sales & Services (Doorstep AC, Fridge & Washing Machine repairs)
  2. RO Water Purifier Sales & Services & Spares (Domestic & 100L–1000L Industrial plants)
  3. Ceiling & Table Fan Winding Works (Salem specialist)
  4. Mixer / Water Heater / Grinder & Induction Stove Service & Motor Winding Works
  5. Stainless Steel (SS) Custom Products made to order
  6. Real Estate Solutions (Yazh City Property Picks - Houses, Plots, Farmlands up to 60 km around Salem)
- **Live Business Schedule**: Dynamic "Open Now" / "Closed" indicator with lunch break (01:00 PM - 02:00 PM) logic.
- **Bilingual Content**: English and Tamil descriptions.
- **Customer Testimonials**: Verified customer reviews from Mahalakshmi, Saravanan motors, Priyanka, Venkatesan, Ramkumar, Thalapathy Vetri Kondan, Rajavel, Michael, Tamil, and Dhineshbabu.

---

### 🛡️ Admin Management Dashboard (`public/admin.html`)

- **Secure Login Credentials**:
  - **Email / Username**: `isai@1991`
  - **Password**: `Tamil@1991`
- **Dynamic Live Synchronization**: Any changes made by the admin in the dashboard immediately update the live customer website.
- **Full CRUD Management**:
  - **Appliances & Products**: Add new items, update prices, MRP, discounts, images, badges, and stock availability.
  - **Store Services**: Add, edit, or delete service cards.
  - **Offers & EMI Bar**: Customize the top ticker ("EASY EMI COMING SOON...."), festive offer banners, and descriptions.
  - **Store Profile & Contact**: Edit phone numbers, email, shop address, and about information.
  - **Real Estate Listings**: Manage properties for Yazh City Property Picks.
  - **Customer Inquiries Inbox**: Review orders and booking submissions with one-click WhatsApp reply.
  - **Customer Reviews**: Approve, add, or delete testimonials.

---

### 🔄 GitHub Auto-Commit & Auto-Push

Whenever the admin saves changes or files are updated, the application automatically triggers:
```bash
git add .
git commit -m "Admin update: <details> [<timestamp>]"
git push origin main
```
Target Repository: [github.com/sanjayalok2222-pixel/isai](https://github.com/sanjayalok2222-pixel/isai)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Web Server
```bash
npm start
```
The application will launch on `http://localhost:3000`:
- **Public Store**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### 3. Start Background Auto-Push Watcher (Optional)
```bash
npm run watch
```
Monitors file changes in `data/` and `public/` and automatically commits and pushes to GitHub within 4 seconds of editing.

---

## 📂 Project Structure

```
isai/
├── server.js               # Express API backend + Git runner
├── package.json            # Node.js dependencies & scripts
├── auto-push.js            # Background file watcher for auto git push
├── data/
│   └── store_data.json     # Dynamic store data (Products, Services, Contact, Offers)
├── public/
│   ├── index.html          # Public customer storefront
│   ├── admin.html          # Admin portal
│   ├── css/
│   │   ├── style.css       # Storefront styling
│   │   └── admin.css       # Admin dashboard styling
│   └── js/
│       ├── app.js          # Customer storefront dynamic logic
│       └── admin.js        # Admin portal CRUD & GitHub sync logic
└── README.md               # Documentation
```

---

## 📞 Business Information

- **Promoter**: S. Tamilselvan
- **Address**: Near Srimaan Theater, Sandhaipettai Main Road, Shevapet, Salem, Tamil Nadu 636002, India
- **Phones**: +91 8248611861, 8124401259, 9443029079, 8270555745
- **Email**: enquiry.isaigroups@gmail.com
- **Original Profile**: [vkno.in/isaimarketing](https://vkno.in/isaimarketing)