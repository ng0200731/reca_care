import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'node:path';

const dbPath = path.join('D:', 'project', 'illustrator_etimed_layout', 'database.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const tables = ['customers', 'members', 'translations', 'fonts'];
    for (const table of tables) {
      console.log(`\n=== ${table} ===`);
      const cols = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`);
      for (const col of cols as {cid: number, name: string, type: string, notnull: number, dflt_value: string | null, pk: number}[]) {
        const pk = col.pk ? ' PK' : '';
        const nn = col.notnull ? ' NOT NULL' : '';
        const def = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
        console.log(`  ${col.name} ${col.type}${nn}${def}${pk}`);
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
