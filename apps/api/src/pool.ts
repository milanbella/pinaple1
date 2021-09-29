const { Pool } = require('pg');

const pool = new Pool();
const FILE = 'pool.ts'

async function query<T>(sql: string, values: any[]): Promise<T> {
  const FUNC = 'query()';
  return new Promise(() => {
    pool.connect((err, client, release) => {
      if (err) {
        release()
        console.error(`${FILE}:${FUNC}: pool error: sql: ${sql}`, err);
        Promise.reject(new Error('pool error'));
        return;
      }
      client.query(sql, values, (err, res) => {
        release();
        if (err) {
          console.error(`${FILE}:${FUNC}: query error: sql: ${sql}`, err);
          Promise.reject(new Error('query error'));
          return;
        }
        Promise.resolve(res as T);
      });
    })
  })
}
