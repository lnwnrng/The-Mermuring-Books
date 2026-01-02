import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { hashPassword } from '../utils/auth';

async function main() {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const existing = await prisma.user.findUnique({ where: { email: env.adminEmail } });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    return;
  }

  const passwordHash = await hashPassword(env.adminPassword);
  const admin = await prisma.user.create({
    data: {
      email: env.adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  console.log('Admin created:', admin.email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
