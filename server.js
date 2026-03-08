const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(
    CONTENT_FILE,
    JSON.stringify(
      {
        videos: [],
        images: [],
        highlights: []
      },
      null,
      2
    ),
    'utf8'
  );
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const PRIMARY_EMAIL = process.env.PRIMARY_EMAIL || 'rajsakpal4@gmail.com';
const SECONDARY_EMAIL = process.env.SECONDARY_EMAIL || 'harshsakpal1227@gmail.com';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'kingsfitness123';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, serviceType } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required.' });
  }

  const summary = {
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone,
    serviceType,
    message
  };

  console.log('New contact enquiry:', summary);

  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"KING'S FITNESS Website" <${PRIMARY_EMAIL}>`,
        to: [PRIMARY_EMAIL, SECONDARY_EMAIL].join(','),
        subject: `New enquiry from ${name} - KING'S FITNESS website`,
        text: `
New enquiry for KING'S FITNESS

Name: ${name}
Email: ${email || 'N/A'}
Phone: ${phone}
Service Type: ${serviceType || 'N/A'}

Message:
${message}
        `.trim()
      });
    } catch (err) {
      console.error('Failed to send contact email:', err.message);
    }
  }

  return res.json({
    success: true,
    message: 'Thank you! We will contact you shortly.'
  });
});

app.get('/api/content', (req, res) => {
  try {
    const raw = fs.readFileSync(CONTENT_FILE, 'utf8');
    const data = JSON.parse(raw);
    return res.json(data);
  } catch (err) {
    console.error('Failed to read content file:', err.message);
    return res.status(500).json({ error: 'Failed to load content' });
  }
});

app.post('/api/content', authMiddleware, (req, res) => {
  const { videos, images, highlights } = req.body;

  try {
    const existingRaw = fs.readFileSync(CONTENT_FILE, 'utf8');
    const existing = JSON.parse(existingRaw);

    const updated = {
      videos: Array.isArray(videos) ? videos : existing.videos,
      images: Array.isArray(images) ? images : existing.images,
      highlights: Array.isArray(highlights) ? highlights : existing.highlights
    };

    fs.writeFileSync(CONTENT_FILE, JSON.stringify(updated, null, 2), 'utf8');
    return res.json({ success: true, content: updated });
  } catch (err) {
    console.error('Failed to update content file:', err.message);
    return res.status(500).json({ error: 'Failed to update content' });
  }
});

