const puppeteer = require('puppeteer');

/**
 * Avvia un'istanza di Puppeteer
 * @param {Object} options - Opzioni di configurazione
 * @param {boolean} options.headless - Se lanciare in headless mode
 * @param {string[]} options.args - Argomenti aggiuntivi per il browser
 * @returns {Promise<Browser>} Istanza del browser
 */
async function launchBrowser(options = {}) {
  return puppeteer.launch({
    headless: options.headless !== undefined ? options.headless : true,
    defaultViewport: null,
    args: options.args || ['--start-maximized']
  });
}

/**
 * Naviga a un URL e aspetta che il caricamento sia completo
 * @param {Page} page - Pagina di Puppeteer
 * @param {string} url - URL da visitare
 * @returns {Promise<void>}
 */
async function navigateTo(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2' });
}

/**
 * Estrae i link dei episodi dalla pagina
 * @param {Page} page - Pagina di Puppeteer
 * @param {number} timeout - Timeout in millisecondi
 * @returns {Promise<string[]>} Array di URL
 */
async function extractEpisodeLinks(page, timeout = 10000) {
  await page.waitForSelector('.episode > a', { timeout });
  
  const links = await page.evaluate(() => {
    return [...document.querySelectorAll(".episode > a")]
      .map(a => a.href);
  });
  
  return links;
}

module.exports = { launchBrowser, navigateTo, extractEpisodeLinks };