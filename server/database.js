const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'meesho.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const productImages = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=60'
];

function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur.trim());
    return result;
}

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price REAL,
        category TEXT,
        image TEXT,
        description TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            return;
        }

        // Check if table is empty before seeding
        db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
            if (err || (row && row.count > 0)) return;

            // Locate CSV file safely across common paths
            const possiblePaths = [
                path.resolve(__dirname, '../meesho_dataset/meesho_generated.csv'),
                path.resolve(__dirname, '../../meesho_dataset/meesho_generated.csv'),
                path.resolve(process.cwd(), 'meesho_dataset/meesho_generated.csv')
            ];

            let csvPath = null;
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    csvPath = p;
                    break;
                }
            }

            if (!csvPath) {
                console.log('Warning: meesho_generated.csv not found. Skipping auto-seed.');
                return;
            }

            try {
                const rawData = fs.readFileSync(csvPath, 'utf8');
                const lines = rawData.split('\n').filter(line => line.trim() !== '');

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION;");
                    const stmt = db.prepare(`INSERT INTO products (title, price, category, image, description) VALUES (?, ?, ?, ?, ?)`);
                    
                    for (let i = 1; i < lines.length; i++) {
                        const cols = parseCSVLine(lines[i]);
                        if (cols.length >= 14) {
                            const clean = cols.map(c => c ? c.replace(/^"|"$/g, '').trim() : '');

                            const title = clean[1] || `Product ${i}`;
                            const price = parseFloat(clean[6]) || parseFloat(clean[5]) || 299;
                            const category = clean[2] || 'General Collection';
                            const assignedImage = productImages[i % productImages.length];
                            const description = clean[13] || 'High-quality wholesale product from Meesho.';

                            stmt.run(title, price, category, assignedImage, description);
                        }
                    }
                    stmt.finalize();
                    db.run("COMMIT;", (commitErr) => {
                        if (commitErr) {
                            console.error('Error committing database transaction:', commitErr.message);
                        } else {
                            console.log('Database successfully seeded and ready!');
                        }
                    });
                });
            } catch (parseErr) {
                console.error('Error parsing dataset CSV:', parseErr.message);
            }
        });
    });
});

module.exports = db;