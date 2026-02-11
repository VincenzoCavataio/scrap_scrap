/**
 * Estrae e valida gli argomenti da linea di comando
 * @param {string[]} args - Argomenti da process.argv.slice(2)
 * @returns {Object} Oggetto con url e headless
 * @throws {Error} Se url non è specificato
 */
function parseArgs(args) {
  let siteUrl = null;
  let headless = true;
  
  for (const arg of args) {
    if (arg.startsWith('url=')) {
      siteUrl = arg.split('=')[1];
      if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
        siteUrl = 'https://' + siteUrl;
      }
    } else if (arg.startsWith('headless=')) {
      const value = arg.split('=')[1].toLowerCase();
      headless = value !== 'false' && value !== '0';
    }
  }
  
  if (!siteUrl) {
    throw new Error('URL non specificato');
  }
  
  return { siteUrl, headless };
}

/**
 * Stampa le istruzioni di utilizzo
 */
function printUsage() {
  console.log('❌ Errore: URL non specificato!');
  console.log('\n📝 Utilizzo:');
  console.log('   node index.js url=www.esempio.com');
  console.log('   node index.js url=https://www.esempio.com');
  console.log('   node index.js url=www.esempio.com headless=false');
  console.log('\nOppure:');
  console.log('   npm start -- url=www.esempio.com\n');
}

module.exports = { parseArgs, printUsage };