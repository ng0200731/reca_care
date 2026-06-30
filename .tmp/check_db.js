const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    console.log('Customers:', await prisma.customer.count());
    console.log('TranslationTables:', await prisma.translationTable.count());
    console.log('FontFamilies:', await prisma.fontFamily.count());
    const tables = await prisma.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('Tables:', tables.map(t => t.name).join(', '));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
