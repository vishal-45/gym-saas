import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all leads for the authenticated Tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to load lead database." });
  }
});

// POST a new lead
router.post('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const { name, phone, email, source, interest, notes, nextFollowUp } = req.body;

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        name,
        phone,
        email,
        source: source || 'Walk-in',
        interest,
        notes,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      }
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: "Failed to capture lead." });
  }
});

// UPDATE lead status/details
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status, trialStartDate, trialEndDate, nextFollowUp, notes } = req.body;
    
    const lead = await prisma.lead.update({
      where: { 
        id: req.params.id,
        tenantId: (req.user.tenantId || req.user.id)
      },
      data: {
        status,
        notes,
        trialStartDate: trialStartDate ? new Date(trialStartDate) : undefined,
        trialEndDate: trialEndDate ? new Date(trialEndDate) : undefined,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      }
    });

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: "Failed to update lead protocols." });
  }
});

// DELETE a lead
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.lead.delete({
      where: { 
        id: req.params.id,
        tenantId: (req.user.tenantId || req.user.id)
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to purge lead data." });
  }
});

export default router;
