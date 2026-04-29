import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all classes for the authenticated Tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    
    const classes = await prisma.class.findMany({
      where: { tenantId },
      include: {
        bookings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(classes);
  } catch(err) {
    res.status(500).json({ error: "Failed to load class schedule." });
  }
});

// POST a new class (Tenant only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'MEMBER') return res.status(403).json({ error: "Members cannot create classes." });

    const tenantId = req.user.id;
    const { title, time, trainer, capacity } = req.body;

    const newClass = await prisma.class.create({
      data: {
        tenantId,
        title,
        time,
        trainer,
        capacity: parseInt(capacity)
      }
    });

    res.status(201).json(newClass);
  } catch(err) {
    res.status(500).json({ error: "Failed to create class." });
  }
});

// DELETE a class (Tenant only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'MEMBER') return res.status(403).json({ error: "Access Denied." });

    await prisma.class.delete({
      where: { 
        id: req.params.id,
        tenantId: req.user.id 
      }
    });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: "Failed to delete class." });
  }
});

// BOOK a class (Member only)
router.post('/:id/book', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') {
      return res.status(403).json({ error: "Only members can book classes." });
    }
    
    const memberId = req.user.id;
    const classId = req.params.id;

    // Check availability
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { bookings: true }
    });

    if (!targetClass) return res.status(404).json({ error: "Class not found." });
    
    // Check if already booked
    const alreadyBooked = targetClass.bookings.find(b => b.memberId === memberId);
    if (alreadyBooked) return res.status(400).json({ error: "You have already secured a slot/waitlist for this class." });

    // Determine status based on capacity
    const confirmedCount = targetClass.bookings.filter(b => b.status === 'Confirmed').length;
    const bookingStatus = confirmedCount < targetClass.capacity ? 'Confirmed' : 'Waitlist';

    const booking = await prisma.booking.create({
      data: {
        memberId,
        classId,
        status: bookingStatus
      }
    });

    res.json({ 
      success: true, 
      booking, 
      message: bookingStatus === 'Waitlist' ? "Slot filled. You have been added to the Waitlist." : "Booking confirmed successfully." 
    });
  } catch(err) {
    res.status(500).json({ error: "Booking process failed." });
  }
});

export default router;
