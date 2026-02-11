process.noDeprecation = true;

const { launchBrowser, navigateTo, extractEpisodeLinks } = require('./browser');
const { processAllEpisodes } = require('./scraper');
const { saveAsJson, saveAsText, printSummary, handleSuccessOutput } = require('./output');
const { parseArgs, printUsage } = require('./argParser');
const config = require('./config');

/**
 * Funzione principale dell'applicazione
 * @returns {Promise<void>}
 */
async function main() {
  let args;
  
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    printUsage();
    process.exit(1);
  }
  
  const browser = await launchBrowser({
    headless: args.headless,
    args: config.browserArgs
  });
  
  try {
    const page = await browser.newPage();
    
    console.log(`🌐 Navigando verso ${args.siteUrl}...`);
    await navigateTo(page, args.siteUrl);
    
    console.log(`\n📋 Estraendo i link degli episodi...`);
    const links = await extractEpisodeLinks(page, config.timeouts.selector);
    
    console.log(`\n📋 Trovati ${links.length} link:\n`);
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link}`);
    });
    
    await page.close();
    
    const results = await processAllEpisodes(browser, links, {
      maxRetries: config.maxRetries,
      iframeTimeout: config.timeouts.iframe,
      clickTimeout: config.timeouts.click,
      retryDelay: config.timeouts.retry
    });
    
    console.log('\n🎊 Tutti i link sono stati visitati!\n');
    
    saveAsJson(results);
    saveAsText(results);
    printSummary(results);
    await handleSuccessOutput(results);
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await browser.close();
  }
}

module.exports = main;