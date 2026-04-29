import express from 'express';

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

let razorpay = null;
try {
  const Razorpay = (await import('razorpay')).default;
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.warn("⚠️ Razorpay module not found or failed to load. Online payments will be disabled but server will remain online.");
}

// Create Online Order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { amount, memberId } = req.body;
    
    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Record pending transaction in our DB
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        memberId,
        tenantId: req.user.id,
        status: 'Pending',
        type: 'Online',
        method: 'Razorpay',
        razorpayOrderId: order.id,
      }
    });

    res.json({ 
      orderId: order.id, 
      amount: options.amount, 
      currency: options.currency,
      paymentId: payment.id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});

// Verify Online Payment
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment Verified
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { 
          status: 'Paid', 
          razorpayPaymentId: razorpay_payment_id 
        }
      });
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed." });
  }
});

// Record Offline Payment (Owner Only)
router.post('/offline', verifyToken, async (req, res) => {
  try {
    const { memberId, amount, method } = req.body;
    
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        memberId,
        tenantId: req.user.id,
        status: 'Paid',
        type: 'Offline',
        method: method || 'Cash',
      }
    });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to record offline payment." });
  }
});

// Get Payment History
router.get('/history', verifyToken, async (req, res) => {
  try {
    // If it's a tenant, show all payments for their gym. 
    // If it's a member, show only their payments.
    const isMember = req.user.role === 'MEMBER';
    
    const payments = await prisma.payment.findMany({
      where: isMember ? { memberId: req.user.id } : { tenantId: req.user.id },
      include: {
        member: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment history." });
  }
});

export default router;
