const { Pool } = require('pg');

const pool = new Pool();
const FILE = 'pool.ts'

interface IResult {
  rows: any[];
}
async function query(sql: string, values: any[]): Promise<IResult> {
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
        Promise.resolve(res as IResult);
      });
    })
  })
}
