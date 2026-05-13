async function collectAllWords() {
    const listItems = document.querySelectorAll('#mcq-list li[data-file]');
    const allWords = new Set(); // Set ensures we don't have duplicates

    console.log(`Starting collection from ${listItems.length} files...`);

    for (let li of listItems) {
        const filePath = li.getAttribute('data-file');
        
        try {
            const response = await fetch(filePath);
            const data = await response.json();

            // Assuming your JSON structure has 'question' and 'options'
            // Adjust these keys to match your DigiBook JSON format
            data.forEach(item => {
                // Collect from questions
                extractWords(item.question, allWords);
                
                // Collect from options
                if (item.options) {
                    item.options.forEach(opt => extractWords(opt, allWords));
                }
            });
        } catch (err) {
            console.error(`Could not load ${filePath}:`, err);
        }
    }

    console.log(`Collection complete! Found ${allWords.size} unique words.`);
    return Array.from(allWords).sort();
}

// Helper to clean strings and split into words
function extractWords(text, set) {
    if (!text) return;
    // Remove punctuation and split by spaces
    const words = text.toLowerCase()
                      .replace(/[?.!,():;"']/g, "")
                      .split(/\s+/);
    
    words.forEach(word => {
        if (word.length > 0) { // Ignore tiny words like 'a', 'is', 'to'
            set.add(word);
        }
    });
   const dictionaryTemplate = {};
    words.forEach(word => {
        dictionaryTemplate[word] = ""; // Leave value empty for you to fill in Sinhala
    });
    console.log(JSON.stringify(dictionaryTemplate, null, 2));
 //   generateMasterDictionary()
}
async function generateMasterDictionary() {
    const words = await collectAllWords();
    
    // This creates a text blob you can copy-paste into a new JS file
    const dictionaryTemplate = {};
    words.forEach(word => {
        dictionaryTemplate[word] = ""; // Leave value empty for you to fill in Sinhala
    });

    console.log("Copy this into your localDictionary.js file:");
    console.log(JSON.stringify(dictionaryTemplate, null, 2));
}