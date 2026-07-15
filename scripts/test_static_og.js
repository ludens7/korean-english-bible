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
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log("Checking if WLC.json exists and reading its schema...");
        const wlcData = await fetchJson("https://bolls.life/static/translations/WLC.json");
        console.log("WLC.json loaded! Array length:", wlcData.length);
        console.log("First element sample:", JSON.stringify(wlcData[0]));

        console.log("\nChecking if TISCH.json exists and reading its schema...");
        const tischData = await fetchJson("https://bolls.life/static/translations/TISCH.json");
        console.log("TISCH.json loaded! Array length:", tischData.length);
        console.log("First element sample:", JSON.stringify(tischData[0]));
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

run();
