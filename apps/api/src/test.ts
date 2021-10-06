import { environment } from './environment';
import { initPool, releasePool, query  } from 'www/dist/pool';

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

async function testit() {
  await query("update code set issued_at=$1 where id=$2", [new Date(), 'xxx']);
}

testit().then(() => {
  console.log('success');
}, (err) => {
  console.error(`error: $err`, err);
})
