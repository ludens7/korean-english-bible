const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'bible_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log("Analyzing Bible data for broken characters (Replacement character \ufffd)...");

let count = 0;
data.forEach(bookObj => {
    bookObj.chapters.forEach(ch => {
        ch.verses.forEach(v => {
            if (v.ko.includes('\uFFFD')) {
                console.log(`[Broken] ${bookObj.book} Chapter ${ch.chapter}, Verse ${v.verse}:`);
                console.log(`Text: ${v.ko}`);
                console.log(`----------------------------------------`);
                count++;
            }
        });
    });
});

console.log(`Total broken verses found: ${count}`);
