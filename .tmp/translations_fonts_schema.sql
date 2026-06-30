-- Exported from docs/left-menu-translation-font.md
-- Tables for Customer, Translation, and Font Family modules

CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    email_domain TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_type TEXT,
    member_name TEXT,
    member_title TEXT
);

CREATE TABLE translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    customer_id TEXT,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE fonts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    font_name TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    customer_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
