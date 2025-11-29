import { PrismaClient } from '@prisma/client';

// Mencegah multiple instance saat hot-reloading di development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;