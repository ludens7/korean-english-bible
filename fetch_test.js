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
                    const cleanBody = body.replace(/^\uFEFF/, '');
                    resolve(JSON.parse(cleanBody));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        const niv = await fetchJson("https://raw.githubusercontent.com/aruljohn/Bible-niv/main/Genesis.json");
        const ch0 = niv.chapters["0"];
        console.log("ch0 keys:", Object.keys(ch0));
        console.log("ch0.chapter:", ch0.chapter);
        console.log("Type of ch0.verses:", typeof ch0.verses);
        if (Array.isArray(ch0.verses)) {
            console.log("ch0.verses is array, length:", ch0.verses.length);
            console.log("ch0.verses[0]:", ch0.verses[0]);
        } else {
            console.log("ch0.verses is object, keys count:", Object.keys(ch0.verses).length);
            console.log("ch0.verses keys:", Object.keys(ch0.verses).slice(0, 5));
            console.log("ch0.verses['1']:", ch0.verses["1"]);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
