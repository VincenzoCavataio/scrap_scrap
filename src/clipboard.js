const { spawn } = require('child_process');

/**
 * Copia testo nella clipboard in modo cross-platform
 * @param {string} text - Il testo da copiare
 * @returns {Promise<void>}
 * @throws {Error} Se l'operazione fallisce
 */
async function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    const platform = process.platform;
    let command, args;
    
    if (platform === 'darwin') {
      command = 'pbcopy';
      args = [];
    } else if (platform === 'win32') {
      command = 'clip';
      args = [];
    } else {
      command = 'xclip';
      args = ['-selection', 'clipboard'];
    }
    
    const proc = spawn(command, args);
    
    proc.on('error', (error) => {
      reject(error);
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Processo terminato con codice ${code}`));
      }
    });
    
    proc.stdin.write(text);
    proc.stdin.end();
  });
}

module.exports = { copyToClipboard };