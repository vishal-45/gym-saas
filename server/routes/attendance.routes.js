import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/rbac.middleware.js';

const router = express.Router();

// Record Check-in
router.post('/check-in', verifyToken, requirePermission('scanner'), async (req, res) => {
  try {
    const { memberId } = req.body;
    const tenantId = req.user.tenantId || req.user.id;
    
    // Verify member belongs to this tenant AND has an active subscription
    const member = await prisma.member.findFirst({
      where: { id: memberId, tenantId }
    });

    if (!member) return res.status(404).json({ error: "Member not found." });

    // REVENUE PROTECTION: Check for expired subscription
    if (member.subscriptionEnd && new Date(member.subscriptionEnd) < new Date()) {
      return res.status(403).json({ 
        error: "ACCESS DENIED: Membership has expired. Please renew before check-in.",
        memberStatus: "Expired",
        expiryDate: member.subscriptionEnd
      });
    }

    // Prevent duplicate check-ins within 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingCheckIn = await prisma.attendance.findFirst({
      where: {
        memberId,
        tenantId,
        timestamp: { gte: tenMinutesAgo }
      }
    });

    if (existingCheckIn) {
      return res.status(400).json({ error: `${member.name} is already checked in.` });
    }

    const attendance = await prisma.attendance.create({
      data: { memberId, tenantId },
      include: { member: { select: { name: true } } }
    });

    res.json({ success: true, message: `Welcome, ${member.name}`, attendance });
  } catch (err) {
    res.status(500).json({ error: "Check-in failed." });
  }
});

// History
router.get('/history', verifyToken, async (req, res) => {
  try {
    const isMember = req.user.role === 'MEMBER';
    const tenantId = req.user.tenantId || req.user.id;
    
    const history = await prisma.attendance.findMany({
      where: isMember ? { memberId: req.user.id, tenantId } : { tenantId },
      include: { member: { select: { name: true, plan: true } } },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// Daily Stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
      const tenantId = req.user.tenantId || req.user.id;
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const count = await prisma.attendance.count({
        where: {
          tenantId,
          timestamp: { gte: today }
        }
      });
      
      res.json({ todayCount: count });
    } catch (err) {
      res.status(500).json({ error: "Stats failed." });
    }
});

export default router;
