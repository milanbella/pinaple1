import { environment } from './environment';
import { httpPost, httpDelete } from 'pinaple_www/dist/http';
import { HttpError } from 'pinaple_www/dist/http';
import { Command } from 'commander';
import process from 'process';

let program = new Command();

const FILE = 'login_page_spec.ts';


async function createClient() {
  const FUNC = 'createClient()';
  try {
    let hres = await httpPost(`${environment.apiUrl}/client`, {
      clientName: "pinaple",
      redirectUri: "https://pinaple-app/api/token"
    });
    console.log(`created oauth client, name: 'pinaple', id: ${hres.id}`);  
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error`, err);
    throw Error('could not create client');
  }
}

async function removeClient() {
  const FUNC = 'removeClient()';
  try {
    let hres = await httpDelete(`${environment.apiUrl}/client`, {
      clientName: 'pinaple'
    });
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error`, err);
    throw Error('could not remove client');
  }
}

program.command('setup').action(async () => {
    await removeClient();
    await createClient();
  });
program.command('teardown').action(async () => {
    await removeClient();
  })

program.parse(process.argv);
