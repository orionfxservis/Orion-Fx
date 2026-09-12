import { ReceiptData } from '../types';

declare global {
  interface Window {
    html2canvas?: any;
    jspdf?: any;
    QRCode?: any;
  }
}

/**
 * Downloads a canvas or dataUrl as a file
 */
function downloadFile(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export receipt element as high-resolution JPG image using HTML5 Canvas & CDN html2canvas
 */
export async function exportReceiptAsJpg(fileName: string = 'receipt'): Promise<boolean> {
  const target = document.getElementById('receipt-printable-area');
  if (!target) {
    console.error('Target receipt element not found');
    return false;
  }

  // Ensure html2canvas CDN is ready
  if (!window.html2canvas) {
    alert('Canvas rendering library is still loading. Please try again in a moment.');
    return false;
  }

  try {
    const canvas = await window.html2canvas(target, {
      scale: 2, // High resolution for crisp printing & display
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    downloadFile(imgData, `${fileName.replace(/[^a-zA-Z0-9-_]/g, '_')}.jpg`);
    return true;
  } catch (err) {
    console.error('Error generating JPG:', err);
    // Fallback: draw directly with vanilla canvas
    try {
      fallbackCanvasExport(target, fileName);
      return true;
    } catch (fallbackErr) {
      alert('Failed to generate image. You can use the Print option to save as PDF or image.');
      return false;
    }
  }
}

/**
 * Export receipt element as PDF using client-side CDN jsPDF + html2canvas
 */
export async function exportReceiptAsPdf(fileName: string = 'receipt', isThermal: boolean = false): Promise<boolean> {
  const target = document.getElementById('receipt-printable-area');
  if (!target) {
    console.error('Target receipt element not found');
    return false;
  }

  if (!window.html2canvas || !window.jspdf) {
    // Fallback to native browser print-to-PDF
    window.print();
    return true;
  }

  try {
    const canvas = await window.html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: isThermal ? 400 : 1200,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;

    if (isThermal) {
      // 80mm roll width
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight + 10]
      });
      pdf.addImage(imgData, 'JPEG', 0, 5, pdfWidth, pdfHeight);
      pdf.save(`${fileName.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`);
    } else {
      // Standard A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 20; // 10mm margins on both sides
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - 20) {
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      } else {
        // Multi-page slicing if receipt is extra long
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pageHeight - 20);
        }
      }

      pdf.save(`${fileName.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`);
    }
    return true;
  } catch (err) {
    console.error('Error generating PDF with jsPDF:', err);
    // Instant fallback to CSS print
    window.print();
    return true;
  }
}

/**
 * Trigger native print dialog with clean @media print layout
 */
export function triggerPrint() {
  window.print();
}

/**
 * Fallback direct SVG foreignObject canvas renderer if html2canvas is blocked
 */
