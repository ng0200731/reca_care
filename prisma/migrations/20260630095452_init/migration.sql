-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "layouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "layout_details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "layout_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "width_mm" REAL NOT NULL,
    "height_mm" REAL NOT NULL,
    "orientation" TEXT NOT NULL,
    "cutting_type" TEXT NOT NULL,
    "loop_fold_orientation" TEXT,
    "loop_mid_form" BOOLEAN,
    "loop_fold_distance_mm" REAL,
    "padding_option" TEXT NOT NULL,
    "padding_top" REAL NOT NULL DEFAULT 0,
    "padding_right" REAL NOT NULL DEFAULT 0,
    "padding_bottom" REAL NOT NULL DEFAULT 0,
    "padding_left" REAL NOT NULL DEFAULT 0,
    "padding_r2_top" REAL NOT NULL DEFAULT 0,
    "padding_r2_right" REAL NOT NULL DEFAULT 0,
    "padding_r2_bottom" REAL NOT NULL DEFAULT 0,
    "padding_r2_left" REAL NOT NULL DEFAULT 0,
    "view_mode" TEXT NOT NULL DEFAULT 'side-by-side',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "layout_details_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "layouts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "layout_details_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "layouts_name_key" ON "layouts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "layout_details_layout_id_key" ON "layout_details"("layout_id");
