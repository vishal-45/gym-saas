import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all members for the authenticated Tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    
    const members = await prisma.member.findMany({
      where: { tenantId },
      include: {
        membershipPlan: {
          select: { name: true, price: true, duration: true }
        },
        trainer: true,
        attendance: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        _count: {
          select: { 
            attendance: {
              where: {
                timestamp: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const enrichedMembers = members.map(m => ({
      ...m,
      lastSeen: m.attendance?.[0]?.timestamp || null,
      consistencyScore: m._count?.attendance || 0
    }));

    res.json(enrichedMembers);
  } catch(err) {
    res.status(500).json({ error: "Failed to load members." });
  }
});

// POST a new member
router.post('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const { name, email, phone, planId, password, trainerId } = req.body;

    if (!name || !planId) return res.status(400).json({ error: "Name and Plan are required." });

    const selectedPlan = await prisma.membershipPlan.findFirst({
      where: { id: planId, tenantId } // SECURITY: Ensure plan belongs to this tenant
    });

    if (!selectedPlan) return res.status(404).json({ error: "Membership plan not found." });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + selectedPlan.duration);

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newMember = await prisma.member.create({
      data: {
        tenantId,
        name,
        email,
        phone,
        plan: selectedPlan.name,
        planId: selectedPlan.id,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
        password: hashedPassword,
        status: "Active",
        trainerId: trainerId || null
      }
    });

    res.status(201).json(newMember);
  } catch(err) {
    res.status(500).json({ error: "Failed to create member." });
  }
});

// PUT/UPDATE
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const { name, email, phone, planId, status, password, autoRenew, trainerId } = req.body;
    
    const updateData = { name, email, phone, status, autoRenew, trainerId: trainerId || null };

    if (planId) {
      const selectedPlan = await prisma.membershipPlan.findFirst({
        where: { id: planId, tenantId }
      });
      if (selectedPlan) {
        updateData.plan = selectedPlan.name;
        updateData.planId = selectedPlan.id;
      }
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const updated = await prisma.member.update({
      where: { 
        id: req.params.id,
        tenantId // SECURITY: Ensure member belongs to this tenant
      },
      data: updateData
    });
    res.json(updated);
  } catch(err) {
    res.status(500).json({ error: "Update failed." });
  }
});

// DELETE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    await prisma.member.delete({
      where: { 
        id: req.params.id,
        tenantId 
      }
    });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: "Delete failed." });
  }
});

export default router;
