const puppeteer = require('puppeteer');
const fs = require('fs');
const clipboardy = require('clipboardy');
const say = require('say');

// Configurazione retry
const MAX_RETRIES = 3; // Numero massimo di tentativi per ogni episodio

async function main() {
  // Leggi l'URL dagli argomenti del terminale
  const args = process.argv.slice(2);
  let siteUrl = null;
  
  // Cerca l'argomento url=...
  for (const arg of args) {
    if (arg.startsWith('url=')) {
      siteUrl = arg.split('=')[1];
      // Aggiungi https:// se manca
      if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
        siteUrl = 'https://' + siteUrl;
      }
      break;
    }
  }
  
  // Se non è stato passato l'URL, chiedi di inserirlo
  if (!siteUrl) {
    console.log('❌ Errore: URL non specificato!');
    console.log('\n📝 Utilizzo:');
    console.log('   node scraper.js url=www.esempio.com');
    console.log('   node scraper.js url=https://www.esempio.com');
    console.log('\nOppure:');
    console.log('   npm start -- url=www.esempio.com\n');
    process.exit(1);
  }

  // Avvia il browser
  const browser = await puppeteer.launch({
    headless: true, // Metti true se non vuoi vedere il browser
    defaultViewport: null,
    args: ['--start-maximized']
  });

  // Array per salvare tutti i video URLs
  const videoResults = [];

  try {
    const page = await browser.newPage();
    
    console.log(`🌐 Navigando verso ${siteUrl}...`);
    await page.goto(siteUrl, { waitUntil: 'networkidle2' });
    
    // Aspetta che gli elementi .episode > a siano presenti
    await page.waitForSelector('.episode > a', { timeout: 10000 });
    
    // Estrai tutti i link
    const links = await page.evaluate(() => {
      return [...document.querySelectorAll(".episode > a")]
        .map(a => a.href);
    });
    
    console.log(`\n📋 Trovati ${links.length} link:\n`);
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link}`);
    });
    
    // Pronuncia "SUCATO" (versione Node.js - usando il log)
    console.log('\n🎉 SUCATO!\n');
    
    // Ora clicca su ogni link
    console.log('🖱️  Iniziando a cliccare sui link ed estrarre video URLs...\n');
    
    for (let i = 0; i < links.length; i++) {
      console.log(`\n[${i + 1}/${links.length}] Cliccando su: ${links[i]}`);
      
      let videoUrl = null;
      let retryCount = 0;
      let success = false;
      
      // Loop di retry
      while (retryCount <= MAX_RETRIES && !success) {
        if (retryCount > 0) {
          console.log(`   🔄 Tentativo ${retryCount}/${MAX_RETRIES}...`);
        }
        
        let newPage = null;
        
        try {
          newPage = await browser.newPage();
          await newPage.goto(links[i], { waitUntil: 'networkidle2' });
          
          // Clicca sull'elemento #alternative
          console.log('   🖱️  Cliccando su #alternative...');
          await newPage.waitForSelector('#alternative', { timeout: 10000 });
          await newPage.click('#alternative');
          
          // Aspetta un attimo che il DOM si aggiorni dopo il click
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Aspetta che l'iframe player-iframe sia presente nel DOM
          console.log('   ⏳ Aspettando l\'iframe player-iframe...');
          await newPage.waitForSelector('#player-iframe', { timeout: 15000 });
          
          // Estrai l'URL del video dall'iframe
          videoUrl = await newPage.evaluate(() => {
            const iframe = document.querySelector('#player-iframe');
            if (!iframe) return null;
            
            // Accedi al contenuto dell'iframe
            try {
              const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
              const video = iframeDocument.querySelector('video');
              
              if (video && video.src) {
                return video.src;
              }
              
              // Prova anche con source tag
              const source = iframeDocument.querySelector('video source');
              if (source && source.src) {
                return source.src;
              }
            } catch (e) {
              // Se l'iframe è cross-origin, prova a prendere il src dell'iframe stesso
              return iframe.src;
            }
            
            return null;
          });
          
          if (videoUrl) {
            console.log(`   ✅ Video URL trovato: ${videoUrl}`);
            videoResults.push({
              episodeLink: links[i],
              videoUrl: videoUrl,
              index: i + 1
            });
            success = true;
          } else {
            console.log(`   ⚠️  Nessun video URL trovato`);
            retryCount++;
          }
          
        } catch (error) {
          console.log(`   ❌ Errore: ${error.message}`);
          retryCount++;
        } finally {
          // Chiudi la tab in modo sicuro
          if (newPage) {
            try {
              await newPage.close();
            } catch (closeError) {
              // Ignora errori durante la chiusura
            }
          }
        }
        
        // Piccola pausa tra i retry per evitare sovraccarichi
        if (!success && retryCount <= MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Se dopo tutti i retry non ha trovato nulla
      if (!success) {
        console.log(`   ❌ Fallito dopo ${MAX_RETRIES} tentativi`);
        videoResults.push({
          episodeLink: links[i],
          videoUrl: 'NOT_FOUND',
          index: i + 1
        });
      }
      
      console.log(`   📊 Progresso: ${i + 1}/${links.length}`);
    }
    
    console.log('\n🎊 Tutti i link sono stati visitati!\n');
    
    // Salva i risultati in un file JSON
    const jsonOutput = JSON.stringify(videoResults, null, 2);
    fs.writeFileSync('video_urls.json', jsonOutput);
    console.log('💾 Risultati salvati in: video_urls.json\n');
    
    // Salva anche in formato testo semplice (uno per riga)
    const txtOutput = videoResults
      .map(r => `[${r.index}] ${r.episodeLink}\n    → ${r.videoUrl}`)
      .join('\n\n');
    fs.writeFileSync('video_urls.txt', txtOutput);
    console.log('💾 Risultati salvati in: video_urls.txt\n');
    
    // Stampa riepilogo
    console.log('📊 RIEPILOGO:');
    console.log(`   Totale episodi: ${videoResults.length}`);
    console.log(`   Video trovati: ${videoResults.filter(r => r.videoUrl && !r.videoUrl.startsWith('ERROR') && r.videoUrl !== 'NOT_FOUND').length}`);
    console.log(`   Errori: ${videoResults.filter(r => r.videoUrl.startsWith('ERROR')).length}`);
    console.log(`   Non trovati: ${videoResults.filter(r => r.videoUrl === 'NOT_FOUND').length}\n`);
    
    // Estrai solo gli URL video validi
    const validVideoUrls = videoResults
      .filter(r => r.videoUrl && !r.videoUrl.startsWith('ERROR') && r.videoUrl !== 'NOT_FOUND')
      .map(r => r.videoUrl);
    
    if (validVideoUrls.length > 0) {
      // Copia nella clipboard (uno per riga)
    //   const clipboardContent = validVideoUrls.join('\n');
    //   await clipboardy.write(clipboardContent);
      console.log('📋 URL video copiati nella clipboard!');
      console.log(`   Puoi fare CTRL+V per incollare ${validVideoUrls.length} URL\n`);
      
      // Pronuncia "SUCATO"
      console.log('🎉 SUCATO!\n');
      say.speak('SUCATO', null, 1.0, (err) => {
        if (err) {
          console.log('⚠️  Non è stato possibile riprodurre l\'audio');
        }
      });
    } else {
      console.log('⚠️  Nessun URL valido trovato, clipboard non copiata\n');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    // Chiudi il browser
    await browser.close();
  }
}

// Esegui lo script
main();