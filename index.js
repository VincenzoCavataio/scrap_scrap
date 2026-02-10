const puppeteer = require("puppeteer");
const fs = require("fs");

const START_URL = "https://www.animeworld.ac/play/the-darwin-incident-ita.TL0ZJ"; 
// ← metti la pagina che contiene i bottoni/episodi

async function getEpisodeLinks(page) {
  return await page.evaluate(() => {
    return [...document.querySelectorAll(".episode > a")]
      .map(a => a.href);
  });
}

async function getVideoUrlFromEpisode(browser, episodeUrl) {
  const page = await browser.newPage();

  try {
    await page.goto(episodeUrl, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // click su "alternative"
    await page.waitForSelector("#alternative", { timeout: 10000 });
    await page.click("#alternative");

    // aspetta il video JWPlayer
    await page.waitForSelector("video.jw-video", { timeout: 15000 });

    // prendi src del video
    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector("video.jw-video");
      return video ? video.src : null;
    });

    await page.close();
    return videoUrl;
  } catch (err) {
    console.error("Errore su:", episodeUrl);
    console.error(err.message);
    await page.close();
    return null;
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // metti false se vuoi vedere cosa fa
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto(START_URL, {
    waitUntil: "networkidle2",
    timeout: 60000
  });

  console.log("📥 Recupero link episodi...");
  const episodeLinks = await getEpisodeLinks(page);
  console.log(`Trovati ${episodeLinks.length} episodi`);

  const videoUrls = [];

  for (let i = 0; i < episodeLinks.length; i++) {
    const link = episodeLinks[i];
    console.log(`🎬 [${i + 1}/${episodeLinks.length}] ${link}`);

    const videoUrl = await getVideoUrlFromEpisode(browser, link);

    if (videoUrl) {
      console.log("   → video:", videoUrl);
      videoUrls.push(videoUrl);
    } else {
      console.log("   → video NON trovato");
    }
  }

  fs.writeFileSync("video_urls.txt", videoUrls.join("\n"));
  console.log("✅ File video_urls.txt creato");

  await browser.close();
})();
