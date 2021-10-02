/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: [ "**/dist/**/__tests__/**/*.[jt]s?(x)" ]
};
