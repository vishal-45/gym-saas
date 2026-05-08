import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import membersRoutes from './routes/members.routes.js';
import classesRoutes from './routes/classes.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import vaultRoutes from './routes/vault.routes.js';
import trainersRoutes from './routes/trainers.routes.js';
import staffRoutes from './routes/staff.routes.js';
import plansRoutes from './routes/plans.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import { runGlobalRetentionScan } from './services/retention.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CoreFitness SaaS Backend Engine Online' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Secure Authentication Engine running on port ${PORT}`);
  });
}

// Global Error Handler for Serverless Stability
app.use((err, req, res, next) => {
  console.error("Serverless Runtime Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;
