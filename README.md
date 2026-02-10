# 🎬 Video Scraper con Puppeteer

Scraper automatico per estrarre URL video da episodi.

## 📋 Requisiti

- **Node.js** versione 16 o superiore ([Download](https://nodejs.org/))

Verifica l'installazione:
```bash
node --version
```

## 📦 Installazione

1. Scarica i file del progetto in una cartella
2. Apri il terminale nella cartella
3. Installa le dipendenze:

```bash
npm install
```

## 🚀 Utilizzo

```bash
node scraper.js url=www.tuosito.com
```

Oppure con npm:

```bash
npm start -- url=www.tuosito.com
```

### Esempi

```bash
# URL semplice
node scraper.js url=esempio.com/episodi

# URL completo
node scraper.js url=https://streaming.com/serie/anime

# Con npm
npm start -- url=www.esempio.com
```

## 📤 Output

Lo script genera 2 file:

- **`video_urls.json`** - Formato JSON strutturato
- **`video_urls.txt`** - Formato testo leggibile

**BONUS:**
- ✅ Gli URL video vengono **copiati automaticamente nella clipboard**
- ✅ Alla fine sentirai un **"SUCATO"** vocale 🎉

## ⚙️ Configurazione

### Modalità invisibile (headless)

Modifica `scraper.js` alla riga 36:

```javascript
headless: true  // false = vedi il browser, true = invisibile
```

### Aumentare timeout

Se il sito è lento, aumenta il timeout alla riga 71:

```javascript
await newPage.waitForSelector('#player-iframe', { timeout: 30000 }); // 30 secondi invece di 15
```

## 🎯 Cosa fa

1. Naviga al sito specificato
2. Estrae tutti i link degli episodi (`.episode > a`)
3. Per ogni episodio:
   - Apre la pagina
   - Clicca su `#alternative`
   - Aspetta l'iframe `#player-iframe`
   - Estrae l'URL del video
4. Salva tutto nei file di output
5. **Copia gli URL nella clipboard** (pronti per CTRL+V)
6. **Pronuncia "SUCATO"** 🎉

## 🔧 Problemi Comuni

**Errore: "URL non specificato"**
```bash
# Soluzione: aggiungi url=
node scraper.js url=www.tuosito.com
```

**Errore: "Cannot find module 'puppeteer'"**
```bash
# Soluzione: installa le dipendenze
npm install
```

**Timeout errors**
- Aumenta il timeout nel file `scraper.js`
- Verifica che il sito sia accessibile

---

**Buon SUCATO! 🎉**