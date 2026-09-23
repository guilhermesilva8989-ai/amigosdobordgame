import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client.js';

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`A variável ${name} não foi configurada.`);
  }

  return value;
}

async function main(): Promise<void> {
  const connectionString = requiredEnvironment('DATABASE_URL');
  const name = requiredEnvironment('ADMIN_NAME');
  const email = requiredEnvironment('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnvironment('ADMIN_PASSWORD');

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD deve possuir pelo menos 12 caracteres.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  const passwordHash = await hash(password);

  try {
    const existing = await prisma.admin.findUnique({
      where: { email },
      select: { deletedAt: true },
    });

    if (existing?.deletedAt) {
      throw new Error('Este e-mail pertence a uma conta removida. Use outro e-mail.');
    }

    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        isActive: true,
        deletedAt: null,
      },
      create: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    console.log('Administrador configurado:', admin);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Erro ao configurar administrador:', error);
  process.exitCode = 1;
});
