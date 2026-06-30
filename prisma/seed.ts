import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.material.count();
  if (existing > 0) {
    console.log("Materials already seeded.");
    return;
  }

  await prisma.material.createMany({
    data: [
      { id: "satin", name: "Satin", imageUrl: "/materials/satin.svg", displayOrder: 1 },
      { id: "cotton", name: "Cotton", imageUrl: "/materials/cotton.svg", displayOrder: 2 },
      { id: "polyester", name: "Polyester", imageUrl: "/materials/polyester.svg", displayOrder: 3 },
    ],
  });

  console.log("Seeded 3 materials.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
