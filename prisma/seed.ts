import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type GlobalRole } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Contas iniciais para demonstração (issue 002). Senhas podem ser
// sobrescritas por variáveis de ambiente; os valores padrão servem apenas
// para o ambiente local/demo do TCC.
const accounts = [
  {
    name: "Administração Solydaries",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@solydaries.dev",
    password: process.env.SEED_ADMIN_PASSWORD ?? "admin12345",
    role: "ADMIN" as GlobalRole,
  },
  {
    name: "Moderação Solydaries",
    email: process.env.SEED_MODERATOR_EMAIL ?? "moderacao@solydaries.dev",
    password: process.env.SEED_MODERATOR_PASSWORD ?? "modera12345",
    role: "MODERATOR" as GlobalRole,
  },
];

async function main() {
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const person = await prisma.person.upsert({
      where: { email: account.email },
      update: { role: account.role },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        termsAcceptedAt: new Date(),
      },
    });
    console.log(`OK ${person.role}: ${person.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
