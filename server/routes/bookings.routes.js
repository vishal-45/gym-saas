import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST a new booking (Member only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') return res.status(403).json({ error: "Only members can book classes." });

    const { classId } = req.body;
    const memberId = req.user.id;

    // Check if class exists
    const classToBook = await prisma.class.findUnique({
      where: { id: classId },
      include: { bookings: true }
    });

    if (!classToBook) return res.status(404).json({ error: "Class not found." });
    if (classToBook.tenantId !== req.user.tenantId) return res.status(403).json({ error: "Class does not belong to your gym." });
    
    // Check capacity
    if (classToBook.bookings.length >= classToBook.capacity) {
      return res.status(400).json({ error: "Class is full." });
    }

    // Check if already booked
    const existing = await prisma.booking.findFirst({
      where: { memberId, classId }
    });
    if (existing) return res.status(400).json({ error: "You are already booked for this session." });

    const booking = await prisma.booking.create({
      data: {
        memberId,
        classId
      }
    });

    res.status(201).json(booking);
  } catch(err) {
    res.status(500).json({ error: "Booking failed." });
  }
});

// GET my bookings
router.get('/my', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'MEMBER') return res.status(403).json({ error: "Access Denied." });

    const memberId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { memberId },
      include: {
        class: true
      }
    });
    res.json(bookings);
  } catch(err) {
    res.status(500).json({ error: "Failed to load bookings." });
  }
});

export default router;
