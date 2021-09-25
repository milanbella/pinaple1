const { importPKCS8 } = require('jose/key/import');
const { importX509 } = require('jose/key/import');
const { SignJWT } = require('jose/jwt/sign');
const { jwtVerify } = require('jose/jwt/verify');

const fs = require('fs');

async function getPrivateKey() {
  const key = fs.readFileSync('certs/key-pkcs8.pem', 'utf8')
  const privateKey = await importPKCS8(key, 'RS256')
  return privateKey;
}

async function getPublicKey() {
  const key = fs.readFileSync('certs/cert.pem', 'utf8')
  const publicKey = await importX509(key, 'RS256')
  return publicKey;
}

async function generateJWT() {
  const privateKey = await getPrivateKey();
  const jwt = await new SignJWT({ 'urn:example:claim': true })
  .setProtectedHeader({ alg: 'RS256' })
  .setIssuedAt()
  .setIssuer('urn:example:issuer')
  .setAudience('urn:example:audience')
  .setExpirationTime('2h')
  .sign(privateKey);

  return jwt;
}

async function verifyJWT() {
  const jwt = await generateJWT();
  const publicKey = await getPublicKey();

  const { payload, protectedHeader } = await jwtVerify(jwt, publicKey, {
    issuer: 'urn:example:issuer',
    audience: 'urn:example:audience'
  });

  console.log(protectedHeader)
  console.log(payload)
}

verifyJWT();

