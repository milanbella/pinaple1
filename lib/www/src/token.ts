const { importPKCS8 } = require('jose/key/import');
const { importX509 } = require('jose/key/import');
const { SignJWT } = require('jose/jwt/sign');
const { jwtVerify } = require('jose/jwt/verify');

const fs = require('fs');

const PRIVATE_KEY_FILE_PATH = 'certs/key-pkcs8.pem';
const PUBLIC_KEY_FILE_PATH = 'certs/cert.pem';
const JWT_CLAIMS = {
  'urn:example:claim': true,
};
const JWT_ISSUER = 'pinaple1';
const JWT_AUDIENCE = 'api';
const JWT_EXPIRATION_TIME = '2h';

export function readKeyFromFs(keyFilePath: string): string {
  let key = fs.readFileSync(keyFilePath, 'utf8');
  return key;
}

export async function importPrivateKey(privateKey: string): Promise<any> {
  let key = await importPKCS8(privateKey, 'RS256');
  return key;
}

export async function importPublicKey(publicKey: string): Promise<any> {
  let key = await importX509(publicKey, 'RS256');
  return key;
}

export async function generateJWT(privateKey: any, expiresIn: string): Promise<string> {
  const jwt = await new SignJWT(JWT_CLAIMS).setProtectedHeader({ alg: 'RS256' }).setIssuedAt().setIssuer(JWT_ISSUER).setAudience(JWT_AUDIENCE).setExpirationTime(expiresIn).sign(privateKey);

  return jwt;
}

export async function verifyJWT(jwt: string, publicKey: any): Promise<{payload: any; protectedHeader: any}> {
  const { payload, protectedHeader } = await jwtVerify(jwt, publicKey, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  return {
    payload: payload,
    protectedHeader: protectedHeader,
  }
}

