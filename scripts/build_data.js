const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper to fetch JSON via HTTPS (supports big JSON streams)
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
            let body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                try {
                    const fullBody = Buffer.concat(body).toString('utf-8');
                    const cleanBody = fullBody.replace(/^\uFEFF/, '');
                    resolve(JSON.parse(cleanBody));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Helper to fetch HTML via HTTP (for ibibles.net)
function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to fetch HTML from ${url}, status: ${res.statusCode}`));
                return;
            }
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
}

// Map Korean Book names to ibibles.net lowercase English identifiers
const IBIBLES_BOOK_MAP = {
    '창세기': 'genesis',
    '출애굽기': 'exodus',
    '레위기': 'leviticus',
    '민수기': 'numbers',
    '신명기': 'deuteronomy',
    '여호수아': 'joshua',
    '사사기': 'judges',
    '룻기': 'ruth',
    '사무엘상': '1samuel',
    '사무엘하': '2samuel',
    '열왕기상': '1kings',
    '열왕기하': '2kings',
    '역대상': '1chronicles',
    '역대하': '2chronicles',
    '에스라': 'ezra',
    '느헤미야': 'nehemiah',
    '에스더': 'esther',
    '욥기': 'job',
    '시편': 'psalms',
    '잠언': 'proverbs',
    '전도서': 'ecclesiastes',
    '아가': 'song',
    '이사야': 'isaiah',
    '예레미야': 'jeremiah',
    '애가': 'lamentations',
    '에스겔': 'ezekiel',
    '다니엘': 'daniel',
    '호세아': 'hosea',
    '요엘': 'joel',
    '아모스': 'amos',
    '오바댜': 'obadiah',
    '요나': 'jonah',
    '미가': 'micah',
    '나훔': 'nahum',
    '하박국': 'habakkuk',
    '스바냐': 'zephaniah',
    '학개': 'haggai',
    '스가랴': 'zechariah',
    '말라기': 'malachi',

    // 신약 (New Testament)
    '마태복음': 'matthew',
    '마가복음': 'mark',
    '누가복음': 'luke',
    '요한복음': 'john',
    '사도행전': 'acts',
    '로마서': 'romans',
    '고린도전서': '1corinthians',
    '고린도후서': '2corinthians',
    '갈라디아서': 'galatians',
    '에베소서': 'ephesians',
    '빌립보서': 'philippians',
    '골로새서': 'colossians',
    '데살로니가전서': '1thessalonians',
    '데살로니가후서': '2thessalonians',
    '디모데전서': '1timothy',
    '디모데후서': '2timothy',
    '디도서': 'titus',
    '빌레몬서': 'philemon',
    '히브리서': 'hebrews',
    '야고보서': 'james',
    '베드로전서': '1peter',
    '베드로후서': '2peter',
    '요한일서': '1john',
    '요한이서': '2john',
    '요한삼서': '3john',
    '유다서': 'jude',
    '요한계시록': 'revelation'
};

// Hardcoded manual regex replacement map for early validation
const CORRECTIONS = {
    "창세기:1:12": { from: /내니\s+.*?나님의/, to: "내니 하나님의" },
    "창세기:1:31": { from: /아.*?이\s+되니/, to: "아침이 되니" },
    "창세기:3:7": { from: /이.*?그들의/, to: "이에 그들의" },
    "창세기:3:15": { from: /머리를\s+.*?하게/, to: "머리를 상하게" },
    "창세기:3:24": { from: /.*?같이\s+하나님이/, to: "이같이 하나님이" },
    "창세기:4:9": { from: /.*?가\s+내\s+아우를/, to: "내가 내 아우를" },
    "창세기:5:2": { from: /하.*?님이\s+그들에게/, to: "하나님이 그들에게" },
    "창세기:5:5": { from: /구백\s+.*?십세를/, to: "구백 삼십세를" },
    "창세기:5:22": { from: /삼백년을\s+.*?나님과/, to: "삼백년을 하나님과" },
    "창세기:7:4": { from: /지.*?부터\s+칠일이면/, to: "지금부터 칠일이면" },
    "창세기:8:7": { from: /놓.*?매/, to: "놓으매" },
    "창세기:8:19": { from: /모든\s+.*?는\s+것과/, to: "모든 기는 것과" },
    "창세기:9:6": { from: /.*?릇\s+사람의/, to: "무릇 사람의" },
    "창세기:9:29": { from: /오.*?세에/, to: "오십세에" },
    "창세기:10:14": { from: /갑도.*?을\s+낳았더라/, to: "갑도림을 낳았더라" },
    "창세기:10:30": { from: /그들.*?거하는/, to: "그들의 거하는" },
    "창세기:10:31": { from: /지방과\s+나.*?대로였더라/, to: "지방과 나라대로였더라" },
    "창세기:11:27": { from: /낳.*?으며/, to: "낳았으며" },
    "창세기:12:14": { from: /아리따움을\s+.*?았고/, to: "아리따움을 보았고" },
    "창세기:14:9": { from: /.*?람\s+왕\s+그돌라오멜과/, to: "엘람 왕 그돌라오멜과" },
    "창세기:14:18": { from: /지.*?히\s+높으신/, to: "지극히 높으신" },
    "창세기:16:3": { from: /아브람.*?아내/, to: "아브람의 아내" },
    "창세기:16:11": { from: /사자.*?또\s+그에게/, to: "사자가 또 그에게" },
    "창세기:17:1": { from: /.*?브람의\s+구십/, to: "아브람의 구십" },
    "창세기:17:14": { from: /끊.*?지리니/, to: "끊어지리니" },
    "창세기:17:23": { from: /자기.*?게\s+말씀하신/, to: "자기에게 말씀하신" },
    "창세기:18:15": { from: /가라사.*?아니라/, to: "가라사대 아니라" },
    "창세기:18:32": { from: /십인.*?인하여도/, to: "십인을 인하여도" },
    "창세기:19:17": { from: /후.*?이르되/, to: "후에 이르되" },
    "창세기:24:18": { from: /주.*?,\s+마시소서/, to: "주여, 마시소서" },
    "창세기:24:25": { from: /보리.*?족하며/, to: "보리도 족하며" },
    "창세기:26:32": { from: /우리가\s+.*?을\s+얻었나이다/, to: "우리가 물을 얻었나이다" },
    "창세기:30:2": { from: /이\s+하나님이시니\s+.*?가\s+하나님을/, to: "이 하나님이시니 내가 하나님을" },
    "창세기:31:49": { from: /여.*?와께서/, to: "여호와께서" },
    "창세기:32:22": { from: /두\s+.*?종과/, to: "두 여종과" },
    "창세기:32:29": { from: /야.*?이\s+청하여/, to: "야곱이 청하여" },
    "창세기:35:22": { from: /아.*?은\s+열\s+둘이라/, to: "아들은 열 둘이라" },
    "창세기:36:30": { from: /호리\s+족속으.*?말미암아/, to: "호리 족속으로 말미암아" },
    "창세기:36:39": { from: /하달이\s+.*?를\s+대신하여/, to: "하달이 저를 대신하여" },
    "창세기:40:13": { from: /당신이\s+이.*?에\s+술\s+맡은/, to: "당신이 이전에 술 맡은" },
    "창세기:40:19": { from: /먹으리이.*?\'\s+하더니/, to: "먹으리이다' 하더니" },
    "창세기:42:22": { from: /말라.*?하지/, to: "말라고 하지" },
    "창세기:43:9": { from: /내.*?그의\s+몸을/, to: "내가 그의 몸을" },
    "창세기:45:17": { from: /바로.*?요셉에게/, to: "바로가 요셉에게" },
    "창세기:46:21": { from: /훔빔과,\s+.*?이니/, to: "훔빔과, 아르디이니" },
    "창세기:46:30": { from: /네가\s+지.*?까지/, to: "네가 지금까지" },
    "창세기:50:8": { from: /그와\s+함.*?올라가고/, to: "그와 함께 올라가고" },
    "창세기:50:14": { from: /호상군과\s+.*?께\s+애굽으로/, to: "호상군과 함께 애굽으로" },

    // 출애굽기 (Exodus)
    "출애굽기:4:18": { from: /이드.*?가\s+그에게\s+\'평안히/, to: "이드로가 그에게 '평안히" },
    "출애굽기:4:24": { from: /그.*?\s+죽이려/, to: "그를 죽이려" },
    "출애굽기:12:13": { from: /아니하리.*?$/, to: "아니하리라" },
    "출애굽기:15:15": { from: /떨림에\s+.*?히며/, to: "떨림에 잡히며" },
    "출애굽기:19:8": { from: /우리가\s+.*?행하리이다/, to: "우리가 다 행하리이다" },
    "출애굽기:19:13": { from: /당하.*?나\s+살에/, to: "당하거나 살에" },
    "출애굽기:23:12": { from: /네\s+.*?종의\s+자식과/, to: "네 여종의 자식과" },
    "출애굽기:23:18": { from: /두.*?\s+말지니라/, to: "두지 말지니라" },
    "출애굽기:28:1": { from: /중\s+.*?형\s+아론과/, to: "중 네 형 아론과" },
    "출애굽기:31:3": { from: /충.*?하게\s+하여/, to: "충만하게 하여" },
    "출애굽기:31:12": { from: /여.*?와께서/, to: "여호와께서" },
    "출애굽기:34:29": { from: /여호.*?와\s+말씀하였음을/, to: "여호와와 말씀하였음을" },
    "출애굽기:38:28": { from: /기둥머리를\s+.*?고/, to: "기둥머리를 싸고" }
};

// Clean and dynamically restore broken text via ibibles.net
async function cleanKoreanText(text, book, chapter, verse) {
    if (!text) return '';
    let cleaned = text
        .trim()
        .replace(/\s+!$/, '.')
        .replace(/\s+\?$/, '?')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"');
    
    // Apply manual regex map first
    const key = `${book}:${chapter}:${verse}`;
    if (CORRECTIONS[key]) {
        cleaned = cleaned.replace(CORRECTIONS[key].from, CORRECTIONS[key].to);
    }
    
    // Check if still contains the replacement character \uFFFD
    if (cleaned.includes('\uFFFD')) {
        const ibiblesBook = IBIBLES_BOOK_MAP[book];
        if (ibiblesBook) {
            console.log(`  [Clean] Detected broken text at ${book} ${chapter}:${verse}. Fetching correction from ibibles.net...`);
            try {
                const url = `http://ibibles.net/quote.php?kor-${ibiblesBook}/${chapter}:${verse}`;
                const html = await fetchHtml(url);
                // Extract text between </small> and <br>
                const match = html.match(/<\/small>\s*([^<]+)<br>/i);
                if (match && match[1].trim()) {
                    const restoredText = match[1].trim()
                        .replace(/&#x27;/g, "'")
                        .replace(/&quot;/g, '"')
                        .trim();
                    if (!restoredText.includes('\uFFFD')) {
                        console.log(`    -> Restored successfully: "${restoredText.substring(0, 30)}..."`);
                        cleaned = restoredText;
                    } else {
                        console.warn(`    -> Warning: ibibles text also contained broken characters.`);
                    }
                }
            } catch (err) {
                console.error(`    -> Error correcting text from ibibles.net: ${err.message}`);
            }
        }
    }
    
    return cleaned.trim();
}

