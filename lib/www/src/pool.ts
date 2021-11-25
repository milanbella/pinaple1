const { Pool } = require('pg');

const FILE = 'pool.ts'

let pool;

export interface IResult {
  rows: any[];
}
export async function query(sql: string, values?: any[]): Promise<IResult> {
  const FUNC = 'query()';

  if (!pool) {
    console.error(`${FILE}:${FUNC}: pool not initialized, call initPool() to initialize it`);
    return Promise.reject(new Error('pool not initialized'));
  }

  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        release()
        console.error(`${FILE}:${FUNC}: pool error: sql: ${sql}`, err);
        reject(err);
        return;
      }
      client.query(sql, values, (err, res) => {
        release();
        if (err) {
          console.error(`${FILE}:${FUNC}: query error: sql: ${sql}`, err);
          reject(err);
          return;
        }
        resolve(res as IResult);
      });
    })
  })
}


export interface IClient {
  query: (sql: string, values?: any[]) => Promise<IResult>;
  end: () => Promise<void>;
}

export async function getClient(): Promise<IClient> {
  const FUNC = 'getClient()';

  if (!pool) {
    console.error(`${FILE}:${FUNC}: pool not initialized, call initPool() to initialize it`);
    return Promise.reject(new Error('pool not initialized'));
  }

  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        release()
        console.error(`${FILE}:${FUNC}: pool error: ${err}`, err);
        reject(err);
        return;
      }
      resolve(client as IClient);
    })
  });
}

export function initPool(user: string, host: string, database: string, password: string, port: number) {
  const FUNC = 'initPool()';
  if (pool) {
    console.error(`${FILE}:${FUNC}: pool already initialized`);
    throw new Error('pool already initialized');
  }
  let opts = {
    user: user,
    host: host,
    database: database,
    password: password,
    port: port,
  }
  pool = new Pool(opts);
}

export function releasePool(): Promise<any> {
  return pool.end();
}