app.post('/api/bill/pdf', (req, res) => {
  const {
    type,
    billNumber,
    billDate,
    clientName,
    clientAddress,
    clientPhone,
    subject,
    lineItems,
    notes
  } = req.body;

  if (!clientName || !Array.isArray(lineItems) || lineItems.length === 0) {
    return res.status(400).json({ error: 'Client name and at least one line item are required.' });
  }

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${(type || 'document')}-${Date.now()}.pdf"`
  );

  doc.pipe(res);

  const brandRed = '#b91c1c';

  const pageWidth = doc.page.width;

  doc.rect(40, 40, pageWidth - 80, 70).fill(brandRed);
  doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold');
  doc.text("KING'S FITNESS", 40, 55, { width: pageWidth - 80, align: 'center' });
  doc.fontSize(9).font('Helvetica');
  doc.text(
    'Distributor of Quality Fitness Health Equipments, Sports Goods, Gym Rubber Flooring, Artificial Grass & Gym Setups',
    40,
    82,
    { width: pageWidth - 80, align: 'center' }
  );
  doc.text(
    'B-404, Jay Ashtavinayak CHS Ltd, Saibaba Nagar, Mira Road (E), Thane - 401 107. Ph: 8850081223',
    40,
    96,
    { width: pageWidth - 80, align: 'center' }
  );
  doc.text('Email: rajsakpal4@gmail.com', 40, 110, {
    width: pageWidth - 80,
    align: 'center'
  });

  doc.moveDown(2);
  const titleY = 135;
  doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold');
  doc.text(type === 'quotation' ? 'QUOTATION' : 'TAX INVOICE', 40, titleY, {
    width: pageWidth - 80,
    align: 'center'
  });

  if (subject) {
    doc.fontSize(11).font('Helvetica');
    doc.text(subject, 40, titleY + 18, { width: pageWidth - 80, align: 'center' });
  }

  const infoTop = subject ? titleY + 44 : titleY + 28;
  const leftX = 45;
  const midX = pageWidth / 2;

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Bill To:', leftX, infoTop);
  doc.fontSize(10).font('Helvetica');
  doc.text(clientName, leftX, infoTop + 12, { width: midX - leftX - 10 });
  if (clientAddress) {
    doc.text(clientAddress, leftX, infoTop + 26, { width: midX - leftX - 10 });
  }
  if (clientPhone) {
    doc.text(`Phone: ${clientPhone}`, leftX, infoTop + 50, { width: midX - leftX - 10 });
  }

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Bill / Quotation No:', midX + 10, infoTop);
  doc.fontSize(10).font('Helvetica');
  doc.text(billNumber || 'Auto', midX + 10, infoTop + 12);
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Date:', midX + 10, infoTop + 30);
  doc.fontSize(10).font('Helvetica');
  doc.text(billDate || new Date().toLocaleDateString(), midX + 10, infoTop + 42);

  const tableTop = infoTop + 80;
  const itemColX = 45;
  const descColX = 90;
  const qtyColX = 320;
  const rateColX = 380;
  const amountColX = 450;

  doc.moveTo(itemColX, tableTop).lineTo(doc.page.width - 45, tableTop).stroke();
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Sr', itemColX, tableTop + 8);
  doc.text('Description', descColX, tableTop + 8);
  doc.text('Qty', qtyColX, tableTop + 8, { width: 40, align: 'right' });
  doc.text('Rate', rateColX, tableTop + 8, { width: 60, align: 'right' });
  doc.text('Amount', amountColX, tableTop + 8, { width: 80, align: 'right' });

  doc.moveTo(itemColX, tableTop + 26).lineTo(doc.page.width - 45, tableTop + 26).stroke();

  let y = tableTop + 32;
  let subTotal = 0;

  doc.fontSize(10).font('Helvetica');

  lineItems.forEach((item, index) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const amount = qty * rate;
    subTotal += amount;

    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 60;
    }

    doc.text(String(index + 1), itemColX, y);
    doc.text(item.description || '', descColX, y, { width: 220 });
    doc.text(qty.toFixed(2), qtyColX, y, { width: 40, align: 'right' });
    doc.text(rate.toFixed(2), rateColX, y, { width: 60, align: 'right' });
    doc.text(amount.toFixed(2), amountColX, y, { width: 80, align: 'right' });

    y += 18;
  });

  const taxRate = 0;
  const taxAmount = subTotal * taxRate;
  const grandTotal = subTotal + taxAmount;

  if (y < doc.page.height - 170) {
    y = doc.page.height - 170;
  }

  doc.moveTo(itemColX, y).lineTo(doc.page.width - 45, y).stroke();

  y += 10;
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Subtotal', rateColX, y, { width: 60, align: 'right' });
  doc.text(subTotal.toFixed(2), amountColX, y, { width: 80, align: 'right' });

  y += 16;
  doc.fontSize(10).font('Helvetica');
  doc.text('Tax', rateColX, y, { width: 60, align: 'right' });
  doc.text(taxAmount.toFixed(2), amountColX, y, { width: 80, align: 'right' });

  y += 18;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total', rateColX, y, { width: 60, align: 'right' });
  doc.text(grandTotal.toFixed(2), amountColX, y, { width: 80, align: 'right' });

  y += 40;
  doc.fontSize(10).font('Helvetica');
  if (notes) {
    doc.text('Notes:', itemColX, y);
    y += 14;
    doc.text(notes, itemColX, y, {
      width: doc.page.width - 90
    });
  }

  let bankTop = y + 30;
  if (bankTop > doc.page.height - 140) {
    doc.addPage();
    bankTop = 60;
  }

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('COMPANY BANK DETAILS:', itemColX, bankTop);
  doc.fontSize(9).font('Helvetica');
  doc.text("A/c Holder Name : KING'S FITNESS", itemColX, bankTop + 14);
  doc.text('Bank Name       : (update in code)', itemColX, bankTop + 26);
  doc.text('A/c Number      : (update in code)', itemColX, bankTop + 38);
  doc.text('Branch & IFSC   : (update in code)', itemColX, bankTop + 50);

  const signX = doc.page.width - 220;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text("For KING'S FITNESS", signX, bankTop + 14, { align: 'center', width: 180 });
  doc.fontSize(9).font('Helvetica');
  doc.text('Authorised Signatory', signX, bankTop + 52, { align: 'center', width: 180 });

  const footerY = doc.page.height - 60;
  doc.moveTo(40, footerY).lineTo(doc.page.width - 40, footerY).stroke();
  doc.fontSize(8);
  doc.text(
    "Motto: Providing best equipments, gym products, dream gym builds, complete gym setups and expert manpower including trainers, receptionists and managers.",
    45,
    footerY + 6,
    { width: doc.page.width - 90, align: 'center' }
  );

  doc.end();
});

app.listen(PORT, () => {
  console.log(`KING'S FITNESS server running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`KING'S FITNESS server running on http://localhost:${PORT}`);
});