// Complete Old Testament configuration (39 books)
const OT_BOOKS_CONFIG = [
    { ko: '창세기', en: 'Genesis', abbrev: 'gn', chapters: 50 },
    { ko: '출애굽기', en: 'Exodus', abbrev: 'ex', chapters: 40 },
    { ko: '레위기', en: 'Leviticus', abbrev: 'lv', chapters: 27 },
    { ko: '민수기', en: 'Numbers', abbrev: 'nu', chapters: 36 },
    { ko: '신명기', en: 'Deuteronomy', abbrev: 'de', chapters: 34 },
    { ko: '여호수아', en: 'Joshua', abbrev: 'jos', chapters: 24 },
    { ko: '사사기', en: 'Judges', abbrev: 'jud', chapters: 21 },
    { ko: '룻기', en: 'Ruth', abbrev: 'ru', chapters: 4 },
    { ko: '사무엘상', en: '1 Samuel', abbrev: '1sa', chapters: 31 },
    { ko: '사무엘하', en: '2 Samuel', abbrev: '2sa', chapters: 24 },
    { ko: '열왕기상', en: '1 Kings', abbrev: '1ki', chapters: 22 },
    { ko: '열왕기하', en: '2 Kings', abbrev: '2ki', chapters: 25 },
    { ko: '역대상', en: '1 Chronicles', abbrev: '1ch', chapters: 29 },
    { ko: '역대하', en: '2 Chronicles', abbrev: '2ch', chapters: 36 },
    { ko: '에스라', en: 'Ezra', abbrev: 'ezr', chapters: 10 },
    { ko: '느헤미야', en: 'Nehemiah', abbrev: 'ne', chapters: 13 },
    { ko: '에스더', en: 'Esther', abbrev: 'est', chapters: 10 },
    { ko: '욥기', en: 'Job', abbrev: 'job', chapters: 42 },
    { ko: '시편', en: 'Psalms', abbrev: 'ps', chapters: 150 },
    { ko: '잠언', en: 'Proverbs', abbrev: 'pr', chapters: 31 },
    { ko: '전도서', en: 'Ecclesiastes', abbrev: 'ec', chapters: 12 },
    { ko: '아가', en: 'Song Of Solomon', abbrev: 'so', chapters: 8 },
    { ko: '이사야', en: 'Isaiah', abbrev: 'is', chapters: 66 },
    { ko: '예레미야', en: 'Jeremiah', abbrev: 'je', chapters: 52 },
    { ko: '애가', en: 'Lamentations', abbrev: 'la', chapters: 5 },
    { ko: '에스겔', en: 'Ezekiel', abbrev: 'ez', chapters: 48 },
    { ko: '다니엘', en: 'Daniel', abbrev: 'da', chapters: 12 },
    { ko: '호세아', en: 'Hosea', abbrev: 'ho', chapters: 14 },
    { ko: '요엘', en: 'Joel', abbrev: 'jl', chapters: 3 },
    { ko: '아모스', en: 'Amos', abbrev: 'am', chapters: 9 },
    { ko: '오바댜', en: 'Obadiah', abbrev: 'ob', chapters: 1 },
    { ko: '요나', en: 'Jonah', abbrev: 'jon', chapters: 4 },
    { ko: '미가', en: 'Micah', abbrev: 'mic', chapters: 7 },
    { ko: '나훔', en: 'Nahum', abbrev: 'na', chapters: 3 },
    { ko: '하박국', en: 'Habakkuk', abbrev: 'hb', chapters: 3 },
    { ko: '스바냐', en: 'Zephaniah', abbrev: 'zp', chapters: 3 },
    { ko: '학개', en: 'Haggai', abbrev: 'hg', chapters: 2 },
    { ko: '스가랴', en: 'Zechariah', abbrev: 'zc', chapters: 14 },
    { ko: '말라기', en: 'Malachi', abbrev: 'mal', chapters: 4 }
];

