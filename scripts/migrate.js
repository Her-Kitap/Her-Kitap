/**
 * migrations/ altındaki NNN_*.sql dosyalarını sürüme göre sırayla uygular.
 * Uygulanan sürümler schema_migrations tablosunda tutulur.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const migrationsDir = path.join(__dirname, '..', 'migrations');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'herkitap',
    max: 2
});

async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

function listMigrationFiles() {
    if (!fs.existsSync(migrationsDir)) {
        return [];
    }
    return fs
        .readdirSync(migrationsDir)
        .filter((f) => /^\d{3}_.+\.sql$/i.test(f))
        .sort((a, b) => {
            const va = parseInt(a.slice(0, 3), 10);
            const vb = parseInt(b.slice(0, 3), 10);
            return va - vb;
        });
}

async function main() {
    const client = await pool.connect();
    try {
        await ensureMigrationsTable(client);

        const files = listMigrationFiles();
        if (files.length === 0) {
            console.log('migrations/ altında NNN_*.sql dosyası bulunamadı.');
            return;
        }

        for (const file of files) {
            const version = parseInt(file.slice(0, 3), 10);
            const { rows } = await client.query(
                'SELECT 1 FROM schema_migrations WHERE version = $1',
                [version]
            );
            if (rows.length > 0) {
                console.log(`Atlandı (zaten uygulandı): ${file}`);
                continue;
            }

            const sqlPath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(sqlPath, 'utf8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
                    [version, file]
                );
                await client.query('COMMIT');
                console.log(`Uygulandı: ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            }
        }
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Migration hatası:', err.message);
    process.exit(1);
});
