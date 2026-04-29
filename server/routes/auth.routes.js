import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Register New Gym Tenant
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, tier } = req.body;

    // Check if exists
    const existingTenant = await prisma.tenant.findFirst({ where: { email } });
    if (existingTenant) {
      return res.status(400).json({ error: "A gym with this email is already registered." });
    }

    // Hash Password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to DB
    const newTenant = await prisma.tenant.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tier: tier || 'Starter'
      }
    });

    res.status(201).json({ message: "Tenant successfully provisioned.", tenantId: newTenant.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error during provisioning." });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // SUPER ADMIN GOD-MODE OVERRIDE
    if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'GOD-MODE', role: 'SUPER_ADMIN' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ 
        token, 
        tenant: { role: 'SUPER_ADMIN', name: 'Super Admin', email } 
      });
    }

    // NORMAL TENANT VALIDATION
    const tenant = await prisma.tenant.findFirst({ where: { email } });
    if (!tenant) return res.status(400).json({ error: "Invalid credentials." });

    if (tenant.status === 'Suspended') {
      return res.status(403).json({ error: "Your account is suspended. Please contact platform support." });
    }

    const validPassword = await bcrypt.compare(password, tenant.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    // Generate JWT
    const token = jwt.sign(
      { id: tenant.id, tenantId: tenant.id, name: tenant.name, tier: tenant.tier },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      tenant: { id: tenant.id, name: tenant.name, email: tenant.email, tier: tenant.tier } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error during authentication." });
  }
});

// Member Login
router.post('/member-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const member = await prisma.member.findFirst({ where: { email } });
    if (!member) return res.status(400).json({ error: "Invalid member credentials." });

    if (member.status === 'Suspended') {
      return res.status(403).json({ error: "Your membership is suspended. Please contact your gym." });
    }

    if (!member.password) {
      return res.status(400).json({ error: "No password has been set up for this account. Please ask your gym to resend your provision portal link." });
    }

    const validPassword = await bcrypt.compare(password, member.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid member credentials." });

    // Generate JWT for Member
    const token = jwt.sign(
      { id: member.id, tenantId: member.tenantId, name: member.name, role: 'MEMBER', plan: member.plan },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      tenant: { id: member.id, name: member.name, email: member.email, role: 'MEMBER', plan: member.plan, tenantId: member.tenantId } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error during member authentication." });
  }
});

// Trainer Login
router.post('/trainer-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const trainer = await prisma.trainer.findFirst({ where: { email } });
    if (!trainer) return res.status(400).json({ error: "No trainer account found with this email." });

    if (trainer.status === 'Inactive') {
      return res.status(403).json({ error: "Your account has been deactivated. Contact your gym admin." });
    }

    if (!trainer.password) {
      return res.status(400).json({ error: "No password set. Ask your gym admin to set one for you." });
    }

    const validPassword = await bcrypt.compare(password, trainer.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { id: trainer.id, tenantId: trainer.tenantId, name: trainer.name, role: 'TRAINER', specialty: trainer.specialty },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      tenant: { id: trainer.id, name: trainer.name, email: trainer.email, role: 'TRAINER', tenantId: trainer.tenantId }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Authentication failure." });
  }
});

// Staff Login
router.post('/staff-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const staff = await prisma.staff.findFirst({ where: { email } });
    if (!staff) return res.status(400).json({ error: "No staff account found with this email." });

    if (staff.status === 'Inactive') {
      return res.status(403).json({ error: "Your account has been deactivated. Contact your gym admin." });
    }

    if (!staff.password) {
      return res.status(400).json({ error: "No password set. Ask your gym admin to set one for you." });
    }

    const validPassword = await bcrypt.compare(password, staff.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { 
        id: staff.id, 
        tenantId: staff.tenantId, 
        name: staff.name, 
        role: 'STAFF', 
        staffRole: staff.role,
        permissions: staff.permissions ? JSON.parse(staff.permissions) : []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      tenant: { 
        id: staff.id, 
        name: staff.name, 
        email: staff.email, 
        role: 'STAFF', 
        staffRole: staff.role, 
        tenantId: staff.tenantId,
        permissions: staff.permissions ? JSON.parse(staff.permissions) : []
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Authentication failure." });
  }
});

export default router;
