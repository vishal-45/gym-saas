import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all staff for the authenticated Tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const staff = await prisma.staff.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    const safe = staff.map(({ password, ...s }) => s);
    res.json(safe);
  } catch(err) {
    res.status(500).json({ error: "Failed to load team members." });
  }
});

// POST a new staff member (with password)
router.post('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const { name, email, phone, role, password, permissions } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, Email, and Role are required." });
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newStaff = await prisma.staff.create({
      data: { 
        tenantId, name, email, phone, role, status: "Active", password: hashedPassword,
        permissions: permissions ? JSON.stringify(permissions) : null
      }
    });

    const { password: _, ...safe } = newStaff;
    res.status(201).json(safe);
  } catch(err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: "A staff member with this email already exists." });
    }
    res.status(500).json({ error: "Server failed to create staff member." });
  }
});

// PUT/UPDATE staff + optional password reset
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, role, status, password, permissions } = req.body;

    const updateData = { name, email, phone, role, status };
    if (permissions) updateData.permissions = JSON.stringify(permissions);
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.staff.update({
      where: { id: req.params.id, tenantId: req.user.tenantId || req.user.id },
      data: updateData
    });
    const { password: _, ...safe } = updated;
    res.json(safe);
  } catch(err) {
    res.status(500).json({ error: "Failed to update staff profile." });
  }
});

// DELETE a specific staff member
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.staff.delete({
      where: { id: req.params.id, tenantId: req.user.tenantId || req.user.id }
    });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: "Failed to delete staff member." });
  }
});

export default router;
