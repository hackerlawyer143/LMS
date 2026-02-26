const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, Enrollment, Course } = require('../models');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

let razorpayInstance = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpayInstance = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
}

function getRazorpay() {
  if (!razorpayInstance) {
    throw new Error('Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return razorpayInstance;
}

async function createOrder(userId, courseId, amountPaise, currency = 'INR') {
  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: Math.round(amountPaise),
    currency,
    receipt: `lms_${courseId}_${userId}_${Date.now()}`,
    notes: { userId: String(userId), courseId: String(courseId) },
  });
  return order;
}

function verifySignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', razorpayKeySecret).update(body).digest('hex');
  return expected === signature;
}

function verifyWebhookSignature(body, signature) {
  if (!razorpayWebhookSecret) return false;
  const expected = crypto.createHmac('sha256', razorpayWebhookSecret).update(body).digest('hex');
  return expected === signature;
}

async function onPaymentSuccess(orderId, paymentId, method) {
  const rzp = getRazorpay();
  const order = await rzp.orders.fetch(orderId);
  const payment = await rzp.payments.fetch(paymentId);
  const userId = order.notes?.userId;
  const courseId = order.notes?.courseId;
  if (!userId || !courseId) return null;

  const [txn, created] = await Payment.findOrCreate({
    where: { gateway_order_id: orderId },
    defaults: {
      user_id: Number(userId),
      course_id: Number(courseId),
      amount: order.amount / 100,
      currency: order.currency,
      gateway_order_id: orderId,
      gateway_txn_id: paymentId,
      payment_method: method || payment.method || 'card',
      status: 'success',
      paid_at: new Date(),
      receipt_url: payment.receipt || null,
    },
  });

  if (!created) {
    txn.status = 'success';
    txn.gateway_txn_id = paymentId;
    txn.paid_at = new Date();
    txn.receipt_url = payment.receipt || txn.receipt_url;
    await txn.save();
  }

  await Enrollment.findOrCreate({
    where: { user_id: Number(userId), course_id: Number(courseId) },
    defaults: { user_id: Number(userId), course_id: Number(courseId), status: 'active' },
  });

  return txn;
}

module.exports = {
  getRazorpay,
  createOrder,
  verifySignature,
  verifyWebhookSignature,
  onPaymentSuccess,
  isConfigured: !!razorpayInstance,
};
