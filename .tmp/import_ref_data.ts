import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'node:path';

const refDbPath = path.join('D:', 'project', 'illustrator_etimed_layout', 'database.db');
const currentDbPath = path.join(process.cwd(), 'dev.db');

const refAdapter = new PrismaLibSql({ url: `file:${refDbPath}` });
const refPrisma = new PrismaClient({ adapter: refAdapter });

const currentAdapter = new PrismaLibSql({ url: `file:${currentDbPath}` });
const currentPrisma = new PrismaClient({ adapter: currentAdapter });

async function main() {
  try {
    const refCustomers = await refPrisma.$queryRawUnsafe(`SELECT * FROM customers`) as any[];
    const refMembers = await refPrisma.$queryRawUnsafe(`SELECT * FROM members`) as any[];
    const refTranslations = await refPrisma.$queryRawUnsafe(`SELECT * FROM translations`) as any[];
    const refFonts = await refPrisma.$queryRawUnsafe(`SELECT * FROM fonts`) as any[];

    const validCustomerIds = new Set(refCustomers.map((c) => c.customer_id));

    console.log(`Importing ${refCustomers.length} customers...`);
    for (const c of refCustomers) {
      await currentPrisma.customer.create({
        data: {
          customerId: c.customer_id,
          companyName: c.company_name,
          emailDomain: c.email_domain,
          email: c.email,
          phone: c.phone,
          address: c.address,
          notes: c.notes,
          companyType: c.company_type,
          memberName: c.member_name,
          memberTitle: c.member_title,
          createdAt: c.created_at ? new Date(c.created_at) : undefined,
          updatedAt: c.updated_at ? new Date(c.updated_at) : undefined,
        },
      });
    }

    const validMembers = refMembers.filter((m) => validCustomerIds.has(m.customer_id));
    const skippedMembers = refMembers.length - validMembers.length;
    console.log(`Importing ${validMembers.length} members... (${skippedMembers} orphaned skipped)`);
    for (const m of validMembers) {
      await currentPrisma.member.create({
        data: {
          memberId: m.member_id,
          customerId: m.customer_id,
          name: m.name,
          title: m.title,
          email: m.email,
          phone: m.phone,
          createdAt: m.created_at ? new Date(m.created_at) : undefined,
          updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
        },
      });
    }

    const validTranslations = refTranslations.filter((t) => !t.customer_id || validCustomerIds.has(t.customer_id));
    console.log(`Importing ${validTranslations.length} translations...`);
    for (const t of validTranslations) {
      await currentPrisma.translationTable.create({
        data: {
          name: t.table_name,
          customerId: t.customer_id,
          data: t.data,
          createdAt: t.created_at ? new Date(t.created_at) : undefined,
          updatedAt: t.updated_at ? new Date(t.updated_at) : undefined,
        },
      });
    }

    const validFonts = refFonts.filter((f) => !f.customer_id || validCustomerIds.has(f.customer_id));
    console.log(`Importing ${validFonts.length} fonts...`);
    for (const f of validFonts) {
      await currentPrisma.fontFamily.create({
        data: {
          name: f.font_name,
          fileName: f.filename,
          filePath: f.file_path,
          customerId: f.customer_id,
          createdAt: f.created_at ? new Date(f.created_at) : undefined,
        },
      });
    }

    console.log('Import complete.');
    console.log('Customers:', await currentPrisma.customer.count());
    console.log('Members:', await currentPrisma.member.count());
    console.log('Translations:', await currentPrisma.translationTable.count());
    console.log('Fonts:', await currentPrisma.fontFamily.count());
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await refPrisma.$disconnect();
    await currentPrisma.$disconnect();
  }
}

main();
