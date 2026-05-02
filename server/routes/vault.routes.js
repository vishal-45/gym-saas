import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get Library Resources
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    
    const resources = await prisma.resource.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch library resources." });
  }
});

// Add Resource (Owner only)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'MEMBER') return res.status(403).json({ error: "Access denied." });
    
    const { title, type, url, category } = req.body;
    
    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        url,
        category,
        tenantId: req.user.tenantId || req.user.id
      }
    });
    
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: "Failed to add resource." });
  }
});

// Delete Resource (Owner only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'MEMBER') return res.status(403).json({ error: "Access denied." });
    
    await prisma.resource.deleteMany({
      where: { 
        id: req.params.id,
        tenantId: req.user.tenantId || req.user.id
      }
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete resource." });
  }
});

export default router;
