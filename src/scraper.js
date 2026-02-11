const { navigateTo } = require('./browser');

/**
 * Estrae l'URL del video da una pagina di episodio
 * @param {Page} page - Pagina di Puppeteer
 * @returns {Promise<string|null>} URL del video o null
 */
async function extractVideoUrl(page) {
  const videoUrl = await page.evaluate(() => {
    const iframe = document.querySelector('#player-iframe');
    if (!iframe) return null;
    
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const video = iframeDocument.querySelector('video');
      
      if (video && video.src) {
        return video.src;
      }
      
      const source = iframeDocument.querySelector('video source');
      if (source && source.src) {
        return source.src;
      }
    } catch (e) {
      return iframe.src;
    }
    
    return null;
  });
  
  return videoUrl;
}

/**
 * Processa un singolo episodio e estrae l'URL del video
 * @param {Browser} browser - Istanza del browser
 * @param {string} episodeLink - URL dell'episodio
 * @param {Object} options - Opzioni di configurazione
 * @returns {Promise<Object>} Risultato con episodeLink e videoUrl
 */
async function processEpisode(browser, episodeLink, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const iframeTimeout = options.iframeTimeout || 15000;
  const clickTimeout = options.clickTimeout || 1000;
  const retryDelay = options.retryDelay || 2000;
  
  let retryCount = 0;
  let success = false;
  let videoUrl = null;
  
  while (retryCount <= maxRetries && !success) {
    if (retryCount > 0) {
      console.log(`   🔄 Tentativo ${retryCount}/${maxRetries}...`);
    }
    
    let newPage = null;
    
    try {
      newPage = await browser.newPage();
      await navigateTo(newPage, episodeLink);
      
      console.log('   🖱️  Cliccando su #alternative...');
      await newPage.waitForSelector('#alternative', { timeout: 10000 });
      await newPage.click('#alternative');
      
      await new Promise(resolve => setTimeout(resolve, clickTimeout));
      
      console.log('   ⏳ Aspettando l\'iframe player-iframe...');
      await newPage.waitForSelector('#player-iframe', { timeout: iframeTimeout });
      
      videoUrl = await extractVideoUrl(newPage);
      
      if (videoUrl) {
        console.log(`   ✅ Video URL trovato: ${videoUrl}`);
        success = true;
      } else {
        console.log(`   ⚠️  Nessun video URL trovato`);
        retryCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ Errore: ${error.message}`);
      retryCount++;
    } finally {
      if (newPage) {
        try {
          await newPage.close();
        } catch (closeError) {
          // Ignora errori durante la chiusura
        }
      }
    }
    
    if (!success && retryCount <= maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  if (!success) {
    console.log(`   ❌ Fallito dopo ${maxRetries} tentativi`);
  }
  
  return {
    episodeLink,
    videoUrl: videoUrl || 'NOT_FOUND'
  };
}

/**
 * Processa tutti gli episodi
 * @param {Browser} browser - Istanza del browser
 * @param {string[]} links - Array di link degli episodi
 * @param {Object} options - Opzioni di configurazione
 * @returns {Promise<Array>} Array di risultati
 */
async function processAllEpisodes(browser, links, options = {}) {
  const results = [];
  
  console.log('🖱️  Iniziando a cliccare sui link ed estrarre video URLs...\n');
  
  for (let i = 0; i < links.length; i++) {
    console.log(`\n[${i + 1}/${links.length}] Cliccando su: ${links[i]}`);
    
    const result = await processEpisode(browser, links[i], options);
    results.push({
      ...result,
      index: i + 1
    });
    
    console.log(`   📊 Progresso: ${i + 1}/${links.length}`);
  }
  
  return results;
}

module.exports = { processEpisode, processAllEpisodes, extractVideoUrl };