const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const cleanBody = body.replace(/^\uFEFF/, '');
                resolve(JSON.parse(cleanBody));
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log("Fetching Korean Bible JSON...");
        const korBible = await fetchJson("https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json");
        console.log("Books in ko_ko.json:");
        korBible.forEach((b, i) => {
            console.log(`${i + 1}. book: "${b.book}", abbrev: "${b.abbrev}"`);
        });
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
