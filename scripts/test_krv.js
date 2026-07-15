const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
                return;
            }
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body.replace(/^\uFEFF/, '')));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log("Fetching m0ty kor-krv-1938.json...");
        const data = await fetchJson("https://raw.githubusercontent.com/m0ty/bible-io-json/main/kor-krv-1938.json");
        console.log("Success! ID:", data.id);
        console.log("Name:", data.name);
        console.log("Available books keys:", Object.keys(data.books).slice(0, 10));
        console.log("Genesis structure sample:", JSON.stringify(data.books.gn.chapters["1"]["1"]));
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

run();
