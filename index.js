const puppeteer = require('puppeteer');
const cors = require('cors');

const express = require('express');
const app = express();

const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

const baseUrl = 'https://www.futbin.com/21/player/';
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    app.get('/', async ({query: {playerId}}, res) => {
        const queryUrl = baseUrl + playerId;
        await page.goto(queryUrl);
        const name = await page.$('#info_content > table > tbody > tr > td');
        if (!name) return res.status(404).json({error: 404});
        const playerName = await page.evaluate(el => el.innerText, name);
        console.log(`found ${playerName}`);
        const ranked = await page.$('.pcdisplay-rat');
        const playerRanked = await page.evaluate(el => el.innerText, ranked);
        console.log(`noted ${playerRanked}`);
        const spanLowestValue = await page.$('#ps-lowest-1');
        const playerLowestValue = await page.evaluate(el => el.innerText, spanLowestValue);
        console.log(`value ${playerLowestValue.trim()}`);
        return res.json({
            name: playerName,
            price: parseInt(playerLowestValue.trim().replace(/,/g, '')) || 0,
            ranked: playerRanked
        });
    });
    app.listen(4100, () => {
        console.log('Server started on port', 4100);
    });
})();
