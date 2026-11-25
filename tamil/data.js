const vocabularyData = [
	// 1. වාක්‍ය සහ සුභ පැතුම් (Sentences & Greetings)
	{
		id: 1,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "ඔයාගේ වයස කීයද?",
		tamil: "உனக்கு எத்தனை வயசு?",
		tamilPolite: "உங்களுக்கு எத்தனை வயது?",
		phonetic: "උනක්කු එත්තනෛ වයසු? (මිත්‍රශීලී) / උංගළුක්කු එත්තනෛ වයදු? (ගරුත්වයෙන්)",
		speechText: "உனக்கு எத்தனை வயசு?",
		emoji: "🎂"
	},
	{
		id: 2,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "මම ඇතුළට එන්නද?",
		tamil: "நான் உள்ளே வரலாமா?",
		phonetic: "නාන් උල්ලේ වරලාමා?",
		speechText: "நான் உள்ளே வரலாமா?",
		emoji: "🚪"
	},
	{
		id: 3,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "මම එලියට යන්නම් / යනවා",
		tamil: "நான் வெளியே போகலாம் / போறேன்",
		phonetic: "නාන් වෙලියේ පෝහලාම් / පෝරේන්",
		speechText: "நான் வெளியே போகலாம்",
		emoji: "🚶"
	},
	{
		id: 7,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "ආයුබෝවන්",
		tamil: "வணக்கம்",
		phonetic: "වණක්කම්",
		speechText: "வணக்கம்",
		emoji: "🙏"
	},
	{
		id: 8,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "එන්න ඉඳගන්න",
		tamil: "வாருங்கள் உட்காருங்கள்",
		phonetic: "වාරුංගල් උට්කාරුංගල්",
		speechText: "வாருங்கள் உட்காருங்கள்",
		emoji: "🪑"
	},
	{
		id: 9,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "ස්තූතියි",
		tamil: "நன்றி",
		phonetic: "නන්ද්‍රි",
		speechText: "நன்றி",
		emoji: "🤝"
	},
	{
		id: 10,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "සැප සනීප කොහොමද?",
		tamil: "எப்படி இருக்கிறீர்கள்?",
		phonetic: "එප්පඩි ඉරුක්කිරීර්ගල්?",
		speechText: "எப்படி இருக்கிறீர்கள்?",
		emoji: "😊"
	},
	{
		id: 11,
		category: "meetings",
		categoryName: "හමුවීම්",
		sinhala: "හොඳින් ඉන්නවා",
		tamil: "நன்றாக இருக்கிறேன்",
		phonetic: "නන්ද්‍රාග ඉරුක්කිරේන්",
		speechText: "நன்றாக இருக்கிறேன்",
		emoji: "👍"
	},

	// 3. මල් වර්ග (Flowers)
	{
		id: 12,
		category: "flowers",
		categoryName: "මල් වර්ග",
		sinhala: "අරලිය මල්",
		tamil: "அலரிப் பூ",
		phonetic: "අලරිප් පූ",
		speechText: "அலரிப் பூ",
		emoji: "🌺"
	},
	{
		id: 13,
		category: "flowers",
		categoryName: "මල් වර්ග",
		sinhala: "රෝස මල්",
		tamil: "ரோஜாப் பூ",
		phonetic: "රෝජාප් පූ",
		speechText: "ரோஜாப் பூ",
		emoji: "🌹"
	},
	{
		id: 14,
		category: "flowers",
		categoryName: "මල් වර්ග",
		sinhala: "පිච්ච මල්",
		tamil: "மல்லிகைப் பூ",
		phonetic: "මල්ලිගෛප් පූ",
		speechText: "மல்லிகைப் பூ",
		emoji: "🌼"
	},
	{
		id: 15,
		category: "flowers",
		categoryName: "මල් වර්ග",
		sinhala: "නෙළුම් මල්",
		tamil: "தாமரைப் பூ",
		phonetic: "තාමරෛප් පූ",
		speechText: "தாமரைப் பூ",
		emoji: "🪷"
	},

	// 4. පලතුරු වර්ග (Fruits)
	{
		id: 16,
		category: "fruits",
		categoryName: "පලතුරු වර්ග",
		sinhala: "අන්නාසි",
		tamil: "அன்னாசி",
		phonetic: "අන්නාසි",
		speechText: "அன்னாசி",
		emoji: "🍍"
	},
	{
		id: 17,
		category: "fruits",
		categoryName: "පලතුරු වර්ග",
		sinhala: "අඹ",
		tamil: "மாம்பழம்",
		phonetic: "මාම්පළම්",
		speechText: "மாம்பழம்",
		emoji: "🥭"
	},
	{
		id: 18,
		category: "fruits",
		categoryName: "පලතුරු වර්ග",
		sinhala: "කෙසෙල්",
		tamil: "வாழைப்பழம்",
		phonetic: "වාළෛප්පළම්",
		speechText: "வாழைப்பழம்",
		emoji: "🍌"
	},
	{
		id: 19,
		category: "fruits",
		categoryName: "පලතුරු වර්ග",
		sinhala: "පැපොල්",
		tamil: "பப்பாளி",
		phonetic: "පප්පාලි",
		speechText: "பப்பாளி",
		emoji: "🍈"
	},
	{
		id: 20,
		category: "fruits",
		categoryName: "පලතුරු වර්ග",
		sinhala: "දොඩම්",
		tamil: "தோடம்பழம்",
		phonetic: "තෝඩම්පළම්",
		speechText: "தோடம்பழம்",
		emoji: "🍊"
	},

	// 5. ඇඟේ කොටස් (Body Parts)
	{
		id: 21,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "ඔළුව",
		tamil: "தலை",
		phonetic: "තලෛ",
		speechText: "தலை",
		emoji: "🗣️"
	},
	{
		id: 22,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "කන",
		tamil: "காது",
		phonetic: "කාදු",
		speechText: "காது",
		emoji: "👂"
	},
	{
		id: 23,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "කට",
		tamil: "வாய்",
		phonetic: "වායි",
		speechText: "வாய்",
		emoji: "👄"
	},
	{
		id: 24,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "නහය",
		tamil: "மூக்கு",
		phonetic: "මූක්කු",
		speechText: "மூக்கு",
		emoji: "👃"
	},
	{
		id: 25,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "ඇස්",
		tamil: "கண்கள்",
		phonetic: "කණ්ගල්",
		speechText: "கண்கள்",
		emoji: "👁️"
	},
	{
		id: 26,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "බඩ",
		tamil: "வயிறு",
		phonetic: "වයිරු",
		speechText: "வயிறு",
		emoji: "🫃"
	},
	{
		id: 27,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "අත්",
		tamil: "கைகள்",
		phonetic: "කෛගල්",
		speechText: "கைகள்",
		emoji: "✋"
	},
	{
		id: 28,
		category: "body",
		categoryName: "ඇඟේ කොටස්",
		sinhala: "කකුල්",
		tamil: "கால்கள்",
		phonetic: "කාල්ගල්",
		speechText: "கால்கள்",
		emoji: "🦶"
	},

	// 6. පාට වර්ග (Colors)
	{
		id: 29,
		category: "colors",
		categoryName: "පාට වර්ග",
		sinhala: "රතු",
		tamil: "சிவப்பு",
		phonetic: "සිවප්පු",
		speechText: "சிவப்பு",
		emoji: "🔴"
	},
	{
		id: 30,
		category: "colors",
		categoryName: "පාට වර්ග",
		sinhala: "කොළ",
		tamil: "பச்சை",
		phonetic: "පච්චෛ",
		speechText: "பச்சை",
		emoji: "🟢"
	},
	{
		id: 31,
		category: "colors",
		categoryName: "පාට වර්ග",
		sinhala: "නිල්",
		tamil: "நீலம்",
		phonetic: "නීලම්",
		speechText: "நீலம்",
		emoji: "🔵"
	},
	{
		id: 32,
		category: "colors",
		categoryName: "පාට වර්ග",
		sinhala: "කළු",
		tamil: "கறுப்பு",
		phonetic: "කරුප්පු",
		speechText: "கறுப்பு",
		emoji: "⬛"
	},
	{
		id: 33,
		category: "colors",
		categoryName: "පාට වර්ග",
		sinhala: "කහ",
		tamil: "மஞ்சள்",
		phonetic: "මඤ්ජල්",
		speechText: "மஞ்சள்",
		emoji: "🟡"
	},
	{
		id: 34,
		category: "colors",
		categoryName: "පාට වර්ග",
		sinhala: "සුදු",
		tamil: "வெள்ளை",
		phonetic: "වෙල්ලෛ",
		speechText: "வெள்ளை",
		emoji: "⚪"
	},

	// 7. කුරුල්ලෝ (Birds)
	{
		id: 35,
		category: "birds",
		categoryName: "කුරුල්ලෝ",
		sinhala: "ගිරවා",
		tamil: "கிளி",
		phonetic: "කිලි",
		speechText: "கிளி",
		emoji: "🦜"
	},
	{
		id: 36,
		category: "birds",
		categoryName: "කුරුල්ලෝ",
		sinhala: "කුකුළා",
		tamil: "சேவல்",
		phonetic: "සේවල්",
		speechText: "சேவல்",
		emoji: "🐓"
	},
	{
		id: 37,
		category: "birds",
		categoryName: "කුරුල්ලෝ",
		sinhala: "කපුටා",
		tamil: "காகம்",
		phonetic: "කාගම්",
		speechText: "காகம்",
		emoji: "🐦‍⬛"
	},
	{
		id: 38,
		category: "birds",
		categoryName: "කුරුල්ලෝ",
		sinhala: "මොනරා",
		tamil: "மயில்",
		phonetic: "මයිල්",
		speechText: "மயில்",
		emoji: "🦚"
	},
	{
		id: 39,
		category: "birds",
		categoryName: "කුරුල්ලෝ",
		sinhala: "පරවියා",
		tamil: "புறா",
		phonetic: "පුරා",
		speechText: "புறா",
		emoji: "🕊️"
	},

	// 8. ඉලක්කම් 1 - 10 (Numbers 1 - 10)
	{
		id: 40,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "1 - එක",
		tamil: "ஒன்று",
		phonetic: "ඔන්ඩ්‍රු",
		speechText: "ஒன்று",
		emoji: "1️⃣"
	},
	{
		id: 41,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "2 - දෙක",
		tamil: "இரண்டு",
		phonetic: "ඉරණ්ඩු",
		speechText: "இரண்டு",
		emoji: "2️⃣"
	},
	{
		id: 42,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "3 - තුන",
		tamil: "மூன்று",
		phonetic: "මූන්ඩ්‍රු",
		speechText: "மூன்று",
		emoji: "3️⃣"
	},
	{
		id: 43,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "4 - හතර",
		tamil: "நான்கு",
		phonetic: "නාන්ගු",
		speechText: "நான்கு",
		emoji: "4️⃣"
	},
	{
		id: 44,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "5 - පහ",
		tamil: "ஐந்து",
		phonetic: "අයින්දු",
		speechText: "ஐந்து",
		emoji: "5️⃣"
	},
	{
		id: 45,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "6 - හය",
		tamil: "ஆறு",
		phonetic: "ආරු",
		speechText: "ஆறு",
		emoji: "6️⃣"
	},
	{
		id: 46,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "7 - හත",
		tamil: "ஏழு",
		phonetic: "ඒළු",
		speechText: "ஏழு",
		emoji: "7️⃣"
	},
	{
		id: 47,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "8 - අට",
		tamil: "எட்டு",
		phonetic: "එට්ටු",
		speechText: "எட்டு",
		emoji: "8️⃣"
	},
	{
		id: 48,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "9 - නවය",
		tamil: "ஒன்பது",
		phonetic: "ඔන්බදු",
		speechText: "ஒன்பது",
		emoji: "9️⃣"
	},
	{
		id: 49,
		category: "numbers",
		categoryName: "ඉලක්කම් (1 - 10)",
		sinhala: "10 - දහය",
		tamil: "பத்து",
		phonetic: "පත්තු",
		speechText: "பத்து",
		emoji: "🔟"
	},

	{
		id: 100,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "බල්ලා",
		tamil: "நாய்",
		phonetic: "නායි",
		speechText: "நாய்",
		emoji: "🐕"
	},
	{
		id: 101,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "පූසා",
		tamil: "பூனை",
		phonetic: "පූනෛ",
		speechText: "பூனை",
		emoji: "🐈"
	},
	{
		id: 102,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "අලියා",
		tamil: "யானை",
		phonetic: "යානෛ",
		speechText: "யானை",
		emoji: "🐘"
	},
	{
		id: 103,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "එළදෙන / ගවයා",
		tamil: "பசு",
		phonetic: "පසු",
		speechText: "பசு",
		emoji: "🐄"
	},
	{
		id: 104,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "එළුවා",
		tamil: "ஆடு",
		phonetic: "ආඩු",
		speechText: "ஆடு",
		emoji: "🐐"
	},
	{
		id: 105,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "අශ්වයා",
		tamil: "குதிரை",
		phonetic: "කුදිරෛ",
		speechText: "குதிரை",
		emoji: "🐎"
	},
	{
		id: 106,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "සිංහයා",
		tamil: "சிங்கம்",
		phonetic: "සිංගම්",
		speechText: "சிங்கம்",
		emoji: "🦁"
	},
	{
		id: 107,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "කොටියා",
		tamil: "புலி",
		phonetic: "පුලි",
		speechText: "புலி",
		emoji: "🐅"
	},
	{
		id: 108,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "වඳුරා",
		tamil: "குரங்கு",
		phonetic: "කුරංගු",
		speechText: "குரங்கு",
		emoji: "🐒"
	},
	{
		id: 109,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "හාවා",
		tamil: "முயல்",
		phonetic: "මුයල්",
		speechText: "முயல்",
		emoji: "🐇"
	},
	{
		id: 110,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "මුවා",
		tamil: "மான்",
		phonetic: "මාන්",
		speechText: "மான்",
		emoji: "🦌"
	},
	{
		id: 111,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "වලසා",
		tamil: "கரடி",
		phonetic: "කරඩි",
		speechText: "கரடி",
		emoji: "🐻"
	},
	{
		id: 112,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "නරියා",
		tamil: "நரி",
		phonetic: "නරි",
		speechText: "நரி",
		emoji: "🦊"
	},
	{
		id: 113,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "ඌරා",
		tamil: "பன்றி",
		phonetic: "පන්ඩ්‍රි",
		speechText: "பன்றி",
		emoji: "🐖"
	},
	{
		id: 114,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "මීයා",
		tamil: "எலி",
		phonetic: "එලි",
		speechText: "எலி",
		emoji: "🐀"
	},
	{
		id: 115,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "ලේනා",
		tamil: "அணில்",
		phonetic: "අණිල්",
		speechText: "அணில்",
		emoji: "🐿️"
	},
	{
		id: 116,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "නයා / සර්පයා",
		tamil: "பாம்பு",
		phonetic: "පාම්බු",
		speechText: "பாம்பு",
		emoji: "🐍"
	},
	{
		id: 117,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "ඉබ්බා",
		tamil: "ஆமை",
		phonetic: "ආමෛ",
		speechText: "ஆமை",
		emoji: "🐢"
	},
	{
		id: 118,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "කිඹුලා",
		tamil: "முதலை",
		phonetic: "මුදලෛ",
		speechText: "முதலை",
		emoji: "🐊"
	},
	{
		id: 119,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "ගෙම්බා",
		tamil: "தவளை",
		phonetic: "තවළෛ",
		speechText: "தவளை",
		emoji: "🐸"
	},
	{
		id: 120,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "මාළුවා",
		tamil: "மீன்",
		phonetic: "මීන්",
		speechText: "மீன்",
		emoji: "🐟"
	},
	{
		id: 121,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "සමනලයා",
		tamil: "வண்ணத்துப்பூச்சி",
		phonetic: "වණ්ණත්තුප්පූච්චි",
		speechText: "வண்ணத்துப்பூச்சி",
		emoji: "🦋"
	},
	{
		id: 122,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "මී මැස්සා",
		tamil: "தேனீ",
		phonetic: "තේනී",
		speechText: "தேனீ",
		emoji: "🐝"
	},
	{
		id: 123,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "කූඹියා",
		tamil: "எறும்பு",
		phonetic: "එරුම්බු",
		speechText: "எறும்பு",
		emoji: "🐜"
	},
	{
		id: 124,
		category: "animals",
		categoryName: "සතුන්",
		sinhala: "මකුළුවා",
		tamil: "சிலந்தி",
		phonetic: "සිලන්දි",
		speechText: "சிலந்தி",
		emoji: "🕷️"
	},
//vegetables
{
    id: 125,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "කැරට්",
    tamil: "கரட்",
    phonetic: "කරට්",
    speechText: "கரட்",
    emoji: "🥕"
},
{
    id: 126,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "අල / අර්තාපල්",
    tamil: "உருளைக்கிழங்கு",
    phonetic: "උරුලෛක්කිලංගු",
    speechText: "உருளைக்கிழங்கு",
    emoji: "🥔"
},
{
    id: 127,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "තක්කාලි",
    tamil: "தக்காளி",
    phonetic: "තක්කාලි",
    speechText: "தக்காளி",
    emoji: "🍅"
},
{
    id: 128,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "බීට්රූට්",
    tamil: "பீட்ரூட்",
    phonetic: "බීට්රූට්",
    speechText: "பீட்ரூட்",
    emoji: "🫜"
},
{
    id: 129,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "ගෝවා",
    tamil: "கோவா",
    phonetic: "කෝවා",
    speechText: "கோவா",
    emoji: "🥬"
},
{
    id: 130,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "වම්බටු",
    tamil: "கத்தரிக்காய்",
    phonetic: "කත්තරික්කායි",
    speechText: "கத்தரிக்காய்",
    emoji: "🍆"
},
{
    id: 131,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "බෝංචි",
    tamil: "போஞ்சி",
    phonetic: "පෝංචි",
    speechText: "போஞ்சி",
    emoji: "🫛"
},
{
    id: 132,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "වට්ටක්කා",
    tamil: "பூசணிக்காய்",
    phonetic: "පූසණික්කායි",
    speechText: "பூசணிக்காய்",
    emoji: "🎃"
},
{
    id: 133,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "පිපිඤ්ඤා",
    tamil: "வெள்ளரிக்காய்",
    phonetic: "වෙල්ලරික්කායි",
    speechText: "வெள்ளரிக்காய்",
    emoji: "🥒"
},
{
    id: 134,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "කරවිල",
    tamil: "பாகற்காய்",
    phonetic: "පාගර්ක්කායි",
    speechText: "பாகற்காய்",
    emoji: "🥒"
},
{
    id: 135,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "බණ්ඩක්කා",
    tamil: "வெண்டைக்காய்",
    phonetic: "වෙන්ඩෛක්කායි",
    speechText: "வெண்டைக்காய்",
    emoji: "🌿"
},
{
    id: 136,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "මෑ කරල්",
    tamil: "பயற்றங்காய்",
    phonetic: "පයට්ට්‍රංගායි",
    speechText: "பயற்றங்காய்",
    emoji: "🫘"
},
{
    id: 137,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "මුරුංගා කරල්",
    tamil: "முருங்கைக்காய்",
    phonetic: "මුරුංගෛක්කායි",
    speechText: "முருங்கைக்காய்",
    emoji: "🌱"
},
{
    id: 138,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "ලූනු",
    tamil: "வெங்காயம்",
    phonetic: "වෙන්ගායම්",
    speechText: "வெங்காயம்",
    emoji: "🧅"
},
{
    id: 139,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "සුදු ලූනු",
    tamil: "பூண்டு",
    phonetic: "පූන්ඩු",
    speechText: "பூண்டு",
    emoji: "🧄"
},
{
    id: 140,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "ඉඟුරු",
    tamil: "இஞ்சி",
    phonetic: "ඉංජි",
    speechText: "இஞ்சி",
    emoji: "🫚"
},
{
    id: 141,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "අමු මිරිස්",
    tamil: "பச்சை மிளகாய்",
    phonetic: "පච්චෛ මිලගායි",
    speechText: "பச்சை மிளகாய்",
    emoji: "🌶️"
},
{
    id: 142,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "මාළු මිරිස්",
    tamil: "குடமிளகாய்",
    phonetic: "කුඩමිලගායි",
    speechText: "குடமிளகாய்",
    emoji: "🫑"
},
{
    id: 143,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "රාබු",
    tamil: "முள்ளங்கி",
    phonetic: "මුල්ලංගි",
    speechText: "முள்ளங்கி",
    emoji: "🥬"
},
{
    id: 144,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "බඩ ඉරිඟු",
    tamil: "சோளம்",
    phonetic: "සෝලම්",
    speechText: "சோளம்",
    emoji: "🌽"
},
{
    id: 145,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "පතෝල",
    tamil: "புடலங்காய்",
    phonetic: "පුඩලංගායි",
    speechText: "புடலங்காய்",
    emoji: "🥒"
},
{
    id: 146,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "වැටකොළු",
    tamil: "பீர்க்கங்காய்",
    phonetic: "පීර්ක්කංගායි",
    speechText: "பீர்க்கங்காய்",
    emoji: "🥒"
},
{
    id: 147,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "කැකිරි",
    tamil: "கக்கரி",
    phonetic: "කක්කරි",
    speechText: "கக்கரி",
    emoji: "🍈"
},
{
    id: 148,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "කොස්",
    tamil: "பலாக்காய்",
    phonetic: "පලාක්කායි",
    speechText: "பலாக்காய்",
    emoji: "🍈"
},
{
    id: 149,
    category: "vegetables",
    categoryName: "එළවළු",
    sinhala: "දෙල්",
    tamil: "ஈரப்பலா",
    phonetic: "ඊරප්පලා",
    speechText: "ஈரப்பலா",
    emoji: "🌳"
},
//family
{
    id: 150,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "අම්මා",
    tamil: "அம்மா",
    phonetic: "අම්මා",
    speechText: "அம்மா",
    emoji: "👩"
},
{
    id: 151,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "තාත්තා",
    tamil: "அப்பா",
    phonetic: "අප්පා",
    speechText: "அப்பா",
    emoji: "👨"
},
{
    id: 152,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "අයියා",
    tamil: "அண்ணா",
    phonetic: "අණ්ණා",
    speechText: "அண்ணா",
    emoji: "👦"
},
{
    id: 153,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "අක්කා",
    tamil: "அக்கா",
    phonetic: "අක්කා",
    speechText: "அக்கா",
    emoji: "👧"
},
{
    id: 154,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "මල්ලි",
    tamil: "தம்பி",
    phonetic: "තම්බි",
    speechText: "தம்பி",
    emoji: "🧒"
},
{
    id: 155,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "නංගි",
    tamil: "தங்கை",
    phonetic: "තංගෛ",
    speechText: "தங்கை",
    emoji: "👧"
},
{
    id: 156,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "සීයා",
    tamil: "தாத்தா",
    phonetic: "තාත්තා",
    speechText: "தாத்தா",
    emoji: "👴"
},
{
    id: 157,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "ආච්චි / අත්තම්මා",
    tamil: "பாட்டி",
    phonetic: "පාට්ටි",
    speechText: "பாட்டி",
    emoji: "👵"
},
{
    id: 158,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "පුතා",
    tamil: "மகன்",
    phonetic: "මගන්",
    speechText: "மகன்",
    emoji: "👦"
},
{
    id: 159,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "දුව",
    tamil: "மகள்",
    phonetic: "මගල්",
    speechText: "மகள்",
    emoji: "👧"
},
{
    id: 160,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "මාමා",
    tamil: "மாமா",
    phonetic: "මාමා",
    speechText: "மாமா",
    emoji: "🧔"
},
{
    id: 161,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "නැන්දා",
    tamil: "மாமி / அத்தை",
    phonetic: "මාමි / අත්තෛ",
    speechText: "மாமி",
    emoji: "👩"
},
{
    id: 162,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "ලොකු තාත්තා / බාප්පා",
    tamil: "பெரியப்பா / சித்தப்பா",
    phonetic: "පෙරියප්පා / සිත්තප්පා",
    speechText: "பெரியப்பா",
    emoji: "👨"
},
{
    id: 163,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "ලොකු අම්මා / පුංචි අම්මා",
    tamil: "பெரியம்மா / சித்தி",
    phonetic: "පෙරියම්මා / සිත්ති",
    speechText: "சித்தி",
    emoji: "👩"
},
{
    id: 164,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "ස්වාමිපුරුෂයා / සැමියා",
    tamil: "கணவன்",
    phonetic: "කණවන්",
    speechText: "கணவன்",
    emoji: "🤵"
},
{
    id: 165,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "බිරිඳ",
    tamil: "மனைவி",
    phonetic: "මනෛවි",
    speechText: "மனைவி",
    emoji: "👰"
},
{
    id: 166,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "බිලිඳා / බබා",
    tamil: "குழந்தை",
    phonetic: "කුළන්දෛ",
    speechText: "குழந்தை",
    emoji: "👶"
},
{
    id: 167,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "දෙමාපියන්",
    tamil: "பெற்றோர்",
    phonetic: "පෙට්ට්‍රෝර්",
    speechText: "பெற்றோர்",
    emoji: "👨‍👩‍👧"
},
{
    id: 168,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "පවුල",
    tamil: "குடும்பம்",
    phonetic: "කුඩුම්බම්",
    speechText: "குடும்பம்",
    emoji: "👨‍👩‍👧‍👦"
},
{
    id: 169,
    category: "family",
    categoryName: "පවුලේ සාමාජිකයන්",
    sinhala: "නෑදෑයන්",
    tamil: "உறவினர்கள்",
    phonetic: "උරවිනර්ගල්",
    speechText: "உறவினர்கள்",
    emoji: "👪"
}
	  ,
//school
{
    id: 170,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පාසල",
    tamil: "பாடசாலை",
    phonetic: "පාඩසාලෛ",
    speechText: "பாடசாலை",
    emoji: "🏫"
},
{
    id: 171,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පන්ති කාමරය",
    tamil: "வகுப்பறை",
    phonetic: "වගුප්පරෛ",
    speechText: "வகுப்பறை",
    emoji: "🧑‍🏫"
},
{
    id: 172,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "විදුහල්පති",
    tamil: "அதிபர்",
    phonetic: "අදිබර්",
    speechText: "அதிபர்",
    emoji: "👨‍💼"
},
{
    id: 173,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "ගුරුවරයා / ගුරුවරිය",
    tamil: "ஆசிரியர்",
    phonetic: "ආසිරියර්",
    speechText: "ஆசிரியர்",
    emoji: "👩‍🏫"
},
{
    id: 174,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "ශිෂ්‍යයා",
    tamil: "மாணவன்",
    phonetic: "මාණවන්",
    speechText: "மாணவன்",
    emoji: "👦"
},
{
    id: 175,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "ශිෂ්‍යාව",
    tamil: "மாணவி",
    phonetic: "මාණවි",
    speechText: "மாணவி",
    emoji: "👧"
},
{
    id: 176,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පොත",
    tamil: "புத்தகம்",
    phonetic: "පුත්තගම්",
    speechText: "புத்தகம்",
    emoji: "📖"
},
{
    id: 177,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "අභ්‍යාස පොත",
    tamil: "அப்பியாசக் கொப்பி",
    phonetic: "අප්පියාසක් කොප්පි",
    speechText: "அப்பியாசக் கொப்பி",
    emoji: "📓"
},
{
    id: 178,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පෑන",
    tamil: "பேனா",
    phonetic: "පේනා",
    speechText: "பேனா",
    emoji: "🖊️"
},
{
    id: 179,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පැන්සල",
    tamil: "பென்சில்",
    phonetic: "පෙන්සිල්",
    speechText: "பென்சில்",
    emoji: "✏️"
},
{
    id: 180,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "මකනය",
    tamil: "அழிப்பான்",
    phonetic: "අලිප්පාන්",
    speechText: "அழிப்பான்",
    emoji: "🧼"
},
{
    id: 181,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "අඩි කෝදුව",
    tamil: "அடிமட்டம்",
    phonetic: "අඩිමට්ටම්",
    speechText: "அடிமட்டம்",
    emoji: "📏"
},
{
    id: 182,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පාසල් බෑගය",
    tamil: "புத்தகப் பை",
    phonetic: "පුත්තගප් පෛ",
    speechText: "புத்தகப் பை",
    emoji: "🎒"
},
{
    id: 183,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "කළු ලෑල්ල",
    tamil: "கரும்பலகை",
    phonetic: "කරුම්බලගෛ",
    speechText: "கரும்பலகை",
    emoji: "⬛"
},
{
    id: 184,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "රටහුණු",
    tamil: "வெண்கட்டி",
    phonetic: "වෙණ්කට්ටි",
    speechText: "வெண்கட்டி",
    emoji: "🖍️"
},
{
    id: 185,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "මේසය",
    tamil: "மேசை",
    phonetic: "මේසෛ",
    speechText: "மேசை",
    emoji: "🪑"
},
{
    id: 186,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පුටුව",
    tamil: "கதிரை",
    phonetic: "කදිරෛ",
    speechText: "கதிரை",
    emoji: "💺"
},
{
    id: 187,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පුස්තකාලය",
    tamil: "நூலகம்",
    phonetic: "නූලගම්",
    speechText: "நூலகம்",
    emoji: "📚"
},
{
    id: 188,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "ක්‍රීඩා පිටිය",
    tamil: "விளையாட்டு மைதானம்",
    phonetic: "විළෛයාට්ටු මෛදානම්",
    speechText: "விளையாட்டு மைதானம்",
    emoji: "🏟️"
},
{
    id: 189,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "විභාගය",
    tamil: "பரீட்சை",
    phonetic: "පරීට්සෛ",
    speechText: "பரீட்சை",
    emoji: "📝"
},
{
    id: 190,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පාසල් නිල ඇඳුම",
    tamil: "பாடசாலைச் சீருடை",
    phonetic: "පාඩසාලෛච් සීරුඩෛ",
    speechText: "பாடசாலைச் சீருடை",
    emoji: "👔"
},
{
    id: 191,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "සිතියම",
    tamil: "தேசப்படம்",
    phonetic: "දේසප්පඩම්",
    speechText: "தேசப்படம்",
    emoji: "🗺️"
},
{
    id: 192,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "වතුර බෝතලය",
    tamil: "தண்ணீர்ப் போத்தல்",
    phonetic: "තණ්ණීර්ප් පෝත්තල්",
    speechText: "தண்ணீர்ப் போத்தல்",
    emoji: "🍶"
},
{
    id: 193,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "පැන්සල් කටරය",
    tamil: "பென்சில் சீவி",
    phonetic: "පෙන්සිල් සීවි",
    speechText: "பென்சில் சீவி",
    emoji: "🔪"
},
{
    id: 194,
    category: "school",
    categoryName: "පාසල සහ උපකරණ",
    sinhala: "විද්‍යාගාරය",
    tamil: "ஆய்வுகூடம்",
    phonetic: "ආයිවුකූඩම්",
    speechText: "ஆய்வுகூடம்",
    emoji: "🔬"
}
		  ,
//professions
	{
	  id: 195,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "ගුරුවරයා / ගුරුවරිය",
	  tamil: "ஆசிரியர்",
	  phonetic: "ආසිරියර්",
	  speechText: "ஆசிரியர்",
	  emoji: "👩‍🏫"
	},
	{
	  id: 196,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "වෛද්‍යවරයා",
	  tamil: "வைத்தியர்",
	  phonetic: "වෛත්තියර්",
	  speechText: "வைத்தியர்",
	  emoji: "👨‍⚕️"
	},
	{
	  id: 197,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "හෙදිය",
	  tamil: "தாதி",
	  phonetic: "තාදි",
	  speechText: "தாதி",
	  emoji: "👩‍⚕️"
	},
	{
	  id: 198,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "ගොවියා",
	  tamil: "விவசாயி",
	  phonetic: "විවසායි",
	  speechText: "விவசாயி",
	  emoji: "👨‍🌾"
	},
	{
	  id: 199,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "පොලිස් නිලධාරියා",
	  tamil: "பொலிஸ் அதிகாரி",
	  phonetic: "පොලිස් අදිගාරි",
	  speechText: "பொலிஸ் அதிகாரி",
	  emoji: "👮"
	},
	{
	  id: 200,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "ඉංජිනේරුවා",
	  tamil: "பொறியியலாளர்",
	  phonetic: "පොරියියලාළර්",
	  speechText: "பொறியியலாளர்",
	  emoji: "👷‍♂️"
	},
	{
	  id: 201,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "නීතිඥයා",
	  tamil: "சட்டத்தரணி",
	  phonetic: "සට්ටත්තරණි",
	  speechText: "சட்டத்தரணி",
	  emoji: "⚖️"
	},
	{
	  id: 202,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "රියදුරු",
	  tamil: "சாரதி",
	  phonetic: "සාරදි",
	  speechText: "சாரதி",
	  emoji: "🚗"
	},
	{
	  id: 203,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "ධීවරයා",
	  tamil: "மீனவர்",
	  phonetic: "මීනවර්",
	  speechText: "மீனவர்",
	  emoji: "🎣"
	},
	{
	  id: 204,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "වඩු කාර්මිකයා",
	  tamil: "தச்சர்",
	  phonetic: "තච්චර්",
	  speechText: "தச்சர்",
	  emoji: "🪚"
	},
	{
	  id: 205,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "කම්මල්කරු / ලෝහ කාර්මිකයා",
	  tamil: "கொல்லர்",
	  phonetic: "කොල්ලර්",
	  speechText: "கொல்லர்",
	  emoji: "🔨"
	},
	{
	  id: 206,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "කුඹල්කරු",
	  tamil: "குயவர்",
	  phonetic: "කුයවර්",
	  speechText: "குயவர்",
	  emoji: "🏺"
	},
	{
	  id: 207,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "වෙළෙන්දා",
	  tamil: "வியாபாரி",
	  phonetic: "වියාපාරි",
	  speechText: "வியாபாரி",
	  emoji: "🏪"
	},
	{
	  id: 208,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "කෝකියා / සූපවේදියා",
	  tamil: "சமையல்காரர்",
	  phonetic: "සමෛයල්කාරර්",
	  speechText: "சமையல்காரர்",
	  emoji: "👨‍🍳"
	},
	{
	  id: 209,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "තැපැල්කරු",
	  tamil: "தபால்காரர்",
	  phonetic: "තපාල්කාරර්",
	  speechText: "தபால்காரர்",
	  emoji: "✉️"
	},
	{
	  id: 210,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "කරණවෑමියා / බාබර්",
	  tamil: "நாவிதர்",
	  phonetic: "නාවිදර්",
	  speechText: "நாவிதர்",
	  emoji: "✂️"
	},
	{
	  id: 211,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "කලාකරුවා / චිත්‍ර ශිල්පියා",
	  tamil: "கலைஞர்",
	  phonetic: "කලෛඤර්",
	  speechText: "கலைஞர்",
	  emoji: "🎨"
	},
	{
	  id: 212,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "ගායකයා / ගායිකාව",
	  tamil: "பாடகர்",
	  phonetic: "පාඩගර්",
	  speechText: "பாடகர்",
	  emoji: "🎤"
	},
	{
	  id: 213,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "පුවත්පත් වාර්තාකරු",
	  tamil: "பத்திரிகையாளர்",
	  phonetic: "පත්තිරිගෛයාළර්",
	  speechText: "பத்திரிகையாளர்",
	  emoji: "📰"
	},
	{
	  id: 214,
	  category: "professions",
	  categoryName: "රැකියා",
	  sinhala: "කම්කරුවා",
	  tamil: "தொழிலாளி",
	  phonetic: "තොලිලාලි",
	  speechText: "தொழிலாளி",
	  emoji: "🛠️"
	},
	//vehicles
	{
		id: 215,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "බස් රථය",
		tamil: "பேருந்து",
		phonetic: "පේරුන්දු",
		speechText: "பேருந்து",
		emoji: "🚌"
	  },
	  {
		id: 216,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "දුම්රිය",
		tamil: "ரயில்",
		phonetic: "රයිල්",
		speechText: "ரயில்",
		emoji: "🚆"
	  },
	  {
		id: 217,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "කාර් රථය",
		tamil: "மகிழுந்து",
		phonetic: "මගිළුන්දු",
		speechText: "மகிழுந்து",
		emoji: "🚗"
	  },
	  {
		id: 218,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "වෑන් රථය",
		tamil: "வேன்",
		phonetic: "වේන්",
		speechText: "வேன்",
		emoji: "🚐"
	  },
	  {
		id: 219,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ලොරිය",
		tamil: "லொறி",
		phonetic: "ලොරි",
		speechText: "லொறி",
		emoji: "🚚"
	  },
	  {
		id: 220,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ත්‍රීරෝද රථය",
		tamil: "முச்சக்கர வண்டி",
		phonetic: "මුච්චක්කර වණ්ඩි",
		speechText: "முச்சக்கர வண்டி",
		emoji: "🛺"
	  },
	  {
		id: 221,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "යතුරුපැදිය",
		tamil: "மோட்டார் சைக்கிள்",
		phonetic: "මෝට්ටාර් සෛක්කිල්",
		speechText: "மோட்டார் சைக்கிள்",
		emoji: "🏍️"
	  },
	  {
		id: 222,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "පාපැදිය / බයිසිකලය",
		tamil: "மிதிவண்டி",
		phonetic: "මිදිවණ්ඩි",
		speechText: "மிதிவண்டி",
		emoji: "🚲"
	  },
	  {
		id: 223,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ගුවන් යානය",
		tamil: "விமானம்",
		phonetic: "විමානම්",
		speechText: "விமானம்",
		emoji: "✈️"
	  },
	  {
		id: 224,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "හෙලිකොප්ටරය",
		tamil: "உலங்குவானூர்தி",
		phonetic: "උලංගුවානූර්දි",
		speechText: "உலங்குவானூர்தி",
		emoji: "🚁"
	  },
	  {
		id: 225,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "නැව",
		tamil: "கப்பல்",
		phonetic: "කප්පල්",
		speechText: "கப்பல்",
		emoji: "🚢"
	  },
	  {
		id: 226,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "බෝට්ටුව",
		tamil: "படகு",
		phonetic: "පඩගු",
		speechText: "படகு",
		emoji: "🚤"
	  },
	  {
		id: 227,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ඔරුව",
		tamil: "தோணி",
		phonetic: "තෝණි",
		speechText: "தோணி",
		emoji: "🛶"
	  },
	  {
		id: 228,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ගිලන් රථය",
		tamil: "அம்புலன்ஸ்",
		phonetic: "අම්බුලන්ස්",
		speechText: "அம்புலன்ஸ்",
		emoji: "🚑"
	  },
	  {
		id: 229,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ගිනි නිවන රථය",
		tamil: "தீயணைப்பு வண்டி",
		phonetic: "තීයණෛප්පු වණ්ඩි",
		speechText: "தீயணைப்பு வண்டி",
		emoji: "🚒"
	  },
	  {
		id: 230,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "ට්‍රැක්ටරය",
		tamil: "உழவு இயந்திரம்",
		phonetic: "උළවු ඉයන්දිරම්",
		speechText: "உழவு இயந்திரம்",
		emoji: "🚜"
	  },
	  {
		id: 231,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "කරත්තය",
		tamil: "மாட்டு வண்டி",
		phonetic: "මාට්ටු වණ්ඩි",
		speechText: "மாட்டு வண்டி",
		emoji: "🐂"
	  },
	  {
		id: 232,
		category: "vehicles",
		categoryName: "වාහන",
		sinhala: "පාසල් බස් රථය",
		tamil: "பாடசாலைப் பேருந்து",
		phonetic: "පාඩසාලෛප් පේරුන්දු",
		speechText: "பாடசாலைப் பேருந்து",
		emoji: "🚐"
	  },
	  {
		id: 233,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "බත්",
		tamil: "சோறு",
		phonetic: "සෝරු",
		speechText: "சோறு",
		emoji: "🍚"
	  },
	  {
		id: 234,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "පාන්",
		tamil: "பாண்",
		phonetic: "පාන්",
		speechText: "பாண்",
		emoji: "🍞"
	  },
	  {
		id: 235,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "ආප්ප",
		tamil: "ஆப்பம்",
		phonetic: "ආප්පම්",
		speechText: "ஆப்பம்",
		emoji: "🥞"
	  },
	  {
		id: 236,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "ඉඳිආප්ප",
		tamil: "இடியப்பம்",
		phonetic: "ඉඩියප්පම්",
		speechText: "இடியப்பம்",
		emoji: "🍜"
	  },
	  {
		id: 237,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "තෝසේ",
		tamil: "தோசை",
		phonetic: "තෝසෛ",
		speechText: "தோசை",
		emoji: "🫓"
	  },
	  {
		id: 238,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "පිට්ටු",
		tamil: "பிட்டு",
		phonetic: "පිට්ටු",
		speechText: "பிட்டு",
		emoji: "筒"
	  },
	  {
		id: 239,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "රොටි",
		tamil: "ரொட்டி",
		phonetic: "රොට්ටි",
		speechText: "ரொட்டி",
		emoji: "🫓"
	  },
	  {
		id: 240,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "වඩේ",
		tamil: "வடை",
		phonetic: "වඩෛ",
		speechText: "வடை",
		emoji: "🍩"
	  },
	  {
		id: 241,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "බිත්තර",
		tamil: "முட்டை",
		phonetic: "මුට්ටෛ",
		speechText: "முட்டை",
		emoji: "🥚"
	  },
	  {
		id: 242,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "මස්",
		tamil: "இறைச்சி",
		phonetic: "ඉරෛච්චි",
		speechText: "இறைச்சி",
		emoji: "🍖"
	  },
	  {
		id: 243,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "මාළු",
		tamil: "மீன்",
		phonetic: "මීන්",
		speechText: "மீன்",
		emoji: "🐟"
	  },
	  {
		id: 244,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "පරිප්පු",
		tamil: "பருப்பு",
		phonetic: "පරුප්පු",
		speechText: "பருப்பு",
		emoji: "🍲"
	  },
	  {
		id: 245,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "සම්බෝල",
		tamil: "சம்பல்",
		phonetic: "සම්බල්",
		speechText: "சம்பல்",
		emoji: "🥗"
	  },
	  {
		id: 246,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "කේක්",
		tamil: "கேக்",
		phonetic: "කේක්",
		speechText: "கேக்",
		emoji: "🍰"
	  },
	  {
		id: 247,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "බිස්කට්",
		tamil: "பிஸ்கட்",
		phonetic: "බිස්කට්",
		speechText: "பிஸ்கட்",
		emoji: "🍪"
	  },
	  {
		id: 248,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "වතුර",
		tamil: "தண்ணீர்",
		phonetic: "තණ්ණීර්",
		speechText: "தண்ணீர்",
		emoji: "💧"
	  },
	  {
		id: 249,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "කිරි",
		tamil: "பால்",
		phonetic: "පාල්",
		speechText: "பால்",
		emoji: "🥛"
	  },
	  {
		id: 250,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "තේ",
		tamil: "தேநீர்",
		phonetic: "තේනීර්",
		speechText: "தேநீர்",
		emoji: "☕"
	  },
	  {
		id: 251,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "කෝපි",
		tamil: "கோப்பி",
		phonetic: "කෝප්පි",
		speechText: "கோப்பி",
		emoji: "☕"
	  },
	  {
		id: 252,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "පලතුරු යුෂ",
		tamil: "பழச்சாறு",
		phonetic: "පළච්චාරු",
		speechText: "பழச்சாறு",
		emoji: "🧃"
	  },
	  {
		id: 253,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "සීනි",
		tamil: "சீனி",
		phonetic: "සීනි",
		speechText: "சீனி",
		emoji: "🧂"
	  },
	  {
		id: 254,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "ලුණු",
		tamil: "உப்பு",
		phonetic: "උප්පු",
		speechText: "உப்பு",
		emoji: "🧂"
	  },
	  {
		id: 255,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "මී පැණි",
		tamil: "தேன்",
		phonetic: "තේන්",
		speechText: "தேன்",
		emoji: "🍯"
	  },
	  {
		id: 256,
		category: "food",
		categoryName: "ආහාර සහ පාන වර්ග",
		sinhala: "මුදවපු කිරි / යෝගට්",
		tamil: "தயிர்",
		phonetic: "තයිර්",
		speechText: "தயிர்",
		emoji: "🥣"
	  },
	  //home
	  {
		id: 257,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "නිවස / ගෙදර",
		tamil: "வீடு",
		phonetic: "වීඩු",
		speechText: "வீடு",
		emoji: "🏠"
	  },
	  {
		id: 258,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "කාමරය",
		tamil: "அறை",
		phonetic: "අරෛ",
		speechText: "அறை",
		emoji: "🚪"
	  },
	  {
		id: 259,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "මුළුතැන්ගෙය",
		tamil: "சமையலறை",
		phonetic: "සමෛයලරෛ",
		speechText: "சமையலறை",
		emoji: "🍳"
	  },
	  {
		id: 260,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "නාන කාමරය",
		tamil: "குளியலறை",
		phonetic: "කුලියලරෛ",
		speechText: "குளியலறை",
		emoji: "🚿"
	  },
	  {
		id: 261,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "දොර",
		tamil: "கதவு",
		phonetic: "කදවු",
		speechText: "கதவு",
		emoji: "🚪"
	  },
	  {
		id: 262,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "ජනේලය",
		tamil: "யன்னல்",
		phonetic: "යන්නල්",
		speechText: "யன்னல்",
		emoji: "🪟"
	  },
	  {
		id: 263,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "ඇඳ",
		tamil: "கட்டில்",
		phonetic: "කට්ටිල්",
		speechText: "கட்டில்",
		emoji: "🛏️"
	  },
	  {
		id: 264,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "කොට්ටය",
		tamil: "தலையணை",
		phonetic: "තලෛයණෛ",
		speechText: "தலையணை",
		emoji: "🛋️"
	  },
	  {
		id: 265,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "පුටුව",
		tamil: "கதிரை",
		phonetic: "කදිරෛ",
		speechText: "கதிரை",
		emoji: "💺"
	  },
	  {
		id: 266,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "මේසය",
		tamil: "மேசை",
		phonetic: "මේසෛ",
		speechText: "மேசை",
		emoji: "🪑"
	  },
	  {
		id: 267,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "අල්මාරිය",
		tamil: "அலமாரி",
		phonetic: "අලමාරි",
		speechText: "அலமாரி",
		emoji: "🗄️"
	  },
	  {
		id: 268,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "පිඟාන",
		tamil: "தட்டு",
		phonetic: "තට්ටු",
		speechText: "தட்டு",
		emoji: "🍽️"
	  },
	  {
		id: 269,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "කෝප්පය",
		tamil: "கோப்பை",
		phonetic: "කෝප්පෛ",
		speechText: "கோப்பை",
		emoji: "🥤"
	  },
	  {
		id: 270,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "හැන්ද",
		tamil: "கரண்டி",
		phonetic: "කරණ්ඩි",
		speechText: "கரண்டி",
		emoji: "🥄"
	  },
	  {
		id: 271,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "පිහිය",
		tamil: "கத்தி",
		phonetic: "කත්ති",
		speechText: "கத்தி",
		emoji: "🔪"
	  },
	  {
		id: 272,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "මුට්ටිය / හට්ටිය",
		tamil: "பானை",
		phonetic: "පානෛ",
		speechText: "பானை",
		emoji: "🍲"
	  },
	  {
		id: 273,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "කොස්ස",
		tamil: "துடைப்பம்",
		phonetic: "තුඩෛප්පම්",
		speechText: "துடைப்பம்",
		emoji: "🧹"
	  },
	  {
		id: 274,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "බල්බය / විදුලි පහන",
		tamil: "மின்விளக்கு",
		phonetic: "මින්විළක්කු",
		speechText: "மின்விளக்கு",
		emoji: "💡"
	  },
	  {
		id: 275,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "විදුලි පංකාව",
		tamil: "மின்விசிறி",
		phonetic: "මින්විසිරි",
		speechText: "மின்விசிறி",
		emoji: "🌀"
	  },
	  {
		id: 276,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "රූපවාහිනිය",
		tamil: "தொலைக்காட்சி",
		phonetic: "තොලෛක්කාට්සි",
		speechText: "தொலைக்காட்சி",
		emoji: "📺"
	  },
	  {
		id: 277,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "යතුර",
		tamil: "சாவி",
		phonetic: "සාවි",
		speechText: "சாவி",
		emoji: "🔑"
	  },
	  {
		id: 278,
		category: "home",
		categoryName: "නිවස සහ භාණ්ඩ",
		sinhala: "මිදුල",
		tamil: "முற்றம்",
		phonetic: "මුට්ට්‍රම්",
		speechText: "முற்றம்",
		emoji: "🏡"
	  },
	  //days_months
	  {
		id: 279,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "සඳුදා",
		tamil: "திங்கட்கிழமை",
		phonetic: "තිංගට්කිළමෛ",
		speechText: "திங்கட்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 280,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "අඟහරුවාදා",
		tamil: "செவ்வாய்க்கிழமை",
		phonetic: "සෙව්වායික්කිළමෛ",
		speechText: "செவ்வாய்க்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 281,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "බදාදා",
		tamil: "புதன்கிழமை",
		phonetic: "පුදන්කිළමෛ",
		speechText: "புதன்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 282,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "බ්‍රහස්පතින්දා",
		tamil: "வியாழக்கிழமை",
		phonetic: "වියාළක්කිළමෛ",
		speechText: "வியாழக்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 283,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "සිකුරාදා",
		tamil: "வெள்ளிக்கிழமை",
		phonetic: "වෙල්ලික්කිළමෛ",
		speechText: "வெள்ளிக்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 284,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "සෙනසුරාදා",
		tamil: "சனிக்கிழமை",
		phonetic: "සනික්කිළමෛ",
		speechText: "சனிக்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 285,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "ඉරිදා",
		tamil: "ஞாயிற்றுக்கிழமை",
		phonetic: "ඤායිට්ට්‍රුක්කිළමෛ",
		speechText: "ஞாயிற்றுக்கிழமை",
		emoji: "📅"
	  },
	  {
		id: 286,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "ජනවාරි",
		tamil: "தை",
		phonetic: "තෛ",
		speechText: "தை",
		emoji: "🗓️"
	  },
	  {
		id: 287,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "පෙබරවාරි",
		tamil: "மாசி",
		phonetic: "මාසි",
		speechText: "மாசி",
		emoji: "🗓️"
	  },
	  {
		id: 288,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "මාර්තු",
		tamil: "பங்குனி",
		phonetic: "පංගුනි",
		speechText: "பங்குனி",
		emoji: "🗓️"
	  },
	  {
		id: 289,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "අප්‍රේල්",
		tamil: "சித்திரை",
		phonetic: "සිත්තිරෛ",
		speechText: "சித்திரை",
		emoji: "🗓️"
	  },
	  {
		id: 290,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "මැයි",
		tamil: "வைகாசி",
		phonetic: "වෛගාසි",
		speechText: "வைகாசி",
		emoji: "🗓️"
	  },
	  {
		id: 291,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "ජූනි",
		tamil: "ஆனி",
		phonetic: "ආනි",
		speechText: "ஆனி",
		emoji: "🗓️"
	  },
	  {
		id: 292,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "ජූලි",
		tamil: "ஆடி",
		phonetic: "ආඩි",
		speechText: "ஆடி",
		emoji: "🗓️"
	  },
	  {
		id: 293,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "අගෝස්තු",
		tamil: "ஆவணி",
		phonetic: "ආවණි",
		speechText: "ஆவணி",
		emoji: "🗓️"
	  },
	  {
		id: 294,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "සැප්තැම්බර්",
		tamil: "புரட்டாதி",
		phonetic: "පුරට්ටාදි",
		speechText: "புரட்டாதி",
		emoji: "🗓️"
	  },
	  {
		id: 295,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "ඔක්තෝබර්",
		tamil: "ஐப்பசி",
		phonetic: "අයිප්පසි",
		speechText: "ஐப்பசி",
		emoji: "🗓️"
	  },
	  {
		id: 296,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "නොවැම්බර්",
		tamil: "கார்த்திகை",
		phonetic: "කාර්ත්තිගෛ",
		speechText: "கார்த்திகை",
		emoji: "🗓️"
	  },
	  {
		id: 297,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "දෙසැම්බර්",
		tamil: "மார்கழி",
		phonetic: "මාර්ගලි",
		speechText: "மார்கழி",
		emoji: "🗓️"
	  },
	  {
		id: 298,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "අද",
		tamil: "இன்று",
		phonetic: "ඉන්ඩ්‍රු",
		speechText: "இன்று",
		emoji: "👇"
	  },
	  {
		id: 299,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "හෙට",
		tamil: "நாளை",
		phonetic: "නාළෛ",
		speechText: "நாளை",
		emoji: "⏭️"
	  },
	  {
		id: 300,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "ඊයේ",
		tamil: "நேற்று",
		phonetic: "නේට්ට්‍රු",
		speechText: "நேற்று",
		emoji: "⏮️"
	  },
	  {
		id: 301,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "දවස",
		tamil: "நாள்",
		phonetic: "නාල්",
		speechText: "நாள்",
		emoji: "☀️"
	  },
	  {
		id: 302,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "සතිය",
		tamil: "வாரம்",
		phonetic: "වාරම්",
		speechText: "வாரம்",
		emoji: "📆"
	  },
	  {
		id: 303,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "මාසය",
		tamil: "மாதம்",
		phonetic: "මාදම්",
		speechText: "மாதம்",
		emoji: "🌙"
	  },
	  {
		id: 304,
		category: "days_months",
		categoryName: "දින සහ මාස",
		sinhala: "අවුරුද්ද",
		tamil: "வருடம்",
		phonetic: "වරුඩම්",
		speechText: "வருடம்",
		emoji: "🎉"
	  }
  ,{
    id: 305,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "හිරු / ඉර",
    tamil: "சூரியன்",
    phonetic: "සූරියන්",
    speechText: "சூரியன்",
    emoji: "☀️"
  },
  {
    id: 306,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "සඳ / හඳ",
    tamil: "சந்திரன்",
    phonetic: "සන්දිරන්",
    speechText: "சந்திரன்",
    emoji: "🌙"
  },
  {
    id: 307,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "තරු",
    tamil: "நட்சத்திரம்",
    phonetic: "නට්චත්තිරම්",
    speechText: "நட்சத்திரம்",
    emoji: "⭐"
  },
  {
    id: 308,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "වලාකුළු",
    tamil: "மேகம்",
    phonetic: "මේගම්",
    speechText: "மேகம்",
    emoji: "☁️"
  },
  {
    id: 309,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "වැස්ස",
    tamil: "மழை",
    phonetic: "මළෛ",
    speechText: "மழை",
    emoji: "🌧️"
  },
  {
    id: 310,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "සුළඟ",
    tamil: "காற்று",
    phonetic: "කාට්ට්‍රු",
    speechText: "காற்று",
    emoji: "💨"
  },
  {
    id: 311,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "අකුණු",
    tamil: "மின்னல்",
    phonetic: "මින්නල්",
    speechText: "மின்னல்",
    emoji: "⚡"
  },
  {
    id: 312,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "ගිගුරුම්",
    tamil: "இடி",
    phonetic: "ඉඩි",
    speechText: "இடி",
    emoji: "🌩️"
  },
  {
    id: 313,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "දේදුන්න",
    tamil: "வானவில்",
    phonetic: "වානවිල්",
    speechText: "வானவில்",
    emoji: "🌈"
  },
  {
    id: 314,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "අහස",
    tamil: "வானம்",
    phonetic: "වානම්",
    speechText: "வானம்",
    emoji: "🌌"
  },
  {
    id: 315,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "පොළොව / භූමිය",
    tamil: "நிலம்",
    phonetic: "නිලම්",
    speechText: "நிலம்",
    emoji: "🌍"
  },
  {
    id: 316,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "ගස",
    tamil: "மரம்",
    phonetic: "මරම්",
    speechText: "மரம்",
    emoji: "🌳"
  },
  {
    id: 317,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "කැලය / වනාන්තරය",
    tamil: "காடு",
    phonetic: "කාඩු",
    speechText: "காடு",
    emoji: "🌲"
  },
  {
    id: 318,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "කන්ද",
    tamil: "மலை",
    phonetic: "මලෛ",
    speechText: "மலை",
    emoji: "⛰️"
  },
  {
    id: 319,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "ගඟ",
    tamil: "ஆறு",
    phonetic: "ආරු",
    speechText: "ஆறு",
    emoji: "🏞️"
  },
  {
    id: 320,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "වැව",
    tamil: "குளம்",
    phonetic: "කුලම්",
    speechText: "குளம்",
    emoji: "💧"
  },
  {
    id: 321,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "මුහුද",
    tamil: "கடல்",
    phonetic: "කඩල්",
    speechText: "கடல்",
    emoji: "🌊"
  },
  {
    id: 322,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "වෙරළ",
    tamil: "கடற்கரை",
    phonetic: "කඩට්කරෛ",
    speechText: "கடற்கரை",
    emoji: "🏖️"
  },
  {
    id: 323,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "ගල් / පාෂාණ",
    tamil: "கல்",
    phonetic: "කල්",
    speechText: "கல்",
    emoji: "🪨"
  },
  {
    id: 324,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "වැලි",
    tamil: "மணல்",
    phonetic: "මණල්",
    speechText: "மணல்",
    emoji: "⏳"
  },
  {
    id: 325,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "ගින්දර",
    tamil: "நெருப்பு",
    phonetic: "නෙරුප්පු",
    speechText: "நெருப்பு",
    emoji: "🔥"
  },
  {
    id: 326,
    category: "weather_nature",
    categoryName: "කාලගුණය සහ සොබාදහම",
    sinhala: "කොළය / පත්‍රය",
    tamil: "இலை",
    phonetic: "ඉලෛ",
    speechText: "இலை",
    emoji: "🍃"
  },{
    id: 327,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "උතුර",
    tamil: "வடக்கு",
    phonetic: "වඩක්කු",
    speechText: "வடக்கு",
    emoji: "🧭"
  },
  {
    id: 328,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "දකුණ (දිශාව)",
    tamil: "தெற்கு",
    phonetic: "තෙට්ට්‍රු",
    speechText: "தெற்கு",
    emoji: "🧭"
  },
  {
    id: 329,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "නැගෙනහිර",
    tamil: "கிழக்கு",
    phonetic: "කිලක්කු",
    speechText: "கிழக்கு",
    emoji: "🌅"
  },
  {
    id: 330,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "බටහිර",
    tamil: "மேற்கு",
    phonetic: "මේට්ට්‍රු",
    speechText: "மேற்கு",
    emoji: "🌇"
  },
  {
    id: 331,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "වම",
    tamil: "இடது",
    phonetic: "ඉඩදු",
    speechText: "இடது",
    emoji: "⬅️"
  },
  {
    id: 332,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "දකුණ (පැත්ත)",
    tamil: "வலது",
    phonetic: "වලදු",
    speechText: "வலது",
    emoji: "➡️"
  },
  {
    id: 333,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "ඉදිරියෙන් / ඉස්සරහා",
    tamil: "முன்னால்",
    phonetic: "මුන්නාල්",
    speechText: "முன்னால்",
    emoji: "⬆️"
  },
  {
    id: 334,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "පිටුපසින් / පස්සෙන්",
    tamil: "பின்னால்",
    phonetic: "පින්නාල්",
    speechText: "பின்னால்",
    emoji: "⬇️"
  },
  {
    id: 335,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "උඩ / ඉහළ",
    tamil: "மேலே",
    phonetic: "මේලේ",
    speechText: "மேலே",
    emoji: "🔼"
  },
  {
    id: 336,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "යට / පහළ",
    tamil: "கீழே",
    phonetic: "කීලේ",
    speechText: "கீழே",
    emoji: "🔽"
  },
  {
    id: 337,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "ඇතුළත",
    tamil: "உள்ளே",
    phonetic: "උල්ලේ",
    speechText: "உள்ளே",
    emoji: "📥"
  },
  {
    id: 338,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "පිටත",
    tamil: "வெளியே",
    phonetic: "වෙලියේ",
    speechText: "வெளியே",
    emoji: "📤"
  },
  {
    id: 339,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "ළඟ / කිට්ටුව",
    tamil: "அருகில்",
    phonetic: "අරුගිල්",
    speechText: "அருகில்",
    emoji: "📍"
  },
  {
    id: 340,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "දුර",
    tamil: "தூரம்",
    phonetic: "දූරම්",
    speechText: "தூரம்",
    emoji: "📏"
  },
  {
    id: 341,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "මැද",
    tamil: "நடுவில்",
    phonetic: "නඩුවිල්",
    speechText: "நடுவில்",
    emoji: "⏺️"
  },
  {
    id: 342,
    category: "directions",
    categoryName: "දිශාවන් සහ ස්ථාන",
    sinhala: "අසල / ළඟින්",
    tamil: "பக்கத்தில்",
    phonetic: "පක්කත්තිල්",
    speechText: "பக்கத்தில்",
    emoji: "↔️"
  },
  {
    id: 343,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "යනවා",
    tamil: "போகிறேன்",
    phonetic: "පෝගිරේන්",
    speechText: "போகிறேன்",
    emoji: "🚶"
  },
  {
    id: 344,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "එනවා",
    tamil: "வருகிறேன்",
    phonetic: "වරුගිරේන්",
    speechText: "வருகிறேன்",
    emoji: "🚶‍♂️"
  },
  {
    id: 345,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "කනවා",
    tamil: "சாப்பிடுகிறேன்",
    phonetic: "සාප්පිඩුගිරේන්",
    speechText: "சாப்பிடுகிறேன்",
    emoji: "🍽️"
  },
  {
    id: 346,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "බොනවා",
    tamil: "குடிக்கிறேன்",
    phonetic: "කුඩික්කිරේන්",
    speechText: "குடிக்கிறேன்",
    emoji: "🥤"
  },
  {
    id: 347,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "ලියනවා",
    tamil: "எழுதுகிறேன்",
    phonetic: "එළුදුගිරේන්",
    speechText: "எழுதுகிறேன்",
    emoji: "✍️"
  },
  {
    id: 348,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "කියවනවා",
    tamil: "வாசிக்கிறேன்",
    phonetic: "වාසික්කිරේන්",
    speechText: "வாசிக்கிறேன்",
    emoji: "📖"
  },
  {
    id: 349,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "බලනවා",
    tamil: "பார்க்கிறேன்",
    phonetic: "පාර්ක්කිරේන්",
    speechText: "பார்க்கிறேன்",
    emoji: "👀"
  },
  {
    id: 350,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "අහනවා",
    tamil: "கேட்கிறேன்",
    phonetic: "කේට්කිරේන්",
    speechText: "கேட்கிறேன்",
    emoji: "👂"
  },
  {
    id: 351,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "කතා කරනවා",
    tamil: "பேசுகிறேன்",
    phonetic: "පේසුගිරේන්",
    speechText: "பேசுகிறேன்",
    emoji: "🗣️"
  },
  {
    id: 352,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "නිදාගන්නවා",
    tamil: "தூங்குகிறேன்",
    phonetic: "තූංගුගිරේන්",
    speechText: "தூங்குகிறேன்",
    emoji: "😴"
  },
  {
    id: 353,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "අවදි වෙනවා / නැගිටිනවා",
    tamil: "எழும்புகிறேன்",
    phonetic: "එළුම්බුගිරේන්",
    speechText: "எழும்புகிறேன்",
    emoji: "⏰"
  },
  {
    id: 354,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "වාඩි වෙනවා / ඉඳගන්නවා",
    tamil: "உட்காருகிறேன்",
    phonetic: "උට්කාරුගිරේන්",
    speechText: "உட்காருகிறேன்",
    emoji: "🪑"
  },
  {
    id: 355,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "හිටගන්නවා",
    tamil: "நிற்கிறேன்",
    phonetic: "නිර්ක්කිරේන්",
    speechText: "நிற்கிறேன்",
    emoji: "🧍"
  },
  {
    id: 356,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "දුවනවා",
    tamil: "ஓடுகிறேன்",
    phonetic: "ඕඩුගිරේන්",
    speechText: "ஓடுகிறேன்",
    emoji: "🏃"
  },
  {
    id: 357,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "ඇවිදිනවා",
    tamil: "நடக்கிறேன்",
    phonetic: "නඩක්කිරේන්",
    speechText: "நடக்கிறேன்",
    emoji: "🚶"
  },
  {
    id: 358,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "සෙල්ලම් කරනවා",
    tamil: "விளையாடுகிறேன்",
    phonetic: "විළෛයාඩුගිරේන්",
    speechText: "விளையாடுகிறேன்",
    emoji: "⚽"
  },
  {
    id: 359,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "ඉගෙන ගන්නවා",
    tamil: "படிக்கிறேன்",
    phonetic: "පඩික්කිරේන්",
    speechText: "படிக்கிறேன்",
    emoji: "🎓"
  },
  {
    id: 360,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "උගන්වනවා",
    tamil: "கற்பிக்கிறேன்",
    phonetic: "කර්පික්කිරේන්",
    speechText: "கற்பிக்கிறேன்",
    emoji: "👩‍🏫"
  },
  {
    id: 361,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "දෙනවා",
    tamil: "கொடுக்கிறேன்",
    phonetic: "කොඩුක්කිරේන්",
    speechText: "கொடுக்கிறேன்",
    emoji: "🤲"
  },
  {
    id: 362,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "ගන්නවා",
    tamil: "எடுக்கிறேன்",
    phonetic: "එඩුක්කිරේන්",
    speechText: "எடுக்கிறேன்",
    emoji: "✋"
  },
  {
    id: 363,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "සෝදනවා",
    tamil: "கழுவுகிறேன்",
    phonetic: "කළුවුගිරේන්",
    speechText: "கழுவுகிறேன்",
    emoji: "🧼"
  },
  {
    id: 364,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "අඳිනවා (ඇඳුම්)",
    tamil: "உடுத்துகிறேன்",
    phonetic: "උඩුත්තුගිරේන්",
    speechText: "உடுத்துகிறேன்",
    emoji: "👕"
  },
  {
    id: 365,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "හිනා වෙනවා",
    tamil: "சிரிக்கிறேன்",
    phonetic: "සිරික්කිරේන්",
    speechText: "சிரிக்கிறேன்",
    emoji: "😄"
  },
  {
    id: 366,
    category: "verbs",
    categoryName: "ක්‍රියා පද",
    sinhala: "අඬනවා",
    tamil: "அழுகிறேன்",
    phonetic: "අළුගිරේන්",
    speechText: "அழுகிறேன்",
    emoji: "😢"
  },
  {
    id: 367,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "මම",
    tamil: "நான்",
    phonetic: "නාන්",
    speechText: "நான்",
    emoji: "🙋‍♂️"
  },
  {
    id: 368,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "අපි",
    tamil: "நாங்கள்",
    phonetic: "නාංගල්",
    speechText: "நாங்கள்",
    emoji: "👥"
  },
  {
    id: 369,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඔබ / ඔයා",
    tamil: "நீங்கள்",
    phonetic: "නීංගල්",
    speechText: "நீங்கள்",
    emoji: "👉"
  },
  {
    id: 370,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඔහු",
    tamil: "அவன்",
    phonetic: "අවන්",
    speechText: "அவன்",
    emoji: "👦"
  },
  {
    id: 371,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඇය",
    tamil: "அவள்",
    phonetic: "අවල්",
    speechText: "அவள்",
    emoji: "👧"
  },
  {
    id: 372,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඔවුන්",
    tamil: "அவர்கள்",
    phonetic: "අවර්ගල්",
    speechText: "அவர்கள்",
    emoji: "👫"
  },
  {
    id: 373,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "මේක / මේ",
    tamil: "இது",
    phonetic: "ඉදු",
    speechText: "இது",
    emoji: "👇"
  },
  {
    id: 374,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඒක / ඒ",
    tamil: "அது",
    phonetic: "අදු",
    speechText: "அது",
    emoji: "👆"
  },
  {
    id: 375,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "මේවා",
    tamil: "இவை",
    phonetic: "ඉවෛ",
    speechText: "இவை",
    emoji: "📦"
  },
  {
    id: 376,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඒවා",
    tamil: "அவை",
    phonetic: "අවෛ",
    speechText: "அவை",
    emoji: "🗂️"
  },
  {
    id: 377,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "මගේ",
    tamil: "எனது",
    phonetic: "එනදු",
    speechText: "எனது",
    emoji: "🪪"
  },
  {
    id: 378,
    category: "pronouns",
    categoryName: "සර්වනාම",
    sinhala: "ඔබේ / ඔයාගේ",
    tamil: "உங்களது",
    phonetic: "උංගලදු",
    speechText: "உங்களது",
    emoji: "🏷️"
  },
  {
    id: 379,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කවුද?",
    tamil: "யார்?",
    phonetic: "යාර්?",
    speechText: "யார்?",
    emoji: "🙋"
  },
  {
    id: 380,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "මොකක්ද? / කුමක්ද?",
    tamil: "என்ன?",
    phonetic: "එන්න?",
    speechText: "என்ன?",
    emoji: "❓"
  },
  {
    id: 381,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කොහෙද?",
    tamil: "எங்கே?",
    phonetic: "එංගේ?",
    speechText: "எங்கே?",
    emoji: "📍"
  },
  {
    id: 382,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කවදාද? / කවදද?",
    tamil: "எப்போது?",
    phonetic: "එප්පෝදු?",
    speechText: "எப்போது?",
    emoji: "⏰"
  },
  {
    id: 383,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "ඇයි?",
    tamil: "ஏன்?",
    phonetic: "ඒන්?",
    speechText: "ஏன்?",
    emoji: "🤔"
  },
  {
    id: 384,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කොහොමද?",
    tamil: "எப்படி?",
    phonetic: "එප්පඩි?",
    speechText: "எப்படி?",
    emoji: "🛠️"
  },
  {
    id: 385,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කීයද? (මිල / ගණන)",
    tamil: "எவ்வளவு?",
    phonetic: "එව්වලවු?",
    speechText: "எவ்வளவு?",
    emoji: "💰"
  },
  {
    id: 386,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කීයක්ද? (සංඛ්‍යාව)",
    tamil: "எத்தனை?",
    phonetic: "එත්තනෛ?",
    speechText: "எத்தனை?",
    emoji: "🔢"
  },
  {
    id: 387,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "මොන?",
    tamil: "எந்த?",
    phonetic: "එන්ද?",
    speechText: "எந்த?",
    emoji: "👉"
  },
  {
    id: 388,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කාගේද?",
    tamil: "யாருடையது?",
    phonetic: "යාරුඩෛයදු?",
    speechText: "யாருடையது?",
    emoji: "🏷️"
  },
  {
    id: 389,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කොහෙන්ද?",
    tamil: "எங்கிருந்து?",
    phonetic: "එංගිරුන්දු?",
    speechText: "எங்கிருந்து?",
    emoji: "🔙"
  },
  {
    id: 390,
    category: "questions",
    categoryName: "ප්‍රශ්න පද",
    sinhala: "කවුරුන්ද? (බහුවචන)",
    tamil: "யாரவர்கள்?",
    phonetic: "යාරවර්ගල්?",
    speechText: "யாரவர்கள்?",
    emoji: "👥"
  },
  {
    id: 391,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "ලොකු",
    tamil: "பெரிய",
    phonetic: "පෙරිය",
    speechText: "பெரிய",
    emoji: "🐘"
  },
  {
    id: 392,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "පොඩි / කුඩා",
    tamil: "சிறிய",
    phonetic: "සිරිය",
    speechText: "சிறிய",
    emoji: "🐜"
  },
  {
    id: 393,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "හොඳ",
    tamil: "நல்ல",
    phonetic: "නල්ල",
    speechText: "நல்ல",
    emoji: "👍"
  },
  {
    id: 394,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "නරක",
    tamil: "கெட்ட",
    phonetic: "කෙට්ට",
    speechText: "கெட்ட",
    emoji: "👎"
  },
  {
    id: 395,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "ලස්සන",
    tamil: "அழகான",
    phonetic: "අළගාන",
    speechText: "அழகான",
    emoji: "🌸"
  },
  {
    id: 396,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "අලුත්",
    tamil: "புதிய",
    phonetic: "පුදිය",
    speechText: "புதிய",
    emoji: "✨"
  },
  {
    id: 397,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "පරණ",
    tamil: "பழைய",
    phonetic: "පළෛය",
    speechText: "பழைய",
    emoji: "📜"
  },
  {
    id: 398,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "උස",
    tamil: "உயரமான",
    phonetic: "උයරමාන",
    speechText: "உயரமான",
    emoji: "🦒"
  },
  {
    id: 399,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "මිටි / කොට",
    tamil: "குள்ளமான",
    phonetic: "කුල්ලමාන",
    speechText: "குள்ளமான",
    emoji: "矮"
  },
  {
    id: 400,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "දිග",
    tamil: "நீளமான",
    phonetic: "නීලමාන",
    speechText: "நீளமான",
    emoji: "📏"
  },
  {
    id: 401,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "කෙටි",
    tamil: "குறுகிய",
    phonetic: "කුරුගිය",
    speechText: "குறுகிய",
    emoji: "✂️"
  },
  {
    id: 402,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "රස්නේ / උණුසුම්",
    tamil: "சூடான",
    phonetic: "සූඩාන",
    speechText: "சூடான",
    emoji: "🔥"
  },
  {
    id: 403,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "සීතල",
    tamil: "குளிர்ச்சியான",
    phonetic: "කුලිර්ච්චියාන",
    speechText: "குளிர்ச்சியான",
    emoji: "❄️"
  },
  {
    id: 404,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "පැණිරස / මිහිරි",
    tamil: "இனிப்பான",
    phonetic: "ඉනිප්පාන",
    speechText: "இனிப்பான",
    emoji: "🍯"
  },
  {
    id: 405,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "සැර",
    tamil: "காரமான",
    phonetic: "කාරමාන",
    speechText: "காரமான",
    emoji: "🌶️"
  },
  {
    id: 406,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "පිරිසිදු",
    tamil: "சுத்தமான",
    phonetic: "සුත්තමාන",
    speechText: "சுத்தமான",
    emoji: "🧼"
  },
  {
    id: 407,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "අපිරිසිදු",
    tamil: "அழுக்கான",
    phonetic: "අළුක්කාන",
    speechText: "அழுக்கான",
    emoji: "🗑️"
  },
  {
    id: 408,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "බර",
    tamil: "கனமான",
    phonetic: "කනමාන",
    speechText: "கனமான",
    emoji: "🏋️"
  },
  {
    id: 409,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "සැහැල්ලු",
    tamil: "இலேசான",
    phonetic: "ඉලේසාන",
    speechText: "இலேசான",
    emoji: "🪶"
  },
  {
    id: 410,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "වේගවත්",
    tamil: "வேகமான",
    phonetic: "වේගමාන",
    speechText: "வேகமான",
    emoji: "⚡"
  },
  {
    id: 411,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "සෙමින් / හෙමින්",
    tamil: "மெதுவான",
    phonetic: "මෙදුවාන",
    speechText: "மெதுவான",
    emoji: "🐢"
  },
  {
    id: 412,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "කඩිසර / දක්ෂ",
    tamil: "சுறுசுறுப்பான",
    phonetic: "සුරුසුරුප්පාන",
    speechText: "சுறுசுறுப்பான",
    emoji: "🌟"
  },
  {
    id: 413,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "කම්මැලි",
    tamil: "சோம்பலான",
    phonetic: "සෝම්බලාන",
    speechText: "சோம்பலான",
    emoji: "🥱"
  },
  {
    id: 414,
    category: "adjectives",
    categoryName: "නාම විශේෂණ",
    sinhala: "සතුටු",
    tamil: "மகிழ்ச்சியான",
    phonetic: "මගිල්ච්චියාන",
    speechText: "மகிழ்ச்சியான",
    emoji: "😊"
  },
  {
    id: 415,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ නම කමල්.",
    tamil: "எனது பெயர் கமல்.",
    phonetic: "එනදු පෙයර් කමල්.",
    speechText: "எனது பெயர் கமல்.",
    emoji: "🪪"
  },
  {
    id: 416,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ වයස අවුරුදු දහයයි.",
    tamil: "எனது வயது பத்து.",
    phonetic: "එනදු වයදු පත්තු.",
    speechText: "எனது வயது பத்து.",
    emoji: "🎂"
  },
  {
    id: 417,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මම ඉන්නේ කොළඹ.",
    tamil: "நான் கொழும்பில் வசிக்கிறேன்.",
    phonetic: "නාන් කොළුම්බිල් වසික්කිරේන්.",
    speechText: "நான் கொழும்பில் வசிக்கிறேன்.",
    emoji: "🏡"
  },
  {
    id: 418,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ ගම නුවර.",
    tamil: "எனது ஊர் கண்டி.",
    phonetic: "එනදු ඌර් කණ්ඩි.",
    speechText: "எனது ஊர் கண்டி.",
    emoji: "🏘️"
  },
  {
    id: 419,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මම පාසල් ශිෂ්‍යයෙක්.",
    tamil: "நான் ஒரு பாடசாலை மாணவன்.",
    phonetic: "නාන් ඔරු පාඩසාලෛ මාණවන්.",
    speechText: "நான் ஒரு பாடசாலை மாணவன்.",
    emoji: "👦"
  },
  {
    id: 420,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මම පාසල් ශිෂ්‍යාවක්.",
    tamil: "நான் ஒரு பாடசாலை மாணவி.",
    phonetic: "නාන් ඔරු පාඩසාලෛ මාණවි.",
    speechText: "நான் ஒரு பாடசாலை மாணவி.",
    emoji: "👧"
  },
  {
    id: 421,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මම ඉගෙන ගන්නේ හයවන ශ්‍රේණියේ.",
    tamil: "நான் ஆறாம் தரத்தில் படிக்கிறேன்.",
    phonetic: "නාන් ආරාම් තරත්තිල් පඩික්කිරේන්.",
    speechText: "நான் ஆறாம் தரத்தில் படிக்கிறேன்.",
    emoji: "🏫"
  },
  {
    id: 422,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ ප්‍රියතම විෂය දෙමළ.",
    tamil: "எனக்குப் பிடித்த பாடம் தமிழ்.",
    phonetic: "එනක්කුප් පිඩිත්ත පාඩම් තමිල්.",
    speechText: "எனக்குப் பிடித்த பாடம் தமிழ்.",
    emoji: "📚"
  },
  {
    id: 423,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ විනෝදාංශය පොත් කියවීමයි.",
    tamil: "எனது பொழுதுபோக்கு புத்தகம் வாசிப்பது.",
    phonetic: "එනදු පොළුදුපෝක්කු පුත්තගම් වාසිප්පදු.",
    speechText: "எனது பொழுதுபோக்கு புத்தகம் வாசிப்பது.",
    emoji: "📖"
  },
  {
    id: 424,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මම ක්‍රිකට් සෙල්ලම් කරන්න කැමතියි.",
    tamil: "எனக்கு கிரிக்கெட் விளையாடப் பிடிக்கும்.",
    phonetic: "එනක්කු ක්‍රිකට් විළෛයාඩප් පිඩික්කුම්.",
    speechText: "எனக்கு கிரிக்கெட் விளையாடப் பிடிக்கும்.",
    emoji: "🏏"
  },
  {
    id: 425,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ පවුලේ සාමාජිකයන් හතර දෙනෙක් ඉන්නවා.",
    tamil: "எனது குடும்பத்தில் நான்கு பேர் உள்ளனர்.",
    phonetic: "එනදු කුඩුම්බත්තිල් නාන්ගු පේර් උල්ළනර්.",
    speechText: "எனது குடும்பத்தில் நான்கு பேர் உள்ளனர்.",
    emoji: "👨‍👩‍👧‍👦"
  },
  {
    id: 426,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ තාත්තා ගොවියෙක්.",
    tamil: "எனது அப்பா ஒரு விவசாயி.",
    phonetic: "එනදු අප්පා ඔරු විවසායි.",
    speechText: "எனது அப்பா ஒரு விவசாயி.",
    emoji: "👨‍🌾"
  },
  {
    id: 427,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ අම්මා ගුරුවරියක්.",
    tamil: "எனது அம்மா ஒரு ஆசிரியை.",
    phonetic: "එනදු අම්මා ඔරු ආසිරියෛ.",
    speechText: "எனது அம்மா ஒரு ஆசிரியை.",
    emoji: "👩‍🏫"
  },
  {
    id: 428,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ හොඳම යාළුවා නිමල්.",
    tamil: "எனது சிறந்த நண்பன் நிமல்.",
    phonetic: "එනදු සිරන්ද නණ්බන් නිමල්.",
    speechText: "எனது சிறந்த நண்பன் நிமல்.",
    emoji: "🤝"
  },
  {
    id: 429,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මට දෙමළ ටිකක් කතා කරන්න පුළුවන්.",
    tamil: "எனக்குக் கொஞ்சம் தமிழ் பேச முடியும்.",
    phonetic: "එනක්කුක් කොංජම් තමිල් පේස මුඩියුම්.",
    speechText: "எனக்குக் கொஞ்சம் தமிழ் பேச முடியும்.",
    emoji: "🗣️"
  },
  {
    id: 430,
    category: "self_intro",
    categoryName: "මා ගැන",
    sinhala: "මගේ අනාගත බලාපොරොත්තුව වෛද්‍යවරයෙක් වීමයි.",
    tamil: "எனது எதிர்கால இலட்சியம் வைத்தியராவது.",
    phonetic: "එනදු එදිර්ගාල ඉලට්චියම් වෛත්තියරාවදු.",
    speechText: "எனது எதிர்கால இலட்சியம் வைத்தியராவது.",
    emoji: "🩺"
  },
  {
    id: 431,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මේක කීයද?",
    tamil: "இது எவ்வளவு?",
    phonetic: "ඉදු එව්වලවු?",
    speechText: "இது எவ்வளவு?",
    emoji: "💰"
  },
  {
    id: 432,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මට පෑනක් දෙන්න.",
    tamil: "எனக்கு ஒரு பேனா தாருங்கள்.",
    phonetic: "එනක්කු ඔරු පේනා තාරුංගල්.",
    speechText: "எனக்கு ஒரு பேனா தாருங்கள்.",
    emoji: "🖊️"
  },
  {
    id: 433,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "කිලෝ එකක් කීයද?",
    tamil: "ஒரு கிலோ எவ்வளவு?",
    phonetic: "ඔරු කිලෝ එව්වලවු?",
    speechText: "ஒரு கிலோ எவ்வளவு?",
    emoji: "⚖️"
  },
  {
    id: 434,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "කිලෝ භාගයක් දෙන්න.",
    tamil: "அரை கிலோ தாருங்கள்.",
    phonetic: "අරෛ කිලෝ තාරුංගල්.",
    speechText: "அரை கிலோ தாருங்கள்.",
    emoji: "🛒"
  },
  {
    id: 435,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මිල ටිකක් අඩු කරන්න පුළුවන්ද?",
    tamil: "விலையைக் கொஞ்சம் குறைக்க முடியுமா?",
    phonetic: "විලෛයෛක් කොංජම් කුරෛක්ක මුඩියුමා?",
    speechText: "விலையைக் கொஞ்சம் குறைக்க முடியுமா?",
    emoji: "🏷️"
  },
  {
    id: 436,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මේක හරිම ලාබයි.",
    tamil: "இது மிகவும் மலிவு.",
    phonetic: "ඉදු මිගවුම් මලිවු.",
    speechText: "இது மிகவும் மலிவு.",
    emoji: "👍"
  },
  {
    id: 437,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මේක හරිම ගණන්.",
    tamil: "இது மிகவும் விலை அதிகம்.",
    phonetic: "ඉදු මිගවුම් විලෛ අදිගම්.",
    speechText: "இது மிகவும் விலை அதிகம்.",
    emoji: "💸"
  },
  {
    id: 438,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මට තව දෙකක් දෙන්න.",
    tamil: "எனக்கு இன்னும் இரண்டு தாருங்கள்.",
    phonetic: "එනක්කු ඉන්නුම් ඉරණ්ඩු තාරුංගල්.",
    speechText: "எனக்கு இன்னும் இரண்டு தாருங்கள்.",
    emoji: "🔢"
  },
  {
    id: 439,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "ඉතුරු සල්ලි දෙන්න.",
    tamil: "மீதிப் பணத்தைத் தாருங்கள்.",
    phonetic: "මීදිප් පණත්තෛත් තාරුංගල්.",
    speechText: "மீதிப் பணத்தைத் தாருங்கள்.",
    emoji: "💵"
  },
  {
    id: 440,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "බිලක් දෙන්න පුළුවන්ද?",
    tamil: "பில் தர முடியுமா?",
    phonetic: "බිල් තර මුඩියුමා?",
    speechText: "பில் தர முடியுமா?",
    emoji: "🧾"
  },
  {
    id: 441,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "අලුත් එළවළු තියෙනවාද?",
    tamil: "புதிய காய்கறிகள் உள்ளனவா?",
    phonetic: "පුදිය කායිකරිගල් උල්ළනවා?",
    speechText: "புதிய காய்கறிகள் உள்ளனவா?",
    emoji: "🥦"
  },
  {
    id: 442,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මට මේක එපා.",
    tamil: "எனக்கு இது வேண்டாம்.",
    phonetic: "එනක්කු ඉදු වේණ්ඩාම්.",
    speechText: "எனக்கு இது வேண்டாம்.",
    emoji: "🙅"
  },
  {
    id: 443,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මම මේක ගන්නවා.",
    tamil: "நான் இதை வாங்குகிறேன்.",
    phonetic: "නාන් ඉදෛ වාංගුගිරේන්.",
    speechText: "நான் இதை வாங்குகிறேன்.",
    emoji: "🛍️"
  },
  {
    id: 444,
    category: "shopping",
    categoryName: "වෙළඳපොළේදී",
    sinhala: "මල්ලක් තියෙනවාද?",
    tamil: "பை உள்ளதா?",
    phonetic: "පෛ උල්ළදා?",
    speechText: "பை உள்ளதா?",
    emoji: "👜"
  },
  {
    id: 445,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට හිසරදයයි.",
    tamil: "எனக்குத் தலைவலி.",
    phonetic: "එනක්කුත් තලෛවලි.",
    speechText: "எனக்குத் தலைவலி.",
    emoji: "🤕"
  },
  {
    id: 446,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට උණ හැදිලා.",
    tamil: "எனக்குக் காய்ச்சல்.",
    phonetic: "එනක්කුක් කායිච්චල්.",
    speechText: "எனக்குக் காய்ச்சல்.",
    emoji: "🤒"
  },
  {
    id: 447,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට බඩේ අමාරුවයි.",
    tamil: "எனக்கு வயிற்று வலி.",
    phonetic: "එනක්කු වයිට්ට්‍රු වලි.",
    speechText: "எனக்கு வயிற்று வலி.",
    emoji: "🤢"
  },
  {
    id: 448,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට කැස්සයි.",
    tamil: "எனக்கு இருமல்.",
    phonetic: "එනක්කු ඉරුමල්.",
    speechText: "எனக்கு இருமல்.",
    emoji: "🤧"
  },
  {
    id: 449,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට සෙම හැදිලා.",
    tamil: "எனக்குத் தடிமன்.",
    phonetic: "එනක්කුත් තඩිමන්.",
    speechText: "எனக்குத் தடிமன்.",
    emoji: "😷"
  },
  {
    id: 450,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට දත් කැක්කුමයි.",
    tamil: "எனக்குப் பல் வலி.",
    phonetic: "එනක්කුප් පල් වලි.",
    speechText: "எனக்குப் பல் வலி.",
    emoji: "🦷"
  },
  {
    id: 451,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට තුවාල වුණා.",
    tamil: "எனக்குக் காயம் ஏற்பட்டது.",
    phonetic: "එනක්කුක් කායම් ඒර්පට්ටදු.",
    speechText: "எனக்குக் காயம் ஏற்பட்டது.",
    emoji: "🩹"
  },
  {
    id: 452,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට ටිකක් අමාරුයි.",
    tamil: "எனக்குச் சற்று உடம்பு சரியில்லை.",
    phonetic: "එනක්කුච් සට්ට්‍රු උඩම්බු සරියිල්ලෛ.",
    speechText: "எனக்குச் சற்று உடம்பு சரியில்லை.",
    emoji: "😔"
  },
  {
    id: 453,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "අපි රෝහලට යමු.",
    tamil: "நாம் வைத்தியசாலைக்குப் போவோம்.",
    phonetic: "නාම් වෛත්තියසාලෛක්කුප් පෝවෝම්.",
    speechText: "நாம் வைத்தியசாலைக்குப் போவோம்.",
    emoji: "🏥"
  },
  {
    id: 454,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "වෛද්‍යවරයා කොහෙද?",
    tamil: "வைத்தியர் எங்கே?",
    phonetic: "වෛත්තියර් එංගේ?",
    speechText: "வைத்தியர் எங்கே?",
    emoji: "👨‍⚕️"
  },
  {
    id: 455,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "මට බෙහෙත් ඕනෑ.",
    tamil: "எனக்கு மருந்து வேண்டும்.",
    phonetic: "එනක්කු මරුන්දු වේණ්ඩුම්.",
    speechText: "எனக்கு மருந்து வேண்டும்.",
    emoji: "💊"
  },
  {
    id: 456,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "දැන් මට ටිකක් හොඳයි.",
    tamil: "இப்போது எனக்குச் சற்றுப் பரவாயில்லை.",
    phonetic: "ඉප්පෝදු එනක්කුච් සට්ට්‍රුප් පරවායිල්ලෛ.",
    speechText: "இப்போது எனக்குச் சற்றுப் பரவாயில்லை.",
    emoji: "🙂"
  },
  {
    id: 457,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "පිරිසිදුව සිටීම සෞඛ්‍යයට හොඳයි.",
    tamil: "சுத்தமாக இருப்பது ஆரோக்கியத்திற்கு நல்லது.",
    phonetic: "සුත්තමාග ඉරුප්පදු ආරෝක්කියත්තිට්ට්‍රු නල්ලදු.",
    speechText: "சுத்தமாக இருப்பது ஆரோக்கியத்திற்கு நல்லது.",
    emoji: "🧼"
  },
  {
    id: 458,
    category: "health",
    categoryName: "සෞඛ්‍යය සහ අසනීප",
    sinhala: "හොඳින් වතුර බොන්න.",
    tamil: "நன்றாகத் தண்ணீர் குடியுங்கள்.",
    phonetic: "නන්ඩ්‍රාගත් තණ්ණීර් කුඩියුංගල්.",
    speechText: "நன்றாகத் தண்ணீர் குடியுங்கள்.",
    emoji: "💧"
  },
  {
    id: 459,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "පුස්තකාලය",
    tamil: "நூலகம்",
    phonetic: "නූලගම්",
    speechText: "நூலகம்",
    emoji: "📚"
  },
  {
    id: 460,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "රෝහල",
    tamil: "வைத்தியசாலை",
    phonetic: "වෛත්තියසාලෛ",
    speechText: "வைத்தியசாலை",
    emoji: "🏥"
  },
  {
    id: 461,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "තැපැල් කාර්යාලය",
    tamil: "தபால் நிலையம்",
    phonetic: "තපාල් නිලෛයම්",
    speechText: "தபால் நிலையம்",
    emoji: "🏤"
  },
  {
    id: 462,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "බැංකුව",
    tamil: "வங்கி",
    phonetic: "වංගි",
    speechText: "வங்கி",
    emoji: "🏦"
  },
  {
    id: 463,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "පොලිස් ස්ථානය",
    tamil: "பொலிஸ் நிலையம்",
    phonetic: "පොලිස් නිලෛයම්",
    speechText: "பொலிஸ் நிலையம்",
    emoji: "🚓"
  },
  {
    id: 464,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "බස් නැවතුම්පොළ",
    tamil: "பேருந்து நிலையம்",
    phonetic: "පේරුන්දු නිලෛයම්",
    speechText: "பேருந்து நிலையம்",
    emoji: "🚏"
  },
  {
    id: 465,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "දුම්රිය ස්ථානය",
    tamil: "ரயில் நிலையம்",
    phonetic: "රයිල් නිලෛයම්",
    speechText: "ரயில் நிலையம்",
    emoji: "🚉"
  },
  {
    id: 466,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "වෙළඳපොළ / පොළ",
    tamil: "சந்தை",
    phonetic: "සන්දෛ",
    speechText: "சந்தை",
    emoji: "🏪"
  },
  {
    id: 467,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "කඩය / සාප්පුව",
    tamil: "கடை",
    phonetic: "කඩෛ",
    speechText: "கடை",
    emoji: "🏬"
  },
  {
    id: 468,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "ආපනශාලාව / හෝටලය",
    tamil: "உணவகம்",
    phonetic: "උණවගම්",
    speechText: "உணவகம்",
    emoji: "🍽️"
  },
  {
    id: 469,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "උද්‍යානය / පාර්ක් එක",
    tamil: "பூங்கா",
    phonetic: "පූංගා",
    speechText: "பூங்கா",
    emoji: "🏞️"
  },
  {
    id: 470,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "ක්‍රීඩාංගණය",
    tamil: "விளையாட்டு மைதானம்",
    phonetic: "විළෛයාට්ටු මෛදානම්",
    speechText: "விளையாட்டு மைதானம்",
    emoji: "🏟️"
  },
  {
    id: 471,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "කෞතුකාගාරය",
    tamil: "அருங்காட்சியகம்",
    phonetic: "අරුංගාට්චියගම්",
    speechText: "அருங்காட்சியகம்",
    emoji: "🏛️"
  },
  {
    id: 472,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "පන්සල / විහාරය",
    tamil: "பௌத்த கோயில்",
    phonetic: "පෞත්ත කෝයිල්",
    speechText: "பௌத்த கோயில்",
    emoji: "🛕"
  },
  {
    id: 473,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "කෝවිල",
    tamil: "கோயில்",
    phonetic: "කෝයිල්",
    speechText: "கோயில்",
    emoji: "🕉️"
  },
  {
    id: 474,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "පල්ලිය (කතෝලික / ක්‍රිස්තියානි)",
    tamil: "தேவாலயம்",
    phonetic: "දේවාලයම්",
    speechText: "தேவாலயம்",
    emoji: "⛪"
  },
  {
    id: 475,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "මුස්ලිම් පල්ලිය",
    tamil: "பள்ளிவாசல்",
    phonetic: "පල්ලිවාසල්",
    speechText: "பள்ளிவாசல்",
    emoji: "🕌"
  },
  {
    id: 476,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "ගුවන් තොටුපළ",
    tamil: "விமான நிலையம்",
    phonetic: "විමාන නිලෛයම්",
    speechText: "விமான நிலையம்",
    emoji: "✈️"
  },
  {
    id: 477,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "වරාය",
    tamil: "துறைமுகம்",
    phonetic: "තුරෛමුගම්",
    speechText: "துறைமுகம்",
    emoji: "⚓"
  },
  {
    id: 478,
    category: "public_places",
    categoryName: "පොදු ස්ථාන",
    sinhala: "බෙහෙත් ශාලාව / ෆාමසිය",
    tamil: "மருந்தகம்",
    phonetic: "මරුන්දගම්",
    speechText: "மருந்தகம்",
    emoji: "💊"
  },{
    id: 479,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ අලුත් අවුරුද්දක් වේවා!",
    tamil: "இனிய புத்தாண்டு வாழ்த்துக்கள்!",
    phonetic: "ඉනිය පුත්තාණ්ඩු වාල්තුක්කල්!",
    speechText: "இனிய புத்தாண்டு வாழ்த்துக்கள்!",
    emoji: "🎉"
  },
  {
    id: 480,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ උපන්දිනයක් වේවා!",
    tamil: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    phonetic: "ඉනිය පිරන්දනාල් වාල්තුක්කල්!",
    speechText: "இனிய பிறந்தநாள் வாழ்த்துக்கள்!",
    emoji: "🎂"
  },
  {
    id: 481,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ වෙසක් මංගල්‍යයක් වේවා!",
    tamil: "இனிய வெசாக் வாழ்த்துக்கள்!",
    phonetic: "ඉනිය වෙසාක් වාල්තුක්කල්!",
    speechText: "இனிய வெசாக் வாழ்த்துக்கள்!",
    emoji: "🏮"
  },
  {
    id: 482,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ තෛපොංගල් දිනයක් වේවා!",
    tamil: "இனிய தைப்பொங்கல் வாழ்த்துக்கள்!",
    phonetic: "ඉනිය තෛප්පොංගල් වාල්තුක්කල්!",
    speechText: "இனிய தைப்பொங்கல் வாழ்த்துக்கள்!",
    emoji: "🌾"
  },
  {
    id: 483,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ දීපවාලි දිනයක් වේවා!",
    tamil: "இனிய தீபாவளி வாழ்த்துக்கள்!",
    phonetic: "ඉනිය දීපාවලි වාල්තුක්කල්!",
    speechText: "இனிய தீபாவளி வாழ்த்துக்கள்!",
    emoji: "🪔"
  },
  {
    id: 484,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ නත්තලක් වේවා!",
    tamil: "இனிய நத்தார் வாழ்த்துக்கள்!",
    phonetic: "ඉනිය නත්තාර් වාල්තුක්කල්!",
    speechText: "இனிய நத்தார் வாழ்த்துக்கள்!",
    emoji: "🎄"
  },
  {
    id: 485,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "ඊද් මුබාරක්! (රාමසාන් සුභ පැතුම්)",
    tamil: "ஈத் முபாரக்!",
    phonetic: "ඊද් මුබාරක්!",
    speechText: "ஈத் முபாரக்!",
    emoji: "🌙"
  },
  {
    id: 486,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ ගමන්!",
    tamil: "இனிய பயணம் அமைய வாழ்த்துக்கள்!",
    phonetic: "ඉනිය පයණම් අමෛය වාල්තුක්කල්!",
    speechText: "இனிய பயணம் அமைய வாழ்த்துக்கள்!",
    emoji: "✈️"
  },
  {
    id: 487,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "ඔබට ජය වේවා! / සුභ පැතුම්!",
    tamil: "உங்களுக்கு வெற்றி உண்டாகட்டும்!",
    phonetic: "උංගළුක්කු වෙට්ට්‍රි උණ්ඩාගට්ටුම්!",
    speechText: "உங்களுக்கு வெற்றி உண்டாகட்டும்!",
    emoji: "🏆"
  },
  {
    id: 488,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "විභාගයට සුභ පැතුම්!",
    tamil: "பரீட்சையில் வெற்றி பெற வாழ்த்துக்கள்!",
    phonetic: "පරීට්චෛයිල් වෙට්ට්‍රි පෙර වාල්තුක්කල්!",
    speechText: "பரீட்சையில் வெற்றி பெற வாழ்த்துக்கள்!",
    emoji: "✍️"
  },
  {
    id: 489,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "ඉක්මන් සුවය ලැබේවා!",
    tamil: "விரைவில் குணமடைய வாழ்த்துக்கள்!",
    phonetic: "විරෛවිල් කුණමඩෛය වාල්තුක්කල්!",
    speechText: "விரைவில் குணமடைய வாழ்த்துக்கள்!",
    emoji: "💐"
  },
  {
    id: 490,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ විවාහ දිනයක් වේවා!",
    tamil: "இனிய திருமண நாள் வாழ்த்துக்கள்!",
    phonetic: "ඉනිය තිරුමණ නාල් වාල්තුක්කල්!",
    speechText: "இனிய திருமண நாள் வாழ்த்துக்கள்!",
    emoji: "💍"
  },
  {
    id: 491,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ ගුරු දිනයක් වේවා!",
    tamil: "இனிய ஆசிரியர் தின வாழ்த்துக்கள்!",
    phonetic: "ඉනිය ආසිරියර් දින වාල්තුක්කල්!",
    speechText: "இனிய ஆசிரியர் தின வாழ்த்துக்கள்!",
    emoji: "👩‍🏫"
  },
  {
    id: 492,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "සුභ ළමා දිනයක් වේවා!",
    tamil: "இனிய சிறுவர் தின வாழ்த்துக்கள்!",
    phonetic: "ඉනිය සිරුවර් දින වාල්තුක්කල්!",
    speechText: "இனிய சிறுவர் தின வாழ்த்துக்கள்!",
    emoji: "🎈"
  },
  {
    id: 493,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "ඔබට සුභ දවසක් වේවා!",
    tamil: "உங்களுக்கு இனிய நாளாக அமையட்டும்!",
    phonetic: "උංගළුක්කු ඉනිය නාළාග අමෛයට්ටුම්!",
    speechText: "உங்களுக்கு இனிய நாளாக அமையட்டும்!",
    emoji: "☀️"
  },
  {
    id: 494,
    category: "greetings",
    categoryName: "සුභ පැතුම්",
    sinhala: "උණුසුම් සුභ පැතුම්! (ජයග්‍රහණයකදී)",
    tamil: "மனமார்ந்த பாராட்டுக்கள்!",
    phonetic: "මනමාර්න්ද පාරාට්ටුක්කල්!",
    speechText: "மனமார்ந்த பாராட்டுக்கள்!",
    emoji: "👏"
  }
];
