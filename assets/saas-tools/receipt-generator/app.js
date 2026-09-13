/**
 * OrionFx SaaS - Pure Client-Side Receipt & Invoice Generator
 * ZERO-NPM ARCHITECTURE: Runs directly on GitHub Pages, cPanel, OrionFx.net domain, or local machine!
 * No Node.js, Vite, or npm build required on your server or GitHub repo.
 */

(function () {
  'use strict';

  // --- Initial Default Data (Pakistan POS & SaaS Standards) ---
  const DEFAULT_DATA = {
    receiptNumber: 'OFX-2026-0042',
    fbrInvoiceNumber: '1002342609120842',
    cashierName: 'Counter 01 / Ali',
    receiptTime: '14:35:10',
    type: 'TAX INVOICE',
    status: 'PAID',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: { code: 'PKR', symbol: 'Rs. ', name: 'Pak Rupees' },
    company: {
      name: 'ORIONFX SAAS TECHNOLOGIES',
      tagline: 'Enterprise Cloud Solutions & Retail POS',
      address: 'Suite 402, Software Technology Park, Shahrah-e-Faisal',
      cityStateZip: 'Karachi, Sindh 75400',
      country: 'Pakistan',
      phone: '+92 (021) 3456-7890',
      email: 'billing@orionfx.net',
      website: 'www.orionfx.net',
      taxId: '7412985-3',
      ntn: '7412985-3',
      strn: '17-00-7412-985-19',
      posTerminalId: 'POS-01',
      logoUrl: '',
      logoPosition: 'left',
      logoWidth: 100,
      logoRadius: 'rounded-lg'
    },
    client: {
      name: 'Apex Innovations Pvt Ltd',
      company: 'Apex Technologies Group',
      email: 'procurement@apexinnovations.pk',
      phone: '+92 300 1234567',
      address: 'Plot 12-C, Commercial Area, DHA Phase 6',
      cityStateZip: 'Karachi, Pakistan',
      taxId: '3920194-8'
    },
    items: [
      { id: '1', description: 'OrionFx Cloud SaaS Core License', details: 'Dedicated Business Suite (Annual)', quantity: 1, unitPrice: 45000 },
      { id: '2', description: 'POS System Integration & Hardware Setup', details: 'Thermal Roll & Barcode Interface', quantity: 1, unitPrice: 15000 },
      { id: '3', description: 'FBR Tier-1 Real-time Fiscal API Module', details: 'FBR e-Invoicing Gateway & QR Sync', quantity: 1, unitPrice: 12500 }
    ],
    discountType: 'fixed',
    discountValue: 2500,
    taxRate: 15,
    taxLabel: 'GST / Sales Tax',
    shippingFee: 0,
    paidAmount: 70000,
    payment: {
      method: 'Bank Transfer',
      bankName: 'Meezan Bank Ltd',
      accountName: 'OrionFx Technologies Pvt Ltd',
      accountNumber: 'PK12MEZN0001020304050607',
      showQrCode: true,
      qrPayload: 'https://e.fbr.gov.pk/pos/verify?fbrInvoiceNo=1002342609120842&posId=POS-01'
    },
    terms: '• Goods/Services provided are subject to OrionFx standard SLA terms.\n• For Retail POS: Exchanges permitted within 7 days with original receipt.\n• Invoices certified by FBR Tier-1 Integration.',
    notes: 'Thank you for choosing OrionFx Cloud Solutions! Your business is deeply valued.',
    signature: {
      signerName: 'Tariq Mehmood',
      signerTitle: 'Director of Finance',
      signatureType: 'typed',
      signatureData: '',
      showStamp: true
    },
    styling: {
      template: 'thermal', // default to requested Pakistan thermal standard
      primaryColor: '#059669',
      fontFamily: 'mono'
    }
  };

  // State
  let state = loadFromStorage() || JSON.parse(JSON.stringify(DEFAULT_DATA));
  let activeTab = 'edit'; // 'edit' or 'preview' on mobile
  let zoomLevel = 1;
  let activeAccordion = 'template'; // 'template', 'company', 'client', 'items', 'payment', 'terms'

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('orionfx_receipt_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return null;
  }

  function saveToStorage() {
    try {
      localStorage.setItem('orionfx_receipt_data', JSON.stringify(state));
    } catch (e) {}
  }

  // --- Financial Calculation Helpers ---
  function calculateTotals() {
    const subtotal = state.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
    const discountAmount = state.discountType === 'percent'
      ? (subtotal * (Number(state.discountValue) || 0)) / 100
      : (Number(state.discountValue) || 0);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * (Number(state.taxRate) || 0)) / 100;
    const shipping = Number(state.shippingFee) || 0;
    const grandTotal = taxableAmount + taxAmount + shipping;
    const paidAmount = Number(state.paidAmount) || 0;
    const balanceDue = Math.max(0, grandTotal - paidAmount);
    const changeReturned = Math.max(0, paidAmount - grandTotal);

    return { subtotal, discountAmount, taxableAmount, taxAmount, shipping, grandTotal, paidAmount, balanceDue, changeReturned };
  }

  function formatMoney(amount, symbol) {
    const sym = symbol !== undefined ? symbol : (state.currency.symbol || '');
    return `${sym}${(Number(amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Number to Words Converter (Special Support for Pak Rupees and Paisa)
  function numberToWords(num, currencyName) {
    const cur = currencyName || state.currency.name || 'Pak Rupees';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if ((n = n.toString()).length > 9) return 'Overflow';
      let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_arr) return '';
      let str = '';
      str += (n_arr[1] != 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'Crore ' : '';
      str += (n_arr[2] != 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'Lakh ' : '';
      str += (n_arr[3] != 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'Thousand ' : '';
      str += (n_arr[4] != 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'Hundred ' : '';
      str += (n_arr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
      return str.trim();
    }

    const parts = num.toFixed(2).split('.');
    const whole = parseInt(parts[0], 10);
    const cents = parseInt(parts[1], 10);

    if (whole === 0 && cents === 0) return `Zero ${cur} Only`;
    let res = whole > 0 ? `${inWords(whole)} ${cur}` : '';
    if (cents > 0) {
      const centName = cur.includes('Rupee') ? 'Paisa' : 'Cents';
      res += (whole > 0 ? ` and ` : '') + `${inWords(cents)} ${centName}`;
    }
    return res + ' Only';
  }

  // --- Export Actions ---
  window.printReceipt = function () {
    window.print();
  };

  window.downloadPdf = function () {
    const el = document.getElementById('receipt-printable-area');
    if (!el || !window.html2canvas || !window.jspdf) {
      alert('PDF generator library is initializing, please try again in a moment.');
      return;
    }

    const isThermal = state.styling.template === 'thermal';
    const originalShadow = el.style.boxShadow;
    el.style.boxShadow = 'none';

    window.html2canvas(el, { scale: 2, useCORS: true, logging: false }).then(function (canvas) {
      el.style.boxShadow = originalShadow;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new window.jspdf.jsPDF('p', 'mm', isThermal ? [80, 260] : 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = isThermal ? 3 : 10;
      const width = pageWidth - (margin * 2);
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, width, height);
      pdf.save(`${state.receiptNumber || 'Receipt'}.pdf`);
      showToast('PDF downloaded successfully!');
    }).catch(function (err) {
      console.error(err);
      alert('Error exporting PDF: ' + err.message);
    });
  };

  window.downloadJpg = function () {
    const el = document.getElementById('receipt-printable-area');
    if (!el || !window.html2canvas) return;

    window.html2canvas(el, { scale: 2, useCORS: true }).then(function (canvas) {
      const link = document.createElement('a');
      link.download = `${state.receiptNumber || 'Receipt'}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      showToast('High-Res JPG image saved!');
    });
  };

  window.copyStandaloneHtml = function () {
    const htmlCode = generateStandaloneCode();
    navigator.clipboard.writeText(htmlCode).then(() => {
      showToast('Standalone HTML copied to clipboard! You can paste it into any file or upload directly to OrionFx.net.');
    }).catch(() => {
      alert('Could not copy directly. Please select and copy manually.');
    });
  };

  window.downloadStandaloneHtml = function () {
    const htmlCode = generateStandaloneCode();
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.receiptNumber || 'receipt'}-standalone.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Standalone HTML downloaded! No build or npm needed.');
  };

  function generateStandaloneCode() {
    const printable = document.getElementById('receipt-printable-area');
    const content = printable ? printable.outerHTML : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.receiptNumber} - OrionFx Receipt</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    @media print {
      body { background: white !important; padding: 0 !important; }
      .no-print { display: none !important; }
      #receipt-printable-area { box-shadow: none !important; border: none !important; margin: 0 auto !important; width: 100% !important; }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="no-print mb-6 max-w-xl w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
    <span class="font-bold text-slate-800 text-sm">OrionFx Client-Side Invoicing</span>
    <button onclick="window.print()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">Print Receipt</button>
  </div>
  ${content}
</body>
</html>`;
  }

  function showToast(msg) {
    let t = document.getElementById('orionfx-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'orionfx-toast';
      t.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2 border border-slate-700';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
      t.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
    }, 3200);
  }

  // --- Auto Generation Helpers ---
  window.generateReceiptNumber = function () {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    state.receiptNumber = `OFX-${year}-${rand}`;
    saveToStorage();
    render();
  };

  window.generateFbrInvoiceNumber = function () {
    const d = new Date();
    const dateStr = d.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    state.fbrInvoiceNumber = `100234${dateStr}${rand}`;
    saveToStorage();
    render();
  };

  window.setCurrentReceiptTime = function () {
    const d = new Date();
    state.receiptTime = d.toTimeString().split(' ')[0];
    saveToStorage();
    render();
  };

  window.setDatePreset = function (days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    state.dueDate = d.toISOString().split('T')[0];
    saveToStorage();
    render();
  };

  window.loadSampleData = function () {
    state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveToStorage();
    render();
    showToast('Loaded standard OrionFx sample receipt!');
  };

  window.clearForm = function () {
    if (confirm('Clear receipt details and start fresh?')) {
      state.items = [{ id: '1', description: 'Item description', details: '', quantity: 1, unitPrice: 0 }];
      state.discountValue = 0;
      state.taxRate = 0;
      state.paidAmount = 0;
      saveToStorage();
      render();
    }
  };

  // --- Line Items Handlers ---
  window.addItem = function () {
    state.items.push({
      id: Date.now().toString(),
      description: '',
      details: '',
      quantity: 1,
      unitPrice: 0
    });
    saveToStorage();
    render();
  };

  window.removeItem = function (index) {
    if (state.items.length <= 1) {
      state.items = [{ id: Date.now().toString(), description: '', details: '', quantity: 1, unitPrice: 0 }];
    } else {
      state.items.splice(index, 1);
    }
    saveToStorage();
    render();
  };

  window.loadItemPreset = function (type) {
    if (type === 'saas') {
      state.items.push({ id: Date.now().toString(), description: 'OrionFx Cloud Server Enterprise Core', details: 'Monthly Recurring Subscription', quantity: 1, unitPrice: 35000 });
    } else if (type === 'grocery') {
      state.items.push({ id: Date.now().toString(), description: 'Basmati Rice Premium (5kg Pack)', details: 'Brand: Super Kernel', quantity: 2, unitPrice: 2800 });
    } else if (type === 'hardware') {
      state.items.push({ id: Date.now().toString(), description: 'Thermal Receipt Printer 80mm USB/LAN', details: 'Direct Thermal Auto-Cutter', quantity: 1, unitPrice: 18500 });
    }
    saveToStorage();
    render();
  };

  // --- Template Switcher ---
  window.setTemplate = function (tmpl) {
    state.styling.template = tmpl;
    if (tmpl === 'thermal') {
      state.styling.fontFamily = 'mono';
    } else if (tmpl === 'classic') {
      state.styling.fontFamily = 'serif';
    } else {
      state.styling.fontFamily = 'sans';
    }
    saveToStorage();
    render();
  };

  window.setPrimaryColor = function (color) {
    state.styling.primaryColor = color;
    saveToStorage();
    render();
  };

  window.setZoom = function (delta) {
    zoomLevel = Math.min(1.4, Math.max(0.6, zoomLevel + delta));
    const container = document.getElementById('receipt-zoom-wrapper');
    if (container) {
      container.style.transform = `scale(${zoomLevel})`;
      container.style.transformOrigin = 'top center';
    }
    const label = document.getElementById('zoom-percentage');
    if (label) label.textContent = `${Math.round(zoomLevel * 100)}%`;
  };

  window.resetZoom = function () {
    zoomLevel = 1;
    const container = document.getElementById('receipt-zoom-wrapper');
    if (container) {
      container.style.transform = 'scale(1)';
    }
    const label = document.getElementById('zoom-percentage');
    if (label) label.textContent = '100%';
  };

  window.setActiveTab = function (tab) {
    activeTab = tab;
    render();
  };

  window.toggleAccordion = function (name) {
    activeAccordion = activeAccordion === name ? '' : name;
    render();
  };

  // --- Logo Upload ---
  window.handleLogoUpload = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        state.company.logoUrl = e.target.result;
        saveToStorage();
        render();
      };
      reader.readAsDataURL(file);
    }
  };

  window.removeLogo = function () {
    state.company.logoUrl = '';
    saveToStorage();
    render();
  };

  window.setLogoAlignment = function (align) {
    state.company.logoPosition = align;
    state.company.logoAlignment = align;
    saveToStorage();
    render();
  };

  window.adjustLogoSize = function (delta) {
    const current = Number(state.company.logoWidth) || 100;
    state.company.logoWidth = Math.min(260, Math.max(40, current + delta));
    saveToStorage();
    render();
  };

  // --- Digital Signature Canvas Modal ---
  let isDrawing = false;
  let signaturePadCanvas = null;

  window.openSignaturePad = function () {
    const modal = document.getElementById('signature-modal');
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(initSignaturePad, 50);
    }
  };

  window.closeSignaturePad = function () {
    const modal = document.getElementById('signature-modal');
    if (modal) modal.classList.add('hidden');
  };

  function initSignaturePad() {
    const canvas = document.getElementById('signature-pad-canvas');
    if (!canvas) return;
    signaturePadCanvas = canvas;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    canvas.onmousedown = canvas.ontouchstart = function (e) {
      e.preventDefault();
      isDrawing = true;
      const pos = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    canvas.onmousemove = canvas.ontouchmove = function (e) {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getCoords(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    window.onmouseup = window.ontouchend = function () {
      isDrawing = false;
    };
  }

  window.clearSignaturePad = function () {
    if (signaturePadCanvas) {
      const ctx = signaturePadCanvas.getContext('2d');
      ctx.clearRect(0, 0, signaturePadCanvas.width, signaturePadCanvas.height);
    }
  };

  window.saveSignaturePad = function () {
    if (signaturePadCanvas) {
      state.signature.signatureData = signaturePadCanvas.toDataURL('image/png');
      state.signature.signatureType = 'drawn';
      saveToStorage();
      closeSignaturePad();
      render();
      showToast('Handwritten signature applied to receipt!');
    }
  };

  // --- Status Stamp Component Helper ---
  function renderStatusStampHtml(status, companyName, date, color) {
    if (!status || status === 'NONE') return '';
    let colorClass = 'border-emerald-600 text-emerald-700';
    if (status === 'PAID') colorClass = 'border-emerald-600 text-emerald-700';
    else if (status === 'DUE') colorClass = 'border-rose-600 text-rose-700';
    else if (status === 'PENDING') colorClass = 'border-amber-600 text-amber-700';
    else if (status === 'REFUNDED') colorClass = 'border-purple-600 text-purple-700';
    else if (status === 'DRAFT') colorClass = 'border-slate-500 text-slate-600';

    const comp = (companyName || 'OFFICIAL').substring(0, 18).toUpperCase();
    return `
      <div class="relative select-none pointer-events-none transform -rotate-12 inline-block">
        <div class="border-4 border-dashed rounded-xl px-3.5 py-1.5 flex flex-col items-center justify-center opacity-90 shadow-sm ${colorClass}" style="${color ? `border-color: ${color}; color: ${color};` : ''}">
          <span class="text-[9px] font-black tracking-widest uppercase truncate max-w-[130px]">${comp}</span>
          <span class="text-xl font-black tracking-widest uppercase my-0.5 leading-none">${status}</span>
          <div class="flex items-center gap-1 text-[8px] font-mono tracking-tight opacity-90">
            <span>VERIFIED</span>
            ${date ? `<span>• ${date}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // --- Document Renderers for 5 Distinct Templates ---
  function renderDocumentHtml() {
    const totals = calculateTotals();
    const template = state.styling.template || 'thermal';
    const primary = state.styling.primaryColor || '#059669';
    const inWords = numberToWords(totals.grandTotal, state.currency.name);
    const logoAlign = state.company.logoPosition || state.company.logoAlignment || 'left';
    const logoW = state.company.logoWidth || 100;

    // 1. Thermal 80mm POS Template (Pakistan Standard POS & FBR Retail Invoicing)
    if (template === 'thermal') {
      const fbrInv = state.fbrInvoiceNumber || '1002342609120842';
      const ntn = state.company.ntn || state.company.taxId || '7412985-3';
      const strn = state.company.strn || '17-00-7412-985-19';
      const posId = state.company.posTerminalId || 'POS-01';
      const totalUnits = state.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);

      return `
      <div id="receipt-printable-area" class="bg-white text-slate-900 mx-auto p-4 sm:p-6 text-xs font-mono max-w-[380px] shadow-2xl border border-slate-300 w-full transition-all">
        <!-- Pakistan POS Header -->
        <div class="text-center pb-2.5 space-y-1">
          ${state.company.logoUrl ? `
            <div class="flex ${logoAlign === 'left' ? 'justify-start' : logoAlign === 'right' ? 'justify-end' : 'justify-center'} mb-2">
              <img src="${state.company.logoUrl}" style="max-width: ${logoW}px" class="${state.company.logoRadius || 'rounded-lg'}" alt="Logo" />
            </div>
          ` : ''}
          <h2 class="text-base sm:text-lg font-black tracking-wider uppercase text-slate-950">${state.company.name || 'COMPANY NAME'}</h2>
          ${state.company.tagline ? `<p class="text-[11px] font-semibold text-slate-700">${state.company.tagline}</p>` : ''}
          <p class="text-[10px] text-slate-600 leading-tight">${state.company.address || ''}</p>
          <p class="text-[10px] text-slate-600">${state.company.cityStateZip || ''} ${state.company.country ? `• ${state.company.country}` : ''}</p>
          ${state.company.phone ? `<p class="text-[10px] font-bold text-slate-800">UAN / Tel: ${state.company.phone}</p>` : ''}
          
          <!-- Pakistan Tax Identification Registration Block -->
          <div class="pt-1 text-[10px] font-bold text-slate-800 space-y-0.5 border-t border-dotted border-slate-400 mt-1.5">
            <div class="flex justify-between px-1"><span>NTN :</span><span class="font-mono tracking-wider">${ntn}</span></div>
            <div class="flex justify-between px-1"><span>STRN :</span><span class="font-mono tracking-wider">${strn}</span></div>
            <div class="flex justify-between px-1"><span>POS REG # :</span><span class="font-mono tracking-wider">${posId}</span></div>
          </div>
        </div>

        <div class="border-t-2 border-dashed border-slate-700 my-2"></div>

        <!-- Invoice Title -->
        <div class="text-center space-y-0.5 pb-1">
          <p class="text-xs font-black uppercase tracking-wider text-slate-900">
            ${state.type === 'TAX INVOICE' ? 'SALES TAX INVOICE (CASH)' : state.type}
          </p>
          <p class="text-[10px] font-semibold text-slate-600 tracking-widest">*** CUSTOMER COPY ***</p>
        </div>

        <!-- Invoice Meta Details -->
        <div class="text-[10px] space-y-1 py-1 border-t border-dotted border-slate-300 font-medium">
          <div class="flex justify-between"><span class="text-slate-600">INVOICE NO:</span><span class="font-bold text-slate-900">${state.receiptNumber}</span></div>
          <div class="flex justify-between"><span class="text-slate-600">FBR INV NO:</span><span class="font-bold font-mono text-slate-900 tracking-wider">${fbrInv}</span></div>
          <div class="flex justify-between"><span class="text-slate-600">DATE & TIME:</span><span class="font-mono text-slate-900">${state.issueDate} ${state.receiptTime || '14:35:10'}</span></div>
          <div class="flex justify-between"><span class="text-slate-600">CASHIER / COUNTER:</span><span class="text-slate-900 font-semibold">${state.cashierName || 'Counter 01'}</span></div>
          ${state.client.name ? `
            <div class="pt-0.5 border-t border-dashed border-slate-200">
              <div class="flex justify-between"><span class="text-slate-600">CUSTOMER:</span><span class="font-bold text-slate-900 truncate max-w-[190px]">${state.client.name}</span></div>
              ${state.client.phone ? `<div class="flex justify-between"><span class="text-slate-600">CONTACT:</span><span class="text-slate-800">${state.client.phone}</span></div>` : ''}
              ${state.client.taxId ? `<div class="flex justify-between"><span class="text-slate-600">BUYER NTN/CNIC:</span><span class="text-slate-800 font-mono">${state.client.taxId}</span></div>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="border-t-2 border-slate-900 my-1.5"></div>

        <!-- Items Table -->
        <div class="py-1">
          <div class="flex justify-between font-black text-[10px] uppercase text-slate-900 pb-1 border-b border-slate-400 mb-1.5">
            <span class="w-[18px]">#</span>
            <span class="flex-1 px-1">DESCRIPTION</span>
            <span class="w-10 text-center">QTY</span>
            <span class="w-14 text-right">RATE</span>
            <span class="w-16 text-right">AMOUNT</span>
          </div>
          <div class="space-y-2 text-[11px]">
            ${state.items.map((item, idx) => `
              <div class="leading-tight">
                <div class="flex items-start">
                  <span class="w-[18px] text-[10px] text-slate-500 font-bold">${String(idx + 1).padStart(2, '0')}</span>
                  <div class="flex-1 px-1 font-bold text-slate-900">
                    ${item.description || 'General Item'}
                    ${item.details ? `<span class="block text-[9px] font-normal text-slate-500 italic mt-0.5">${item.details}</span>` : ''}
                  </div>
                </div>
                <div class="flex justify-between items-center text-[10px] pl-[18px] text-slate-600 pt-0.5">
                  <span class="w-10 text-center font-semibold text-slate-800">${item.quantity}</span>
                  <span class="w-14 text-right font-mono">${formatMoney(item.unitPrice, '')}</span>
                  <span class="w-16 text-right font-bold font-mono text-slate-950">${formatMoney(item.quantity * item.unitPrice, state.currency.symbol)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="pt-2 mt-2 border-t border-dashed border-slate-300 flex justify-between text-[10px] font-bold text-slate-700">
            <span>TOTAL ITEMS: ${state.items.length}</span>
            <span>TOTAL UNITS: ${totalUnits}</span>
          </div>
        </div>

        <div class="border-t-2 border-dashed border-slate-700 my-2"></div>

        <!-- Financial Totals & Taxes -->
        <div class="space-y-1 text-[11px] py-1">
          <div class="flex justify-between text-slate-700"><span>GROSS AMOUNT:</span><span class="font-mono">${formatMoney(totals.subtotal)}</span></div>
          ${totals.discountAmount > 0 ? `
            <div class="flex justify-between text-slate-700">
              <span>DISCOUNT (${state.discountValue}${state.discountType === 'percent' ? '%' : ''}):</span>
              <span class="font-mono font-bold text-rose-700">-${formatMoney(totals.discountAmount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-slate-700"><span>TAXABLE VALUE:</span><span class="font-mono font-semibold">${formatMoney(totals.taxableAmount)}</span></div>
          ${totals.taxAmount > 0 ? `
            <div class="flex justify-between text-slate-800">
              <span>${state.taxLabel || 'SALES TAX / GST'} (${state.taxRate}%):</span>
              <span class="font-mono font-bold">+${formatMoney(totals.taxAmount)}</span>
            </div>
          ` : ''}
          ${totals.shipping > 0 ? `
            <div class="flex justify-between text-slate-700"><span>SERVICE / CHARGES:</span><span class="font-mono">+${formatMoney(totals.shipping)}</span></div>
          ` : ''}
          
          <div class="border-y-2 border-slate-950 py-1.5 my-1.5 flex justify-between items-baseline text-sm sm:text-base font-black text-slate-950">
            <span>NET PAYABLE:</span><span class="font-mono">${formatMoney(totals.grandTotal)}</span>
          </div>

          <div class="text-[10px] space-y-0.5 pt-0.5">
            <div class="flex justify-between text-slate-800"><span>TENDERED / PAID:</span><span class="font-mono font-bold">${formatMoney(totals.paidAmount)}</span></div>
            ${totals.balanceDue > 0 ? `
              <div class="flex justify-between font-bold text-rose-600"><span>BALANCE DUE:</span><span class="font-mono">${formatMoney(totals.balanceDue)}</span></div>
            ` : `
              <div class="flex justify-between text-slate-700"><span>CHANGE RETURNED:</span><span class="font-mono">${formatMoney(totals.changeReturned)}</span></div>
            `}
            <div class="flex justify-between text-slate-700 pt-0.5 font-medium"><span>PAYMENT MODE:</span><span class="font-bold uppercase text-slate-900">${state.payment.method || 'CASH'}</span></div>
          </div>

          <div class="pt-1.5 border-t border-dotted border-slate-300 text-[10px] text-slate-700 italic">
            <span class="font-bold not-italic">In Words: </span><span>${inWords}</span>
          </div>
        </div>

        <div class="border-t-2 border-dashed border-slate-700 my-2.5"></div>

        <!-- FBR POS Integrated Box -->
        <div class="my-2 p-2.5 border-2 border-slate-800 rounded bg-slate-50 text-center space-y-1.5">
          <div class="border-b border-slate-400 pb-1">
            <span class="text-[11px] font-black tracking-wider uppercase text-slate-950 block">FBR POS INTEGRATED INVOICE</span>
            <span class="text-[9px] font-bold text-emerald-800 uppercase tracking-wide block">TIER-1 RETAILER SYSTEM</span>
          </div>
          <div class="flex flex-col items-center justify-center py-1">
            <div id="live-qrcode-thermal" class="p-1 bg-white inline-block border border-slate-300"></div>
            <p class="text-[8px] font-mono text-slate-600 mt-1 font-bold">FBR INV ID: ${fbrInv}</p>
          </div>
          <div class="text-[8px] text-slate-700 leading-tight font-medium">
            <p class="font-bold text-slate-900">Verify this invoice via FBR "Tax Asaan" App</p>
            <p>or SMS FBR Invoice Number to <span class="font-bold text-slate-950">9966</span></p>
          </div>
          <!-- Barcode simulation -->
          <div class="pt-1 flex flex-col items-center">
            <div class="h-6 w-44 flex justify-center items-center gap-[2px] overflow-hidden">
              ${[2,1,3,1,2,1,4,1,2,3,1,2,1,3,2,1,2,4,1,2,1,3,1,2,1,3,2,1,4,1,2,1].map(w => `<div class="h-full bg-slate-900" style="width: ${w}px"></div>`).join('')}
            </div>
            <span class="text-[8px] font-mono tracking-widest text-slate-600">*${fbrInv}*</span>
          </div>
        </div>

        ${state.signature.showStamp && state.status !== 'NONE' ? `
          <div class="py-2 flex justify-center">
            ${renderStatusStampHtml(state.status, state.company.name, state.issueDate)}
          </div>
        ` : ''}

        <!-- Urdu & English Customer Greetings & Policy -->
        <div class="pt-2 text-center text-[9px] text-slate-600 space-y-1">
          <p class="text-sm font-bold text-slate-950 py-0.5 tracking-wide">شکریہ! دوبارہ تشریف لائیں</p>
          <p class="text-[10px] font-bold text-slate-800 uppercase tracking-wider">THANK YOU FOR SHOPPING WITH US</p>
          <div class="border-t border-dotted border-slate-300 pt-1 text-left px-1 space-y-0.5 text-[8.5px] leading-tight text-slate-500">
            ${state.terms ? `<p>${state.terms}</p>` : `
              <p>• Goods once sold can be exchanged within 7 days with original receipt.</p>
              <p>• Price tags and barcodes must remain intact. No cash refunds.</p>
              <p>• Altered, used, or sale/discounted items are not exchangeable.</p>
            `}
            ${state.notes ? `<p class="font-semibold text-slate-700 italic pt-0.5">Note: ${state.notes}</p>` : ''}
          </div>
          <div class="pt-2 text-[8px] text-slate-400 font-mono">
            <span>Powered by OrionFx SaaS POS • orionfx.net</span>
          </div>
        </div>
      </div>
      `;
    }

    // 2. Corporate Executive Template (Striking Top Banner, Structured Corporate Design)
    if (template === 'corporate') {
      return `
      <div id="receipt-printable-area" class="bg-white text-slate-900 mx-auto rounded-2xl shadow-2xl border border-slate-300 max-w-[840px] w-full overflow-hidden transition-all">
        <!-- Full-bleed Corporate Header Banner -->
        <div class="p-6 sm:p-8 text-white" style="background: ${primary}">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div class="flex items-center gap-4">
              ${state.company.logoUrl ? `
                <div class="bg-white p-2.5 rounded-xl shadow-md flex-shrink-0">
                  <img src="${state.company.logoUrl}" style="max-width: ${state.company.logoWidth || 100}px" class="${state.company.logoRadius || 'rounded-lg'}" alt="Logo" />
                </div>
              ` : `
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center font-black text-2xl border border-white/30">
                  OFX
                </div>
              `}
              <div>
                <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">${state.company.name || 'COMPANY NAME'}</h1>
                ${state.company.tagline ? `<p class="text-xs opacity-90 font-medium mt-0.5">${state.company.tagline}</p>` : ''}
                <p class="text-[11px] opacity-80 mt-1">${state.company.address || ''}, ${state.company.cityStateZip || ''}</p>
                ${state.company.ntn ? `<p class="text-[11px] font-mono opacity-90 font-semibold">NTN: ${state.company.ntn} | STRN: ${state.company.strn || 'N/A'}</p>` : ''}
              </div>
            </div>

            <div class="text-left sm:text-right bg-white/15 p-4 rounded-xl backdrop-blur-sm border border-white/25 min-w-[200px] shadow-sm">
              <span class="text-[11px] uppercase tracking-widest font-black opacity-90 block">${state.type}</span>
              <span class="text-xl font-mono font-black tracking-tight block my-0.5">${state.receiptNumber}</span>
              <div class="text-[11px] opacity-90 flex justify-between sm:justify-end gap-2 mt-1">
                <span>Date:</span><span class="font-bold">${state.issueDate}</span>
              </div>
              ${state.dueDate ? `
                <div class="text-[11px] opacity-90 flex justify-between sm:justify-end gap-2">
                  <span>Due:</span><span class="font-bold">${state.dueDate}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="p-6 sm:p-10 space-y-6">
          <!-- Corporate 2-Column Info Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200 text-xs">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">CONSIGNEE / CLIENT DETAILS</span>
              <p class="text-sm font-bold text-slate-900">${state.client.name || 'Valued Corporate Client'}</p>
              ${state.client.company ? `<p class="text-slate-700 font-semibold">${state.client.company}</p>` : ''}
              <p class="text-slate-600">${state.client.address || ''}</p>
              <p class="text-slate-600">${state.client.cityStateZip || ''}</p>
              ${state.client.phone ? `<p class="text-slate-700 font-medium">Contact: ${state.client.phone}</p>` : ''}
              ${state.client.taxId ? `<p class="text-slate-700 font-mono font-bold">NTN / CNIC: ${state.client.taxId}</p>` : ''}
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">BANKING & SETTLEMENT MANDATE</span>
                <p class="text-slate-800"><span class="font-bold">Payment Method:</span> ${state.payment.method}</p>
                ${state.payment.bankName ? `<p class="text-slate-700 font-medium">Bank: ${state.payment.bankName}</p>` : ''}
                ${state.payment.accountName ? `<p class="text-slate-700">A/C Title: ${state.payment.accountName}</p>` : ''}
                ${state.payment.accountNumber ? `<p class="text-slate-800 font-mono font-bold">IBAN / A/C: ${state.payment.accountNumber}</p>` : ''}
              </div>
              <div class="pt-2 flex justify-between items-center border-t border-slate-200 mt-2">
                <span class="text-[11px] font-bold text-slate-500">Invoice Status:</span>
                <span class="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${state.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}">
                  ${state.status}
                </span>
              </div>
            </div>
          </div>

          <!-- Items Table with Corporate Theme -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-white text-[11px] font-black uppercase tracking-wider" style="background: ${primary}">
                  <th class="py-3 px-3 rounded-l-lg">#</th>
                  <th class="py-3 px-3">Item Description & Specifications</th>
                  <th class="py-3 px-3 text-center w-16">Qty</th>
                  <th class="py-3 px-3 text-right w-28">Unit Rate</th>
                  <th class="py-3 px-3 text-right w-32 rounded-r-lg">Total Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${state.items.map((it, idx) => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-3 text-slate-400 font-mono font-bold align-top">${String(idx + 1).padStart(2, '0')}</td>
                    <td class="py-3.5 px-3 align-top">
                      <p class="font-bold text-slate-900 text-sm">${it.description || 'Service or Item'}</p>
                      ${it.details ? `<p class="text-[11px] text-slate-500 mt-0.5 italic leading-relaxed">${it.details}</p>` : ''}
                    </td>
                    <td class="py-3.5 px-3 text-center font-bold text-slate-800 align-top">${it.quantity}</td>
                    <td class="py-3.5 px-3 text-right font-mono text-slate-700 align-top">${formatMoney(it.unitPrice, '')}</td>
                    <td class="py-3.5 px-3 text-right font-mono font-black text-slate-900 align-top">${formatMoney(it.quantity * it.unitPrice, state.currency.symbol)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Totals Calculation Block -->
          <div class="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-8 text-xs">
            <div class="w-full sm:w-1/2 space-y-4">
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">TOTAL IN WORDS</span>
                <p class="text-xs font-bold text-slate-800 italic leading-snug">${inWords}</p>
              </div>

              ${state.payment.showQrCode ? `
                <div class="flex items-center gap-3.5 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div id="live-qrcode-corporate" class="p-1 bg-white border border-slate-300 rounded"></div>
                  <div class="text-[10px] text-slate-600">
                    <p class="font-bold text-slate-800 text-xs">Official Verification QR</p>
                    <p class="leading-tight mt-0.5">Scan via camera to verify authentic e-billing document & payment mandate.</p>
                  </div>
                </div>
              ` : ''}

              ${state.terms ? `
                <div class="space-y-1">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 block">TERMS & EXECUTIVE MANDATE</span>
                  <p class="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">${state.terms}</p>
                </div>
              ` : ''}
            </div>

            <div class="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="flex justify-between text-slate-600"><span>Gross Subtotal:</span><span class="font-mono font-semibold">${formatMoney(totals.subtotal)}</span></div>
              ${totals.discountAmount > 0 ? `
                <div class="flex justify-between text-rose-600 font-semibold"><span>Discount (${state.discountValue}${state.discountType === 'percent' ? '%' : ''}):</span><span class="font-mono">-${formatMoney(totals.discountAmount)}</span></div>
              ` : ''}
              <div class="flex justify-between text-slate-600"><span>Taxable Base:</span><span class="font-mono font-semibold">${formatMoney(totals.taxableAmount)}</span></div>
              ${totals.taxAmount > 0 ? `
                <div class="flex justify-between text-slate-700 font-medium"><span>${state.taxLabel || 'Sales Tax / GST'} (${state.taxRate}%):</span><span class="font-mono font-bold">+${formatMoney(totals.taxAmount)}</span></div>
              ` : ''}
              ${totals.shipping > 0 ? `
                <div class="flex justify-between text-slate-600"><span>Service / Shipping:</span><span class="font-mono">+${formatMoney(totals.shipping)}</span></div>
              ` : ''}

              <div class="border-t-2 border-b-2 py-2.5 my-1 flex justify-between items-baseline text-base font-black text-slate-950" style="border-color: ${primary}">
                <span>NET PAYABLE:</span><span class="font-mono text-lg" style="color: ${primary}">${formatMoney(totals.grandTotal)}</span>
              </div>

              <div class="flex justify-between text-slate-700 pt-1 font-medium"><span>Amount Paid:</span><span class="font-mono font-bold">${formatMoney(totals.paidAmount)}</span></div>
              ${totals.balanceDue > 0 ? `
                <div class="flex justify-between font-bold text-rose-600"><span>Balance Due:</span><span class="font-mono">${formatMoney(totals.balanceDue)}</span></div>
              ` : `
                <div class="flex justify-between text-slate-600"><span>Change / Excess:</span><span class="font-mono">${formatMoney(totals.changeReturned)}</span></div>
              `}
            </div>
          </div>

          <!-- Signatures & Stamp -->
          <div class="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
            <div>
              ${state.signature.showStamp && state.status !== 'NONE' ? `
                ${renderStatusStampHtml(state.status, state.company.name, state.issueDate, primary)}
              ` : `
                <div class="text-[10px] text-slate-400">
                  <p class="font-bold text-slate-600">OrionFx Enterprise Invoicing Suite</p>
                  <p>Certified Client-Side Document • www.orionfx.net</p>
                </div>
              `}
            </div>

            <div class="text-right min-w-[200px]">
              ${state.signature.signatureType === 'drawn' && state.signature.signatureData ? `
                <img src="${state.signature.signatureData}" class="h-14 inline-block object-contain mb-1" alt="Signature" />
              ` : `
                <p class="font-signature text-3xl text-slate-800 my-1">${state.signature.signerName || 'Authorized Signatory'}</p>
              `}
              <div class="w-48 border-t-2 border-slate-400 mt-1 mb-1 ml-auto"></div>
              <p class="font-bold text-slate-900 text-xs">${state.signature.signerName || 'Authorized Signatory'}</p>
              <p class="text-[10px] text-slate-500 font-semibold">${state.signature.signerTitle || 'Managing Director'}</p>
              <p class="text-[9px] text-slate-400 font-mono mt-0.5">Signed & Certified: ${state.issueDate}</p>
            </div>
          </div>
        </div>
      </div>
      `;
    }

    // 3. Classic Serif Template (Timeless Editorial, Playfair Display, Ornate Double Border)
    if (template === 'classic') {
      return `
      <div id="receipt-printable-area" class="bg-white text-slate-900 mx-auto p-8 sm:p-12 max-w-[820px] w-full font-serif border-4 border-double border-slate-800 shadow-2xl transition-all">
        <!-- Classic Ornate Header -->
        <div class="text-center pb-6 border-b border-slate-300 space-y-1.5">
          ${state.company.logoUrl ? `
            <div class="flex ${logoAlign === 'left' ? 'justify-start' : logoAlign === 'right' ? 'justify-end' : 'justify-center'} mb-3">
              <img src="${state.company.logoUrl}" style="max-width: ${logoW}px" class="${state.company.logoRadius || 'rounded'}" alt="Logo" />
            </div>
          ` : ''}
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight uppercase text-slate-900 font-serif">${state.company.name || 'COMPANY NAME'}</h1>
          ${state.company.tagline ? `<p class="text-xs italic text-slate-600">${state.company.tagline}</p>` : ''}
          <p class="text-xs text-slate-600">${state.company.address || ''}, ${state.company.cityStateZip || ''} ${state.company.country ? `• ${state.company.country}` : ''}</p>
          <div class="text-[11px] text-slate-500 flex justify-center gap-4 pt-1">
            ${state.company.phone ? `<span>Tel: ${state.company.phone}</span>` : ''}
            ${state.company.email ? `<span>Email: ${state.company.email}</span>` : ''}
            ${state.company.ntn ? `<span>NTN: ${state.company.ntn}</span>` : ''}
          </div>
          
          <div class="pt-3">
            <span class="text-xs tracking-widest text-slate-500 uppercase font-sans">♦ ♦ ♦</span>
            <h2 class="text-lg font-bold uppercase tracking-widest text-slate-900 mt-1 font-serif">
              — ${state.type} OF PAYMENT —
            </h2>
            <p class="text-xs font-mono text-slate-700 font-bold">Doc Ref: ${state.receiptNumber}</p>
          </div>
        </div>

        <!-- Classic Client & Date Metadata -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div class="space-y-1">
            <span class="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block">RECEIVED WITH THANKS FROM:</span>
            <p class="text-sm font-bold text-slate-900 font-serif">${state.client.name || 'Valued Patron'}</p>
            ${state.client.company ? `<p class="text-slate-700 font-semibold italic">${state.client.company}</p>` : ''}
            <p class="text-slate-600">${state.client.address || ''} ${state.client.cityStateZip || ''}</p>
            ${state.client.taxId ? `<p class="font-mono text-slate-700">Tax ID: ${state.client.taxId}</p>` : ''}
          </div>
          <div class="sm:text-right space-y-1 font-sans">
            <p><span class="font-bold text-slate-600">Date of Record:</span> <span class="font-serif font-bold text-slate-900">${state.issueDate}</span></p>
            ${state.dueDate ? `<p><span class="font-bold text-slate-600">Due by:</span> <span class="font-serif font-bold text-slate-900">${state.dueDate}</span></p>` : ''}
            <p><span class="font-bold text-slate-600">Payment Instrument:</span> <span class="font-serif font-bold text-slate-900">${state.payment.method}</span></p>
            <div class="pt-2 sm:flex sm:justify-end">
              <span class="px-3 py-1 border border-slate-800 text-[10px] font-black uppercase tracking-wider">
                STATUS: ${state.status}
              </span>
            </div>
          </div>
        </div>

        <!-- Classic Line Items Table -->
        <div class="py-6">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b-2 border-slate-800 text-[10px] font-sans font-bold uppercase tracking-widest text-slate-700">
                <th class="py-2.5 px-1">Item #</th>
                <th class="py-2.5 px-2">Particulars & Services Rendered</th>
                <th class="py-2.5 px-2 text-center w-16">Quantity</th>
                <th class="py-2.5 px-2 text-right w-28">Rate</th>
                <th class="py-2.5 px-2 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${state.items.map((it, idx) => `
                <tr>
                  <td class="py-3 px-1 text-slate-500 font-mono align-top">${idx + 1}.</td>
                  <td class="py-3 px-2 align-top">
                    <p class="font-bold text-slate-900 font-serif text-sm">${it.description || 'Particular Item'}</p>
                    ${it.details ? `<p class="text-[11px] text-slate-600 italic mt-0.5">${it.details}</p>` : ''}
                  </td>
                  <td class="py-3 px-2 text-center font-sans font-semibold text-slate-800 align-top">${it.quantity}</td>
                  <td class="py-3 px-2 text-right font-mono text-slate-700 align-top">${formatMoney(it.unitPrice, '')}</td>
                  <td class="py-3 px-2 text-right font-mono font-bold text-slate-900 align-top">${formatMoney(it.quantity * it.unitPrice, state.currency.symbol)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Classic Financial Calculations -->
        <div class="pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-8 text-xs">
          <div class="w-full sm:w-1/2 space-y-3">
            <div class="p-3 border border-slate-300 rounded bg-slate-50/50">
              <span class="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block mb-0.5">AMOUNT CONFERRED IN WORDS</span>
              <p class="font-serif italic text-slate-800 text-xs leading-snug">${inWords}</p>
            </div>
            ${state.terms ? `
              <div class="text-[11px] text-slate-600 space-y-1">
                <span class="font-sans font-bold text-slate-700 uppercase tracking-wider text-[10px]">TERMS OF SETTLEMENT:</span>
                <p class="italic leading-relaxed">${state.terms}</p>
              </div>
            ` : ''}
          </div>

          <div class="w-full sm:w-72 space-y-1.5 font-sans">
            <div class="flex justify-between text-slate-600"><span>Sub-Total:</span><span class="font-mono font-medium">${formatMoney(totals.subtotal)}</span></div>
            ${totals.discountAmount > 0 ? `
              <div class="flex justify-between text-rose-700 font-medium"><span>Less Remission / Discount:</span><span class="font-mono">-${formatMoney(totals.discountAmount)}</span></div>
            ` : ''}
            <div class="flex justify-between text-slate-600"><span>Taxable Balance:</span><span class="font-mono font-medium">${formatMoney(totals.taxableAmount)}</span></div>
            ${totals.taxAmount > 0 ? `
              <div class="flex justify-between text-slate-700"><span>${state.taxLabel || 'Sales Tax / Duty'} (${state.taxRate}%):</span><span class="font-mono">+${formatMoney(totals.taxAmount)}</span></div>
            ` : ''}
            
            <div class="border-t-2 border-b-4 border-double border-slate-900 py-2 my-2 flex justify-between items-baseline text-base font-bold text-slate-950 font-serif">
              <span>TOTAL DUE:</span><span class="font-mono text-lg font-bold">${formatMoney(totals.grandTotal)}</span>
            </div>

            <div class="flex justify-between text-slate-700"><span>Remitted / Paid:</span><span class="font-mono font-bold">${formatMoney(totals.paidAmount)}</span></div>
            ${totals.balanceDue > 0 ? `
              <div class="flex justify-between font-bold text-rose-700"><span>Outstanding Due:</span><span class="font-mono">${formatMoney(totals.balanceDue)}</span></div>
            ` : `
              <div class="flex justify-between text-slate-600"><span>Settlement Balance:</span><span class="font-mono">${formatMoney(totals.changeReturned)}</span></div>
            `}
          </div>
        </div>

        <!-- Classic Signature & Seal -->
        <div class="pt-10 mt-6 border-t border-slate-300 flex justify-between items-end text-xs">
          <div>
            ${state.signature.showStamp && state.status !== 'NONE' ? `
              ${renderStatusStampHtml(state.status, state.company.name, state.issueDate)}
            ` : ''}
          </div>
          <div class="text-right min-w-[200px]">
            ${state.signature.signatureType === 'drawn' && state.signature.signatureData ? `
              <img src="${state.signature.signatureData}" class="h-14 inline-block object-contain mb-1" alt="Signature" />
            ` : `
              <p class="font-signature text-3xl text-slate-800 my-1">${state.signature.signerName || 'Authorized Signatory'}</p>
            `}
            <div class="w-48 border-t border-slate-800 mt-1 mb-1 ml-auto"></div>
            <p class="font-bold text-slate-900 font-serif text-sm">${state.signature.signerName || 'Authorized Signatory'}</p>
            <p class="text-[10px] font-sans text-slate-500 uppercase tracking-widest">${state.signature.signerTitle || 'Executive Officer'}</p>
          </div>
        </div>
      </div>
      `;
    }

    // 4. Minimalist Studio Template (Swiss Architectural Monochrome Layout)
    if (template === 'minimal') {
      return `
      <div id="receipt-printable-area" class="bg-white text-slate-900 mx-auto p-8 sm:p-12 max-w-[820px] w-full font-sans shadow-xl border border-slate-100 transition-all">
        <!-- Minimalist Clean Top Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start gap-8 pb-10 border-b border-slate-100">
          <div class="${logoAlign === 'center' ? 'text-center' : logoAlign === 'right' ? 'text-right' : 'text-left'}">
            ${state.company.logoUrl ? `
              <div class="flex ${logoAlign === 'center' ? 'justify-center' : logoAlign === 'right' ? 'justify-end' : 'justify-start'} mb-4">
                <img src="${state.company.logoUrl}" style="max-width: ${logoW}px" class="${state.company.logoRadius || 'rounded-none'}" alt="Logo" />
              </div>
            ` : ''}
            <h1 class="text-xl font-bold tracking-tight uppercase text-slate-900">${state.company.name || 'COMPANY NAME'}</h1>
            <p class="text-xs text-slate-400 mt-1">${state.company.address || ''} • ${state.company.cityStateZip || ''}</p>
            <p class="text-xs text-slate-400">${state.company.phone || ''} • ${state.company.email || ''}</p>
          </div>
          <div class="sm:text-right space-y-1">
            <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">${state.type}</span>
            <p class="text-xl font-mono font-light text-slate-900">${state.receiptNumber}</p>
            <p class="text-xs text-slate-400">Date: ${state.issueDate}</p>
            <div class="pt-2">
              <span class="text-[10px] font-mono tracking-widest uppercase border-b border-slate-900 pb-0.5">
                ${state.status}
              </span>
            </div>
          </div>
        </div>

        <!-- Minimalist Client Meta -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
          <div>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">CLIENT</span>
            <p class="font-bold text-slate-900 text-sm">${state.client.name || 'Client Name'}</p>
            <p class="text-slate-500 mt-0.5">${state.client.company || ''}</p>
            <p class="text-slate-400">${state.client.address || ''} ${state.client.cityStateZip || ''}</p>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 block mb-1">PAYMENT REFERENCE</span>
            <p class="text-slate-700">Method: ${state.payment.method}</p>
            ${state.payment.bankName ? `<p class="text-slate-500">Bank: ${state.payment.bankName}</p>` : ''}
            ${state.payment.accountNumber ? `<p class="text-slate-500 font-mono">A/C: ${state.payment.accountNumber}</p>` : ''}
          </div>
        </div>

        <!-- Minimalist Table -->
        <div class="py-8">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 pb-2">
                <th class="py-2 px-1">DESCRIPTION</th>
                <th class="py-2 px-1 text-center w-14">QTY</th>
                <th class="py-2 px-1 text-right w-24">RATE</th>
                <th class="py-2 px-1 text-right w-28">AMOUNT</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              ${state.items.map((it) => `
                <tr>
                  <td class="py-3 px-1">
                    <span class="font-medium text-slate-900 block">${it.description || 'Item'}</span>
                    ${it.details ? `<span class="text-[10px] text-slate-400 block mt-0.5">${it.details}</span>` : ''}
                  </td>
                  <td class="py-3 px-1 text-center text-slate-600">${it.quantity}</td>
                  <td class="py-3 px-1 text-right font-mono text-slate-600">${formatMoney(it.unitPrice, '')}</td>
                  <td class="py-3 px-1 text-right font-mono font-medium text-slate-900">${formatMoney(it.quantity * it.unitPrice, state.currency.symbol)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Minimalist Totals -->
        <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-8 text-xs">
          <div class="w-full sm:w-1/2 space-y-3">
            <p class="italic text-slate-500 text-[11px]">${inWords}</p>
            ${state.terms ? `<p class="text-[10px] text-slate-400 leading-relaxed">${state.terms}</p>` : ''}
          </div>

          <div class="w-full sm:w-64 space-y-1.5">
            <div class="flex justify-between text-slate-500"><span>Subtotal:</span><span class="font-mono">${formatMoney(totals.subtotal)}</span></div>
            ${totals.discountAmount > 0 ? `<div class="flex justify-between text-slate-500"><span>Discount:</span><span class="font-mono">-${formatMoney(totals.discountAmount)}</span></div>` : ''}
            ${totals.taxAmount > 0 ? `<div class="flex justify-between text-slate-500"><span>Tax (${state.taxRate}%):</span><span class="font-mono">+${formatMoney(totals.taxAmount)}</span></div>` : ''}
            
            <div class="border-t border-slate-900 pt-2 my-1 flex justify-between items-baseline text-sm font-bold text-slate-950">
              <span>TOTAL:</span><span class="font-mono text-base">${formatMoney(totals.grandTotal)}</span>
            </div>
            <div class="flex justify-between text-slate-400 text-[11px]"><span>Paid:</span><span class="font-mono">${formatMoney(totals.paidAmount)}</span></div>
            ${totals.balanceDue > 0 ? `<div class="flex justify-between text-slate-900 font-bold text-[11px]"><span>Balance Due:</span><span class="font-mono">${formatMoney(totals.balanceDue)}</span></div>` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-12 mt-8 border-t border-slate-100 flex justify-between items-end text-[10px] text-slate-400">
          <div>
            ${state.signature.showStamp && state.status !== 'NONE' ? `
              ${renderStatusStampHtml(state.status, state.company.name, state.issueDate)}
            ` : '<span>OrionFx Minimalist Engine</span>'}
          </div>
          <div class="text-right">
            ${state.signature.signatureType === 'drawn' && state.signature.signatureData ? `
              <img src="${state.signature.signatureData}" class="h-10 inline-block object-contain mb-1" alt="Signature" />
            ` : `
              <p class="font-signature text-2xl text-slate-800">${state.signature.signerName || 'Authorized'}</p>
            `}
            <div class="w-32 border-t border-slate-200 mt-1 mb-0.5 ml-auto"></div>
            <p class="font-bold text-slate-700">${state.signature.signerName || 'Authorized Signatory'}</p>
          </div>
        </div>
      </div>
      `;
    }

    // 5. Modern Clean Template (Default SaaS Style with Accent Color Bar, Dual Cards, Split Totals & QR Code)
    return `
    <div id="receipt-printable-area" class="bg-white text-slate-900 mx-auto p-6 sm:p-10 md:p-12 max-w-[820px] min-h-[900px] rounded-2xl shadow-xl border border-slate-200 transition relative flex flex-col justify-between">
      <!-- Top Colored Accent Bar -->
      <div class="absolute top-0 left-0 right-0 h-2.5 rounded-t-2xl" style="background: ${primary}"></div>

      <div class="space-y-6 pt-1">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
          <div class="space-y-2 max-w-sm ${logoAlign === 'center' ? 'text-center' : logoAlign === 'right' ? 'text-right' : 'text-left'}">
            ${state.company.logoUrl ? `
              <div class="flex ${logoAlign === 'center' ? 'justify-center' : logoAlign === 'right' ? 'justify-end' : 'justify-start'} mb-2">
                <img src="${state.company.logoUrl}" style="max-width: ${logoW}px" class="${state.company.logoRadius || 'rounded-lg'} object-contain shadow-2xs" alt="Logo" />
              </div>
            ` : ''}
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight leading-snug">${state.company.name || 'COMPANY NAME'}</h1>
              ${state.company.tagline ? `<p class="text-xs text-slate-500 font-medium mt-0.5">${state.company.tagline}</p>` : ''}
            </div>
            <div class="text-xs text-slate-600 space-y-0.5 leading-relaxed">
              <p>${state.company.address || ''}</p>
              <p>${state.company.cityStateZip || ''} ${state.company.country ? `• ${state.company.country}` : ''}</p>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 pt-1">
                ${state.company.phone ? `<span>Tel: ${state.company.phone}</span>` : ''}
                ${state.company.email ? `<span>• ${state.company.email}</span>` : ''}
                ${state.company.website ? `<span>• ${state.company.website.replace('https://', '')}</span>` : ''}
              </div>
              ${state.company.ntn ? `<p class="font-mono text-[11px] font-semibold text-slate-700 pt-0.5">NTN: ${state.company.ntn} | STRN: ${state.company.strn || 'N/A'}</p>` : ''}
            </div>
          </div>

          <div class="sm:text-right flex flex-col items-start sm:items-end justify-between self-stretch">
            <div>
              <div class="flex items-center gap-2 sm:justify-end mb-1">
                <span class="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${state.status === 'PAID' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}">
                  ${state.status}
                </span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black tracking-tight" style="color: ${primary}">${state.type}</h2>
              <p class="text-sm font-mono font-bold text-slate-700 mt-1">#${state.receiptNumber}</p>
              <div class="mt-2.5 space-y-0.5 text-xs text-slate-600">
                <p><span class="font-semibold text-slate-500">Date Issued:</span> ${state.issueDate}</p>
                ${state.dueDate ? `<p><span class="font-semibold text-slate-500">Due Date:</span> ${state.dueDate}</p>` : ''}
              </div>
            </div>

            ${state.signature.showStamp && state.status !== 'NONE' ? `
              <div class="mt-2 hidden sm:block">
                ${renderStatusStampHtml(state.status, state.company.name, state.issueDate, primary)}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Customer & Payment 2 Rounded Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50/90 rounded-xl border border-slate-200/90">
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">BILLED TO / CUSTOMER</span>
            <h3 class="text-sm font-bold text-slate-900">${state.client.name || 'Valued Customer'}</h3>
            ${state.client.company ? `<p class="text-xs font-semibold text-slate-700">${state.client.company}</p>` : ''}
            <div class="text-xs text-slate-500 mt-1 space-y-0.5">
              ${state.client.address ? `<p>${state.client.address}</p>` : ''}
              ${state.client.cityStateZip ? `<p>${state.client.cityStateZip}</p>` : ''}
              ${state.client.phone ? `<p class="text-slate-600 font-medium">Tel: ${state.client.phone}</p>` : ''}
              ${state.client.taxId ? `<p class="font-mono text-[11px] pt-0.5 text-slate-700 font-semibold">NTN / CNIC: ${state.client.taxId}</p>` : ''}
            </div>
          </div>

          <div class="p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">PAYMENT & SETTLEMENT DETAILS</span>
              <div class="text-xs text-slate-700 space-y-1">
                <p><span class="font-semibold text-slate-500">Method:</span> <span class="font-bold text-slate-900">${state.payment.method}</span></p>
                ${state.payment.bankName ? `<p><span class="font-semibold text-slate-500">Bank:</span> ${state.payment.bankName}</p>` : ''}
                ${state.payment.accountName ? `<p><span class="font-semibold text-slate-500">Account Title:</span> ${state.payment.accountName}</p>` : ''}
                ${state.payment.accountNumber ? `<p class="font-mono text-slate-800 font-bold"><span class="font-sans font-semibold text-slate-500">IBAN / A/C:</span> ${state.payment.accountNumber}</p>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Items Table with Colored Underline Header -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 text-xs font-bold uppercase tracking-wider text-slate-700" style="border-color: ${primary}">
                <th class="py-2.5 px-2">#</th>
                <th class="py-2.5 px-2">Description & Specifications</th>
                <th class="py-2.5 px-2 text-center w-16">Qty</th>
                <th class="py-2.5 px-2 text-right w-28">Unit Rate</th>
                <th class="py-2.5 px-2 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              ${state.items.map((item, idx) => `
                <tr class="hover:bg-slate-50/50 transition">
                  <td class="py-3 px-2 text-slate-400 font-mono align-top text-[11px]">${idx + 1}</td>
                  <td class="py-3 px-2 align-top">
                    <p class="font-bold text-slate-900 text-sm">${item.description || 'Service or Item'}</p>
                    ${item.details ? `<p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed italic">${item.details}</p>` : ''}
                  </td>
                  <td class="py-3 px-2 text-center font-mono font-semibold text-slate-700 align-top">${item.quantity}</td>
                  <td class="py-3 px-2 text-right font-mono text-slate-700 align-top">${formatMoney(item.unitPrice, '')}</td>
                  <td class="py-3 px-2 text-right font-mono font-bold text-slate-900 align-top">${formatMoney(item.quantity * item.unitPrice, state.currency.symbol)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals Calculation & QR Section -->
        <div class="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div class="flex-1 space-y-3 max-w-sm">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">TOTAL IN WORDS</span>
              <p class="text-xs font-semibold text-slate-800 italic leading-snug">${inWords}</p>
            </div>

            ${state.payment.showQrCode ? `
              <div class="pt-1 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <div id="live-qrcode-modern" class="p-1 bg-white border border-slate-300 rounded"></div>
                <div class="text-[10px] text-slate-500">
                  <p class="font-bold text-slate-700">Official Document QR</p>
                  <p>Scan with any mobile camera for instant verification or electronic payment.</p>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="w-full sm:w-72 space-y-2 text-xs">
            <div class="flex justify-between text-slate-600"><span>Subtotal:</span><span class="font-mono font-medium">${formatMoney(totals.subtotal)}</span></div>
            ${totals.discountAmount > 0 ? `
              <div class="flex justify-between text-rose-600 font-medium"><span>Discount (${state.discountValue}${state.discountType === 'percent' ? '%' : ''}):</span><span class="font-mono">-${formatMoney(totals.discountAmount)}</span></div>
            ` : ''}
            <div class="flex justify-between text-slate-600"><span>Taxable Value:</span><span class="font-mono">${formatMoney(totals.taxableAmount)}</span></div>
            ${totals.taxAmount > 0 ? `
              <div class="flex justify-between text-slate-700"><span>${state.taxLabel || 'Tax / GST'} (${state.taxRate}%):</span><span class="font-mono">+${formatMoney(totals.taxAmount)}</span></div>
            ` : ''}
            ${totals.shipping > 0 ? `
              <div class="flex justify-between text-slate-600"><span>Shipping / Fee:</span><span class="font-mono">+${formatMoney(totals.shipping)}</span></div>
            ` : ''}

            <div class="flex justify-between text-sm sm:text-base font-black border-t-2 border-b-2 py-2 text-slate-900" style="border-color: ${primary}">
              <span>Total Amount:</span><span class="font-mono" style="color: ${primary}">${formatMoney(totals.grandTotal)}</span>
            </div>

            <div class="flex justify-between text-slate-700 pt-0.5 text-xs"><span>Amount Paid:</span><span class="font-mono font-bold">${formatMoney(totals.paidAmount)}</span></div>
            ${totals.balanceDue > 0 ? `
              <div class="flex justify-between text-rose-600 font-bold text-xs"><span>Balance Due:</span><span class="font-mono">${formatMoney(totals.balanceDue)}</span></div>
            ` : `
              <div class="flex justify-between text-slate-600 text-xs"><span>Change Returned:</span><span class="font-mono">${formatMoney(totals.changeReturned)}</span></div>
            `}
          </div>
        </div>

        <!-- Terms and Conditions & Notes -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
          <div class="space-y-1">
            <h4 class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Terms & Conditions</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">${state.terms || 'Payment is due according to agreed service terms.'}</p>
          </div>
          <div class="space-y-1">
            ${state.notes ? `
              <h4 class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Notes & Remarks</h4>
              <p class="text-[11px] text-slate-600 leading-relaxed">${state.notes}</p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Signatures & Footer Section -->
      <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6">
        <div class="text-[10px] text-slate-400">
          <p class="font-semibold text-slate-500">OrionFx SaaS Suite • Automated Billing & Receipts</p>
          <p>Generated securely on client-side • orionfx.net</p>
        </div>

        <div class="text-center sm:text-right min-w-[200px]">
          ${state.signature.signatureType === 'drawn' && state.signature.signatureData ? `
            <img src="${state.signature.signatureData}" class="h-14 inline-block object-contain mb-1" alt="Signature" />
          ` : `
            <p class="font-signature text-3xl text-slate-800 my-1">${state.signature.signerName || 'Authorized Signatory'}</p>
          `}
          <div class="w-44 border-t border-slate-300 mt-1 mb-1 ml-auto"></div>
          <p class="text-xs font-bold text-slate-900">${state.signature.signerName || 'Authorized Signatory'}</p>
          <p class="text-[10px] text-slate-500">${state.signature.signerTitle || 'Executive Officer'}</p>
          <p class="text-[9px] text-slate-400 font-mono mt-0.5">Signed: ${state.issueDate}</p>
        </div>
      </div>
    </div>
    `;
  }

  // Render QR Code dynamically after HTML is injected
  function updateQrCodes() {
    const fbrPayload = state.payment.qrPayload || `https://e.fbr.gov.pk/pos/verify?fbrInvoiceNo=${state.fbrInvoiceNumber || '1002342609120842'}`;
    ['live-qrcode-thermal', 'live-qrcode-modern', 'live-qrcode-corporate'].forEach(id => {
      const el = document.getElementById(id);
      if (el && window.QRCode) {
        el.innerHTML = '';
        new window.QRCode(el, {
          text: fbrPayload,
          width: id === 'live-qrcode-thermal' ? 78 : 64,
          height: id === 'live-qrcode-thermal' ? 78 : 64,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
      }
    });
  }

  // --- Main Editor UI Builder ---
  function renderEditorHtml() {
    const tmpl = state.styling.template || 'thermal';
    const primary = state.styling.primaryColor || '#059669';

    return `
    <div class="space-y-4">
      <!-- Section 1: Template, Theme Color & Invoice Meta -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button type="button" onclick="toggleAccordion('template')" class="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-sm">Template Design & Color Palette</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${activeAccordion === 'template' ? '▲ Hide' : '▼ Expand'}</span>
        </button>
        ${activeAccordion === 'template' ? `
          <div class="p-5 border-t border-slate-100 space-y-4">
            <!-- 5 Premium Templates Grid -->
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Design Template</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button type="button" onclick="setTemplate('thermal')" class="p-3 rounded-xl border text-left transition ${tmpl === 'thermal' ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}">
                  <div class="text-xs font-black">🧾 Thermal 80mm</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Pakistan FBR Tier-1 POS</div>
                </button>
                <button type="button" onclick="setTemplate('modern')" class="p-3 rounded-xl border text-left transition ${tmpl === 'modern' ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}">
                  <div class="text-xs font-black">💎 Modern Clean</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">SaaS & Tech Invoicing</div>
                </button>
                <button type="button" onclick="setTemplate('corporate')" class="p-3 rounded-xl border text-left transition ${tmpl === 'corporate' ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}">
                  <div class="text-xs font-black">🏛️ Corporate Banner</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Full-Width Executive</div>
                </button>
                <button type="button" onclick="setTemplate('classic')" class="p-3 rounded-xl border text-left transition ${tmpl === 'classic' ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}">
                  <div class="text-xs font-black">📜 Classic Serif</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Playfair Editorial Style</div>
                </button>
                <button type="button" onclick="setTemplate('minimal')" class="p-3 rounded-xl border text-left transition ${tmpl === 'minimal' ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}">
                  <div class="text-xs font-black">📐 Minimalist Studio</div>
                  <div class="text-[10px] text-slate-500 mt-0.5">Swiss Architectural</div>
                </button>
              </div>
            </div>

            <!-- Primary Theme Color Palette Picker -->
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Accent Theme Color</label>
              <div class="flex flex-wrap items-center gap-2">
                ${[
                  { name: 'Emerald', hex: '#059669' },
                  { name: 'Sapphire', hex: '#2563eb' },
                  { name: 'Navy', hex: '#0f172a' },
                  { name: 'Purple', hex: '#7c3aed' },
                  { name: 'Crimson', hex: '#dc2626' },
                  { name: 'Amber', hex: '#d97706' },
                  { name: 'Teal', hex: '#0d9488' }
                ].map(c => `
                  <button type="button" onclick="setPrimaryColor('${c.hex}')" title="${c.name}" class="w-7 h-7 rounded-full transition transform hover:scale-110 flex items-center justify-center ${primary === c.hex ? 'ring-2 ring-offset-2 ring-slate-800' : ''}" style="background: ${c.hex}">
                    ${primary === c.hex ? '<span class="text-white text-[10px] font-bold">✓</span>' : ''}
                  </button>
                `).join('')}
                <div class="flex items-center gap-1 ml-2">
                  <span class="text-[11px] text-slate-500">Custom:</span>
                  <input type="color" value="${primary}" onchange="setPrimaryColor(this.value)" class="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer" />
                </div>
              </div>
            </div>

            <!-- Receipt Numbers & Pakistan FBR POS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-[11px] font-bold text-slate-700">Receipt / Invoice #</label>
                  <button type="button" onclick="generateReceiptNumber()" class="text-[10px] text-emerald-600 font-semibold hover:underline">⚡ Auto ID</button>
                </div>
                <input type="text" value="${state.receiptNumber}" oninput="state.receiptNumber=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold" />
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-[11px] font-bold text-slate-700">FBR POS Invoice #</label>
                  <button type="button" onclick="generateFbrInvoiceNumber()" class="text-[10px] text-emerald-600 font-semibold hover:underline">⚡ Auto FBR</button>
                </div>
                <input type="text" value="${state.fbrInvoiceNumber || ''}" oninput="state.fbrInvoiceNumber=this.value;saveToStorage();renderPreview();" placeholder="1002342609120842" class="w-full px-3 py-1.5 text-xs border border-emerald-300 bg-emerald-50/50 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Cashier / Counter</label>
                <input type="text" value="${state.cashierName || ''}" oninput="state.cashierName=this.value;saveToStorage();renderPreview();" placeholder="Counter 01 / Ali" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-[11px] font-bold text-slate-700">Receipt Time</label>
                  <button type="button" onclick="setCurrentReceiptTime()" class="text-[10px] text-emerald-600 font-semibold hover:underline">Set Current</button>
                </div>
                <input type="text" value="${state.receiptTime || ''}" oninput="state.receiptTime=this.value;saveToStorage();renderPreview();" placeholder="14:35:10" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Status Badge</label>
                <select onchange="state.status=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold">
                  <option value="PAID" ${state.status === 'PAID' ? 'selected' : ''}>PAID</option>
                  <option value="DUE" ${state.status === 'DUE' ? 'selected' : ''}>DUE</option>
                  <option value="PENDING" ${state.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                  <option value="REFUNDED" ${state.status === 'REFUNDED' ? 'selected' : ''}>REFUNDED</option>
                  <option value="DRAFT" ${state.status === 'DRAFT' ? 'selected' : ''}>DRAFT</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Currency</label>
                <select onchange="const val=this.value;if(val==='PKR'){state.currency={code:'PKR',symbol:'Rs. ',name:'Pak Rupees'}}else if(val==='USD'){state.currency={code:'USD',symbol:'$',name:'US Dollars'}}else if(val==='EUR'){state.currency={code:'EUR',symbol:'€',name:'Euros'}}else if(val==='AED'){state.currency={code:'AED',symbol:'AED ',name:'UAE Dirhams'}}else{state.currency={code:'INR',symbol:'₹',name:'Rupees'}};saveToStorage();render();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold">
                  <option value="PKR" ${state.currency.code === 'PKR' ? 'selected' : ''}>Pak Rs. (PKR)</option>
                  <option value="USD" ${state.currency.code === 'USD' ? 'selected' : ''}>US Dollar ($)</option>
                  <option value="EUR" ${state.currency.code === 'EUR' ? 'selected' : ''}>Euro (€)</option>
                  <option value="AED" ${state.currency.code === 'AED' ? 'selected' : ''}>UAE Dirham (AED)</option>
                  <option value="INR" ${state.currency.code === 'INR' ? 'selected' : ''}>Indian Rupee (₹)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Issue Date</label>
                <input type="date" value="${state.issueDate}" onchange="state.issueDate=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Due Date</label>
                <input type="date" value="${state.dueDate}" onchange="state.dueDate=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
            </div>

            <!-- Toggles for Official Stamp & QR Code -->
            <div class="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-700 font-semibold">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" ${state.signature.showStamp ? 'checked' : ''} onchange="state.signature.showStamp=this.checked;saveToStorage();renderPreview();" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Show Official Stamp (PAID / DUE)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" ${state.payment.showQrCode ? 'checked' : ''} onchange="state.payment.showQrCode=this.checked;saveToStorage();renderPreview();" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Show Scannable QR Code</span>
              </label>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Section 2: Company & Adjustable Logo -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button type="button" onclick="toggleAccordion('company')" class="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span class="text-sm">Company Branding & Adjustable Logo</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${activeAccordion === 'company' ? '▲ Hide' : '▼ Expand'}</span>
        </button>
        ${activeAccordion === 'company' ? `
          <div class="p-5 border-t border-slate-100 space-y-4">
            <!-- Logo Customizer -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏢</span> Company Logo
                </span>
                ${state.company.logoUrl ? `
                  <button type="button" onclick="removeLogo()" class="text-[11px] text-rose-600 font-bold hover:underline">Remove Logo</button>
                ` : ''}
              </div>

              <!-- Left & Right side: Choose File on Left, Placement / Alignment on Right -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <!-- Left Side: Company Logo (Choose File) -->
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-bold text-slate-700">Choose Logo File</label>
                  <div class="flex gap-2.5 items-center">
                    ${state.company.logoUrl ? `
                      <div class="w-14 h-12 bg-white p-1 border border-slate-300 rounded-lg shadow-2xs flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src="${state.company.logoUrl}" alt="Logo preview" class="max-w-full max-h-full object-contain ${state.company.logoRadius || 'rounded'}" />
                      </div>
                    ` : ''}
                    <div class="flex-1 min-w-0">
                      <input type="file" accept="image/*" onchange="handleLogoUpload(event)" class="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer" />
                    </div>
                  </div>
                  <p class="text-[10px] text-slate-400">Upload PNG, JPG, or SVG image logo</p>
                </div>

                <!-- Right Side: Logo Placement / Alignment -->
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-bold text-slate-700">Logo Placement / Alignment</label>
                  <div class="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                    <button type="button" onclick="setLogoAlignment('left')" class="px-3.5 py-1 text-xs font-semibold rounded-md transition ${(state.company.logoPosition || state.company.logoAlignment || 'left') === 'left' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                      Left
                    </button>
                    <button type="button" onclick="setLogoAlignment('center')" class="px-3.5 py-1 text-xs font-semibold rounded-md transition ${(state.company.logoPosition || state.company.logoAlignment || 'left') === 'center' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                      Center
                    </button>
                    <button type="button" onclick="setLogoAlignment('right')" class="px-3.5 py-1 text-xs font-semibold rounded-md transition ${(state.company.logoPosition || state.company.logoAlignment || 'left') === 'right' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
                      Right
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400">Position logo on receipt header</p>
                </div>
              </div>

              <!-- Logo Size: Increase / Reduced Option + Slider -->
              <div class="pt-3 border-t border-slate-200 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <label class="text-[11px] font-bold text-slate-700">Logo Size (Width)</label>
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="adjustLogoSize(-10)" class="w-7 h-6 bg-white hover:bg-slate-100 border border-slate-300 rounded font-bold text-xs text-slate-700 flex items-center justify-center transition shadow-2xs" title="Reduce Logo Size">−</button>
                    <span id="logo-size-badge" class="font-mono font-bold text-slate-900 w-14 text-center text-xs">${state.company.logoWidth || 100}px</span>
                    <button type="button" onclick="adjustLogoSize(10)" class="w-7 h-6 bg-white hover:bg-slate-100 border border-slate-300 rounded font-bold text-xs text-slate-700 flex items-center justify-center transition shadow-2xs" title="Increase Logo Size">+</button>
                  </div>
                </div>
                <input type="range" min="40" max="250" step="5" value="${state.company.logoWidth || 100}" oninput="state.company.logoWidth=Number(this.value);saveToStorage();renderPreview();const b=document.getElementById('logo-size-badge');if(b)b.textContent=this.value+'px';" class="w-full accent-slate-800 cursor-pointer" />
                <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>40px (Small)</span>
                  <span>100px (Default)</span>
                  <span>250px (Large)</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Company Name</label>
                <input type="text" value="${state.company.name}" oninput="state.company.name=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Tagline / Slogan</label>
                <input type="text" value="${state.company.tagline || ''}" oninput="state.company.tagline=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">NTN (National Tax #)</label>
                <input type="text" value="${state.company.ntn || ''}" oninput="state.company.ntn=this.value;saveToStorage();renderPreview();" placeholder="7412985-3" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">STRN (Sales Tax #)</label>
                <input type="text" value="${state.company.strn || ''}" oninput="state.company.strn=this.value;saveToStorage();renderPreview();" placeholder="17-00-7412-985-19" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">POS Terminal ID</label>
                <input type="text" value="${state.company.posTerminalId || ''}" oninput="state.company.posTerminalId=this.value;saveToStorage();renderPreview();" placeholder="POS-01" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                <input type="text" value="${state.company.address}" oninput="state.company.address=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">City, State / Zip & Phone</label>
                <input type="text" value="${state.company.cityStateZip} • ${state.company.phone}" oninput="const p=this.value.split('•');state.company.cityStateZip=p[0]?p[0].trim():'';state.company.phone=p[1]?p[1].trim():'';saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Section 3: Client Details -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button type="button" onclick="toggleAccordion('client')" class="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-purple-500"></span>
            <span class="text-sm">Customer / Client Information</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${activeAccordion === 'client' ? '▲ Hide' : '▼ Expand'}</span>
        </button>
        ${activeAccordion === 'client' ? `
          <div class="p-5 border-t border-slate-100 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Customer / Company Name</label>
                <input type="text" value="${state.client.name}" oninput="state.client.name=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Customer Phone / Mobile</label>
                <input type="text" value="${state.client.phone}" oninput="state.client.phone=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Customer NTN / CNIC #</label>
                <input type="text" value="${state.client.taxId || ''}" oninput="state.client.taxId=this.value;saveToStorage();renderPreview();" placeholder="42101-1234567-1" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Customer Address / City</label>
                <input type="text" value="${state.client.address || ''}" oninput="state.client.address=this.value;saveToStorage();renderPreview();" placeholder="DHA, Karachi" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Section 4: Line Items & Amounts -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button type="button" onclick="toggleAccordion('items')" class="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span class="text-sm">Items & Totals (${state.items.length})</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${activeAccordion === 'items' ? '▲ Hide' : '▼ Expand'}</span>
        </button>
        ${activeAccordion === 'items' ? `
          <div class="p-5 border-t border-slate-100 space-y-4">
            <!-- Preset Quick Buttons -->
            <div class="flex flex-wrap gap-2 text-[11px]">
              <span class="text-slate-500 self-center">Quick Insert:</span>
              <button type="button" onclick="loadItemPreset('saas')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium">+ SaaS License</button>
              <button type="button" onclick="loadItemPreset('grocery')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium">+ Grocery Pack</button>
              <button type="button" onclick="loadItemPreset('hardware')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium">+ POS Hardware</button>
            </div>

            <!-- Items List -->
            <div class="space-y-3">
              ${state.items.map((it, idx) => `
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-[11px] font-bold text-slate-600">Item #${idx + 1}</span>
                    <button type="button" onclick="removeItem(${idx})" class="text-[10px] text-rose-600 font-bold hover:underline">Remove</button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div class="sm:col-span-2">
                      <input type="text" placeholder="Item description" value="${it.description}" oninput="state.items[${idx}].description=this.value;saveToStorage();renderPreview();" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-bold" />
                    </div>
                    <div>
                      <input type="text" placeholder="Details / SKU" value="${it.details || ''}" oninput="state.items[${idx}].details=this.value;saveToStorage();renderPreview();" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600" />
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="block text-[10px] text-slate-500 font-bold">Qty</label>
                      <input type="number" min="1" value="${it.quantity}" oninput="state.items[${idx}].quantity=Number(this.value);saveToStorage();renderPreview();" class="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold" />
                    </div>
                    <div>
                      <label class="block text-[10px] text-slate-500 font-bold">Rate</label>
                      <input type="number" min="0" step="any" value="${it.unitPrice}" oninput="state.items[${idx}].unitPrice=Number(this.value);saveToStorage();renderPreview();" class="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-right font-mono" />
                    </div>
                    <div>
                      <label class="block text-[10px] text-slate-500 font-bold">Total</label>
                      <div class="px-2.5 py-1 text-xs font-mono font-bold text-right text-slate-800 bg-white border border-slate-200 rounded-lg">
                        ${formatMoney(it.quantity * it.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <button type="button" onclick="addItem()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
              + Add Another Line Item
            </button>

            <!-- Tax, Discount & Paid -->
            <div class="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Discount</label>
                <div class="flex gap-1">
                  <input type="number" min="0" value="${state.discountValue}" oninput="state.discountValue=Number(this.value);saveToStorage();renderPreview();" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono" />
                  <select onchange="state.discountType=this.value;saveToStorage();renderPreview();" class="text-xs border border-slate-300 rounded-lg px-2 font-bold">
                    <option value="fixed" ${state.discountType === 'fixed' ? 'selected' : ''}>Fixed</option>
                    <option value="percent" ${state.discountType === 'percent' ? 'selected' : ''}>%</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Sales Tax / GST Rate (%)</label>
                <input type="number" min="0" max="100" value="${state.taxRate}" oninput="state.taxRate=Number(this.value);saveToStorage();renderPreview();" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Paid / Tendered</label>
                <input type="number" min="0" value="${state.paidAmount}" oninput="state.paidAmount=Number(this.value);saveToStorage();renderPreview();" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold text-emerald-800" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Section 5: Payment & Bank -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button type="button" onclick="toggleAccordion('payment')" class="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-teal-500"></span>
            <span class="text-sm">Payment Method & Bank Details</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${activeAccordion === 'payment' ? '▲ Hide' : '▼ Expand'}</span>
        </button>
        ${activeAccordion === 'payment' ? `
          <div class="p-5 border-t border-slate-100 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
                <select onchange="state.payment.method=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold">
                  <option value="Cash" ${state.payment.method === 'Cash' ? 'selected' : ''}>Cash</option>
                  <option value="Bank Transfer" ${state.payment.method === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer / IBFT</option>
                  <option value="EasyPaisa / JazzCash" ${state.payment.method.includes('EasyPaisa') ? 'selected' : ''}>EasyPaisa / JazzCash</option>
                  <option value="Raast Instant Pay" ${state.payment.method.includes('Raast') ? 'selected' : ''}>Raast Instant Pay</option>
                  <option value="Credit / Debit Card" ${state.payment.method.includes('Card') ? 'selected' : ''}>Credit / Debit Card</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Bank Name</label>
                <input type="text" value="${state.payment.bankName}" oninput="state.payment.bankName=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Account Title</label>
                <input type="text" value="${state.payment.accountName}" oninput="state.payment.accountName=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Account # / IBAN</label>
                <input type="text" value="${state.payment.accountNumber}" oninput="state.payment.accountNumber=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Section 6: Terms & Signature -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button type="button" onclick="toggleAccordion('terms')" class="w-full px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span class="text-sm">Terms, Notes & Signature</span>
          </div>
          <span class="text-xs text-slate-400 font-mono">${activeAccordion === 'terms' ? '▲ Hide' : '▼ Expand'}</span>
        </button>
        ${activeAccordion === 'terms' ? `
          <div class="p-5 border-t border-slate-100 space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">Terms & Conditions</label>
              <textarea rows="2" oninput="state.terms=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg">${state.terms}</textarea>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">Customer Note</label>
              <input type="text" value="${state.notes}" oninput="state.notes=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Signer Name & Title</label>
                <input type="text" value="${state.signature.signerName}" oninput="state.signature.signerName=this.value;saveToStorage();renderPreview();" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-bold" />
              </div>
              <div class="flex items-end">
                <button type="button" onclick="openSignaturePad()" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition">
                  ✍️ Open Signature Drawing Pad
                </button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
    `;
  }

  // Fast preview-only updater
  function renderPreview() {
    const previewContainer = document.getElementById('receipt-preview-content');
    if (previewContainer) {
      previewContainer.innerHTML = renderDocumentHtml();
      updateQrCodes();
    }
  }

  // Full app re-render
  function render() {
    const root = document.getElementById('root');
    if (!root) return;

    const totals = calculateTotals();

    root.innerHTML = `
    <div class="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <!-- Top OrionFx SaaS Navbar -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
              OFX
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-sm font-extrabold text-slate-900 tracking-tight">OrionFx Receipt SaaS</h1>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Zero-NPM • GitHub & Web Ready
                </span>
              </div>
              <p class="text-[11px] text-slate-500">Standalone Client-Side POS & Invoicing Platform</p>
            </div>
          </div>

          <!-- Top Quick Actions -->
          <div class="flex items-center gap-2">
            <!-- Mobile Tab Toggle -->
            <div class="flex md:hidden bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button onclick="setActiveTab('edit')" class="px-3 py-1 text-xs font-bold rounded-md ${activeTab === 'edit' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}">Edit</button>
              <button onclick="setActiveTab('preview')" class="px-3 py-1 text-xs font-bold rounded-md ${activeTab === 'preview' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}">Preview</button>
            </div>

            <button onclick="loadSampleData()" class="hidden sm:inline-flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition">
              Sample Data
            </button>
            <button onclick="clearForm()" class="hidden sm:inline-flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition">
              Clear
            </button>

            <button onclick="printReceipt()" class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <span>🖨️</span> Print
            </button>
            <button onclick="downloadPdf()" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <span>📄</span> PDF
            </button>
            <button onclick="downloadJpg()" class="hidden sm:inline-flex px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition">
              JPG
            </button>
          </div>
        </div>
      </header>

      <!-- Main Dual Split Workspace -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Form Controls (Hidden on mobile if preview tab active) -->
        <div class="lg:col-span-6 space-y-4 ${activeTab === 'preview' ? 'hidden md:block' : ''} no-print">
          <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
            <span class="text-emerald-900 font-bold">✨ Pakistan FBR POS & Standard Invoicing Enabled</span>
            <span class="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded">All Offline & Client-Side</span>
          </div>
          ${renderEditorHtml()}
        </div>

        <!-- Right: Live Interactive Preview -->
        <div class="lg:col-span-6 space-y-4 ${activeTab === 'edit' ? 'hidden md:block' : ''}">
          <!-- Zoom & Quick Bar -->
          <div class="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-700">Live Preview:</span>
              <span class="text-slate-500 font-mono text-[11px]">${state.styling.template.toUpperCase()}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="setZoom(-0.1)" class="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 font-bold text-xs flex items-center justify-center">-</button>
              <span id="zoom-percentage" class="text-xs font-mono font-bold w-12 text-center">${Math.round(zoomLevel * 100)}%</span>
              <button onclick="setZoom(0.1)" class="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 font-bold text-xs flex items-center justify-center">+</button>
              <button onclick="resetZoom()" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-600">Reset</button>
            </div>
          </div>

          <!-- Document Canvas Wrapper -->
          <div id="receipt-document-container" class="overflow-x-auto pb-8 flex justify-center">
            <div id="receipt-zoom-wrapper" class="w-full flex justify-center transition-transform">
              <div id="receipt-preview-content" class="w-full">
                ${renderDocumentHtml()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Signature Pad Modal -->
      <div id="signature-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900">Draw Handwritten Signature</h3>
            <button onclick="closeSignaturePad()" class="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
          </div>
          <p class="text-xs text-slate-500">Sign with your mouse or touch on mobile screen inside the box below:</p>
          <div class="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 flex justify-center">
            <canvas id="signature-pad-canvas" width="380" height="160" class="cursor-crosshair"></canvas>
          </div>
          <div class="flex justify-between items-center pt-2">
            <button onclick="clearSignaturePad()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">Clear Canvas</button>
            <div class="flex gap-2">
              <button onclick="closeSignaturePad()" class="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold">Cancel</button>
              <button onclick="saveSignaturePad()" class="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs">Apply Signature</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    updateQrCodes();
  }

  // Kickstart Application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

})();
