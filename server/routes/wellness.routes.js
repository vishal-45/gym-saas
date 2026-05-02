import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

const verifyMemberTenant = async (req, res, next) => {
    const memberId = req.params.memberId || req.body.memberId;
    const tenantId = req.user.tenantId || req.user.id;
    if (!memberId) return next();
    
    const member = await prisma.member.findFirst({ where: { id: memberId, tenantId } });
    if (!member) return res.status(403).json({ error: "Access Denied. Member not in your gym." });
    next();
};

router.use(verifyMemberTenant);

// ----------------------------------------------------
// UTILS
// ----------------------------------------------------
const tryParse = (str) => {
    try { return JSON.parse(str); }
    catch (e) { return str; }
};

// ----------------------------------------------------
// WORKOUT PLANS
// ----------------------------------------------------

// Get workouts for a member
router.get('/workouts/:memberId', verifyToken, async (req, res) => {
  try {
    const workouts = await prisma.workoutPlan.findMany({
      where: { memberId: req.params.memberId },
      orderBy: { createdAt: 'desc' }
    });
    // Parse JSON strings for SQLite compatibility
    const parsed = workouts.map(w => ({ ...w, exercises: tryParse(w.exercises) }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Failed to load workout protocols." });
  }
});

// Create workout plan
router.post('/workouts', verifyToken, async (req, res) => {
  try {
    const { memberId, title, exercises, trainerName } = req.body;
    const plan = await prisma.workoutPlan.create({
      data: { 
        memberId, 
        title, 
        exercises: typeof exercises === 'string' ? exercises : JSON.stringify(exercises), 
        trainerName 
      }
    });
    res.status(201).json({ ...plan, exercises: tryParse(plan.exercises) });
  } catch (err) {
    res.status(500).json({ error: "Failed to deploy workout plan." });
  }
});

// ----------------------------------------------------
// DIET PLANS
// ----------------------------------------------------

// Get diets for a member
router.get('/diets/:memberId', verifyToken, async (req, res) => {
  try {
    const diets = await prisma.dietPlan.findMany({
      where: { memberId: req.params.memberId },
      orderBy: { createdAt: 'desc' }
    });
    const parsed = diets.map(d => ({ 
        ...d, 
        meals: tryParse(d.meals),
        macros: d.macros ? tryParse(d.macros) : null
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Failed to load nutrition protocols." });
  }
});

// Create diet plan
router.post('/diets', verifyToken, async (req, res) => {
  try {
    const { memberId, title, meals, macros } = req.body;
    const plan = await prisma.dietPlan.create({
      data: { 
        memberId, 
        title, 
        meals: typeof meals === 'string' ? meals : JSON.stringify(meals), 
        macros: typeof macros === 'string' ? macros : JSON.stringify(macros)
      }
    });
    res.status(201).json({ 
        ...plan, 
        meals: tryParse(plan.meals),
        macros: plan.macros ? tryParse(plan.macros) : null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to deploy nutrition plan." });
  }
});

// ----------------------------------------------------
// PROGRESS & TRANSFORMATION
// ----------------------------------------------------

// Get progress logs
router.get('/progress/:memberId', verifyToken, async (req, res) => {
  try {
    const logs = await prisma.progressLog.findMany({
      where: { memberId: req.params.memberId },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to load progress metrics." });
  }
});

// Post progress log (weight, bodyfat, photo)
router.post('/progress', verifyToken, async (req, res) => {
  try {
    const { memberId, weight, bodyFat, photoUrl, notes } = req.body;
    const log = await prisma.progressLog.create({
      data: { 
        memberId, 
        weight: parseFloat(weight), 
        bodyFat: parseFloat(bodyFat), 
        photoUrl, 
        notes 
      }
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to log progress metrics." });
  }
});

export default router;
