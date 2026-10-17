import { Invoice } from '../types/invoice';
import { calculateInvoice } from './calculations';
import { formatCurrency } from './currencies';

export function buildWhatsAppMessage(invoice: Invoice): string {
  const { grandTotal } = calculateInvoice(invoice);
  const formattedTotal = formatCurrency(grandTotal, invoice.currency);
  const senderName = invoice.sender.businessName || invoice.sender.name || 'Our Company';
  const clientName = invoice.client.name || 'Valued Client';

  let msg = `Hello ${clientName},\n\n`;
  msg += `This is ${senderName}. Please find the details for Invoice *#${invoice.invoiceNumber}*:\n\n`;
  msg += `• Amount Due: *${formattedTotal}*\n`;
  msg += `• Issue Date: ${invoice.issueDate}\n`;
  msg += `• Due Date: ${invoice.dueDate}\n`;
  if (invoice.client.projectCode) {
    msg += `• Project / Ref: ${invoice.client.projectCode}\n`;
  }
  msg += `\n*Summary of Services:*\n`;
  invoice.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.description} (Qty: ${item.quantity}) - ${formatCurrency(item.quantity * item.unitPrice, invoice.currency)}\n`;
  });

  if (invoice.paymentMethod.bankName || invoice.paymentMethod.iban || invoice.paymentMethod.stripeLink || invoice.paymentMethod.paypalEmail) {
    msg += `\n*Payment Details:*\n`;
    if (invoice.paymentMethod.bankName) msg += `Bank: ${invoice.paymentMethod.bankName}\n`;
    if (invoice.paymentMethod.accountNumber) msg += `Account: ${invoice.paymentMethod.accountNumber}\n`;
    if (invoice.paymentMethod.iban) msg += `IBAN: ${invoice.paymentMethod.iban}\n`;
    if (invoice.paymentMethod.paypalEmail) msg += `PayPal: ${invoice.paymentMethod.paypalEmail}\n`;
    if (invoice.paymentMethod.stripeLink) msg += `Pay Online: ${invoice.paymentMethod.stripeLink}\n`;
    if (invoice.paymentMethod.upiId) msg += `UPI / ID: ${invoice.paymentMethod.upiId}\n`;
  }

  if (invoice.notes) {
    msg += `\nNote: ${invoice.notes}\n`;
  }

  msg += `\nThank you for your business! Please let us know once the transfer is initiated.`;

  return msg;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  // Strip non-numeric except leading plus
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

export function buildEmailData(invoice: Invoice, subjectOverride?: string, bodyOverride?: string): {
  mailtoUrl: string;
  subject: string;
  body: string;
} {
  const { grandTotal } = calculateInvoice(invoice);
  const formattedTotal = formatCurrency(grandTotal, invoice.currency);
  const senderName = invoice.sender.businessName || invoice.sender.name || 'Our Company';
  const clientName = invoice.client.name || 'Valued Client';

  const defaultSubject = `Invoice #${invoice.invoiceNumber} from ${senderName} [${formattedTotal}]`;

  let defaultBody = `Dear ${clientName},\n\n`;
  defaultBody += `I hope this email finds you well.\n\n`;
  defaultBody += `Please find attached Invoice #${invoice.invoiceNumber} for ${formattedTotal}, due on ${invoice.dueDate}.\n\n`;
  defaultBody += `Invoice Summary:\n`;
  defaultBody += `----------------------------------------\n`;
  defaultBody += `Invoice Number: ${invoice.invoiceNumber}\n`;
  defaultBody += `Due Date: ${invoice.dueDate}\n`;
  defaultBody += `Total Due: ${formattedTotal}\n`;
  if (invoice.client.projectCode) {
    defaultBody += `Project Reference: ${invoice.client.projectCode}\n`;
  }
  defaultBody += `----------------------------------------\n\n`;

  if (invoice.paymentMethod.bankName || invoice.paymentMethod.iban || invoice.paymentMethod.stripeLink) {
    defaultBody += `Payment Instructions:\n`;
    if (invoice.paymentMethod.bankName) defaultBody += `• Bank Name: ${invoice.paymentMethod.bankName}\n`;
    if (invoice.paymentMethod.accountName) defaultBody += `• Account Name: ${invoice.paymentMethod.accountName}\n`;
    if (invoice.paymentMethod.accountNumber) defaultBody += `• Account Number: ${invoice.paymentMethod.accountNumber}\n`;
    if (invoice.paymentMethod.routingOrSwift) defaultBody += `• SWIFT / Routing: ${invoice.paymentMethod.routingOrSwift}\n`;
    if (invoice.paymentMethod.iban) defaultBody += `• IBAN: ${invoice.paymentMethod.iban}\n`;
    if (invoice.paymentMethod.paypalEmail) defaultBody += `• PayPal: ${invoice.paymentMethod.paypalEmail}\n`;
    if (invoice.paymentMethod.stripeLink) defaultBody += `• Instant Payment Link: ${invoice.paymentMethod.stripeLink}\n`;
    defaultBody += `\n`;
  }

  defaultBody += `If you have any questions regarding this invoice, please do not hesitate to reach out.\n\n`;
  defaultBody += `Best regards,\n`;
  defaultBody += `${senderName}\n`;
  if (invoice.sender.email) defaultBody += `${invoice.sender.email}\n`;
  if (invoice.sender.phone) defaultBody += `${invoice.sender.phone}\n`;

  const finalSubject = subjectOverride || defaultSubject;
  const finalBody = bodyOverride || defaultBody;

  const mailtoUrl = `mailto:${encodeURIComponent(invoice.client.email || '')}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;

  return {
    mailtoUrl,
    subject: finalSubject,
    body: finalBody,
  };
}

export function getDefaultFollowUpSequences(invoiceNumber: string, senderName: string, clientName: string, formattedTotal: string, dueDate: string) {
  return [
    {
      id: 'seq-1',
      stage: 'gentle_reminder' as const,
      title: 'Gentle Heads-Up (3 Days Before)',
      daysOffset: -3,
      subject: `Upcoming Due Date: Invoice #${invoiceNumber} (${formattedTotal})`,
      messageBody: `Hi ${clientName || 'there'},\n\nJust a quick heads-up that Invoice #${invoiceNumber} for ${formattedTotal} is scheduled for payment on ${dueDate}.\n\nPlease let me know if you need any additional details or documentation.\n\nThank you,\n${senderName}`,
      isEnabled: true,
    },
    {
      id: 'seq-2',
      stage: 'due_today' as const,
      title: 'Due Today Reminder',
      daysOffset: 0,
      subject: `Due Today: Invoice #${invoiceNumber} from ${senderName}`,
      messageBody: `Dear ${clientName || 'Client'},\n\nThis is a friendly reminder that Invoice #${invoiceNumber} for ${formattedTotal} is due today (${dueDate}).\n\nPlease confirm once payment has been released so I can mark your account as settled.\n\nBest regards,\n${senderName}`,
      isEnabled: true,
    },
    {
      id: 'seq-3',
      stage: 'overdue_notice' as const,
      title: 'Overdue Follow-Up (7 Days Past Due)',
      daysOffset: 7,
      subject: `Overdue Notice: Invoice #${invoiceNumber} (${formattedTotal})`,
      messageBody: `Dear ${clientName || 'Client'},\n\nOur records indicate that Invoice #${invoiceNumber} was due on ${dueDate} and remains unpaid.\n\nCould you please check on the status of this transfer and advise when we can expect settlement?\n\nIf payment was sent recently, please disregard this message.\n\nSincerely,\n${senderName}`,
      isEnabled: true,
    },
  ];
}