// Complete New Testament configuration (27 books)
const NT_BOOKS_CONFIG = [
    { ko: '마태복음', en: 'Matthew', abbrev: 'mt', chapters: 28 },
    { ko: '마가복음', en: 'Mark', abbrev: 'mk', chapters: 16 },
    { ko: '누가복음', en: 'Luke', abbrev: 'lk', chapters: 24 },
    { ko: '요한복음', en: 'John', abbrev: 'jo', chapters: 21 },
    { ko: '사도행전', en: 'Acts', abbrev: 'act', chapters: 28 },
    { ko: '로마서', en: 'Romans', abbrev: 'rm', chapters: 16 },
    { ko: '고린도전서', en: '1 Corinthians', abbrev: '1co', chapters: 16 },
    { ko: '고린도후서', en: '2 Corinthians', abbrev: '2co', chapters: 13 },
    { ko: '갈라디아서', en: 'Galatians', abbrev: 'gl', chapters: 6 },
    { ko: '에베소서', en: 'Ephesians', abbrev: 'eph', chapters: 6 },
    { ko: '빌립보서', en: 'Philippians', abbrev: 'ph', chapters: 4 },
    { ko: '골로새서', en: 'Colossians', abbrev: 'cl', chapters: 4 },
    { ko: '데살로니가전서', en: '1 Thessalonians', abbrev: '1ts', chapters: 5 },
    { ko: '데살로니가후서', en: '2 Thessalonians', abbrev: '2ts', chapters: 3 },
    { ko: '디모데전서', en: '1 Timothy', abbrev: '1tm', chapters: 6 },
    { ko: '디모데후서', en: '2 Timothy', abbrev: '2tm', chapters: 4 },
    { ko: '디도서', en: 'Titus', abbrev: 'tt', chapters: 3 },
    { ko: '빌레몬서', en: 'Philemon', abbrev: 'phm', chapters: 1 },
    { ko: '히브리서', en: 'Hebrews', abbrev: 'hb', chapters: 13 },
    { ko: '야고보서', en: 'James', abbrev: 'jm', chapters: 5 },
    { ko: '베드로전서', en: '1 Peter', abbrev: '1pe', chapters: 5 },
    { ko: '베드로후서', en: '2 Peter', abbrev: '2pe', chapters: 3 },
    { ko: '요한일서', en: '1 John', abbrev: '1jo', chapters: 5 },
    { ko: '요한이서', en: '2 John', abbrev: '2jo', chapters: 1 },
    { ko: '요한삼서', en: '3 John', abbrev: '3jo', chapters: 1 },
    { ko: '유다서', en: 'Jude', abbrev: 'jd', chapters: 1 },
    { ko: '요한계시록', en: 'Revelation', abbrev: 're', chapters: 22 }
];

