import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { runRetentionScanForTenant } from '../services/retention.service.js';

const router = express.Router();

// GET all notifications for the authenticated user/tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to load notifications." });
  }
});

// Run Expiry Check (Retention Engine)
router.post('/run-reminder-scan', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const results = await runRetentionScanForTenant(tenantId);
    res.json({ success: true, ...results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Retention scan failed." });
  }
});

// Mark as Read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    await prisma.notification.update({
      where: { id: req.params.id, tenantId },
      data: { status: "Read" }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed." });
  }
});

export default router;
