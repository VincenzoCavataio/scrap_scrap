# SUCATO - Video Scraper - Estrattore di URL Video

Un'applicazione Node.js modulare che estrae automaticamente gli URL dei video da una pagina web di episodi, li salva in file e li copia nella clipboard.

## 📋 Caratteristiche

- **Scraping automatico** di link episodi da una pagina web
- **Estrazione URL video** con sistema di retry intelligente
- **Salvataggio multi-formato** (JSON e TXT)
- **Copia automatica clipboard** dei video URL trovati
- **Audio di notifica** "SUCATO!" al completamento
- **Cross-platform** (Windows, macOS, Linux)
- **Modulare e manutenibile** con JSDoc completo

## 🔧 Prerequisiti

- **Node.js** >= 12.0.0
- **npm** o **yarn**
- **Puppeteer** (installato automaticamente)
- **say** (installato automaticamente)

### Dipendenze di sistema richieste

#### Windows
- Nessuna dipendenza aggiuntiva (usa il comando `clip` nativo)

#### macOS
- Nessuna dipendenza aggiuntiva (usa il comando `pbcopy` nativo)

#### Linux
- `xclip` (per la clipboard)
  ```bash
  sudo apt-get install xclip
  ```

## 📦 Installazione

### 1. Clona o scarica il progetto
```bash
git clone <repository-url>
cd video-scraper
```

### 2. Installa le dipendenze
```bash
npm install
```

Oppure con yarn:
```bash
yarn install
```

### 3. Struttura delle cartelle
```
video-scraper/
├── src/
│   ├── index.js              # Entry point
│   ├── main.js               # Orchestrazione principale
│   ├── argParser.js          # Parser argomenti CLI
│   ├── config.js             # Configurazione
│   ├── browser.js            # Gestione Puppeteer
│   ├── scraper.js            # Logica scraping
│   ├── clipboard.js          # Gestione clipboard
│   └── output.js             # Salvataggio file e output
├── package.json
└── README.md
```

## 🚀 Come avviare

### Metodo 1: Con npm start (consigliato)
```bash
npm start -- url=www.esempio.com
```

### Metodo 2: Con node diretto
```bash
node src/index.js url=www.esempio.com
```

### Con parametri opzionali
```bash
# Con headless=false per vedere il browser
npm start -- url=www.esempio.com headless=false

# URL con protocollo esplicito
node src/index.js url=https://www.esempio.com

# Combinare parametri
node src/index.js url=www.esempio.com headless=false
```

## 📝 Parametri da terminale

| Parametro | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `url` | string | **obbligatorio** | URL del sito da scrapare (con o senza `https://`) |
| `headless` | boolean | `true` | Mostra il browser durante l'esecuzione (usa `false` per abilitare) |

### Esempi di utilizzo
```bash
# Più semplice - URL senza protocollo
npm start -- url=www.miosito.com

# Con protocollo esplicito
npm start -- url=https://www.miosito.com/episodi

# Visualizzare il browser in azione
npm start -- url=www.miosito.com headless=false

# Entrambi i parametri
node src/index.js url=www.miosito.com headless=false
```

## 🎯 Cosa fa l'applicazione

### Processo di esecuzione

1. **Parsing argomenti** - Estrae `url` e `headless` dalla linea di comando
2. **Avvio browser** - Lancia Puppeteer in modalità headless (o visibile)
3. **Navigazione** - Accede all'URL specificato
4. **Estrazione link** - Ricerca tutti gli elementi `.episode > a` nella pagina
5. **Visualizzazione** - Stampa l'elenco dei link trovati
6. **Processamento episodi** - Per ogni episodio:
   - Naviga al link
   - Clicca su `#alternative`
   - Aspetta il caricamento dell'iframe `#player-iframe`
   - Estrae l'URL del video
   - Implementa retry automatici (fino a 3 tentativi)
7. **Salvataggio risultati** - Genera file JSON e TXT
8. **Copia clipboard** - Copia gli URL validi nella clipboard
9. **Notifica audio** - Riproduce "SUCATO!" al completamento

## 📊 Output e file generati

### File salvati

#### 1. `video_urls.json`
Formato JSON strutturato con tutti i risultati:
```json
[
  {
    "index": 1,
    "episodeLink": "https://www.esempio.com/episodio-1",
    "videoUrl": "https://video.server.com/video1.mp4"
  },
  {
    "index": 2,
    "episodeLink": "https://www.esempio.com/episodio-2",
    "videoUrl": "NOT_FOUND"
  }
]
```

#### 2. `video_urls.txt`
Formato testo leggibile con uno per riga:
```
[1] https://www.esempio.com/episodio-1
    → https://video.server.com/video1.mp4

[2] https://www.esempio.com/episodio-2
    → NOT_FOUND
```

### Output console

L'applicazione fornisce feedback visivo a ogni step:

