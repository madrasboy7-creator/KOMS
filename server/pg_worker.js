import { parentPort } from 'node:worker_threads';
import pg from 'pg';

const { Pool } = pg;

function translateQuery(sql) {
  let paramIndex = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let out = '';

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (inSingleQuote) {
      out += c;
      if (c === "'") {
        if (sql[i + 1] === "'") {
          out += sql[++i];
        } else {
          inSingleQuote = false;
        }
      }
    } else if (inDoubleQuote) {
      out += c;
      if (c === '"') {
        if (sql[i + 1] === '"') {
          out += sql[++i];
        } else {
          inDoubleQuote = false;
        }
      }
    } else {
      if (c === "'") {
        inSingleQuote = true;
        out += c;
      } else if (c === '"') {
        inDoubleQuote = true;
        out += c;
      } else if (c === '?') {
        out += `$${paramIndex++}`;
      } else {
        out += c;
      }
    }
  }

  // Replace common SQLite idioms with PostgreSQL equivalents
  out = out.replace(/datetime\('now'\)/gi, 'NOW()');
  out = out.replace(/date\('now'\)/gi, 'CURRENT_DATE');
  out = out.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');

  return out;
}

parentPort.on('message', ({ port, sab, connectionString }) => {
  const notify = new Int32Array(sab);

  const ssl = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false };

  const pool = new Pool({
    connectionString,
    ssl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Ready signal
  port.on('message', async ({ type, sql, params }) => {
    try {
      if (type === 'exec') {
        await pool.query(sql);
        port.postMessage({ success: true });
      } else if (type === 'run') {
        let pgSql = translateQuery(sql);
        const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
        const hasReturning = /RETURNING/i.test(pgSql);

        if (isInsert && !hasReturning) {
          pgSql += ' RETURNING id';
        }

        const res = await pool.query(pgSql, params || []);
        const lastInsertRowid = res.rows && res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : null;
        port.postMessage({
          success: true,
          result: {
            changes: res.rowCount || 0,
            lastInsertRowid,
          },
        });
      } else if (type === 'get') {
        const pgSql = translateQuery(sql);
        const res = await pool.query(pgSql, params || []);
        port.postMessage({
          success: true,
          result: res.rows && res.rows.length > 0 ? res.rows[0] : undefined,
        });
      } else if (type === 'all') {
        const pgSql = translateQuery(sql);
        const res = await pool.query(pgSql, params || []);
        port.postMessage({
          success: true,
          result: res.rows || [],
        });
      }
    } catch (err) {
      port.postMessage({
        success: false,
        error: err.message,
      });
    } finally {
      Atomics.store(notify, 0, 1);
      Atomics.notify(notify, 0, 1);
    }
  });

  // Signal worker is ready
  Atomics.store(notify, 0, 999);
  Atomics.notify(notify, 0, 1);
});