function fallbackCanvasExport(element: HTMLElement, fileName: string) {
  const canvas = document.createElement('canvas');
  const rect = element.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  ctx.scale(2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);

  const data = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${element.innerHTML}
        </div>
      </foreignObject>
    </svg>
  `;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    downloadFile(canvas.toDataURL('image/jpeg', 0.95), `${fileName}.jpg`);
  };
}

/**
 * Generates a self-contained, standalone single HTML file
 * featuring Vanilla JavaScript and CDN libraries that the user can directly
 * upload to their OrionFx.net static website without needing npm or any build tools!
 */
export function generateStandaloneHtml(data: ReceiptData): string {
  const isThermal = data.styling.template === 'thermal';
  const fbrInvoiceNumber = data.fbrInvoiceNumber || '1002342609120842';
  const cashierName = data.cashierName || 'Counter 01 / Cashier';
  const receiptTime = data.receiptTime || '14:35:10';
  const ntnNumber = data.company.ntn || data.company.taxId || '7412985-3';
  const strnNumber = data.company.strn || '17-00-7412-985-19';
  const posTerminal = data.company.posTerminalId || 'POS-01';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.receiptNumber} - OrionFx Receipt Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    @media print {
      body { background: white !important; padding: 0 !important; }
      .no-print { display: none !important; }
      #receipt-paper { box-shadow: none !important; border: none !important; margin: 0 auto !important; width: 100% !important; }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen ${isThermal ? 'font-mono' : "font-['Plus_Jakarta_Sans',sans-serif]"} p-4 md:p-8">
  <div class="max-w-4xl mx-auto mb-6 no-print flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
    <div>
      <h1 class="text-lg font-bold text-slate-900">OrionFx SaaS Applications</h1>
      <p class="text-xs text-slate-500">${isThermal ? 'Pakistan Standard POS & FBR Receipt' : 'Standalone Client-Side Receipt & Invoice Generator'}</p>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition">Print Document</button>
      <button onclick="exportToPdf()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition">Download PDF</button>
      <button onclick="exportToJpg()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-500 transition">Download JPG</button>
    </div>
  </div>

  ${isThermal ? `
  <!-- Thermal 80mm POS Receipt (Pakistan Standards) -->
  <div id="receipt-paper" class="max-w-[380px] mx-auto bg-white p-6 shadow-2xl border border-slate-300 font-mono text-xs text-slate-900">
    <div class="text-center pb-2.5 space-y-1">
      ${data.company.logoUrl ? `<div class="flex justify-center mb-2"><img src="${data.company.logoUrl}" style="max-width: 120px;" alt="Logo"/></div>` : ''}
      <h2 class="text-lg font-black tracking-wider uppercase">${data.company.name || 'COMPANY NAME'}</h2>
      ${data.company.tagline ? `<p class="text-[11px] font-semibold text-slate-700">${data.company.tagline}</p>` : ''}
      <p class="text-[10px] text-slate-600">${data.company.address || ''}</p>
      <p class="text-[10px] text-slate-600">${data.company.cityStateZip || ''} ${data.company.country || ''}</p>
      ${data.company.phone ? `<p class="text-[10px] font-bold text-slate-800">UAN / Tel: ${data.company.phone}</p>` : ''}
      
      <div class="pt-1 text-[10px] font-bold text-slate-800 space-y-0.5 border-t border-dotted border-slate-400 mt-1.5">
        <div class="flex justify-between"><span>NTN :</span><span class="tracking-wider">${ntnNumber}</span></div>
        <div class="flex justify-between"><span>STRN :</span><span class="tracking-wider">${strnNumber}</span></div>
        <div class="flex justify-between"><span>POS REG # :</span><span class="tracking-wider">${posTerminal}</span></div>
      </div>
    </div>

    <div class="border-t-2 border-dashed border-slate-700 my-2"></div>

    <div class="text-center pb-1">
      <p class="text-xs font-black uppercase tracking-wider">${data.type === 'TAX INVOICE' ? 'SALES TAX INVOICE (CASH)' : data.type}</p>
      <p class="text-[10px] font-semibold text-slate-600 tracking-widest">*** CUSTOMER COPY ***</p>
    </div>

    <div class="text-[10px] space-y-1 py-1 border-t border-dotted border-slate-300 font-medium">
      <div class="flex justify-between"><span class="text-slate-600">INVOICE NO:</span><span class="font-bold">${data.receiptNumber}</span></div>
      <div class="flex justify-between"><span class="text-slate-600">FBR INV NO:</span><span class="font-bold tracking-wider">${fbrInvoiceNumber}</span></div>
      <div class="flex justify-between"><span class="text-slate-600">DATE & TIME:</span><span>${data.issueDate} ${receiptTime}</span></div>
      <div class="flex justify-between"><span class="text-slate-600">CASHIER / COUNTER:</span><span class="font-semibold">${cashierName}</span></div>
      ${data.client.name ? `
      <div class="pt-0.5 border-t border-dashed border-slate-200">
        <div class="flex justify-between"><span class="text-slate-600">CUSTOMER:</span><span class="font-bold truncate max-w-[190px]">${data.client.name}</span></div>
        ${data.client.phone ? `<div class="flex justify-between"><span class="text-slate-600">CONTACT:</span><span>${data.client.phone}</span></div>` : ''}
        ${data.client.taxId ? `<div class="flex justify-between"><span class="text-slate-600">BUYER NTN/CNIC:</span><span>${data.client.taxId}</span></div>` : ''}
      </div>` : ''}
    </div>

    <div class="border-t-2 border-slate-900 my-1.5"></div>

    <div class="py-1">
      <div class="flex justify-between font-black text-[10px] uppercase pb-1 border-b border-slate-400 mb-1.5">
        <span class="w-[18px]">#</span>
        <span class="flex-1 px-1">DESCRIPTION</span>
        <span class="w-10 text-center">QTY</span>
        <span class="w-14 text-right">RATE</span>
        <span class="w-16 text-right">AMOUNT</span>
      </div>
      <div class="space-y-2 text-[11px]">
        ${data.items.map((it, idx) => `
        <div class="leading-tight">
          <div class="flex items-start">
            <span class="w-[18px] text-[10px] text-slate-500 font-bold">${String(idx + 1).padStart(2, '0')}</span>
            <div class="flex-1 px-1 font-bold">
              ${it.description}
              ${it.details ? `<span class="block text-[9px] font-normal text-slate-500 italic mt-0.5">${it.details}</span>` : ''}
            </div>
          </div>
          <div class="flex justify-between items-center text-[10px] pl-[18px] text-slate-600 pt-0.5">
            <span class="w-10 text-center font-semibold">${it.quantity}</span>
            <span class="w-14 text-right">${(Number(it.unitPrice) || 0).toFixed(2)}</span>
            <span class="w-16 text-right font-bold text-slate-950">${data.currency.symbol}${(it.quantity * it.unitPrice).toFixed(2)}</span>
          </div>
        </div>`).join('')}
      </div>
      <div class="pt-2 mt-2 border-t border-dashed border-slate-300 flex justify-between text-[10px] font-bold text-slate-700">
        <span>TOTAL ITEMS: ${data.items.length}</span>
        <span>TOTAL UNITS: ${data.items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}</span>
      </div>
    </div>

    <div class="border-t-2 border-dashed border-slate-700 my-2"></div>

    <div class="space-y-1 text-[11px] py-1">
      <div class="flex justify-between text-slate-700"><span>GROSS AMOUNT:</span><span>${data.currency.symbol}${data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0).toFixed(2)}</span></div>
      ${data.discountValue ? `<div class="flex justify-between text-rose-700"><span>DISCOUNT:</span><span>-${data.currency.symbol}${(data.discountType === 'percent' ? (data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) * data.discountValue / 100) : data.discountValue).toFixed(2)}</span></div>` : ''}
      ${data.taxRate ? `<div class="flex justify-between text-slate-800"><span>${data.taxLabel || 'SALES TAX / GST'} (${data.taxRate}%):</span><span>+${data.currency.symbol}${(data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) * data.taxRate / 100).toFixed(2)}</span></div>` : ''}
      <div class="border-y-2 border-slate-950 py-1.5 my-1.5 flex justify-between items-baseline text-base font-black">
        <span>NET PAYABLE:</span><span>${data.currency.symbol}${data.paidAmount.toFixed(2)}</span>
      </div>
      <div class="flex justify-between text-[10px] text-slate-800"><span>TENDERED / PAID:</span><span class="font-bold">${data.currency.symbol}${data.paidAmount.toFixed(2)}</span></div>
      <div class="flex justify-between text-[10px] text-slate-700"><span>PAYMENT MODE:</span><span class="font-bold uppercase">${data.payment.method || 'CASH'}</span></div>
    </div>

    <div class="border-t-2 border-dashed border-slate-700 my-2.5"></div>

    <!-- FBR POS Integrated Box -->
    <div class="my-2 p-2.5 border-2 border-slate-800 rounded bg-slate-50 text-center space-y-1.5">
      <div class="border-b border-slate-400 pb-1">
        <span class="text-[11px] font-black tracking-wider uppercase block">FBR POS INTEGRATED INVOICE</span>
        <span class="text-[9px] font-bold text-emerald-800 uppercase tracking-wide block">TIER-1 RETAILER SYSTEM</span>
      </div>
      <div class="flex flex-col items-center justify-center py-1">
        <div id="qrcode-container" class="p-1 bg-white inline-block border border-slate-300"></div>
        <p class="text-[8px] text-slate-600 mt-1 font-bold">FBR INV ID: ${fbrInvoiceNumber}</p>
      </div>
      <div class="text-[8px] text-slate-700 leading-tight">
        <p class="font-bold">Verify this invoice via FBR "Tax Asaan" App</p>
        <p>or SMS FBR Invoice Number to <span class="font-bold">9966</span></p>
      </div>
    </div>

    <div class="pt-2 text-center text-[9px] text-slate-600 space-y-1">
      <p class="text-sm font-bold text-slate-950 py-0.5 tracking-wide">شکریہ! دوبارہ تشریف لائیں</p>
      <p class="text-[10px] font-bold uppercase tracking-wider">THANK YOU FOR SHOPPING WITH US</p>
      <div class="border-t border-dotted border-slate-300 pt-1 text-left px-1 space-y-0.5 text-[8.5px] leading-tight text-slate-500">
        <p>• Goods once sold can be exchanged within 7 days with original receipt.</p>
        <p>• Price tags and barcodes must remain intact. No cash refunds.</p>
        <p>• Altered, used, or sale/discounted items are not exchangeable.</p>
      </div>
      <div class="pt-2 text-[8px] text-slate-400">
        <span>Powered by OrionFx SaaS POS • orionfx.net</span>
      </div>
    </div>
  </div>
  ` : `
  <!-- Standard A4 / Letter Layout -->
  <div id="receipt-paper" class="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-200">
    <div class="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
      <div>
        <h2 class="text-2xl font-black text-slate-900">${data.company.name || 'Company Name'}</h2>
        <p class="text-sm text-slate-500">${data.company.tagline || ''}</p>
        <div class="text-xs text-slate-600 mt-2 space-y-0.5">
          <p>${data.company.address || ''}</p>
          <p>${data.company.cityStateZip || ''} ${data.company.country || ''}</p>
          <p>${data.company.email || ''} ${data.company.phone ? '• ' + data.company.phone : ''}</p>
          ${data.company.taxId ? `<p class="font-medium text-slate-700">Tax ID: ${data.company.taxId}</p>` : ''}
        </div>
      </div>
      <div class="text-right">
        <span class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${data.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'} mb-2">${data.status}</span>
        <h3 class="text-2xl font-black text-slate-900 tracking-tight">${data.type}</h3>
        <p class="text-sm font-mono text-slate-600 mt-1">${data.receiptNumber}</p>
        <p class="text-xs text-slate-500 mt-1">Date: ${data.issueDate}</p>
      </div>
    </div>

    <div class="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Billed To</p>
      <p class="font-bold text-slate-900">${data.client.name || 'Client Name'}</p>
      <p class="text-sm text-slate-600">${data.client.company || ''}</p>
      <p class="text-xs text-slate-500">${data.client.address || ''} ${data.client.cityStateZip || ''}</p>
      <p class="text-xs text-slate-500">${data.client.email || ''}</p>
    </div>

    <table class="w-full text-left mb-8">
      <thead>
        <tr class="border-b-2 border-slate-900 text-xs font-bold text-slate-700 uppercase">
          <th class="py-3">Description</th>
          <th class="py-3 text-center">Qty</th>
          <th class="py-3 text-right">Unit Price</th>
          <th class="py-3 text-right">Amount</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 text-sm">
        ${data.items.map(i => `
          <tr>
            <td class="py-3">
              <p class="font-medium text-slate-900">${i.description}</p>
              ${i.details ? `<p class="text-xs text-slate-500">${i.details}</p>` : ''}
            </td>
            <td class="py-3 text-center text-slate-700 font-mono">${i.quantity}</td>
            <td class="py-3 text-right text-slate-700 font-mono">${data.currency.symbol}${(Number(i.unitPrice) || 0).toFixed(2)}</td>
            <td class="py-3 text-right font-bold text-slate-900 font-mono">${data.currency.symbol}${(i.quantity * i.unitPrice).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="border-t border-slate-300 pt-4 flex justify-end">
      <div class="w-64 space-y-2 text-sm">
        <div class="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span class="font-mono font-medium">${data.currency.symbol}${data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0).toFixed(2)}</span>
        </div>
        ${data.discountValue ? `
        <div class="flex justify-between text-emerald-600">
          <span>Discount (${data.discountValue}${data.discountType === 'percent' ? '%' : ''}):</span>
          <span class="font-mono font-medium">-${data.currency.symbol}${(data.discountType === 'percent' ? (data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) * data.discountValue / 100) : data.discountValue).toFixed(2)}</span>
        </div>` : ''}
        ${data.taxRate ? `
        <div class="flex justify-between text-slate-600">
          <span>Tax (${data.taxRate}%):</span>
          <span class="font-mono font-medium">+${data.currency.symbol}${(data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0) * data.taxRate / 100).toFixed(2)}</span>
        </div>` : ''}
        <div class="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
          <span>Total:</span>
          <span class="font-mono">${data.currency.symbol}${data.paidAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    ${data.terms ? `
    <div class="mt-8 pt-6 border-t border-slate-200">
      <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Terms & Conditions</h4>
      <p class="text-xs text-slate-600 leading-relaxed">${data.terms}</p>
    </div>` : ''}

    <div class="mt-8 pt-4 text-center text-xs text-slate-400 border-t border-slate-100">
      Generated seamlessly via OrionFx SaaS Applications • orionfx.net
    </div>
  </div>
  `}

  <script>
    if (document.getElementById('qrcode-container')) {
      new QRCode(document.getElementById('qrcode-container'), {
        text: 'https://e.fbr.gov.pk/pos/verify?fbrInvoiceNo=${fbrInvoiceNumber}',
        width: 76,
        height: 76
      });
    }

    function exportToPdf() {
      const el = document.getElementById('receipt-paper');
      window.html2canvas(el, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new window.jspdf.jsPDF('p', 'mm', ${isThermal ? '[80, 220]' : "'a4'"});
        const width = pdf.internal.pageSize.getWidth() - ${isThermal ? '6' : '20'};
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'JPEG', ${isThermal ? '3' : '10'}, ${isThermal ? '3' : '10'}, width, height);
        pdf.save('${data.receiptNumber}.pdf');
      });
    }
    function exportToJpg() {
      const el = document.getElementById('receipt-paper');
      window.html2canvas(el, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = '${data.receiptNumber}.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      });
    }
  </script>
</body>
</html>`;
}
