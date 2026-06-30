-- CreateTable
CREATE TABLE "translation_tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "table_name" TEXT NOT NULL,
    "customer_id" TEXT,
    "headers" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "translation_tables_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "translation_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "translation_table_id" TEXT NOT NULL,
    "row_index" INTEGER NOT NULL,
    "values" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "translation_entries_translation_table_id_fkey" FOREIGN KEY ("translation_table_id") REFERENCES "translation_tables" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "font_families" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "font_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "customer_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "font_families_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
