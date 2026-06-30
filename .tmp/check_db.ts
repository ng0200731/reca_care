import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Customers:', await prisma.customer.count());
    console.log('TranslationTables:', await prisma.translationTable.count());
    console.log('FontFamilies:', await prisma.fontFamily.count());
    const tables = await prisma.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('Tables:', (tables as {name: string}[]).map(t => t.name).join(', '));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
