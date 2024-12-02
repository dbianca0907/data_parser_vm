module.exports = {
  preset: 'ts-jest',  // Folosește preset-ul pentru TypeScript
  testEnvironment: 'node',  // Mediul de testare Node.js
  testMatch: ['<rootDir>/tests/*.tests.ts'],  // Căutarea fișierelor de test
  verbose: true  // Detalii suplimentare în timpul testării
};