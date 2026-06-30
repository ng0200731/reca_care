import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'node:path';

const refDbPath = path.join('D:', 'project', 'illustrator_etimed_layout', 'database.db');
const adapter = new PrismaLibSql({ url: `file:${refDbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const customerIds = await prisma.$queryRawUnsafe(`SELECT DISTINCT customer_id FROM customers`) as {customer_id: string}[];
    const memberCustomerIds = await prisma.$queryRawUnsafe(`SELECT DISTINCT customer_id FROM members`) as {customer_id: string}[];
    const missing = memberCustomerIds.filter(m => !customerIds.some(c => c.customer_id === m.customer_id));
    console.log('Customer IDs:', customerIds.map(c => c.customer_id));
    console.log('Member customer IDs:', memberCustomerIds.map(m => m.customer_id));
    console.log('Missing:', missing.map(m => m.customer_id));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
