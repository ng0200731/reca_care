/*
  Warnings:

  - You are about to drop the `translation_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `headers` on the `translation_tables` table. All the data in the column will be lost.
  - Added the required column `data` to the `translation_tables` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "translation_entries";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_translation_tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "table_name" TEXT NOT NULL,
    "customer_id" TEXT,
    "data" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "translation_tables_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_translation_tables" ("created_at", "customer_id", "id", "table_name", "updated_at") SELECT "created_at", "customer_id", "id", "table_name", "updated_at" FROM "translation_tables";
DROP TABLE "translation_tables";
ALTER TABLE "new_translation_tables" RENAME TO "translation_tables";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
