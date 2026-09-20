/**
 * LEXERA TURKISH, Front-end lesson engine
 * Chapter 1: First Steps in Turkish
 *
 * Teaching methodology:
 *  - Spaced repetition within lessons (new -> practice -> review)
 *  - Multi-modal presentation (visual, audio via Web Speech API, interactive)
 *  - Comprehensible input first: see/hear before produce
 *  - Immediate corrective feedback with the right answer always shown
 *  - Task-based learning: real scenarios (shop, cafe, bus) as context
 *  - Minimal grammar explanation, grammar through examples (inductive)
 *  - Cultural notes woven into content (not bolted on)
 *  - "Chunking": whole phrases before isolated words
 */

'use strict';

/* ===== COOKIE HELPERS ===== */
function getTurkishCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? decodeURIComponent(v.pop()) : '';
}
function setTurkishCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires + ';path=/;SameSite=Lax';
}

/* ===== PROGRESS STATE ===== */
function loadProgress() {
  try {
    const raw = getTurkishCookie('tr_progress');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveProgress(prog) {
  setTurkishCookie('tr_progress', JSON.stringify(prog), 365);
}
function markLessonDone(lessonId, stars) {
  const prog = loadProgress();
  if (!prog[lessonId] || prog[lessonId].stars < stars) {
    prog[lessonId] = { done: true, stars, ts: Date.now() };
  }
  prog._streak = (prog._streak || 0) + 1;
  prog._lastDate = new Date().toDateString();
  saveProgress(prog);
}
function getLessonStatus(lessonId) {
  const prog = loadProgress();
  return prog[lessonId] || null;
}

/* ===== SPEECH (Web Speech API) ===== */
function speakTurkish(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'tr-TR';
  utt.rate = 0.85;
  utt.pitch = 1.0;
  window.speechSynthesis.speak(utt);
}

/* ===== TRANSLATIONS (for native-language labels) ===== */
var T = {
  en: {
    tapToFlip: 'Tap to reveal English',
    listenAndChoose: 'Listen and choose',
    whatMeans: 'What does this mean?',
    translateToTr: 'Translate to Turkish',
    translateToNative: 'Translate to English',
    pickCorrect: 'Pick the correct answer',
    arrangeWords: 'Arrange the words',
    fillBlank: 'Fill in the blank',
    correctAnswer: 'Correct answer:',
    wellDone: 'Well done!',
    oops: 'Not quite!',
    tapToHear: 'Tap to hear',
    chapter1: 'Chapter 1: First Steps',
    continueLearning: 'Continue learning',
    backToMap: 'Back to map',
    lessonComplete: 'Lesson complete!',
    keepGoing: 'Keep going!',
    skipPrompt: 'Already know this? Skip level',
  },
  de: {
    tapToFlip: 'Tippen zum Aufdecken',
    listenAndChoose: 'Hör zu und wähle aus',
    whatMeans: 'Was bedeutet das?',
    translateToTr: 'Ins Türkische übersetzen',
    translateToNative: 'Ins Deutsche übersetzen',
    pickCorrect: 'Wähle die richtige Antwort',
    arrangeWords: 'Ordne die Wörter',
    fillBlank: 'Fülle die Lücke aus',
    correctAnswer: 'Richtige Antwort:',
    wellDone: 'Gut gemacht!',
    oops: 'Nicht ganz!',
    tapToHear: 'Zum Anhören tippen',
    chapter1: 'Kapitel 1: Erste Schritte',
    continueLearning: 'Weiterlernen',
    backToMap: 'Zurück zur Karte',
    lessonComplete: 'Lektion abgeschlossen!',
    keepGoing: 'Weiter so!',
    skipPrompt: 'Schon bekannt? Stufe überspringen',
  },
  fr: {
    tapToFlip: 'Touchez pour révéler',
    listenAndChoose: 'Écoutez et choisissez',
    whatMeans: 'Que signifie ceci?',
    translateToTr: 'Traduire en turc',
    translateToNative: 'Traduire en français',
    pickCorrect: 'Choisissez la bonne réponse',
    arrangeWords: 'Arranges les mots',
    fillBlank: 'Remplissez le blanc',
    correctAnswer: 'Bonne réponse :',
    wellDone: 'Bravo !',
    oops: 'Pas tout à fait !',
    tapToHear: 'Appuyez pour écouter',
    chapter1: 'Chapitre 1 : Premiers pas',
    continueLearning: 'Continuer à apprendre',
    backToMap: 'Retour à la carte',
    lessonComplete: 'Leçon terminée !',
    keepGoing: 'Continuez !',
    skipPrompt: 'Déjà connu ? Passer le niveau',
  },
  ar: {
    tapToFlip: 'اضغط للكشف',
    listenAndChoose: 'استمع واختر',
    whatMeans: 'ماذا يعني هذا؟',
    translateToTr: 'ترجم إلى التركية',
    translateToNative: 'ترجم إلى العربية',
    pickCorrect: 'اختر الإجابة الصحيحة',
    arrangeWords: 'رتب الكلمات',
    fillBlank: 'أكمل الفراغ',
    correctAnswer: 'الإجابة الصحيحة:',
    wellDone: 'أحسنت!',
    oops: 'ليس تماماً!',
    tapToHear: 'اضغط للاستماع',
    chapter1: 'الفصل الأول: الخطوات الأولى',
    continueLearning: 'تابع التعلم',
    backToMap: 'العودة للخريطة',
    lessonComplete: 'اكتملت الدرس!',
    keepGoing: 'استمر!',
    skipPrompt: 'تعرفه بالفعل؟ تخطَّ المستوى',
  },
  es: {
    tapToFlip: 'Toca para revelar',
    listenAndChoose: 'Escucha y elige',
    whatMeans: '¿Qué significa esto?',
    translateToTr: 'Traducir al turco',
    translateToNative: 'Traducir al español',
    pickCorrect: 'Elige la respuesta correcta',
    arrangeWords: 'Ordena las palabras',
    fillBlank: 'Rellena el espacio',
    correctAnswer: 'Respuesta correcta:',
    wellDone: '¡Muy bien!',
    oops: '¡No del todo!',
    tapToHear: 'Toca para escuchar',
    chapter1: 'Capítulo 1: Primeros pasos',
    continueLearning: 'Seguir aprendiendo',
    backToMap: 'Volver al mapa',
    lessonComplete: '¡Lección completada!',
    keepGoing: '¡Sigue así!',
    skipPrompt: '¿Ya lo sabes? Salta de nivel',
  },
  nl: {
    tapToFlip: 'Tik om te onthullen',
    listenAndChoose: 'Luister en kies',
    whatMeans: 'Wat betekent dit?',
    translateToTr: 'Vertaal naar Turks',
    translateToNative: 'Vertaal naar Nederlands',
    pickCorrect: 'Kies het juiste antwoord',
    arrangeWords: 'Rangschik de woorden',
    fillBlank: 'Vul de zin aan',
    correctAnswer: 'Juiste antwoord:',
    wellDone: 'Goed gedaan!',
    oops: 'Niet helemaal!',
    tapToHear: 'Tik om te horen',
    chapter1: 'Hoofdstuk 1: Eerste stappen',
    continueLearning: 'Blijf leren',
    backToMap: 'Terug naar kaart',
    lessonComplete: 'Les voltooid!',
    keepGoing: 'Ga door!',
    skipPrompt: 'Ken je dit al? Sla een niveau over',
  },
};
function t(key) {
  const lang = getTurkishCookie('tr_native_lang') || 'en';
  return (T[lang] && T[lang][key]) || T.en[key] || key;
}

/* ===== NATIVE-LANGUAGE TRANSLATIONS FOR CONTENT ===== */
var NATIVE = {
  en: {
    hello: 'Hello', goodbye: 'Goodbye', goodMorning: 'Good morning',
    goodEvening: 'Good evening', howAreYou: 'How are you?',
    imFine: 'I am fine', thankYou: 'Thank you', youreWelcome: "You're welcome",
    yes: 'Yes', no: 'No', please: 'Please', excuse: 'Excuse me',
    iDontUnderstand: "I don't understand", doYouSpeak: 'Do you speak English?',
    myNameIs: 'My name is...', niceToMeet: 'Nice to meet you',
    zero: 'zero', one: 'one', two: 'two', three: 'three', four: 'four',
    five: 'five', six: 'six', seven: 'seven', eight: 'eight', nine: 'nine',
    ten: 'ten', twenty: 'twenty', thirty: 'thirty', forty: 'forty', fifty: 'fifty',
    hundred: 'hundred', thousand: 'thousand',
    howMuch: 'How much?', tooExpensive: 'Too expensive', discount: 'Discount',
    iWantThis: 'I want this', doYouHave: 'Do you have...?',
    bag: 'bag', receipt: 'receipt', pay: 'pay', cash: 'cash', card: 'card',
    water: 'water', coffee: 'coffee', tea: 'tea', menu: 'menu',
    table: 'table', bill: 'the bill', waiter: 'waiter',
    busTicket: 'bus ticket', airport: 'airport', station: 'station',
    where: 'where', how: 'how', stop: 'stop',
    left: 'left', right: 'right', straight: 'straight', near: 'near',
  },
  de: {
    hello: 'Hallo', goodbye: 'Tschüss', goodMorning: 'Guten Morgen',
    goodEvening: 'Guten Abend', howAreYou: 'Wie geht es dir?',
    imFine: 'Mir geht es gut', thankYou: 'Danke', youreWelcome: 'Bitte',
    yes: 'Ja', no: 'Nein', please: 'Bitte', excuse: 'Entschuldigung',
    iDontUnderstand: 'Ich verstehe nicht', doYouSpeak: 'Sprechen Sie Englisch?',
    myNameIs: 'Mein Name ist...', niceToMeet: 'Schön Sie kennen zu lernen',
    zero:'null',one:'eins',two:'zwei',three:'drei',four:'vier',five:'fünf',
    six:'sechs',seven:'sieben',eight:'acht',nine:'neun',ten:'zehn',
    twenty:'zwanzig',thirty:'dreißig',forty:'vierzig',fifty:'fünfzig',
    hundred:'hundert',thousand:'tausend',
    howMuch:'Wie viel?',tooExpensive:'Zu teuer',discount:'Rabatt',
    iWantThis:'Das möchte ich',doYouHave:'Haben Sie...?',
    bag:'Tasche',receipt:'Quittung',pay:'zahlen',cash:'Bargeld',card:'Karte',
    water:'Wasser',coffee:'Kaffee',tea:'Tee',menu:'Speisekarte',
    table:'Tisch',bill:'Rechnung',waiter:'Kellner',
    busTicket:'Busticket',airport:'Flughafen',station:'Bahnhof',
    where:'wo',how:'wie',stop:'Haltestelle',
    left:'links',right:'rechts',straight:'geradeaus',near:'in der Nähe',
  },
};
function n(key) {
  const lang = getTurkishCookie('tr_native_lang') || 'en';
  return (NATIVE[lang] && NATIVE[lang][key]) || NATIVE.en[key] || key;
}

/* ===== DID YOU KNOW FACTS ===== */
var DYK = [
  'Turkish uses vowel harmony, vowels in a word all belong to the same "family" of sounds.',
  'Turkish is an agglutinative language: you build meaning by adding suffixes to root words.',
  'The Turkish alphabet was introduced in 1928, replacing the Ottoman Arabic script.',
  'Turkish has no grammatical gender, there is no "he" or "she", only "o" for both.',
  'About 80 million people speak Turkish as their first language.',
  'Turkish and English share some surprising loanwords: "yoghurt", "kiosk", and "turquoise" all come from Turkish.',
  'The verb always comes at the end of the sentence in Turkish: "I the apple ate."',
  'Turkish coffee is cooked in a small pot called a cezve, often served with Turkish delight.',
  'Istanbul is the only city in the world that spans two continents: Europe and Asia.',
  'The word "tulip" comes from the Turkish word "tülbend" (turban), for the flower\'s shape.',
];

/* ===== ALPHABET ===== */
var TR_ALPHABET = [
  {l:'A',sound:'ah',ex:'araba (car)'},
  {l:'B',sound:'b',ex:'bardak (glass)'},
  {l:'C',sound:'j (as in jam)',ex:'cami (mosque)'},
  {l:'Ç',sound:'ch',ex:'çay (tea)',unique:true},
  {l:'D',sound:'d',ex:'dört (four)'},
  {l:'E',sound:'eh',ex:'ev (house)'},
  {l:'F',sound:'f',ex:'fiyat (price)'},
  {l:'G',sound:'g',ex:'gün (day)'},
  {l:'Ğ',sound:'stretches prev. vowel',ex:'dağ (mountain)',unique:true},
  {l:'H',sound:'h',ex:'hayır (no)'},
  {l:'I',sound:'uh (unrounded)',ex:'ışık (light)',unique:true},
  {l:'İ',sound:'ee',ex:'iyi (good)',unique:true},
  {l:'J',sound:'zh (like measure)',ex:'jilet (razor)'},
  {l:'K',sound:'k',ex:'kaç (how many)'},
  {l:'L',sound:'l',ex:'lira (lira)'},
  {l:'M',sound:'m',ex:'merhaba (hello)'},
  {l:'N',sound:'n',ex:'ne (what)'},
  {l:'O',sound:'oh',ex:'on (ten)'},
  {l:'Ö',sound:'uh (rounded lips)',ex:'öğretmen (teacher)',unique:true},
  {l:'P',sound:'p',ex:'para (money)'},
  {l:'R',sound:'r (rolled)',ex:'rica (please)'},
  {l:'S',sound:'s',ex:'su (water)'},
  {l:'Ş',sound:'sh',ex:'şeker (sugar)',unique:true},
  {l:'T',sound:'t',ex:'teşekkür (thank you)'},
  {l:'U',sound:'oo',ex:'ucuz (cheap)'},
  {l:'Ü',sound:'ew (like French "tu")',ex:'üç (three)',unique:true},
  {l:'V',sound:'v',ex:'var (there is)'},
  {l:'Y',sound:'y',ex:'yok (there isn\'t)'},
  {l:'Z',sound:'z',ex:'zaman (time)'},
];

/* ===== STEP BUILDERS ===== */

function buildAlphabetLesson() {
  return [
    { type: 'intro', icon: '🔤', title: 'The Turkish Alphabet', body: 'Turkish uses 29 letters, 8 unique ones you won\'t find in English. The great news: every letter makes exactly ONE sound. No surprises.' },
    { type: 'alphabet-explore', title: 'Tap any letter to hear it', letters: TR_ALPHABET },
    { type: 'tip', icon: '💡', text: 'The 8 special letters are highlighted in red: Ç, Ğ, I, İ, Ö, Ş, Ü, and they each have one consistent sound.' },
    { type: 'mcq', prompt: 'What sound does "Ç" make?', choices: ['ch (as in cheese)', 'sh (as in shoe)', 's (as in see)', 'k (as in key)'], answer: 'ch (as in cheese)', explanation: 'Ç sounds like "ch", think çay (chai tea).' },
    { type: 'mcq', prompt: 'How do you pronounce "Ş"?', choices: ['sh (as in ship)', 'ss (as in hiss)', 'z (as in zero)', 'j (as in jam)'], answer: 'sh (as in ship)', explanation: 'Ş sounds like "sh", think şeker (sugar).' },
    { type: 'mcq', prompt: 'What is special about "Ğ" (yumuşak g)?', choices: ['It stretches the vowel before it', 'It sounds like "gh"', 'It is always silent', 'It sounds like "ng"'], answer: 'It stretches the vowel before it', explanation: 'Ğ (soft g) lengthens the vowel that precedes it. It never starts a word.' },
    { type: 'mcq', prompt: 'Turkish has how many letters?', choices: ['29', '26', '32', '31'], answer: '29', explanation: 'Turkish has 29 letters, the standard Latin alphabet minus Q, W, X, plus Ç, Ğ, I, İ, Ö, Ş, Ü.' },
    { type: 'alphabet-explore', title: 'Review the unique letters one more time', letters: TR_ALPHABET.filter(l => l.unique) },
    { type: 'tip', icon: '🎯', text: 'Vowel harmony: Turkish vowels divide into two groups (front: e,i,ö,ü / back: a,ı,o,u). In most words, all vowels come from the same group.' },
  ];
}

function buildGreetingsLesson() {
  const phrases = [
    { tr: 'Merhaba', en: 'Hello', phonetic: 'mer-HA-ba', situation: 'Any time, any place' },
    { tr: 'Günaydın', en: 'Good morning', phonetic: 'gü-NAY-dın', situation: 'Until about noon' },
    { tr: 'İyi günler', en: 'Good day', phonetic: 'ee-YEE gün-LER', situation: 'Daytime farewell or greeting' },
    { tr: 'İyi akşamlar', en: 'Good evening', phonetic: 'ee-YEE ak-SHAM-lar', situation: 'From about 6 pm' },
    { tr: 'İyi geceler', en: 'Good night', phonetic: 'ee-YEE ge-je-LER', situation: 'When going to sleep' },
    { tr: 'Hoşça kal', en: 'Goodbye (you stay well)', phonetic: 'HOSH-cha kal', situation: 'Said by the one leaving' },
    { tr: 'Güle güle', en: 'Goodbye (go with a smile)', phonetic: 'GÜ-le GÜ-le', situation: 'Said by the one staying' },
    { tr: 'Nasılsınız?', en: 'How are you? (formal)', phonetic: 'na-SIL-si-niz', situation: 'Formal / to strangers' },
    { tr: 'Nasılsın?', en: 'How are you? (casual)', phonetic: 'na-SIL-sin', situation: 'Friends / same age' },
    { tr: 'İyiyim, teşekkürler', en: 'I\'m fine, thank you', phonetic: 'ee-YEE-yim te-shek-KÜR-ler', situation: 'Standard reply' },
    { tr: 'Teşekkür ederim', en: 'Thank you (formal)', phonetic: 'te-shek-KÜR e-de-rim', situation: 'Formal situations' },
    { tr: 'Teşekkürler', en: 'Thanks (casual)', phonetic: 'te-shek-KÜR-ler', situation: 'Everyday casual' },
    { tr: 'Rica ederim', en: 'You\'re welcome', phonetic: 'ri-JA e-de-rim', situation: 'Reply to thank you' },
    { tr: 'Evet', en: 'Yes', phonetic: 'e-VET', situation: 'Agreement' },
    { tr: 'Hayır', en: 'No', phonetic: 'HA-yir', situation: 'Disagreement' },
    { tr: 'Lütfen', en: 'Please', phonetic: 'LÜT-fen', situation: 'Requests' },
    { tr: 'Pardon / Affedersiniz', en: 'Excuse me', phonetic: 'par-DON / af-fe-der-si-NIZ', situation: 'Getting attention / apologising' },
    { tr: 'Anlamıyorum', en: "I don't understand", phonetic: 'an-la-MI-yo-rum', situation: 'When confused' },
  ];
  return [
    { type: 'intro', icon: '👋', title: 'Greetings in Turkish', body: 'Turkish greetings are warm and context-specific. There are different goodbyes for the person leaving versus the person staying, a lovely cultural nuance.' },
    { type: 'flip-cards', title: 'Learn the phrases, tap to flip', cards: phrases.slice(0, 6) },
    { type: 'mcq', prompt: 'You are leaving a shop. What do you say?', choices: ['Güle güle', 'Hoşça kal', 'Merhaba', 'İyi geceler'], answer: 'Hoşça kal', explanation: '"Hoşça kal" (stay well) is said by the person leaving. "Güle güle" (go smiling) is said by the one who stays.' },
    { type: 'mcq', prompt: 'It\'s 9 am. What greeting do you use?', choices: ['Günaydın', 'İyi akşamlar', 'İyi geceler', 'Hoşça kal'], answer: 'Günaydın', explanation: '"Günaydın" means good morning and is used until about noon.' },
    { type: 'flip-cards', title: 'More essential phrases', cards: phrases.slice(6, 12) },
    { type: 'match-pairs', title: 'Match Turkish to English', pairs: [
      { tr: 'Merhaba', en: 'Hello' },
      { tr: 'Teşekkürler', en: 'Thanks' },
      { tr: 'Evet', en: 'Yes' },
      { tr: 'Hayır', en: 'No' },
      { tr: 'Lütfen', en: 'Please' },
      { tr: 'Rica ederim', en: "You're welcome" },
    ]},
    { type: 'flip-cards', title: 'Useful phrases when lost', cards: phrases.slice(12) },
    { type: 'mcq', prompt: 'How do you say "I don\'t understand"?', choices: ['Anlamıyorum', 'Bilmiyorum', 'İstiyorum', 'Gidiyorum'], answer: 'Anlamıyorum', explanation: '"Anlamıyorum" = I don\'t understand. The root is "anlamak" (to understand) + negative suffix -mıyor + I suffix -um.' },
    { type: 'mcq', prompt: 'Your friend thanks you. You reply:', choices: ['Rica ederim', 'Teşekkürler', 'Evet', 'Lütfen'], answer: 'Rica ederim', explanation: '"Rica ederim" is the standard polite reply to teşekkürler.' },
    { type: 'tip', icon: '🌙', text: 'Cultural note: Turks often add "inşallah" (God willing) to future plans, it\'s not just religious, it\'s a social habit meaning "I hope so" or "fingers crossed".' },
    { type: 'mcq', prompt: '"İyi akşamlar" means:', choices: ['Good evening', 'Good morning', 'Goodnight', 'See you tomorrow'], answer: 'Good evening', explanation: '"Akşam" = evening. "İyi" = good. So "İyi akşamlar" = good evenings.' },
  ];
}

function buildNumbers1to10Lesson() {
  const nums = [
    { n: 0, tr: 'sıfır', phonetic: 'SI-fir' },
    { n: 1, tr: 'bir', phonetic: 'bir' },
    { n: 2, tr: 'iki', phonetic: 'i-KI' },
    { n: 3, tr: 'üç', phonetic: 'üch' },
    { n: 4, tr: 'dört', phonetic: 'dört' },
    { n: 5, tr: 'beş', phonetic: 'besh' },
    { n: 6, tr: 'altı', phonetic: 'al-TI' },
    { n: 7, tr: 'yedi', phonetic: 'ye-DI' },
    { n: 8, tr: 'sekiz', phonetic: 'se-KIZ' },
    { n: 9, tr: 'dokuz', phonetic: 'do-KUZ' },
    { n: 10, tr: 'on', phonetic: 'on' },
  ];
  return [
    { type: 'intro', icon: '🔢', title: 'Numbers 0-10', body: 'Turkish numbers are completely regular once you learn the base words, no weird exceptions like eleven (on bir = "ten one").' },
    { type: 'number-grid', numbers: nums, title: 'Tap each number to hear it' },
    { type: 'mcq', prompt: 'How do you say 3 in Turkish?', choices: ['üç', 'beş', 'dört', 'iki'], answer: 'üç', explanation: '"Üç" (üch) = three. Notice the special letter Ü and Ç.' },
    { type: 'mcq', prompt: 'What number is "yedi"?', choices: ['7', '8', '6', '9'], answer: '7', explanation: '"Yedi" = seven. Remember: ye-DI.' },
    { type: 'match-pairs', title: 'Match numbers', pairs: [
      { tr: 'bir', en: '1' },
      { tr: 'iki', en: '2' },
      { tr: 'beş', en: '5' },
      { tr: 'sekiz', en: '8' },
      { tr: 'on', en: '10' },
      { tr: 'sıfır', en: '0' },
    ]},
    { type: 'mcq', prompt: 'How do you say 8?', choices: ['sekiz', 'altı', 'dokuz', 'yedi'], answer: 'sekiz', explanation: '"Sekiz" = eight. The "z" at the end is a giveaway once you know it.' },
    { type: 'mcq', prompt: '"Altı" means:', choices: ['6', '7', '4', '9'], answer: '6', explanation: '"Altı" = six. Altı sounds like "al-TI".' },
    { type: 'tip', icon: '💡', text: 'Turkish numbers above 10 are built by combining: on (10) + bir (1) = on bir (11). No irregulars to memorise!' },
    { type: 'fill-blank', sentence: '_____ kere teşekkürler!', blank: 'Bin', translation: '_____ times thank you! (A thousand thanks!)', choices: ['Bin', 'On', 'Sıfır', 'Beş'], explanation: '"Bin kere teşekkürler" means "a thousand thanks!", common phrase for deep gratitude.' },
    { type: 'mcq', prompt: 'What is "dört"?', choices: ['4', '3', '5', '6'], answer: '4', explanation: '"Dört" = four. The ö sound is like in German "schön", round your lips.' },
  ];
}

function buildNumbers11to100Lesson() {
  return [
    { type: 'intro', icon: '💰', title: 'Numbers & Prices', body: 'Prices in Turkey are in lira (TL). Once you know 1-10, numbers 11-99 are built by combining them: on bir, on iki... It is perfectly logical.' },
    { type: 'tip', icon: '🧮', text: 'The pattern: [tens word] + [ones word]. On bir (11) = ten + one. Yirmi beş (25) = twenty + five. No "and" in between.' },
    { type: 'number-showcase', numbers: [
      { n: 11, tr: 'on bir', phonetic: 'on bir' },
      { n: 12, tr: 'on iki', phonetic: 'on i-ki' },
      { n: 20, tr: 'yirmi', phonetic: 'yir-mi' },
      { n: 25, tr: 'yirmi beş', phonetic: 'yir-mi besh' },
      { n: 30, tr: 'otuz', phonetic: 'o-tuz' },
      { n: 40, tr: 'kırk', phonetic: 'kırk' },
      { n: 50, tr: 'elli', phonetic: 'el-li' },
      { n: 60, tr: 'altmış', phonetic: 'alt-mish' },
      { n: 70, tr: 'yetmiş', phonetic: 'yet-mish' },
      { n: 80, tr: 'seksen', phonetic: 'sek-sen' },
      { n: 90, tr: 'doksan', phonetic: 'dok-san' },
      { n: 100, tr: 'yüz', phonetic: 'yüz' },
    ]},
    { type: 'mcq', prompt: 'How do you say 25 in Turkish?', choices: ['Yirmi beş', 'Yirmi dört', 'Otuz beş', 'On beş'], answer: 'Yirmi beş', explanation: 'Yirmi (20) + beş (5) = yirmi beş (25). That\'s it!' },
    { type: 'mcq', prompt: '"Kaç lira?" means:', choices: ['How many lira?', 'I want lira', 'Give me lira', 'A lot of lira'], answer: 'How many lira?', explanation: '"Kaç" = how many/much. "Kaç lira?" is the essential price question.' },
    { type: 'dialogue', location: '🛍️ Market stall', speakers: [
      { name: 'Satıcı (Seller)', side: 'tr-speaker', tr: 'Buyurun!', en: 'Welcome! (lit. "Go ahead!", a warm way to invite customers)', phonetic: 'buy-u-RUN' },
      { name: 'Siz (You)', side: 'learner', tr: 'Bu kaç lira?', en: 'How much is this?', phonetic: 'bu KACH li-ra' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Yirmi beş lira.', en: '25 lira.', phonetic: 'yir-mi besh li-ra' },
      { name: 'Siz', side: 'learner', tr: 'Tamam, alıyorum.', en: 'OK, I\'ll take it.', phonetic: 'ta-MAM a-li-YO-rum' },
    ]},
    { type: 'mcq', prompt: 'The seller says "elli lira". How much is that?', choices: ['50 lira', '15 lira', '40 lira', '55 lira'], answer: '50 lira', explanation: '"Elli" = 50. So "elli lira" = 50 lira.' },
    { type: 'match-pairs', title: 'Match numbers 11-100', pairs: [
      { tr: 'on bir', en: '11' },
      { tr: 'yirmi', en: '20' },
      { tr: 'otuz', en: '30' },
      { tr: 'elli', en: '50' },
      { tr: 'yüz', en: '100' },
      { tr: 'kırk', en: '40' },
    ]},
    { type: 'mcq', prompt: 'How do you say "100 lira"?', choices: ['Yüz lira', 'Bin lira', 'Yirmi lira', 'Elli lira'], answer: 'Yüz lira', explanation: '"Yüz" = hundred. "Yüz lira" = 100 lira. "Bin" = thousand.' },
    { type: 'tip', icon: '💳', text: '"Nakit mi, kart mı?" means "Cash or card?", very useful phrase at any checkout in Turkey.' },
  ];
}

function buildCafeLesson() {
  return [
    { type: 'intro', icon: '☕', title: 'At the Cafe', body: 'Cafe culture is huge in Turkey. From Turkish tea (çay) to strong Turkish coffee (kahve), knowing how to order is your first real-world skill.' },
    { type: 'flip-cards', title: 'Cafe vocabulary, tap to flip', cards: [
      { tr: 'Çay', en: 'Tea (black, served in tulip glass)', phonetic: 'chay', situation: 'National drink of Turkey' },
      { tr: 'Türk kahvesi', en: 'Turkish coffee', phonetic: 'türk kah-ve-si', situation: 'Strong, served with grounds' },
      { tr: 'Su', en: 'Water', phonetic: 'su', situation: 'Always free at Turkish cafes' },
      { tr: 'Meyve suyu', en: 'Fruit juice', phonetic: 'mey-ve su-yu', situation: 'Fresh squeezed often available' },
      { tr: 'Sütlaç', en: 'Rice pudding', phonetic: 'süt-lach', situation: 'Classic Turkish dessert' },
      { tr: 'Menü', en: 'Menu', phonetic: 'me-nü', situation: 'Often also called "liste"' },
      { tr: 'Hesap', en: 'The bill', phonetic: 'he-sap', situation: 'Ask for at end of meal' },
      { tr: 'Garson', en: 'Waiter', phonetic: 'gar-son', situation: 'From French garçon' },
    ]},
    { type: 'mcq', prompt: 'How do you ask for the bill?', choices: ['Hesap, lütfen', 'Menü, lütfen', 'Su, lütfen', 'Çay, lütfen'], answer: 'Hesap, lütfen', explanation: '"Hesap" = bill. Adding "lütfen" (please) makes it polite.' },
    { type: 'dialogue', location: '☕ Turkish cafe', speakers: [
      { name: 'Garson', side: 'tr-speaker', tr: 'Buyurun, ne alırsınız?', en: 'Welcome, what would you like?', phonetic: 'ne a-lir-si-niz' },
      { name: 'Siz', side: 'learner', tr: 'Bir çay, lütfen.', en: 'One tea, please.', phonetic: 'bir chay lüt-fen' },
      { name: 'Garson', side: 'tr-speaker', tr: 'Başka bir şey?', en: 'Anything else?', phonetic: 'bash-ka bir shey' },
      { name: 'Siz', side: 'learner', tr: 'Hayır, teşekkürler.', en: 'No, thank you.', phonetic: 'ha-yir te-shek-kür-ler' },
      { name: 'Garson', side: 'tr-speaker', tr: 'Buyurun!', en: 'Here you go!', phonetic: 'buy-u-run' },
      { name: 'Siz', side: 'learner', tr: 'Hesap, lütfen.', en: 'The bill, please.', phonetic: 'he-sap lüt-fen' },
    ]},
    { type: 'mcq', prompt: '"Bir Türk kahvesi, lütfen" means:', choices: ['One Turkish coffee, please', 'Two teas, please', 'Turkish tea, please', 'Coffee without sugar'], answer: 'One Turkish coffee, please', explanation: '"Bir" = one, "Türk kahvesi" = Turkish coffee, "lütfen" = please.' },
    { type: 'fill-blank', sentence: '_____, lütfen.', blank: 'Hesap', translation: '_____, please. (asking for the bill)', choices: ['Hesap', 'Garson', 'Menü', 'Su'], explanation: '"Hesap lütfen" is the phrase to call for the bill.' },
    { type: 'mcq', prompt: 'How is Turkish tea (çay) traditionally served?', choices: ['In a tulip-shaped glass', 'In a large mug', 'With milk', 'Iced'], answer: 'In a tulip-shaped glass', explanation: 'Turkish çay is served in small tulip-shaped (ince belli) glasses, often with two sugar cubes on the side.' },
    { type: 'tip', icon: '🍵', text: 'Ordering Turkish coffee? You\'ll be asked "nasıl?" (how?), meaning how sweet: sade (no sugar), az şekerli (little sugar), orta (medium), çok şekerli (very sweet).' },
    { type: 'match-pairs', title: 'Cafe words', pairs: [
      { tr: 'Çay', en: 'Tea' },
      { tr: 'Hesap', en: 'The bill' },
      { tr: 'Su', en: 'Water' },
      { tr: 'Garson', en: 'Waiter' },
      { tr: 'Menü', en: 'Menu' },
      { tr: 'Kahve', en: 'Coffee' },
    ]},
  ];
}

function buildShopLesson() {
  return [
    { type: 'intro', icon: '🛍️', title: 'At the Shop', body: 'From the Grand Bazaar to corner stores, Turkish shopping starts with one question: "Bu kaç lira?" (How much is this?). Let\'s get you shopping.' },
    { type: 'flip-cards', title: 'Shopping vocabulary', cards: [
      { tr: 'Bu kaç lira?', en: 'How much is this?', phonetic: 'bu KACH li-ra', situation: 'Essential first question' },
      { tr: 'Çok pahalı', en: 'Too expensive', phonetic: 'chok pa-HA-li', situation: 'For bargaining' },
      { tr: 'Ucuz', en: 'Cheap', phonetic: 'u-JUZ', situation: 'A nice compliment to a price' },
      { tr: 'İndirim var mı?', en: 'Is there a discount?', phonetic: 'in-di-RIM var mi', situation: 'Ask at most stalls' },
      { tr: 'Bunu istiyorum', en: 'I want this', phonetic: 'bu-nu is-ti-YO-rum', situation: 'Pointing to an item' },
      { tr: 'Var mı?', en: 'Do you have it? / Is there...?', phonetic: 'VAR mi', situation: 'Asking for availability' },
      { tr: 'Yok', en: "There isn't / We don't have it", phonetic: 'yok', situation: 'Answer when unavailable' },
      { tr: 'Var', en: 'There is / We have it', phonetic: 'var', situation: 'Answer when available' },
      { tr: 'Çanta', en: 'Bag', phonetic: 'chan-ta', situation: 'You might ask "bir çanta var mı?"' },
      { tr: 'Fiş', en: 'Receipt', phonetic: 'fish', situation: 'Ask "fiş alabilir miyim?"' },
      { tr: 'Nakit', en: 'Cash', phonetic: 'na-kit', situation: 'As in "nakit mi, kart mı?"' },
      { tr: 'Kart', en: 'Card', phonetic: 'kart', situation: 'Credit/debit card' },
    ]},
    { type: 'mcq', prompt: '"Çok pahalı" means:', choices: ['Too expensive', 'Very cheap', 'No discount', 'I want this'], answer: 'Too expensive', explanation: '"Çok" = very/too, "pahalı" = expensive. Together: too expensive.' },
    { type: 'dialogue', location: '🏪 Shop in Istanbul', speakers: [
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Buyurun, yardımcı olabilir miyim?', en: 'Welcome, can I help you?', phonetic: 'yar-dim-JI o-la-bi-lir mi-yim' },
      { name: 'Siz', side: 'learner', tr: 'Bu kaç lira?', en: 'How much is this?', phonetic: 'bu kach li-ra' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Seksen lira.', en: '80 lira.', phonetic: 'sek-sen li-ra' },
      { name: 'Siz', side: 'learner', tr: 'Çok pahalı. İndirim var mı?', en: "That's too expensive. Is there a discount?", phonetic: 'chok pa-ha-li. in-di-rim var mi' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Tamam, yetmiş lira.', en: 'OK, 70 lira.', phonetic: 'ta-mam, yet-mish li-ra' },
      { name: 'Siz', side: 'learner', tr: 'Tamam, alıyorum. Nakit alıyor musunuz?', en: "OK, I'll take it. Do you take cash?", phonetic: 'ta-mam, a-li-yo-rum. na-kit a-li-yor mu-su-nuz' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Evet, nakit de, kart da.', en: 'Yes, both cash and card.', phonetic: 'e-vet, na-kit de, kart da' },
    ]},
    { type: 'mcq', prompt: '"Var mı?" is used to ask:', choices: ['Do you have it?', 'How much?', 'I want this', 'Too expensive'], answer: 'Do you have it?', explanation: '"Var mı?" literally means "Is there?" It\'s the all-purpose availability question.' },
    { type: 'fill-blank', sentence: 'Bu _____ lira?', blank: 'kaç', translation: 'How much is this?', choices: ['kaç', 'çok', 'var', 'yok'], explanation: '"Kaç" = how many / how much in the context of numbers.' },
    { type: 'match-pairs', title: 'Shopping essentials', pairs: [
      { tr: 'Ucuz', en: 'Cheap' },
      { tr: 'Pahalı', en: 'Expensive' },
      { tr: 'İndirim', en: 'Discount' },
      { tr: 'Nakit', en: 'Cash' },
      { tr: 'Fiş', en: 'Receipt' },
      { tr: 'Var', en: 'Available' },
    ]},
    { type: 'tip', icon: '🤝', text: 'Bargaining (pazarlık) is normal at markets and bazaars but not in regular shops. At a market, always make an offer lower than what you want to pay.' },
  ];
}

function buildTransportLesson() {
  return [
    { type: 'intro', icon: '🚌', title: 'Getting Around', body: 'Turkey has great public transport. The key words: "nerede?" (where?) and "nasıl gidebilirim?" (how can I get there?) will take you far.' },
    { type: 'flip-cards', title: 'Transport vocabulary', cards: [
      { tr: 'Otobüs', en: 'Bus', phonetic: 'o-to-büs', situation: 'City buses and intercity coaches' },
      { tr: 'Metro', en: 'Metro / Subway', phonetic: 'met-ro', situation: 'Underground rail' },
      { tr: 'Taksi', en: 'Taxi', phonetic: 'tak-si', situation: 'Widely available, metered' },
      { tr: 'Havalimanı', en: 'Airport', phonetic: 'ha-va-li-ma-NI', situation: 'Istanbul has two major airports' },
      { tr: 'İstasyon', en: 'Station', phonetic: 'is-tas-YON', situation: 'Train or bus station' },
      { tr: 'Durak', en: 'Stop (bus/tram)', phonetic: 'du-RAK', situation: 'Bus stop, tram stop' },
      { tr: 'Bilet', en: 'Ticket', phonetic: 'bi-LET', situation: 'Ticket for any transport' },
      { tr: '...nerede?', en: 'Where is...?', phonetic: 'ne-re-DE', situation: 'Essential direction question' },
      { tr: 'Sol', en: 'Left', phonetic: 'sol', situation: 'Turn left = sola dön' },
      { tr: 'Sağ', en: 'Right', phonetic: 'saa', situation: 'Turn right = sağa dön' },
      { tr: 'Düz git', en: 'Go straight', phonetic: 'düz git', situation: 'Most common direction' },
      { tr: 'Yakın', en: 'Near', phonetic: 'ya-KIN', situation: 'Yakın mı? = Is it near?' },
    ]},
    { type: 'dialogue', location: '🚌 Bus stop', speakers: [
      { name: 'Siz', side: 'learner', tr: 'Affedersiniz, en yakın metro durağı nerede?', en: 'Excuse me, where is the nearest metro stop?', phonetic: 'af-fe-der-si-niz, en ya-kin met-ro du-ra-i ne-re-de' },
      { name: 'Yerli (Local)', side: 'tr-speaker', tr: 'Düz gidin, sonra sola dönün.', en: 'Go straight, then turn left.', phonetic: 'düz gi-din, son-ra so-la dö-nün' },
      { name: 'Siz', side: 'learner', tr: 'Yakın mı?', en: 'Is it near?', phonetic: 'ya-KIN mi' },
      { name: 'Yerli', side: 'tr-speaker', tr: 'Evet, beş dakika.', en: 'Yes, five minutes.', phonetic: 'e-vet, besh da-ki-ka' },
      { name: 'Siz', side: 'learner', tr: 'Teşekkürler!', en: 'Thank you!', phonetic: 'te-shek-kür-ler' },
    ]},
    { type: 'mcq', prompt: '"Durak nerede?" means:', choices: ['Where is the stop?', 'When is the bus?', 'How much is a ticket?', 'Go straight'], answer: 'Where is the stop?', explanation: '"Durak" = stop (bus/tram), "nerede" = where. A very useful question!' },
    { type: 'mcq', prompt: 'You want to say "turn left". You say:', choices: ['Sola dön', 'Sağa dön', 'Düz git', 'Dur'], answer: 'Sola dön', explanation: '"Sol" = left, "-a" is the direction suffix, "dön" = turn. So "sola dön" = turn left.' },
    { type: 'fill-blank', sentence: 'Havalimanı _____?', blank: 'nerede', translation: 'Where is the airport?', choices: ['nerede', 'ne zaman', 'nasıl', 'niçin'], explanation: '"Nerede" = where. "Havalimanı nerede?" is a crucial phrase for travellers.' },
    { type: 'match-pairs', title: 'Getting around', pairs: [
      { tr: 'Sol', en: 'Left' },
      { tr: 'Sağ', en: 'Right' },
      { tr: 'Bilet', en: 'Ticket' },
      { tr: 'Durak', en: 'Stop' },
      { tr: 'Yakın', en: 'Near' },
      { tr: 'Metro', en: 'Subway' },
    ]},
    { type: 'tip', icon: '🚇', text: 'In Istanbul, the Istanbulkart is a rechargeable smart card that works on all metro, tram, bus and ferry lines, much cheaper than single tickets.' },
  ];
}

function buildIntroLesson() {
  return [
    { type: 'intro', icon: '🤝', title: 'Meeting People', body: 'Turks are famously warm and hospitable. Knowing how to introduce yourself and ask a few questions will immediately open doors, and probably invitations to tea.' },
    { type: 'flip-cards', title: 'Introductions', cards: [
      { tr: 'Adım...', en: 'My name is...', phonetic: 'a-DIM', situation: 'Lit. "My name is..."' },
      { tr: 'Adınız ne?', en: 'What is your name? (formal)', phonetic: 'a-di-NIZ ne', situation: 'Formal, to strangers' },
      { tr: 'Adın ne?', en: 'What is your name? (casual)', phonetic: 'a-DIN ne', situation: 'Informal, same age' },
      { tr: 'Tanıştığımıza memnun oldum', en: 'Nice to meet you (formal)', phonetic: 'ta-nish-ti-gi-mi-za mem-NUN ol-dum', situation: 'Standard formal introduction' },
      { tr: 'Memnun oldum', en: 'Nice to meet you (short)', phonetic: 'mem-NUN ol-dum', situation: 'Everyday friendly' },
      { tr: 'Nerelisiniz?', en: 'Where are you from? (formal)', phonetic: 'ne-re-li-si-NIZ', situation: 'Very common question' },
      { tr: '...\'dan / \'den geliyorum', en: 'I come from...', phonetic: 'ge-li-YO-rum', situation: 'Use -dan/-den after country name' },
      { tr: 'İngilizce biliyor musunuz?', en: 'Do you speak English?', phonetic: 'ing-gi-liz-je bi-li-yor mu-su-nuz', situation: 'Useful when needed' },
    ]},
    { type: 'dialogue', location: '🏨 Hotel lobby', speakers: [
      { name: 'Ahmet', side: 'tr-speaker', tr: 'Merhaba! Adınız ne?', en: 'Hello! What is your name?', phonetic: 'mer-HA-ba! a-di-NIZ ne' },
      { name: 'Siz', side: 'learner', tr: 'Merhaba, adım Alex. Siz?', en: "Hello, my name is Alex. And you?", phonetic: 'mer-ha-ba, a-DIM Alex. siz' },
      { name: 'Ahmet', side: 'tr-speaker', tr: 'Ben Ahmet. Memnun oldum.', en: 'I am Ahmet. Nice to meet you.', phonetic: 'ben AH-met. mem-NUN ol-dum' },
      { name: 'Siz', side: 'learner', tr: 'Ben de memnun oldum. Nerelisiniz?', en: 'Nice to meet you too. Where are you from?', phonetic: 'ben de mem-NUN ol-dum. ne-re-li-si-niz' },
      { name: 'Ahmet', side: 'tr-speaker', tr: "Ankaralıyım. Siz nerelisiniz?", en: "I'm from Ankara. Where are you from?", phonetic: 'an-ka-ra-li-YIM' },
      { name: 'Siz', side: 'learner', tr: "Londra'dan geliyorum.", en: "I come from London.", phonetic: 'lon-dra-DAN ge-li-yo-rum' },
    ]},
    { type: 'mcq', prompt: '"Adım..." means:', choices: ['My name is...', 'My address is...', 'I am from...', 'I speak...'], answer: 'My name is...', explanation: '"Ad" = name, "-ım" = my (possessive suffix). So "adım" = my name.' },
    { type: 'fill-blank', sentence: "_____ İngiltere'den geliyorum.", blank: 'Ben', translation: 'I come from England.', choices: ['Ben', 'Sen', 'O', 'Biz'], explanation: '"Ben" = I. Turkish often omits the pronoun but it can be used for emphasis.' },
    { type: 'tip', icon: '☕', text: 'If a Turkish person asks "Çay içer misiniz?" (Would you like tea?), always say yes! Refusing tea is considered slightly rude. It is a gesture of hospitality.' },
    { type: 'mcq', prompt: "How do you say 'Nice to meet you'?", choices: ['Memnun oldum', 'Hoş geldiniz', 'Günaydın', 'İyi günler'], answer: 'Memnun oldum', explanation: '"Memnun" = pleased/happy, "oldum" = I became. Literally "I became pleased."' },
    { type: 'match-pairs', title: 'Introductions', pairs: [
      { tr: 'Adım...', en: 'My name is...' },
      { tr: 'Memnun oldum', en: 'Nice to meet you' },
      { tr: 'Ben', en: 'I' },
      { tr: 'Nerelisiniz?', en: 'Where are you from?' },
      { tr: 'Siz', en: 'You (formal)' },
      { tr: 'Biz', en: 'We' },
    ]},
  ];
}

function buildReviewLesson() {
  return [
    { type: 'intro', icon: '🧩', title: 'Chapter 1 Review', body: 'Time to test everything you have learned. Mix of vocab, dialogues and real-world situations. No new content, just checking what stuck.' },
    { type: 'mcq', prompt: 'You enter a shop. The seller says "Buyurun!", what does this mean?', choices: ['Welcome / Go ahead!', 'Too expensive!', 'Come back later', 'We are closed'], answer: 'Welcome / Go ahead!', explanation: '"Buyurun" is a warm, versatile word used to welcome customers, hand something over, or invite someone to speak.' },
    { type: 'mcq', prompt: 'How do you say "I want two teas, please"?', choices: ['İki çay, lütfen', 'Bir çay, lütfen', 'İki kahve, lütfen', 'Üç çay, lütfen'], answer: 'İki çay, lütfen', explanation: 'İki (2) + çay (tea) + lütfen (please) = "İki çay, lütfen".' },
    { type: 'mcq', prompt: '"Sola dön, sonra düz git" means:', choices: ['Turn left, then go straight', 'Turn right, then stop', 'Go straight, then turn left', 'Stop, then turn left'], answer: 'Turn left, then go straight', explanation: 'Sol = left, dön = turn, sonra = then, düz git = go straight.' },
    { type: 'mcq', prompt: 'What are the 8 special Turkish letters?', choices: ['Ç, Ğ, I, İ, Ö, Ş, Ü + one more', 'C, G, I, J, O, S, U, V', 'Ç, Ğ, I, İ, Ö, Ş, Ü, Y', 'Q, W, X plus 5 others'], answer: 'Ç, Ğ, I, İ, Ö, Ş, Ü + one more', explanation: 'The 8 unique Turkish letters are Ç, Ğ, I (dotless), İ (dotted), Ö, Ş, Ü, Q, W and X are not in Turkish.' },
    { type: 'mcq', prompt: '"Hesap, lütfen", when would you say this?', choices: ['At the end of a meal', 'Entering a shop', 'Boarding a bus', 'Meeting someone'], answer: 'At the end of a meal', explanation: '"Hesap" = bill. You ask for the hesap when you want to pay and leave.' },
    { type: 'mcq', prompt: 'How do you say 75 in Turkish?', choices: ['Yetmiş beş', 'Yetmiş dört', 'Seksen beş', 'Altmış beş'], answer: 'Yetmiş beş', explanation: 'Yetmiş (70) + beş (5) = yetmiş beş (75).' },
    { type: 'match-pairs', title: 'Final review, match them up', pairs: [
      { tr: 'Çay', en: 'Tea' },
      { tr: 'Durak', en: 'Stop' },
      { tr: 'İndirim', en: 'Discount' },
      { tr: 'Adım...', en: 'My name is...' },
      { tr: 'Nerede?', en: 'Where?' },
      { tr: 'Teşekkürler', en: 'Thank you' },
    ]},
    { type: 'mcq', prompt: 'Turkish word order puts the verb:', choices: ['At the end of the sentence', 'At the beginning', 'After the subject', 'Anywhere freely'], answer: 'At the end of the sentence', explanation: 'Turkish is Subject-Object-Verb (SOV): "Ben elma yedim" = I apple ate = I ate an apple.' },
    { type: 'mcq', prompt: '"Anlamıyorum" means:', choices: ["I don't understand", 'I understand', "I don't speak Turkish", 'I am learning'], answer: "I don't understand", explanation: '"Anlamak" = to understand. "Anlamıyorum" = I am not understanding (present negative).' },
    { type: 'mcq', prompt: 'A seller quotes 100 lira. You say "çok pahalı". The seller comes down to 70. You agree. What do you say?', choices: ['Tamam, alıyorum', 'Hayır, teşekkürler', 'Var mı?', 'Kaç lira?'], answer: 'Tamam, alıyorum', explanation: '"Tamam" = OK, "alıyorum" = I am taking (it). Perfect response when you accept a price.' },
  ];
}

function buildFinalScenarioLesson() {
  return [
    { type: 'intro', icon: '🏆', title: 'Your First Conversation', body: 'This is it, a full real-world shopping scenario, from entering the shop to paying and leaving. Everything you have learned comes together here.' },
    { type: 'dialogue', location: '🛍️ Grand Bazaar, Istanbul', speakers: [
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Buyurun, hoş geldiniz!', en: 'Welcome, glad you came!', phonetic: 'buy-u-run, hosh gel-di-niz' },
      { name: 'Siz', side: 'learner', tr: 'Merhaba! Bu çanta kaç lira?', en: 'Hello! How much is this bag?', phonetic: 'mer-ha-ba! bu chan-ta kach li-ra' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'İki yüz elli lira.', en: '250 lira.', phonetic: 'i-ki yüz el-li li-ra' },
      { name: 'Siz', side: 'learner', tr: 'Çok pahalı. İki yüz olur mu?', en: 'Too expensive. Can it be 200?', phonetic: 'chok pa-ha-li. i-ki yüz o-lur mu' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Tamam, iki yüz yirmi lira, son fiyat.', en: 'OK, 220 lira, final price.', phonetic: 'ta-mam, i-ki yüz yir-mi li-ra, son fi-yat' },
      { name: 'Siz', side: 'learner', tr: 'Tamam, alıyorum. Kart alıyor musunuz?', en: "OK, I'll take it. Do you accept card?", phonetic: 'ta-mam, a-li-yo-rum. kart a-li-yor mu-su-nuz' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Evet, buyurun.', en: 'Yes, go ahead.', phonetic: 'e-vet, buy-u-run' },
      { name: 'Siz', side: 'learner', tr: 'Fiş alabilir miyim?', en: 'Can I have a receipt?', phonetic: 'fish a-la-bi-lir mi-yim' },
      { name: 'Satıcı', side: 'tr-speaker', tr: 'Tabii ki! Buyurun, iyi günler!', en: 'Of course! Here you go, have a good day!', phonetic: 'ta-bi-i ki! buy-u-run, i-yi gün-ler' },
      { name: 'Siz', side: 'learner', tr: 'Teşekkürler, iyi günler!', en: 'Thank you, have a good day!', phonetic: 'te-shek-kür-ler, i-yi gün-ler' },
    ]},
    { type: 'mcq', prompt: 'In the scenario: "iki yüz yirmi lira, son fiyat", "son fiyat" means:', choices: ['Final price', 'Good price', 'New price', 'Special price'], answer: 'Final price', explanation: '"Son" = last/final, "fiyat" = price. Sellers say "son fiyat" to signal no more negotiation.' },
    { type: 'fill-blank', sentence: 'Fiş _____ miyim?', blank: 'alabilir', translation: 'Can I have a receipt?', choices: ['alabilir', 'istiyorum', 'var', 'lütfen'], explanation: '"Alabilir miyim?" = Can I take/have? A very useful polite request structure.' },
    { type: 'mcq', prompt: 'The seller said "Hoş geldiniz!", this means:', choices: ["Welcome! / Glad you came!", 'What do you want?', 'Come back later', 'Good morning'], answer: "Welcome! / Glad you came!", explanation: '"Hoş geldiniz" (lit. "You came nicely") is the formal welcoming phrase. You reply "Hoş bulduk" (We found it nice).' },
    { type: 'mcq', prompt: 'How do you say "250 lira" in Turkish?', choices: ['İki yüz elli lira', 'İki yüz beş lira', 'Yirmi beş lira', 'İki yüz on beş lira'], answer: 'İki yüz elli lira', explanation: 'İki (2) + yüz (hundred) + elli (fifty) = 250. Pattern: [multiplier][hundred][tens][ones].' },
    { type: 'match-pairs', title: 'Chapter 1 mastery check', pairs: [
      { tr: 'İndirim var mı?', en: 'Is there a discount?' },
      { tr: 'Son fiyat', en: 'Final price' },
      { tr: 'Fiş', en: 'Receipt' },
      { tr: 'Alıyorum', en: "I'll take it" },
      { tr: 'Tabii ki', en: 'Of course' },
      { tr: 'İyi günler', en: 'Have a good day' },
    ]},
    { type: 'tip', icon: '🌟', text: 'Tebrikler! (Congratulations!) You have completed Chapter 1. You can now greet people, count and handle prices, order at cafes, shop at markets, ask for directions, and introduce yourself. That is real Turkish!' },
  ];
}

/* ===== CHAPTER 1 LESSON DEFINITIONS ===== */
/*
  Learning arc for Chapter 1 (10 lessons):
  L1: The Turkish Alphabet, sounds and unique letters
  L2: Greetings & Basic Phrases
  L3: Numbers 1-10
  L4: Numbers 11-100 + Prices
  L5: At the Cafe (menu vocab + ordering)
  L6: At the Shop (asking price, sizes, payment)
  L7: Getting Around (transport + directions)
  L8: Meeting People (introductions + small talk)
  L9: Putting It Together (review quiz)
  L10: Your First Conversation (full shop scenario)
*/

var CHAPTER1_LESSONS = [
  {
    id: 'tr-c1-l1',
    title: 'The Turkish Alphabet',
    subtitle: 'Sounds & special letters',
    icon: '🔤',
    type: 'vocab',
    xp: 15,
    steps: buildAlphabetLesson(),
  },
  {
    id: 'tr-c1-l2',
    title: 'Greetings',
    subtitle: 'Hello, goodbye & politeness',
    icon: '👋',
    type: 'vocab',
    xp: 12,
    steps: buildGreetingsLesson(),
  },
  {
    id: 'tr-c1-l3',
    title: 'Numbers 1-10',
    subtitle: 'Counting from one to ten',
    icon: '🔢',
    type: 'vocab',
    xp: 12,
    steps: buildNumbers1to10Lesson(),
  },
  {
    id: 'tr-c1-l4',
    title: 'Numbers & Prices',
    subtitle: '11 to 100, asking the price',
    icon: '💰',
    type: 'vocab',
    xp: 15,
    steps: buildNumbers11to100Lesson(),
  },
  {
    id: 'tr-c1-l5',
    title: 'At the Cafe',
    subtitle: 'Order drinks and food',
    icon: '☕',
    type: 'dialogue',
    xp: 18,
    steps: buildCafeLesson(),
  },
  {
    id: 'tr-c1-l6',
    title: 'At the Shop',
    subtitle: 'Ask prices and buy things',
    icon: '🛍️',
    type: 'dialogue',
    xp: 18,
    steps: buildShopLesson(),
  },
  {
    id: 'tr-c1-l7',
    title: 'Getting Around',
    subtitle: 'Buses, directions, transport',
    icon: '🚌',
    type: 'dialogue',
    xp: 18,
    steps: buildTransportLesson(),
  },
  {
    id: 'tr-c1-l8',
    title: 'Meeting People',
    subtitle: 'Introductions & small talk',
    icon: '🤝',
    type: 'dialogue',
    xp: 15,
    steps: buildIntroLesson(),
  },
  {
    id: 'tr-c1-l9',
    title: 'Chapter Review',
    subtitle: 'Test what you have learned',
    icon: '🧩',
    type: 'grammar',
    xp: 20,
    steps: buildReviewLesson(),
  },
  {
    id: 'tr-c1-l10',
    title: 'Your First Conversation',
    subtitle: 'A full shopping scenario',
    icon: '🏆',
    type: 'dialogue',
    xp: 25,
    steps: buildFinalScenarioLesson(),
  },
];

/* ===== LESSON ENGINE STATE ===== */
var lessonState = {
  lessonId: null,
  steps: [],
  currentStep: 0,
  lives: 3,
  correctCount: 0,
  totalAnswerable: 0,
  nativeLang: 'en',
};

/* ===== HOME SCREEN ===== */
function initTurkishHome() {
  // Restore saved language selection in the UI
  const lang = getTurkishCookie('tr_native_lang') || 'en';
  document.querySelectorAll('.tr-lang-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.lang === lang);
  });

  // Only auto-jump to map if user has actually completed at least one lesson
  const prog = loadProgress();
  const completedLessons = Object.keys(prog).filter(k => !k.startsWith('_') && prog[k].done);
  if (completedLessons.length > 0) {
    showChapterMap();
    return;
  }

  // Set streak display
  const streak = prog._streak || 0;
  if (streak > 0) {
    const streakEl = document.getElementById('trStreak');
    if (streakEl) streakEl.style.display = '';
    const streakVal = document.getElementById('trStreakVal');
    if (streakVal) streakVal.textContent = streak;
  }

  // Rotate Did You Know facts (shown on map screen too)
  initDYK();

  // Build skip grid
  buildSkipGrid();
}

function initDYK() {
  let dykIdx = Math.floor(Math.random() * DYK.length);
  const dykEl = document.getElementById('didYouKnow');
  if (!dykEl) return;
  dykEl.textContent = DYK[dykIdx];
  setInterval(() => {
    dykIdx = (dykIdx + 1) % DYK.length;
    dykEl.style.opacity = '0';
    setTimeout(() => {
      if (dykEl) { dykEl.textContent = DYK[dykIdx]; dykEl.style.opacity = '1'; }
    }, 350);
  }, 8000);
}

function buildSkipGrid() {
  const skipGrid = document.getElementById('skipGrid');
  if (!skipGrid) return;
  skipGrid.innerHTML = '';
  CHAPTER1_LESSONS.forEach((lesson) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline';
    btn.style.cssText = 'font-size:22px;padding:12px;border-radius:var(--r-md);min-height:52px;';
    btn.textContent = lesson.icon;
    btn.title = lesson.title;
    btn.onclick = () => {
      // Mark all previous lessons as completed so the path unlocks correctly
      const prog = loadProgress();
      const idx = CHAPTER1_LESSONS.findIndex(l => l.id === lesson.id);
      for (let i = 0; i < idx; i++) {
        if (!prog[CHAPTER1_LESSONS[i].id]) {
          prog[CHAPTER1_LESSONS[i].id] = { done: true, stars: 1, ts: Date.now(), skipped: true };
        }
      }
      saveProgress(prog);
      closeSkipModal();
      showChapterMap();
    };
    skipGrid.appendChild(btn);
  });
}

function selectLang(lang) {
  document.querySelectorAll('.tr-lang-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.lang === lang);
  });
  setTurkishCookie('tr_native_lang', lang, 365);
}

function startJourney() {
  // Ensure language is saved (default to English if somehow not set)
  const lang = getTurkishCookie('tr_native_lang') || 'en';
  if (!getTurkishCookie('tr_native_lang')) {
    setTurkishCookie('tr_native_lang', lang, 365);
  }
  showChapterMap();
}

function showChapterMap() {
  const langScreen = document.getElementById('screenLangSelect');
  const mapScreen = document.getElementById('screenChapterMap');
  if (langScreen) langScreen.style.display = 'none';
  if (mapScreen) mapScreen.style.display = '';
  // Show streak on map too
  const prog = loadProgress();
  const streak = prog._streak || 0;
  const streakEl = document.getElementById('trStreak');
  const streakVal = document.getElementById('trStreakVal');
  if (streakEl) streakEl.style.display = streak > 0 ? '' : 'none';
  if (streakVal) streakVal.textContent = streak;
  initDYK();
  buildLessonPath();
  updateChapterProgress();
}

function buildLessonPath() {
  const pathEl = document.getElementById('lessonPath');
  if (!pathEl) return;
  pathEl.innerHTML = '';
  const prog = loadProgress();
  const offsets = ['', 'path-offset-right', 'path-offset-left'];

  CHAPTER1_LESSONS.forEach((lesson, i) => {
    const status = prog[lesson.id];
    // First lesson always available; subsequent only if previous is done
    const prevDone = i === 0 || !!prog[CHAPTER1_LESSONS[i - 1].id];
    const completed = !!status;
    const available = !completed && prevDone;

    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    // Apply zigzag offset class
    if (i % 3 === 1) wrap.className = 'path-offset-right';
    else if (i % 3 === 2) wrap.className = 'path-offset-left';

    // Use <a> for clickable, <div> for locked
    const node = document.createElement(available || completed ? 'a' : 'div');
    if (available || completed) {
      node.href = `/turkish/lesson/${lesson.id}/`;
      node.style.textDecoration = 'none';
    }

    // Use base Lexera classes: available / completed / locked
    node.className = 'path-node ' + (completed ? 'completed' : available ? 'available' : 'locked');
    node.title = lesson.title;
    node.innerHTML = completed
      ? lesson.icon
      : available
        ? lesson.icon
        : '<span style="font-size:22px;">🔒</span>';

    if (completed && status.stars) {
      const stars = document.createElement('span');
      stars.className = 'path-stars';
      stars.textContent = '⭐'.repeat(status.stars);
      node.appendChild(stars);
    }

    wrap.appendChild(node);

    // Show label below active + completed nodes
    if (available || completed) {
      const info = document.createElement('div');
      info.style.cssText = 'text-align:center;margin-top:6px;max-width:80px;';
      info.innerHTML = `
        <div style="font-size:10px;font-weight:800;color:${completed ? 'var(--amber-600)' : 'var(--tr-red)'};line-height:1.3;">${lesson.title}</div>`;
      wrap.appendChild(info);
    }

    pathEl.appendChild(wrap);
  });
}

function updateChapterProgress() {
  const prog = loadProgress();
  const done = CHAPTER1_LESSONS.filter(l => prog[l.id] && !prog[l.id].skipped).length;
  const pct = Math.round((done / CHAPTER1_LESSONS.length) * 100);
  const fill = document.getElementById('chapterXpFill');
  const label = document.getElementById('chapterXpLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${CHAPTER1_LESSONS.length} lessons complete`;
}

function showSkipModal() {
  const modal = document.getElementById('skipModal');
  if (modal) { buildSkipGrid(); modal.style.display = 'flex'; }
}
function closeSkipModal() {
  const modal = document.getElementById('skipModal');
  if (modal) modal.style.display = 'none';
}
/* ===== LESSON PLAYER ===== */
function initTurkishLesson(lessonId, nativeLang) {
  const lesson = CHAPTER1_LESSONS.find(l => l.id === lessonId);
  if (!lesson) {
    document.getElementById('lessonArea').innerHTML = '<div class="card card-pad" style="margin:20px;">Lesson not found.</div>';
    return;
  }
  lessonState = {
    lessonId,
    steps: lesson.steps,
    currentStep: 0,
    lives: 3,
    correctCount: 0,
    totalAnswerable: lesson.steps.filter(s => ['mcq', 'match-pairs', 'fill-blank'].includes(s.type)).length,
    nativeLang,
    xp: lesson.xp,
    lessonTitle: lesson.title,
  };
  renderLives();
  renderStep();
}

function renderLives() {
  const el = document.getElementById('livesDisplay');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const h = document.createElement('span');
    h.className = 'tr-heart' + (i >= lessonState.lives ? ' lost' : '');
    h.textContent = '❤️';
    el.appendChild(h);
  }
}

function loseLife() {
  if (lessonState.lives > 0) {
    lessonState.lives--;
    renderLives();
    // Shake the hearts
    const hearts = document.querySelectorAll('.tr-heart');
    hearts.forEach(h => { h.classList.add('shake'); setTimeout(() => h.classList.remove('shake'), 400); });
  }
}

function updateProgress() {
  const pct = Math.round((lessonState.currentStep / lessonState.steps.length) * 100);
  const bar = document.getElementById('lessonProgress');
  if (bar) bar.style.width = pct + '%';
}

function renderStep() {
  updateProgress();
  const step = lessonState.steps[lessonState.currentStep];
  if (!step) { finishLesson(); return; }
  const area = document.getElementById('lessonArea');
  area.innerHTML = '';
  area.className = 'game-screen';
  hideFeedback();

  switch (step.type) {
    case 'intro': renderIntro(step, area); break;
    case 'tip': renderTip(step, area); break;
    case 'alphabet-explore': renderAlphabetExplore(step, area); break;
    case 'number-grid': renderNumberGrid(step, area); break;
    case 'number-showcase': renderNumberShowcase(step, area); break;
    case 'flip-cards': renderFlipCards(step, area); break;
    case 'mcq': renderMCQ(step, area); break;
    case 'match-pairs': renderMatchPairs(step, area); break;
    case 'fill-blank': renderFillBlank(step, area); break;
    case 'dialogue': renderDialogue(step, area); break;
    default: nextStep();
  }
}

/* ===== STEP RENDERERS ===== */

function renderIntro(step, area) {
  area.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:20px;">
      <div class="tr-pop-in" style="font-size:64px;margin-bottom:20px;">${step.icon}</div>
      <h2 class="font-display" style="font-size:26px;margin:0 0 12px;">${step.title}</h2>
      <p style="font-size:16px;color:var(--ink-500);max-width:320px;line-height:1.6;margin:0 0 40px;">${step.body}</p>
      <button class="btn btn-primary btn-block" style="max-width:320px;" onclick="nextStep()">Let's go!</button>
    </div>`;
}

function renderTip(step, area) {
  area.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px;">
      <div class="tr-tip tr-slide-up">
        <span class="tr-tip-icon">${step.icon}</span>
        <span class="tr-tip-text">${step.text}</span>
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:24px;" onclick="nextStep()">Got it</button>
    </div>`;
}

function renderAlphabetExplore(step, area) {
  area.innerHTML = `
    <div>
      <div class="tr-lesson-info">
        <div class="tr-lesson-icon">🔤</div>
        <div>
          <div class="tr-lesson-title">${step.title}</div>
          <div class="tr-lesson-subtitle">Tap a letter to hear its sound</div>
        </div>
      </div>
      <div class="tr-alpha-grid" id="alphaGrid"></div>
      <div id="alphaDetail" class="card card-pad" style="margin-top:16px;min-height:64px;display:flex;align-items:center;gap:14px;"></div>
      <button class="btn btn-primary btn-block" style="margin-top:16px;" onclick="nextStep()">Continue</button>
    </div>`;
  const grid = document.getElementById('alphaGrid');
  step.letters.forEach(letter => {
    const cell = document.createElement('button');
    cell.className = 'tr-alpha-cell' + (letter.unique ? ' unique' : '');
    cell.innerHTML = `${letter.l}<span class="tr-alpha-sound">${letter.sound.split(' ')[0]}</span>`;
    cell.onclick = () => {
      document.querySelectorAll('.tr-alpha-cell').forEach(c => c.classList.remove('highlighted'));
      cell.classList.add('highlighted');
      speakTurkish(letter.l);
      const detail = document.getElementById('alphaDetail');
      detail.innerHTML = `
        <div style="font-family:var(--font-display);font-size:38px;font-weight:800;color:var(--tr-red);min-width:44px;text-align:center;">${letter.l}</div>
        <div>
          <div style="font-weight:700;font-size:15px;">Sounds like: <em>${letter.sound}</em></div>
          <div class="muted" style="font-size:13px;margin-top:3px;">${letter.ex}</div>
        </div>`;
    };
    grid.appendChild(cell);
  });
}

function renderNumberGrid(step, area) {
  area.innerHTML = `
    <div>
      <div class="tr-lesson-info" style="margin-bottom:14px;">
        <div class="tr-lesson-icon">🔢</div>
        <div><div class="tr-lesson-title">${step.title}</div></div>
      </div>
      <div class="tr-number-grid" id="numGrid"></div>
      <button class="btn btn-primary btn-block" style="margin-top:20px;" onclick="nextStep()">Continue</button>
    </div>`;
  const grid = document.getElementById('numGrid');
  step.numbers.forEach(num => {
    const card = document.createElement('button');
    card.className = 'tr-number-card';
    card.innerHTML = `
      <div class="tr-number-digit">${num.n}</div>
      <div>
        <div class="tr-number-tr">${num.tr}</div>
        <div class="tr-number-en">${num.phonetic}</div>
      </div>`;
    card.onclick = () => {
      speakTurkish(num.tr);
      card.classList.add('revealed');
      setTimeout(() => card.classList.remove('revealed'), 800);
    };
    grid.appendChild(card);
  });
}

function renderNumberShowcase(step, area) {
  area.innerHTML = `
    <div>
      <div class="tr-lesson-info" style="margin-bottom:14px;">
        <div class="tr-lesson-icon">💰</div>
        <div><div class="tr-lesson-title">Numbers 11-100</div><div class="tr-lesson-subtitle">Tap to hear pronunciation</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;" id="numShowcase"></div>
      <button class="btn btn-primary btn-block" style="margin-top:20px;" onclick="nextStep()">Continue</button>
    </div>`;
  const grid = document.getElementById('numShowcase');
  step.numbers.forEach(num => {
    const card = document.createElement('button');
    card.className = 'tr-number-card';
    card.innerHTML = `
      <div class="tr-number-digit" style="font-size:20px;">${num.n}</div>
      <div>
        <div class="tr-number-tr">${num.tr}</div>
        <div class="tr-number-en" style="font-size:11px;">${num.phonetic}</div>
      </div>`;
    card.onclick = () => { speakTurkish(num.tr); card.classList.toggle('revealed'); };
    grid.appendChild(card);
  });
}

function renderFlipCards(step, area) {
  let idx = 0;
  const cards = step.cards;

  function renderCard() {
    const card = cards[idx];
    area.innerHTML = `
      <div>
        <div class="tr-lesson-info">
          <div class="tr-lesson-icon">🃏</div>
          <div>
            <div class="tr-lesson-title">${step.title}</div>
            <div class="tr-lesson-subtitle">${idx + 1} of ${cards.length}</div>
          </div>
        </div>
        <div class="tr-phrase-scene tr-slide-up" id="flipScene" onclick="flipCard()">
          <div class="tr-phrase-card" id="flipCard">
            <div class="tr-phrase-front">
              <div class="tr-phrase-main">${card.tr}</div>
              <div class="tr-phrase-sub">${card.phonetic || ''}</div>
              <div class="tr-phrase-tap-hint">Tap to see ${getTurkishCookie('tr_native_lang') === 'en' ? 'English' : 'translation'}</div>
            </div>
            <div class="tr-phrase-back">
              <div class="tr-phrase-main">${card.en}</div>
              <div class="tr-phrase-sub">${card.situation || ''}</div>
              <div class="tr-phrase-tap-hint">Tap to flip back</div>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button class="btn btn-outline" style="flex:1;" onclick="prevCard()" ${idx === 0 ? 'disabled' : ''}>Back</button>
          <button class="btn btn-ghost" style="width:48px;font-size:20px;" onclick="speakTurkish('${card.tr.replace(/'/g, "\\'")}')" title="Hear pronunciation">🔊</button>
          <button class="btn btn-primary" style="flex:1;" onclick="${idx < cards.length - 1 ? 'nextCard()' : 'nextStep()'}">
            ${idx < cards.length - 1 ? 'Next' : 'Continue'}
          </button>
        </div>
      </div>`;
    speakTurkish(card.tr);
  }

  window.flipCard = () => { document.getElementById('flipCard').classList.toggle('flipped'); };
  window.nextCard = () => { if (idx < cards.length - 1) { idx++; renderCard(); } };
  window.prevCard = () => { if (idx > 0) { idx--; renderCard(); } };
  renderCard();
}

function renderMCQ(step, area) {
  lessonState.totalAnswerable = (lessonState.totalAnswerable || 0);
  let answered = false;
  area.innerHTML = `
    <div>
      <div class="tr-prompt-card">
        <div class="tr-prompt-lang-tag">🇹🇷 Turkish</div>
        <div class="tr-prompt-text">${step.prompt}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;" id="choices"></div>
    </div>`;
  const choicesEl = document.getElementById('choices');
  const shuffled = [...step.choices].sort(() => Math.random() - 0.5);
  shuffled.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'option-btn tr-slide-up';
    btn.textContent = choice;
    btn.onclick = () => {
      if (answered) return;
      answered = true;
      const correct = choice === step.answer;
      document.querySelectorAll('.option-btn').forEach(b => {
        if (b.textContent === step.answer) b.classList.add('correct');
        else if (b === btn && !correct) b.classList.add('incorrect');
      });
      if (correct) {
        lessonState.correctCount++;
        showFeedback(true, 'Harika!', step.explanation || 'Correct!');
      } else {
        loseLife();
        showFeedback(false, step.explanation || `Correct: ${step.answer}`, `The answer was: ${step.answer}`);
      }
    };
    choicesEl.appendChild(btn);
  });
}

function renderMatchPairs(step, area) {
  let selected = null;
  let matchedCount = 0;
  const total = step.pairs.length;
  area.innerHTML = `
    <div>
      <div class="tr-lesson-info">
        <div class="tr-lesson-icon">🔗</div>
        <div><div class="tr-lesson-title">${step.title}</div><div class="tr-lesson-subtitle">Tap a Turkish word, then its match</div></div>
      </div>
      <div class="tr-match-grid" id="matchGrid"></div>
    </div>`;
  const grid = document.getElementById('matchGrid');

  // Build shuffled left and right columns
  const trWords = [...step.pairs].sort(() => Math.random() - 0.5);
  const enWords = [...step.pairs].sort(() => Math.random() - 0.5);
  const trBtns = [], enBtns = [];

  trWords.forEach(pair => {
    const btn = document.createElement('button');
    btn.className = 'tr-match-btn tr-word';
    btn.textContent = pair.tr;
    btn.dataset.tr = pair.tr;
    btn.dataset.en = pair.en;
    btn.dataset.side = 'tr';
    btn.onclick = () => handleMatchClick(btn, trBtns, enBtns);
    grid.appendChild(btn);
    trBtns.push(btn);
  });
  enWords.forEach(pair => {
    const btn = document.createElement('button');
    btn.className = 'tr-match-btn';
    btn.textContent = pair.en;
    btn.dataset.tr = pair.tr;
    btn.dataset.en = pair.en;
    btn.dataset.side = 'en';
    btn.onclick = () => handleMatchClick(btn, trBtns, enBtns);
    grid.appendChild(btn);
    enBtns.push(btn);
  });

  window._matchState = { selected: null, matchedCount: 0, total, trBtns, enBtns };
}

function handleMatchClick(btn, trBtns, enBtns) {
  if (btn.classList.contains('matched')) return;
  const state = window._matchState;

  if (!state.selected) {
    state.selected = btn;
    btn.classList.add('selected');
    if (btn.dataset.side === 'tr') speakTurkish(btn.dataset.tr);
    return;
  }

  if (state.selected === btn) {
    btn.classList.remove('selected');
    state.selected = null;
    return;
  }

  // Check if same side
  if (state.selected.dataset.side === btn.dataset.side) {
    state.selected.classList.remove('selected');
    state.selected = btn;
    btn.classList.add('selected');
    return;
  }

  // Check match
  const correct = state.selected.dataset.tr === btn.dataset.tr && state.selected.dataset.en === btn.dataset.en;
  if (correct) {
    state.selected.classList.remove('selected');
    state.selected.classList.add('matched');
    btn.classList.add('matched');
    speakTurkish(btn.dataset.tr);
    state.selected = null;
    state.matchedCount++;
    if (state.matchedCount === state.total) {
      lessonState.correctCount++;
      setTimeout(() => showFeedback(true, 'Harika!', 'All pairs matched!'), 300);
    }
  } else {
    loseLife();
    state.selected.classList.remove('selected');
    state.selected.classList.add('wrong');
    btn.classList.add('wrong');
    const prev = state.selected;
    setTimeout(() => {
      prev.classList.remove('wrong');
      btn.classList.remove('wrong');
    }, 600);
    state.selected = null;
  }
}

function renderFillBlank(step, area) {
  let answered = false;
  area.innerHTML = `
    <div>
      <div class="tr-prompt-card">
        <div class="tr-prompt-lang-tag">🇹🇷 Fill in the blank</div>
        <div class="tr-prompt-text">${step.sentence.replace(step.blank, `<span class="tr-blank" id="blankFill">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`)}</div>
        <div class="tr-prompt-phonetic">${step.translation}</div>
      </div>
      <div class="tr-word-bank" id="wordBank"></div>
    </div>`;
  const bank = document.getElementById('wordBank');
  const shuffled = [...step.choices].sort(() => Math.random() - 0.5);
  shuffled.forEach(word => {
    const chip = document.createElement('button');
    chip.className = 'tr-word-chip';
    chip.textContent = word;
    chip.onclick = () => {
      if (answered) return;
      answered = true;
      document.querySelectorAll('.tr-word-chip').forEach(c => c.classList.add('used'));
      const blank = document.getElementById('blankFill');
      if (blank) blank.textContent = word;
      const correct = word === step.blank;
      if (correct) {
        lessonState.correctCount++;
        if (blank) { blank.style.color = 'var(--mint-600)'; blank.style.borderColor = 'var(--mint-600)'; }
        speakTurkish(step.sentence.replace('_____', word));
        showFeedback(true, 'Doğru!', step.explanation || 'Correct!');
      } else {
        loseLife();
        if (blank) { blank.style.color = 'var(--ruby-600)'; blank.style.borderColor = 'var(--ruby-600)'; }
        showFeedback(false, step.explanation || `The answer was: ${step.blank}`, `Correct: ${step.blank}`);
      }
    };
    bank.appendChild(chip);
  });
}

function renderDialogue(step, area) {
  let visibleCount = 0;
  area.innerHTML = `
    <div style="overflow-y:auto;max-height:calc(100vh - 200px);">
      <div class="tr-dialogue-scene">
        <div class="tr-dialogue-header">
          <span style="font-size:20px;">${step.location.split(' ')[0]}</span>
          <span class="tr-dialogue-location">${step.location.split(' ').slice(1).join(' ')}</span>
        </div>
        <div class="tr-bubble-wrap" id="bubbleWrap"></div>
      </div>
      <button class="btn btn-primary btn-block" id="dialogueContinue" style="margin-top:16px;display:none;" onclick="nextStep()">Continue</button>
    </div>`;

  const wrap = document.getElementById('bubbleWrap');

  function revealNext() {
    if (visibleCount >= step.speakers.length) {
      document.getElementById('dialogueContinue').style.display = '';
      return;
    }
    const spk = step.speakers[visibleCount];
    const bubble = document.createElement('div');
    bubble.style.display = 'flex';
    bubble.style.flexDirection = 'column';
    bubble.style.alignItems = spk.side === 'learner' ? 'flex-end' : 'flex-start';
    bubble.innerHTML = `
      <div style="font-size:10px;font-weight:800;color:var(--ink-500);margin-bottom:3px;padding:0 4px;">${spk.name}</div>
      <div class="tr-bubble ${spk.side} tr-slide-up">
        <div class="tr-bubble-tr">${spk.tr}</div>
        <div class="tr-bubble-en">${spk.en}</div>
        <div class="tr-bubble-en" style="opacity:.55;font-style:italic;">${spk.phonetic || ''}</div>
      </div>`;
    bubble.onclick = () => speakTurkish(spk.tr);
    wrap.appendChild(bubble);
    wrap.scrollTop = wrap.scrollHeight;
    if (spk.side === 'tr-speaker') speakTurkish(spk.tr);
    visibleCount++;
    setTimeout(revealNext, spk.side === 'tr-speaker' ? 1400 : 700);
  }
  setTimeout(revealNext, 300);
}

/* ===== FEEDBACK ===== */
function showFeedback(correct, title, sub) {
  const bar = document.getElementById('feedbackBar');
  const icon = document.getElementById('feedbackIcon');
  const titleEl = document.getElementById('feedbackTitle');
  const subEl = document.getElementById('feedbackSub');
  const nextBtn = document.getElementById('nextBtn');

  bar.className = 'feedback-bar ' + (correct ? 'correct' : 'incorrect');
  icon.textContent = correct ? '✅' : '❌';
  titleEl.textContent = title;
  titleEl.style.color = correct ? 'var(--mint-600)' : 'var(--ruby-600)';
  subEl.textContent = sub;
  nextBtn.textContent = 'Continue';
  nextBtn.onclick = nextStep;
  setTimeout(() => bar.classList.remove('hide'), 50);
}

function hideFeedback() {
  const bar = document.getElementById('feedbackBar');
  if (bar) bar.className = 'feedback-bar hide';
}

/* ===== NAVIGATION ===== */
function nextStep() {
  hideFeedback();
  lessonState.currentStep++;
  renderStep();
}

function confirmExit() {
  if (confirm('Leave this lesson? Your progress in this lesson will be lost.')) {
    window.location.href = '/turkish/';
  }
}

/* ===== FINISH ===== */
function finishLesson() {
  const answerable = lessonState.steps.filter(s => ['mcq', 'match-pairs', 'fill-blank'].includes(s.type)).length;
  const score = answerable > 0 ? Math.round((lessonState.correctCount / answerable) * 100) : 100;
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;

  markLessonDone(lessonState.lessonId, stars);
  updateProgress();

  const overlay = document.createElement('div');
  overlay.className = 'tr-finish-overlay';
  const passed = score >= 60;
  overlay.innerHTML = `
    <div class="tr-finish-card">
      <span class="tr-finish-emoji tr-pop-in">${passed ? '🎉' : '💪'}</span>
      <div class="tr-finish-title">${passed ? 'Lesson complete!' : 'Keep going!'}</div>
      <div class="tr-finish-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <div class="tr-finish-stats">
        <div><div class="tr-finish-stat-val">${score}%</div><div class="tr-finish-stat-lbl">Score</div></div>
        <div><div class="tr-finish-stat-val">+${lessonState.xp || 15}</div><div class="tr-finish-stat-lbl">XP</div></div>
        <div><div class="tr-finish-stat-val">⭐${stars}</div><div class="tr-finish-stat-lbl">Stars</div></div>
      </div>
      <a href="/turkish/" class="btn btn-primary btn-block" style="margin-bottom:10px;">Back to map</a>
      ${passed ? '' : `<a href="/turkish/lesson/${lessonState.lessonId}/" class="btn btn-outline btn-block">Try again</a>`}
    </div>`;
  document.body.appendChild(overlay);
  if (passed) lexeraConfetti();
}
