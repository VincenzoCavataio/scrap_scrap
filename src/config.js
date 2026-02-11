/**
 * Configurazione globale dell'applicazione
 */
const config = {
  maxRetries: 3,
  headless: true,
  browserArgs: ['--start-maximized'],
  timeouts: {
    selector: 10000,
    iframe: 15000,
    click: 1000,
    retry: 2000
  }
};

module.exports = config;