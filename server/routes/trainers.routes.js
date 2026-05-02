import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireGymOwner } from '../middleware/rbac.middleware.js';

const router = express.Router();
router.use(verifyToken, requireGymOwner);
const prisma = new PrismaClient();

// GET all trainers for the authenticated Tenant
router.get('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const trainers = await prisma.trainer.findMany({
      where: { tenantId },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' }
    });
    // Never expose hashed passwords to frontend
    const safe = trainers.map(({ password, ...t }) => t);
    res.json(safe);
  } catch(err) {
    res.status(500).json({ error: "Failed to load trainers." });
  }
});

// POST a new trainer (with password and finance)
router.post('/', verifyToken, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const { name, email, phone, specialty, password, paymentModel, baseSalary, commissionRate, perSessionRate } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required." });
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newTrainer = await prisma.trainer.create({
      data: { 
        tenantId, name, email, phone, specialty, status: "Active", password: hashedPassword,
        paymentModel: paymentModel || "SALARY",
        baseSalary: parseFloat(baseSalary) || 0,
        commissionRate: parseFloat(commissionRate) || 0,
        perSessionRate: parseFloat(perSessionRate) || 0
      }
    });

    const { password: _, ...safe } = newTrainer;
    res.status(201).json(safe);
  } catch(err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: "A trainer with this email already exists." });
    }
    res.status(500).json({ error: "Server failed to create trainer." });
  }
});

// GET Trainer Earnings (Analytics)
router.get('/:id/earnings', verifyToken, async (req, res) => {
    try {
        const tenantId = req.user.tenantId || req.user.id;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const trainer = await prisma.trainer.findUnique({
            where: { id: req.params.id },
            include: {
                members: { 
                    include: { 
                        payments: { 
                            where: { 
                                status: 'Paid',
                                createdAt: { gte: firstDayOfMonth }
                            } 
                        } 
                    } 
                },
                classes: { 
                    include: { 
                        bookings: { 
                            where: { 
                                status: 'Confirmed',
                                createdAt: { gte: firstDayOfMonth }
                            } 
                        } 
                    } 
                }
            }
        });

        if (!trainer || trainer.tenantId !== tenantId) return res.status(404).json({ error: "Trainer not found" });

        let earnings = 0;
        let details = { salary: 0, commission: 0, sessions: 0 };

        if (trainer.paymentModel === 'SALARY') {
            earnings = trainer.baseSalary;
            details.salary = trainer.baseSalary;
        } else if (trainer.paymentModel === 'REVENUE_SHARE') {
            // Calculate commission from confirmed payments of assigned members
            const totalRevenue = trainer.members.reduce((acc, m) => {
                return acc + m.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
            }, 0);
            earnings = (totalRevenue * trainer.commissionRate) / 100;
            details.commission = earnings;
        } else if (trainer.paymentModel === 'PER_SESSION') {
            // Count total confirmed bookings in classes lead by this trainer
            const sessionCount = trainer.classes.length;
            earnings = sessionCount * trainer.perSessionRate;
            details.sessions = earnings;
        }

        res.json({ trainerId: trainer.id, name: trainer.name, totalEarnings: earnings, details });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to calculate earnings." });
    }
});

// POST Process Payout
router.post('/:id/payout', verifyToken, async (req, res) => {
    try {
        const tenantId = req.user.tenantId || req.user.id;
        const { amount } = req.body;
        const now = new Date();

        const trainer = await prisma.trainer.findFirst({
            where: { id: req.params.id, tenantId }
        });
        if (!trainer) return res.status(404).json({ error: "Trainer not found." });

        const payout = await prisma.trainerPayout.create({
            data: {
                trainerId: trainer.id,
                amount: parseFloat(amount),
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                status: "Paid",
                processedAt: now
            }
        });

        res.json({ success: true, payout });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process payroll." });
    }
});

// PUT/UPDATE trainer + optional password reset + finance
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, specialty, status, password, paymentModel, baseSalary, commissionRate, perSessionRate } = req.body;

    const updateData = { 
        name, email, phone, specialty, status,
        paymentModel,
        baseSalary: parseFloat(baseSalary),
        commissionRate: parseFloat(commissionRate),
        perSessionRate: parseFloat(perSessionRate)
    };
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.trainer.updateMany({
      where: { id: req.params.id, tenantId: req.user.tenantId || req.user.id },
      data: updateData
    });
    const updatedTrainer = await prisma.trainer.findFirst({ where: { id: req.params.id } });
    if(updatedTrainer) {
      const { password: _, ...safe } = updatedTrainer;
      res.json(safe);
    } else {
      res.status(404).json({ error: "Trainer not found" });
    }
  } catch(err) {
    res.status(500).json({ error: "Failed to update trainer profile." });
  }
});

// DELETE a specific trainer
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.trainer.deleteMany({
      where: { id: req.params.id, tenantId: req.user.tenantId || req.user.id }
    });
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: "Failed to delete trainer." });
  }
});

export default router;
