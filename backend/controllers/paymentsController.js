const { body, validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');
const { Course, Payment, Enrollment } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    if (!paymentService.isConfigured) {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }

    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId required' });

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (Number(course.price) <= 0) {
      return res.status(400).json({ error: 'Course is free; use enrollment endpoint' });
    }

    const existing = await Enrollment.findOne({
      where: { user_id: req.userId, course_id: courseId },
    });
    if (existing) return res.status(400).json({ error: 'Already enrolled' });

    const amountPaise = Math.round(Number(course.price) * 100);
    const order = await paymentService.createOrder(req.userId, courseId, amountPaise);

    await Payment.create({
      user_id: req.userId,
      course_id: courseId,
      amount: course.price,
      currency: 'INR',
      gateway_order_id: order.id,
      status: 'pending',
    });

    res.json({
      orderId: order.id,
      amount: amountPaise,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyValidators = [
  body('orderId').notEmpty(),
  body('paymentId').notEmpty(),
  body('signature').notEmpty(),
];

exports.verify = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { orderId, paymentId, signature } = req.body;
    const valid = paymentService.verifySignature(orderId, paymentId, signature);
    if (!valid) return res.status(400).json({ error: 'Invalid signature' });

    const txn = await paymentService.onPaymentSuccess(orderId, paymentId);
    if (!txn) return res.status(400).json({ error: 'Order not found or already processed' });

    res.json({ message: 'Payment verified', transactionId: txn.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.webhookRaw = async (req, res) => {
  const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
  const signature = req.headers['x-razorpay-signature'];
  const paymentService = require('../services/paymentService');
  if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).send('Invalid webhook signature');
  }
  const raw = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
  if (raw.event === 'payment.captured') {
    const payment = raw.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;
    const method = payment?.method;
    if (orderId && paymentId) {
      try {
        await paymentService.onPaymentSuccess(orderId, paymentId, method);
      } catch (e) {
        console.error('Webhook processing error:', e);
      }
    }
  }
  res.status(200).send('OK');
};
