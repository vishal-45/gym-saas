import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Ensure WebSockets are used (required for Neon in Node environments)
neonConfig.webSocketConstructor = ws;

// Initialize connection pool
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// Pass adapter to Prisma
const prisma = new PrismaClient({ adapter });

export default prisma;