```
🌐 Navigando verso https://www.esempio.com...

📋 Estraendo i link degli episodi...

📋 Trovati 3 link:

1. https://www.esempio.com/episodio-1
2. https://www.esempio.com/episodio-2
3. https://www.esempio.com/episodio-3

🖱️  Iniziando a cliccare sui link ed estrarre video URLs...

[1/3] Cliccando su: https://www.esempio.com/episodio-1
   🖱️  Cliccando su #alternative...
   ⏳ Aspettando l'iframe player-iframe...
   ✅ Video URL trovato: https://video.server.com/video1.mp4
   📊 Progresso: 1/3

[2/3] Cliccando su: https://www.esempio.com/episodio-2
   🖱️  Cliccando su #alternative...
   ⏳ Aspettando l'iframe player-iframe...
   ❌ Errore: selector not found
   🔄 Tentativo 1/3...
   ✅ Video URL trovato: https://video.server.com/video2.mp4
   📊 Progresso: 2/3

[3/3] Cliccando su: https://www.esempio.com/episodio-3
   🖱️  Cliccando su #alternative...
   ⏳ Aspettando l'iframe player-iframe...
   ⚠️  Nessun video URL trovato
   ❌ Fallito dopo 3 tentativi
   📊 Progresso: 3/3

🎊 Tutti i link sono stati visitati!

💾 Risultati salvati in: video_urls.json

💾 Risultati salvati in: video_urls.txt

📊 RIEPILOGO:
   Totale episodi: 3
   Video trovati: 2
   Errori: 0
   Non trovati: 1

📋 URL video copiati nella clipboard!
   Puoi fare CTRL+V per incollare 2 URL

🎉 SUCATO!
```

## 🎨 Emoji utilizzati

| Emoji | Significato |
|-------|------------|
| 🌐 | Navigazione web |
| 📋 | Informazioni/Lista |
| 🖱️ | Azione del mouse |
| ⏳ | Attesa |
| ✅ | Successo |
| ❌ | Errore/Fallimento |
| ⚠️ | Avvertimento |
| 🔄 | Retry/Ripetizione |
| 💾 | Salvataggio file |
| 📊 | Statistiche/Progresso |
| 🎊 | Completamento |
| 🎉 | Celebrazione |

## ⚙️ Configurazione avanzata

Se necessiti di modificare i comportamenti predefiniti, edita `src/config.js`:

```javascript
const config = {
  maxRetries: 3,              // Numero di tentativi per episodio
  headless: true,             // Headless di default (sovrascritto da CLI)
  browserArgs: ['--start-maximized'],
  timeouts: {
    selector: 10000,          // Timeout per selettori CSS (ms)
    iframe: 15000,            // Timeout per iframe player (ms)
    click: 1000,              // Delay dopo click (ms)
    retry: 2000               // Delay tra retry (ms)
  }
};
```

## 🐛 Troubleshooting

### "URL non specificato"
```bash
# ❌ Errato
npm start

# ✅ Corretto
npm start -- url=www.esempio.com
```

### "Impossibile copiare nella clipboard"
**Linux:** Installa xclip
```bash
sudo apt-get install xclip
```

### Il browser non si ferma
Termina il processo manualmente:
```bash
# Windows
taskkill /IM chrome.exe /F

# macOS/Linux
killall chrome
killall Chromium
```

### Timeout su iframe
Aumenta il valore in `config.js`:
```javascript
timeouts: {
  iframe: 20000  // Aumentato a 20 secondi
}
```

### XPath o selettori non trovati
Il sito potrebbe avere struttura HTML diversa. Modifica in `browser.js` e `scraper.js`:
- `.episode > a` - Selettore per episodi
- `#alternative` - ID del pulsante da cliccare
- `#player-iframe` - ID dell'iframe video

## 📚 Struttura modulare

- **index.js** - Punto di ingresso
- **main.js** - Orchestrazione del flusso principale
- **argParser.js** - Parsing e validazione argomenti CLI
- **config.js** - Configurazione centralizzata
- **browser.js** - Operazioni Puppeteer (launch, navigate, extract)
- **scraper.js** - Logica di scraping episodi e video
- **clipboard.js** - Gestione clipboard cross-platform
- **output.js** - Salvataggio file e generazione output

## 🔐 Privacy e sicurezza

- Non salva dati personali
- Non traccia l'utente
- I file generati rimangono in locale
- Nessuna trasmissione a server esterni

## 📄 Licenza

MIT License - Libero da usare

## 💬 Supporto

Per problemi o suggerimenti, controlla:
1. I log in console durante l'esecuzione
2. I file generati per dettagli su errori
3. La configurazione di selettori e timeout

## 🎓 Come estendere

### Aggiungere nuovi selettori
Modifica `browser.js`:
```javascript
async function extractEpisodeLinks(page, timeout = 10000) {
  await page.waitForSelector('.tuo-selettore', { timeout });
  // ...
}
```

### Aggiungere nuovo formato output
Modifica `output.js`:
```javascript
function saveAsCSV(results, filename = 'video_urls.csv') {
  // Tua logica...
}
```

### Aggiungere validazione URL
Modifica `argParser.js`:
```javascript
function validateUrl(url) {
  // Tua logica...
}
```

---

**Versione:** 1.0.0  
**Creato:** 2025  
**Ultimo aggiornamento:** Febbraio 2026