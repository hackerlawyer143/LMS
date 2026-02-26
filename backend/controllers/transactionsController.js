const { Payment, Course, User } = require('../models');
const PDFDocument = require('pdfkit');

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.userRole === 'student') {
      where.user_id = req.userId;
    }
    const transactions = await Payment.findAll({
      where,
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: User, as: 'User', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const txn = await Payment.findByPk(req.params.id, {
      include: [
        { model: Course, include: [{ model: User, as: 'User', attributes: ['full_name'] }] },
        { model: User, as: 'User', attributes: ['full_name', 'email'] },
      ],
    });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    if (req.userRole === 'student' && txn.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    if (txn.status !== 'success') {
      return res.status(400).json({ error: 'No receipt for unsuccessful payment' });
    }

    if (txn.receipt_url) {
      return res.redirect(txn.receipt_url);
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${txn.id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Receipt #${txn.id}`);
    doc.text(`Date: ${txn.paid_at ? new Date(txn.paid_at).toLocaleString() : '-'}`);
    doc.text(`Amount: ₹${txn.amount} ${txn.currency}`);
    doc.text(`Method: ${txn.payment_method || 'N/A'}`);
    doc.text(`Transaction ID: ${txn.gateway_txn_id || 'N/A'}`);
    doc.moveDown();
    doc.text(`Course: ${txn.Course?.title || 'N/A'}`);
    doc.text(`Instructor: ${txn.Course?.User?.full_name || 'N/A'}`);
    doc.text(`Student: ${txn.User?.full_name || 'N/A'} (${txn.User?.email || ''})`);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};
