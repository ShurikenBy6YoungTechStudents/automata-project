import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export async function initDatabase() {
    if (db) return db;
    
    const dbPath = path.join(__dirname, 'automata.db');
    
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);
    
    return db;
}

export async function getDatabase() {
    if (!db) {
        await initDatabase();
    }
    return db;
}