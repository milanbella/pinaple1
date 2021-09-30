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

async function getPrivateKey() {
  const key = fs.readFileSync(PRIVATE_KEY_FILE_PATH, 'utf8');
  const privateKey = await importPKCS8(key, 'RS256');
  return privateKey;
}

async function getPublicKey() {
  const key = fs.readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8');
  const publicKey = await importX509(key, 'RS256');
  return publicKey;
}

async function generateJWT() {
  const privateKey = await getPrivateKey();
  const jwt = await new SignJWT(JWT_CLAIMS).setProtectedHeader({ alg: 'RS256' }).setIssuedAt().setIssuer(JWT_ISSUER).setAudience(JWT_AUDIENCE).setExpirationTime(JWT_EXPIRATION_TIME).sign(privateKey);

  return jwt;
}

async function verifyJWT() {
  const jwt = await generateJWT();
  const publicKey = await getPublicKey();

  const { payload, protectedHeader } = await jwtVerify(jwt, publicKey, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  console.log(protectedHeader);
  console.log(payload);
}

verifyJWT();
