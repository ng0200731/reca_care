import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'node:path';

const dbPath = path.join('D:', 'project', 'illustrator_etimed_layout', 'database.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
    console.log('Reference tables:', (tables as {name: string}[]).map(t => t.name).join(', '));

    for (const table of (tables as {name: string}[]).map(t => t.name)) {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`  ${table}: ${(result as {count: number}[])[0].count}`);
      } catch (e) {
        console.log(`  ${table}: error counting`);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
