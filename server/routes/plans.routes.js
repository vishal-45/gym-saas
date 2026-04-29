import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all membership plans for the authenticated Tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const plans = await prisma.membershipPlan.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch(err) {
    res.status(500).json({ error: "Failed to load membership plans." });
  }
});

// POST a new membership plan
router.post('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const { name, description, price, duration } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ error: "Name, Price, and Duration (days) are required." });
    }

    const newPlan = await prisma.membershipPlan.create({
      data: {
        tenantId,
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration)
      }
    });

    res.status(201).json(newPlan);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server failed to create membership plan." });
  }
});

// PUT/UPDATE an existing plan
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    
    const updated = await prisma.membershipPlan.update({
      where: { 
        id: req.params.id,
        tenantId: req.user.id 
      },
      data: { 
        name, 
        description, 
        price: parseFloat(price), 
        duration: parseInt(duration) 
      }
    });
    res.json(updated);
  } catch(err) {
    res.status(500).json({ error: "Failed to update membership plan." });
  }
});

// DELETE a specific plan
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if any members are using this plan first
    const memberCount = await prisma.member.count({
      where: { planId: req.params.id }
    });

    if (memberCount > 0) {
      return res.status(400).json({ error: "Cannot delete plan. There are active members enrolled in this plan." });
    }

    await prisma.membershipPlan.delete({
      where: { 
        id: req.params.id,
        tenantId: req.user.id 
      }
    });
    res.json({ success: true, message: "Membership plan removed" });
  } catch(err) {
    res.status(500).json({ error: "Failed to delete plan." });
  }
});

export default router;
