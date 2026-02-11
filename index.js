const main = require('./src/main');

main().catch(error => {
  console.error('❌ Errore fatale:', error.message);
  process.exit(1);
});