import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const BIZ = {
  name: 'BN Visionary Cleaning Services',
  address: '128 Easty Street, Phillip, ACT 2606',
  phone: '+61 0405120547',
  abn: '60 195 599 337'
};

function money(n) {
  return '$' + (Math.round(n * 100) / 100).toFixed(2);
}

function buildPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fillColor('#2c4d38').fontSize(20).font('Helvetica-Bold').text(BIZ.name);
    doc.fillColor('#555').fontSize(10).font('Helvetica');
    doc.text(BIZ.address);
    doc.text(`Phone: ${BIZ.phone}    ABN: ${BIZ.abn}`);
    doc.moveDown(1);
    doc.strokeColor('#dfe3dd').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Invoice meta
    doc.fillColor('#1f2a24').fontSize(11).font('Helvetica-Bold').text('Invoice details', { underline: false });
    doc.font('Helvetica').fontSize(10);
    doc.text(`Invoice #: ${data.invNumber || '(not set)'}`);
    doc.text(`Date: ${data.invDate || '(not set)'}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Bill to');
    doc.font('Helvetica');
    doc.text(data.clientName || '(not set)');
    if (data.clientAddress) doc.text(data.clientAddress);
    if (data.clientEmail) doc.text(data.clientEmail);
    doc.moveDown(1);

    // Table header
    const tableTop = doc.y;
    const col = { sn: 50, desc: 90, amt: 460 };
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#2c4d38');
    doc.text('SN', col.sn, tableTop);
    doc.text('Description', col.desc, tableTop);
    doc.text('Amount', col.amt, tableTop, { width: 85, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#3f6b4f').stroke();

    let y = tableTop + 22;
    doc.font('Helvetica').fontSize(10).fillColor('#1f2a24');
    (data.items || []).forEach((item, i) => {
      doc.text(String(i + 1), col.sn, y);
      doc.text(item.desc || '(no description)', col.desc, y, { width: 350 });
      doc.text(money(parseFloat(item.amt) || 0), col.amt, y, { width: 85, align: 'right' });
      y += 20;
    });

    doc.moveTo(50, y + 2).lineTo(545, y + 2).strokeColor('#dfe3dd').stroke();
    y += 14;

    const subtotal = (data.items || []).reduce((s, it) => s + (parseFloat(it.amt) || 0), 0);
    const gst = subtotal * 0.10;
    const total = subtotal + gst;

    doc.font('Helvetica').fontSize(10);
    doc.text('Subtotal', col.amt - 100, y, { width: 100, align: 'right' });
    doc.text(money(subtotal), col.amt, y, { width: 85, align: 'right' });
    y += 16;
    doc.text('GST (10%)', col.amt - 100, y, { width: 100, align: 'right' });
    doc.text(money(gst), col.amt, y, { width: 85, align: 'right' });
    y += 18;
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#2c4d38');
    doc.text('Total', col.amt - 100, y, { width: 100, align: 'right' });
    doc.text(money(total), col.amt, y, { width: 85, align: 'right' });

    if (data.notes) {
      y += 40;
      doc.font('Helvetica').fontSize(9).fillColor('#6b7268');
      doc.text(data.notes, 50, y, { width: 495 });
    }

    doc.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const data = req.body;

    if (!data || !data.clientEmail || !/^\S+@\S+\.\S+$/.test(data.clientEmail)) {
      res.status(400).json({ error: 'A valid client email is required.' });
      return;
    }
    if (!data.items || data.items.length === 0) {
      res.status(400).json({ error: 'At least one line item is required.' });
      return;
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      res.status(500).json({ error: 'Email is not configured on the server (missing GMAIL_USER / GMAIL_APP_PASSWORD).' });
      return;
    }

    const pdfBuffer = await buildPdfBuffer(data);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });

    const subtotal = (data.items || []).reduce((s, it) => s + (parseFloat(it.amt) || 0), 0);
    const total = subtotal * 1.10;

    await transporter.sendMail({
      from: `"${BIZ.name}" <${gmailUser}>`,
      to: data.clientEmail,
      subject: `Receipt ${data.invNumber || ''} — ${BIZ.name}`,
      text: `Hi ${data.clientName || ''},\n\nPlease find attached your receipt from ${BIZ.name}.\n\nTotal: ${money(total)}\n\nThank you for your business.`,
      attachments: [
        {
          filename: `Receipt-${data.invNumber || 'invoice'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email. ' + (err.message || '') });
  }
}