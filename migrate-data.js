const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
const outputPath = path.join(__dirname, 'data-migration.sql');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

const tables = [
    'users',
    'personal_details',
    'about',
    'experience',
    'skills',
    'projects',
    'messages',
    'certifications',
    'publications',
    'notification_settings'
];

let sqlStatements = [];

function escapeSQL(value) {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (typeof value === 'number') {
        return value;
    }
    // Escape single quotes by doubling them
    return `'${String(value).replace(/'/g, "''")}'`;
}

function exportTable(tableName) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) {
                console.error(`❌ Error reading ${tableName}:`, err.message);
                reject(err);
                return;
            }

            if (rows.length === 0) {
                console.log(`⚠️  Table ${tableName} is empty`);
                resolve();
                return;
            }

            console.log(`✅ Exporting ${rows.length} rows from ${tableName}`);

            rows.forEach(row => {
                const columns = Object.keys(row).filter(col => col !== 'id');
                const values = columns.map(col => escapeSQL(row[col]));

                const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
                sqlStatements.push(insertSQL);
            });

            resolve();
        });
    });
}

async function exportAllTables() {
    console.log('🔄 Starting data export...\n');

    for (const table of tables) {
        await exportTable(table);
    }

    // Write to file
    const fileContent = [
        '-- Data Migration from SQLite to Cloudflare D1',
        `-- Generated: ${new Date().toISOString()}`,
        '-- Import this file using: wrangler d1 execute portfolio-db --file=data-migration.sql',
        '',
        ...sqlStatements
    ].join('\n');

    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`\n✅ Migration SQL written to: ${outputPath}`);
    console.log(`📊 Total statements: ${sqlStatements.length}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Create D1 database: wrangler d1 create portfolio-db`);
    console.log(`   2. Update wrangler.toml with the database_id`);
    console.log(`   3. Apply schema: wrangler d1 execute portfolio-db --file=schema.sql`);
    console.log(`   4. Import data: wrangler d1 execute portfolio-db --file=data-migration.sql`);

    db.close();
}

exportAllTables().catch(err => {
    console.error('❌ Export failed:', err);
    process.exit(1);
});