// Merge to create full 66 books config
const BIBLE_BOOKS_CONFIG = [...OT_BOOKS_CONFIG, ...NT_BOOKS_CONFIG];

async function main() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputFilePath = path.join(dataDir, 'bible_data.json');
    console.log("Starting Full Bible (Old & New Testament) Data Compilation Pipeline...");

    try {
        console.log("1. Fetching Korean Bible (KRV)...");
        const korBible = await fetchJson("https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json");

        console.log("2. Fetching Hebrew Old Testament (WLC)...");
        const wlcBible = await fetchJson("https://bolls.life/static/translations/WLC.json");

        console.log("3. Fetching Greek New Testament (TISCH)...");
        const tischBible = await fetchJson("https://bolls.life/static/translations/TISCH.json");

        const compiledBible = [];

        // Loop through all 66 Bible books
        for (let i = 0; i < BIBLE_BOOKS_CONFIG.length; i++) {
            const bookInfo = BIBLE_BOOKS_CONFIG[i];
            const bookNum = i + 1; // 1-indexed book number for bolls.life matching

            console.log(`\n----------------------------------------`);
            console.log(`Processing Book: ${bookInfo.ko} (${bookInfo.en}) [#${bookNum}]`);
            console.log(`----------------------------------------`);

            // Find Korean book representation using direct index mapping
            const korBook = korBible[i];

            if (!korBook) {
                console.error(`Warning: Could not find book index ${i} in the Korean Bible source. Skipping.`);
                continue;
            }

            // Fetch English NIV translation for this book
            const enEscapedName = encodeURIComponent(bookInfo.en);
            const engSourceUrl = `https://raw.githubusercontent.com/aruljohn/Bible-niv/main/${enEscapedName}.json`;
            console.log(`Fetching English translation from: ${engSourceUrl}`);
            
            let engSource;
            try {
                engSource = await fetchJson(engSourceUrl);
            } catch (err) {
                console.error(`Error fetching English version for "${bookInfo.en}": ${err.message}. Skipping.`);
                continue;
            }

            const compiledChapters = [];

            // Compile chapter by chapter
            for (let c = 0; c < bookInfo.chapters; c++) {
                const chapterNum = c + 1;
                const korVerses = korBook.chapters[c] || [];
                
                const engChObj = engSource.chapters.find(ch => parseInt(ch.chapter) === chapterNum);
                const engVerses = engChObj ? engChObj.verses : [];

                const versesList = [];
                const maxVerses = Math.max(korVerses.length, engVerses.length);

                for (let v = 0; v < maxVerses; v++) {
                    const verseNum = v + 1;
                    const koTextRaw = korVerses[v] || '';
                    
                    // Clean Korean text (dynamic restoration)
                    const koText = await cleanKoreanText(koTextRaw, bookInfo.ko, chapterNum, verseNum);

                    // English Text
                    const engVerseObj = engVerses.find(vObj => parseInt(vObj.verse) === verseNum);
                    const enText = engVerseObj ? engVerseObj.text.trim() : '';

                    // Original Text (og): Hebrew WLC for OT, Greek TISCH (cleaned from Strong tags) for NT
                    let ogText = '';
                    if (bookNum <= 39) {
                        // OT -> Hebrew WLC
                        const ogVerseObj = wlcBible.find(vObj => vObj.book === bookNum && vObj.chapter === chapterNum && vObj.verse === verseNum);
                        ogText = ogVerseObj ? ogVerseObj.text.trim() : '';
                    } else {
                        // NT -> Greek TISCH
                        const ogVerseObj = tischBible.find(vObj => vObj.book === bookNum && vObj.chapter === chapterNum && vObj.verse === verseNum);
                        const rawText = ogVerseObj ? ogVerseObj.text.trim() : '';
                        // Remove Strong's tag formatting like <S>1234</S>
                        ogText = rawText.replace(/<S>\d+<\/S>/gi, '').trim();
                    }

                    versesList.push({
                        verse: verseNum,
                        ko: koText,
                        en: enText,
                        og: ogText
                    });
                }

                compiledChapters.push({
                    chapter: chapterNum,
                    verses: versesList
                });
            }

            compiledBible.push({
                book: bookInfo.ko,
                bookEn: bookInfo.en,
                chapters: compiledChapters
            });
            console.log(`Completed compilation for ${bookInfo.ko} (${bookInfo.chapters} chapters).`);
        }

        console.log("\n========================================");
        console.log("Writing final compiled Bible dataset to files...");
        
        // Write JSON file
        fs.writeFileSync(outputFilePath, JSON.stringify(compiledBible, null, 2), 'utf-8');
        
        // Write JS bundle file
        const jsBundlePath = path.join(dataDir, 'bible_data.js');
        const jsContent = `// Compiled Bible Data (Bilingual/Trilingual: Korean, English NIV, Hebrew WLC, Greek TISCH)\nconst BIBLE_DATA = ${JSON.stringify(compiledBible, null, 2)};\n`;
        fs.writeFileSync(jsBundlePath, jsContent, 'utf-8');
        
        console.log(`Compilation complete!`);
        console.log(`- Saved JSON to: ${outputFilePath}`);
        console.log(`- Saved JS Bundle to: ${jsBundlePath}`);

        // Simple validation check
        const fileStats = fs.statSync(outputFilePath);
        const jsStats = fs.statSync(jsBundlePath);
        console.log(`Output JSON file size: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`Output JS Bundle file size: ${(jsStats.size / (1024 * 1024)).toFixed(2)} MB`);

    } catch (error) {
        console.error("Compilation failed:", error);
        process.exit(1);
    }
}

main();
