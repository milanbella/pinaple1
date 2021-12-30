import { environment } from './environment';
import { initPool, releasePool, query  } from 'pinaple_www/dist/pool';

const pool = initPool(environment.pgAuthUser, environment.pgAuthHost, environment.pgAuthDatabase, environment.pgAuthPassword, environment.pgAuthPort); 

async function testit() {
  await query(pool, "update code set issued_at=$1 where id=$2", [new Date(), 'xxx']);
}

testit().then(() => {
  console.log('success');
}, (err) => {
  console.error(`error: $err`, err);
})
