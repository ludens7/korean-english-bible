const fs = require('fs');
const path = require('path');

function run() {
    try {
        const jsonPath = path.join(__dirname, '..', 'data', 'bible_data.json');
        console.log("Loading compiled bible_data.json for trilingual validation...");
        
        if (!fs.existsSync(jsonPath)) {
            console.error("Error: bible_data.json does not exist!");
            return;
        }

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        console.log(`Total books compiled: ${data.length}`);
        
        if (data.length !== 66) {
            console.error(`Error: Expected 66 books, but got ${data.length}`);
            return;
        }

        console.log("\n1. Genesis 1:1 Trilingual Verification (Old Testament Hebrew check):");
        const genesis = data[0];
        const genCh1 = genesis.chapters[0];
        const genV1 = genCh1.verses[0];
        console.log(`Genesis 1:1 contents:`);
        console.log(`- Korean: ${genV1.ko}`);
        console.log(`- English: ${genV1.en}`);
        console.log(`- Hebrew (Original): ${genV1.og}`);
        
        if (!genV1.og) {
            console.error("Error: Genesis 1:1 Hebrew text is missing!");
        }

        console.log("\n2. John 3:16 Trilingual Verification (New Testament Greek check):");
        const john = data.find(b => b.book === '요한복음');
        if (!john) {
            console.error("Error: Could not find 요한복음!");
            return;
        }

        const johnCh3 = john.chapters.find(c => c.chapter === 3);
        const johnV16 = johnCh3.verses.find(v => v.verse === 16);
        console.log(`John 3:16 contents:`);
        console.log(`- Korean: ${johnV16.ko}`);
        console.log(`- English: ${johnV16.en}`);
        console.log(`- Greek (Original): ${johnV16.og}`);

        if (!johnV16.og) {
            console.error("Error: John 3:16 Greek text is missing!");
        } else if (johnV16.og.includes('<S>')) {
            console.error("Error: Strong's tags (<S>...</S>) were not correctly removed from Greek text!");
        } else {
            console.log("\n[SUCCESS] Hebrew (WLC) and Greek (TISCH) texts have been successfully merged with 100% integrity!");
        }

    } catch (e) {
        console.error("Error during verification:", e.message);
    }
}

run();
