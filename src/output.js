const fs = require('fs');
const say = require('say');
const { copyToClipboard } = require('./clipboard');

/**
 * Salva i risultati in formato JSON
 * @param {Array} results - Array di risultati
 * @param {string} filename - Nome del file
 */
function saveAsJson(results, filename = 'video_urls.json') {
  const jsonOutput = JSON.stringify(results, null, 2);
  fs.writeFileSync(filename, jsonOutput);
  console.log(`💾 Risultati salvati in: ${filename}\n`);
}

/**
 * Salva i risultati in formato testo
 * @param {Array} results - Array di risultati
 * @param {string} filename - Nome del file
 */
function saveAsText(results, filename = 'video_urls.txt') {
  const txtOutput = results
    .map(r => r.videoUrl)
    .join('\n\n');
  fs.writeFileSync(filename, txtOutput);
  console.log(`💾 Risultati salvati in: ${filename}\n`);
}

/**
 * Stampa il riepilogo dei risultati
 * @param {Array} results - Array di risultati
 */
function printSummary(results) {
  const validUrls = results.filter(r => 
    r.videoUrl && 
    !r.videoUrl.startsWith('ERROR') && 
    r.videoUrl !== 'NOT_FOUND'
  );
  
  console.log('📊 RIEPILOGO:');
  console.log(`   Totale episodi: ${results.length}`);
  console.log(`   Video trovati: ${validUrls.length}`);
  console.log(`   Errori: ${results.filter(r => r.videoUrl.startsWith('ERROR')).length}`);
  console.log(`   Non trovati: ${results.filter(r => r.videoUrl === 'NOT_FOUND').length}\n`);
  
  return validUrls;
}

/**
 * Copia gli URL nella clipboard e riproduce audio
 * @param {Array} results - Array di risultati
 */
async function handleSuccessOutput(results) {
  const validUrls = results.filter(r => 
    r.videoUrl && 
    !r.videoUrl.startsWith('ERROR') && 
    r.videoUrl !== 'NOT_FOUND'
  ).map(r => r.videoUrl);
  
  if (validUrls.length > 0) {
    const clipboardContent = validUrls.join('\n');
    
    try {
      await copyToClipboard(clipboardContent);
      console.log('📋 URL video copiati nella clipboard!');
      console.log(`   Puoi fare CTRL+V per incollare ${validUrls.length} URL\n`);
    } catch (error) {
      console.log('⚠️  Impossibile copiare nella clipboard automaticamente');
      console.log('   Gli URL sono comunque salvati nei file video_urls.txt e video_urls.json\n');
    }
    
    console.log('🎉 SUCATO!\n');
    say.speak('SUCATO', null, 1.0, (err) => {
      if (err) {
        console.log('⚠️  Non è stato possibile riprodurre l\'audio');
      }
    });
  } else {
    console.log('⚠️  Nessun URL valido trovato, clipboard non copiata\n');
  }
}

module.exports = {
  saveAsJson,
  saveAsText,
  printSummary,
  handleSuccessOutput
};