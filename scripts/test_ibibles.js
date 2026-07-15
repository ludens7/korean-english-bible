const http = require('http');

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed, status: ${res.statusCode}`));
                return;
            }
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
}

// Strip HTML tags and clean up
function cleanText(html) {
    // ibibles output is typically like:
    // <small>kor-genesis 1:12</small> 땅이 풀과 각기 종류대로 ...<br>
    let text = html.replace(/<[^>]*>/g, ''); // strip HTML tags
    text = text.replace(/kor-[a-z0-9]+\s+\d+:\d+/i, ''); // strip header tag
    return text.trim();
}

async function run() {
    try {
        const url = "http://ibibles.net/quote.php?kor-genesis/1:12";
        console.log("Fetching quote from ibibles.net...");
        const html = await fetchHtml(url);
        console.log("Raw HTML response:", html);
        console.log("Cleaned Text:", cleanText(html));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
