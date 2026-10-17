import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportInvoiceToPdf(elementId: string, fileName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Invoice element not found for PDF generation');
    return false;
  }

  try {
    // Clone or capture with high resolution
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for retina/high quality print
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Subsequent pages if invoice is lengthy
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF via html2canvas/jspdf:', error);
    // Fallback to browser print window
    window.print();
    return true;
  }
}

export function printInvoiceDirectly() {
  window.print();
}
