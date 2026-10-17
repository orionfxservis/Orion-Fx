# OrionFx Invoice SaaS – Free Online Invoice Generator & PDF Maker

> A client-side, privacy-first SaaS application by [Orion Fx](https://www.orionfx.net/) for creating, customizing, printing, and exporting professional invoices with zero npm dependencies required.

[![OrionFx SaaS](https://img.shields.io/badge/OrionFx-SaaS%20Tools-0284c7.svg)](https://www.orionfx.net/)
[![Zero NPM Runtime](https://img.shields.io/badge/Runtime-Zero%20NPM%20Dependencies-emerald.svg)](https://www.orionfx.net/)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Ready-blue.svg)](https://www.orionfx.net/assets/saas-tools/invoice-generator/index.html)
[![License](https://img.shields.io/badge/License-Proprietary-neutral.svg)](https://www.orionfx.net/)

---

## 🌐 Application Overview & SEO Metadata

| Attribute | Details |
| :--- | :--- |
| **Product Name** | OrionFx Invoice SaaS |
| **Headline** | Free Online Invoice Generator & PDF Maker |
| **Provider** | [Orion Fx](https://www.orionfx.net/) |
| **Official Website** | [https://www.orionfx.net/](https://www.orionfx.net/) |
| **Live Tool URL** | [https://www.orionfx.net/assets/saas-tools/invoice-generator/index.html](https://www.orionfx.net/assets/saas-tools/invoice-generator/index.html) |
| **Product Category** | Orion Fx SaaS Applications |
| **App Architecture** | 100% Client-Side Standalone Web Application |
| **App Icon & Favicon** | `icons/icons-192.png` (192×192 PNG) |
| **Target Audience** | Freelancers, small businesses, consultants, agencies, contractors |

---

## ✨ Features

- **🎨 Professional Template Gallery**: Choose from multiple curated invoice designs (Classic, Modern, Corporate, Creative, Minimalist).
- **💵 Multi-Currency Calculation**: Built-in support for **Pak Rs. (`PKR`)**, USD (`$`), EUR (`€`), GBP (`£`), and custom currencies with formatted outputs.
- **🧮 Automatic Financial Calculations**: Line item totals, percentage or fixed discounts, compound sales tax/VAT, shipping, and grand total calculations.
- **🏢 Custom Business Branding**: Upload business logo, customized accent color palette, signature, stamp, and custom payment instructions.
- **📄 Pixel-Perfect PDF & Print**: Dedicated `@media print` engine ensures professional A4 portrait exports and clean downloads.
- **📱 One-Click Client Dispatch**: Instant pre-filled WhatsApp and Email delivery shortcuts.
- **🔒 100% Client-Side & Offline Ready**: All invoice data is stored safely in the browser's `localStorage`. No external database or server required.
- **⚡ Zero NPM Runtime**: Runs directly by opening `index.html` in any browser or hosting on standard static web hosts.

---

## 🚀 How to Run the Application

### Option 1: Open Directly in Any Browser (Zero Installation)
For normal use, no installation or setup is needed:
1. Download or clone this repository.
2. Double-click the root **`index.html`** file, or right-click → open in your favorite web browser (Chrome, Edge, Firefox, Safari).
3. The invoice generator is immediately ready to use.

---

### Option 2: 1-Click Launch on Windows (`start-app.bat`)
For Windows users:
1. Open the project folder.
2. Double-click **`start-app.bat`**.
3. It opens `http://localhost:8080/` in your default browser.

---

### Option 3: Optional Local Web Server
If you want to test over HTTP:
```bash
# Using Python (built-in on Windows/Mac/Linux):
python -m http.server 8080
```
Then visit: `http://localhost:8080/`

---

## 📤 Deployment Guide

### Method 1: Host on GitHub Pages (Standard `/docs` Folder)
GitHub Pages natively deploys static applications directly from the **`/docs`** folder:

1. Push this repository to GitHub.
2. Open your repository's **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: Select **Deploy from a branch**.
   - **Branch**: Select **`main`** (or `master`).
   - **Folder**: Select **`/docs`**.
   - Click **Save**.
4. In about 30 seconds, your site is live at:
   `https://<your-username>.github.io/<repository-name>/`

---

### Method 2: Host on Any Web Hosting (cPanel, Hostinger, GoDaddy, Nginx, Apache)
1. Open the **`docs/`** directory (or the root directory).
2. Upload the production files together:
   - `index.html`
   - `app.js`
   - `style.css`
   - `icons/` folder (containing `icons-192.png`)
3. Place them directly in your web directory (e.g., `public_html/assets/saas-tools/invoice-generator/`).
4. Visit your URL in any browser—no Node.js server, database, or backend installation is required.

---

## 📁 Project Structure

```
invoice-generator/
├── docs/                   # Production-ready static files for GitHub Pages
│   ├── index.html          # Production web page with SEO, icons & social tags
│   ├── app.js              # Standalone JavaScript application bundle
│   ├── style.css           # Production styling
│   └── icons/              # App icon for docs
│       └── icons-192.png   # 192x192 app icon
├── icons/                  # Application icons & favicons
│   └── icons-192.png       # 192x192 high-resolution icon
├── src/                    # Source code (TypeScript & React)
│   ├── components/         # UI components (Editor, List, Preview, Modals)
│   ├── types/              # TypeScript types and schema definitions
│   └── utils/              # Calculation, formatting, and PDF export logic
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD deployment workflow
├── .gitignore              # Ignores node_modules/, logs, and build artifacts
├── index.html              # Standalone web app entry point
├── app.js                  # Standalone application bundle (IIFE)
├── style.css               # Production stylesheets
├── start-app.bat           # 1-click Windows offline launcher
├── build-standalone.cjs    # Zero-npm bundle & sync builder
├── dev.html                # Local development page
├── package.json            # Development dependencies & build scripts
├── package-lock.json       # npm locked versions
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite bundler configuration
└── README.md               # Project documentation & SEO guide
```

---

## 🛠️ For Developers (Optional)

If you wish to modify the source code in `src/`:
```bash
# 1. Install development dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build standalone production files (updates app.js, style.css, and syncs docs/)
npm run build
```

> **Note**: `npm install` and `npm run build` are only needed if you are modifying source code. The standalone app runs out-of-the-box without npm.

---

## 🔒 Privacy & Data Handling

- **Zero Cloud Leakage**: All invoice data, customer records, and financial numbers are stored in the user's browser via `localStorage`.
- **Client-Side Processing**: No invoice data is ever sent to, processed by, or stored on external servers.
- **Export Ownership**: Users have full control to download, print, or clear invoices at any time.

---

## ⚖️ Support & Ownership

- **Product**: OrionFx Invoice SaaS
- **Provider**: [Orion Fx](https://www.orionfx.net/)
- **SaaS Portfolio**: [https://www.orionfx.net/saas-applications/](https://www.orionfx.net/saas-applications/)
- **Support**: For product inquiries and support, visit the official Orion Fx website.

*© Orion Fx. All rights reserved. Names, branding, and application content are property of Orion Fx.*