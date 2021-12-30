const { Pool } = require('pg');
import { PROJECT } from './common';

const FILE = 'pool.ts'

type tPool = any;

export interface IResult {
  rows: any[];
}
export async function query(pool: tPool, sql: string, values?: any[]): Promise<IResult> {
  const FUNC = 'query()';

  if (!pool) {
    console.error(`${PROJECT}:${FILE}:${FUNC}: pool not initialized, call initPool() to initialize it`);
    return Promise.reject(new Error('pool not initialized'));
  }

  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        release()
        console.error(`${PROJECT}:${FILE}:${FUNC}: pool error: sql: ${sql}`, err);
        reject(err);
        return;
      }
      client.query(sql, values, (err, res) => {
        release();
        if (err) {
          console.error(`${PROJECT}:${FILE}:${FUNC}: query error: sql: ${sql}`, err);
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

export async function getClient(pool: tPool): Promise<IClient> {
  const FUNC = 'getClient()';

  if (!pool) {
    console.error(`${PROJECT}:${FILE}:${FUNC}: pool not initialized, call initPool() to initialize it`);
    return Promise.reject(new Error('pool not initialized'));
  }

  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        release()
        console.error(`${PROJECT}:${FILE}:${FUNC}: pool error: ${err}`, err);
        reject(err);
        return;
      }
      resolve(client as IClient);
    })
  });
}

export function initPool(user: string, host: string, database: string, password: string, port: number): tPool {
  const FUNC = 'initPool()';
  let opts = {
    user: user,
    host: host,
    database: database,
    password: password,
    port: port,
  }
  let pool = new Pool(opts);
  return pool;
}

export function releasePool(pool: tPool): Promise<any> {
  return pool.end();
}
