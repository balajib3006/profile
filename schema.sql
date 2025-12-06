-- D1 Database Schema for Portfolio Backend
-- Migrated from SQLite schema in database.js

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Personal Details Table
CREATE TABLE IF NOT EXISTS personal_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    work_contact TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    gitlab_url TEXT,
    orcid_url TEXT,
    google_scholar_url TEXT,
    profile_picture TEXT
);

-- About Table
CREATE TABLE IF NOT EXISTS about (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary TEXT,
    experience_years TEXT,
    projects_completed TEXT,
    companies_count TEXT
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    company TEXT,
    period TEXT,
    responsibilities TEXT,
    location TEXT
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    level INTEGER
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    tags TEXT,
    image_url TEXT,
    technologies TEXT,
    features TEXT,
    cad_file TEXT
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    issuer TEXT,
    date TEXT,
    link TEXT,
    type TEXT DEFAULT 'Certification',
    embed_code TEXT
);

-- Publications Table
CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    publisher TEXT,
    date TEXT,
    link TEXT
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_notifications INTEGER DEFAULT 0,
    whatsapp_notifications INTEGER DEFAULT 0,
    notification_email TEXT,
    whatsapp_number TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certifications_type ON certifications(type);
