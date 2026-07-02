import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone

from vocabulary.models import Word, WordOfDay
from learning.models import Level, Lesson
from gamification.models import Badge, StoreItem

WORDS = [
    # (text, pos, difficulty, definition, example, ipa, origin, first_use, fun_fact, synonyms[])
    ("happy", "adjective", 1, "Feeling or showing pleasure and contentment.", "She felt happy after the good news.", "/ˈhæpi/", "Old Norse 'happ' (luck)", "14th century", "Originally meant 'lucky', not just 'joyful'.", ["glad", "cheerful"]),
    ("glad", "adjective", 1, "Pleased and happy about something.", "I'm glad you came.", "/ɡlæd/", "Old English 'glæd' (bright, shining)", "before 12th century", "Related to 'glass' and 'glare' through a root meaning 'shine'.", ["happy"]),
    ("cheerful", "adjective", 1, "Noticeably happy and optimistic.", "A cheerful smile greeted us.", "/ˈtʃɪərfʊl/", "Old French 'chiere' (face)", "14th century", "Originally 'cheer' referred to one's facial expression.", ["happy"]),
    ("big", "adjective", 1, "Of considerable size or extent.", "They bought a big house.", "/bɪɡ/", "Middle English, origin uncertain", "14th century", "One of the few common English words with an unclear origin.", ["large", "huge"]),
    ("large", "adjective", 1, "Of greater size than usual.", "A large crowd gathered.", "/lɑːrdʒ/", "Latin 'largus' (abundant)", "12th century", "Once meant 'generous', which survives in 'to give at large'.", ["big"]),
    ("fast", "adjective", 1, "Moving or capable of moving at high speed.", "He is a fast runner.", "/fæst/", "Old English 'fæst' (firm, fixed)", "before 12th century", "Curiously also means 'firmly fixed', as in 'stand fast'.", ["quick", "swift"]),
    ("quick", "adjective", 1, "Moving fast or doing something in a short time.", "She gave a quick reply.", "/kwɪk/", "Old English 'cwic' (alive)", "before 12th century", "Originally meant 'alive' — hence 'the quick and the dead'.", ["fast", "swift"]),
    ("kind", "adjective", 1, "Having a friendly, generous nature.", "It was kind of you to help.", "/kaɪnd/", "Old English 'gecynde' (natural)", "before 12th century", "Shares a root with 'kin', implying treating others like family.", []),
    ("brave", "adjective", 2, "Ready to face danger without fear.", "The brave firefighter entered the building.", "/breɪv/", "Italian 'bravo' (bold)", "16th century", "Once carried a hint of 'showy' or 'wild' before meaning 'courageous'.", ["bold", "courageous"]),
    ("bold", "adjective", 2, "Showing courage and confidence.", "She made a bold decision.", "/boʊld/", "Old English 'beald' (brave)", "before 12th century", "Related to the German word 'bald', meaning 'soon' or 'daring'.", ["brave"]),
    ("gloomy", "adjective", 2, "Dark or poorly lit; feeling sad.", "The sky looked gloomy before the storm.", "/ˈɡluːmi/", "uncertain, possibly Scandinavian", "16th century", "First described dim light before it described dim moods.", ["dismal"]),
    ("curious", "adjective", 2, "Eager to know or learn something.", "The curious child asked many questions.", "/ˈkjʊəriəs/", "Latin 'curiosus' (careful, inquisitive)", "14th century", "Shares a root with 'cure', both from 'cura' meaning 'care'.", ["inquisitive"]),
    ("generous", "adjective", 2, "Willing to give more of something than necessary.", "He was generous with his time.", "/ˈdʒɛnərəs/", "Latin 'generosus' (of noble birth)", "16th century", "Originally described noble birth, not giving — nobility implied virtue.", []),
    ("fragile", "adjective", 2, "Easily broken or damaged.", "Handle the fragile vase with care.", "/ˈfrædʒaɪl/", "Latin 'fragilis' (easily broken)", "15th century", "Shares a root with 'fracture' and 'fragment'.", ["delicate"]),
    ("delicate", "adjective", 2, "Very fine in texture or structure; easily damaged.", "The lace had a delicate pattern.", "/ˈdɛlɪkət/", "Latin 'delicatus' (giving pleasure, dainty)", "14th century", "Related to 'delicious' through the same Latin root.", ["fragile"]),
    ("ambitious", "adjective", 3, "Having a strong desire for success or achievement.", "She is ambitious about her career.", "/æmˈbɪʃəs/", "Latin 'ambitiosus', from 'ambire' (to go around, canvass for votes)", "14th century", "Originally described politicians literally walking around to gather votes.", []),
    ("resilient", "adjective", 3, "Able to recover quickly from difficulties.", "The team stayed resilient after the setback.", "/rɪˈzɪliənt/", "Latin 'resilire' (to leap back)", "17th century", "First used in physics to describe materials that spring back into shape.", []),
    ("meticulous", "adjective", 3, "Showing great attention to detail; very careful.", "She kept meticulous records.", "/məˈtɪkjʊləs/", "Latin 'meticulosus' (fearful)", "16th century", "Originally meant 'fearful' — being careful out of fear of mistakes.", ["precise"]),
    ("eloquent", "adjective", 3, "Fluent and persuasive in speaking or writing.", "He gave an eloquent speech.", "/ˈɛləkwənt/", "Latin 'eloqui' (to speak out)", "15th century", "Shares a root with 'elocution' and 'loquacious'.", []),
    ("benevolent", "adjective", 3, "Well-meaning and kindly.", "The benevolent king lowered taxes.", "/bəˈnɛvələnt/", "Latin 'bene' (well) + 'velle' (to wish)", "15th century", "Its opposite, 'malevolent', shares the same root structure.", ["kind"]),
    ("candid", "adjective", 3, "Truthful and straightforward; frank.", "He gave a candid opinion.", "/ˈkændɪd/", "Latin 'candidus' (white, pure)", "17th century", "Also the root of 'candidate' — Roman office-seekers wore white togas.", ["honest"]),
    ("audacious", "adjective", 3, "Showing a willingness to take bold risks.", "It was an audacious plan to cross the desert.", "/ɔːˈdeɪʃəs/", "Latin 'audax' (bold, from audere, to dare)", "16th century", "Related to 'audacity' and, distantly, to 'auction' through 'augere' (to increase).", ["bold"]),
    ("pragmatic", "adjective", 3, "Dealing with things sensibly and realistically.", "They took a pragmatic approach to the budget.", "/præɡˈmætɪk/", "Greek 'pragma' (deed, act)", "17th century", "Comes from the same root as 'pragma' meaning 'a thing done'.", []),
    ("ephemeral", "adjective", 4, "Lasting for a very short time.", "Fashion trends are often ephemeral.", "/ɪˈfɛmərəl/", "Greek 'ephemeros' (lasting a day)", "16th century", "Originally used by doctors to describe fevers lasting only a day.", ["fleeting", "transient"]),
    ("ubiquitous", "adjective", 4, "Present, appearing, or found everywhere.", "Smartphones are now ubiquitous.", "/juːˈbɪkwɪtəs/", "Latin 'ubique' (everywhere)", "19th century", "Coined by theologians to describe God's presence everywhere.", []),
    ("serendipity", "noun", 4, "The occurrence of events by chance in a happy way.", "Meeting her was pure serendipity.", "/ˌsɛrənˈdɪpɪti/", "Coined by Horace Walpole from the Persian tale 'The Three Princes of Serendip'", "1754", "Invented for a fairy tale about princes making lucky discoveries.", []),
    ("ambivalent", "adjective", 4, "Having mixed feelings about something.", "She felt ambivalent about the job offer.", "/æmˈbɪvələnt/", "Latin 'ambi' (both) + 'valere' (to be strong)", "20th century", "Coined by psychologist Eugen Bleuler in 1910.", []),
    ("gregarious", "adjective", 4, "Fond of company; sociable.", "He has a gregarious personality.", "/ɡrɪˈɡɛəriəs/", "Latin 'gregarius' (belonging to a flock, from grex, flock)", "17th century", "Shares a root with 'congregation' and 'segregate'.", ["sociable"]),
    ("cacophony", "noun", 4, "A harsh, discordant mixture of sounds.", "The traffic created a cacophony outside.", "/kəˈkɒfəni/", "Greek 'kakos' (bad) + 'phone' (sound)", "17th century", "The opposite of 'euphony', which uses the Greek root for 'good'.", []),
    ("nostalgia", "noun", 4, "A sentimental longing for the past.", "The song filled her with nostalgia.", "/nɒˈstældʒə/", "Greek 'nostos' (return home) + 'algos' (pain)", "17th century", "Coined by a Swiss doctor to describe homesickness in soldiers.", []),
    ("labyrinth", "noun", 4, "A complicated, irregular network of passages.", "The old town was a labyrinth of narrow streets.", "/ˈlæbərɪnθ/", "Greek 'labyrinthos', linked to the myth of the Minotaur", "16th century", "Named after the maze built by Daedalus in Greek mythology.", ["maze"]),
    ("quintessential", "adjective", 5, "Representing the most perfect example of a quality.", "He is the quintessential gentleman.", "/ˌkwɪntɪˈsɛnʃəl/", "Medieval Latin 'quinta essentia' (fifth essence)", "16th century", "Ancient philosophers believed a mysterious 'fifth element' formed the heavens.", []),
    ("perspicacious", "adjective", 5, "Having keen insight or understanding.", "Her perspicacious analysis impressed everyone.", "/ˌpɜːrspɪˈkeɪʃəs/", "Latin 'perspicax' (sharp-sighted)", "17th century", "Shares a root with 'perspective' and 'spectacle'.", []),
    ("obfuscate", "verb", 5, "To deliberately make something unclear or confusing.", "The report seemed designed to obfuscate the facts.", "/ˈɒbfʌskeɪt/", "Latin 'obfuscare' (to darken)", "16th century", "Related to 'fuscous', an old word for dark brownish-gray.", []),
    ("magnanimous", "adjective", 5, "Generous or forgiving, especially toward a rival.", "The champion was magnanimous in victory.", "/mæɡˈnænɪməs/", "Latin 'magnus' (great) + 'animus' (soul)", "16th century", "Literally means 'great-souled'.", ["generous"]),
    ("juxtapose", "verb", 5, "To place things side by side for contrasting effect.", "The film juxtaposes wealth and poverty.", "/ˈdʒʌkstəpoʊz/", "Latin 'juxta' (near) + French 'poser' (to place)", "19th century", "Popular in art criticism to describe contrast in composition.", []),
    ("indefatigable", "adjective", 5, "Persisting tirelessly.", "She was an indefatigable advocate for the cause.", "/ˌɪndɪˈfætɪɡəbəl/", "Latin 'in-' (not) + 'defatigare' (to tire out)", "16th century", "Literally means 'not able to be fatigued'.", ["tireless"]),
    ("sanguine", "adjective", 5, "Optimistic or positive, especially in a difficult situation.", "He remained sanguine despite the setback.", "/ˈsæŋɡwɪn/", "Latin 'sanguis' (blood)", "14th century", "From medieval medicine — a 'sanguine' temperament meant an abundance of blood, thought to cause cheerfulness.", ["optimistic"]),
    ("verbose", "adjective", 3, "Using more words than needed; wordy.", "The instructions were unnecessarily verbose.", "/vɜːrˈboʊs/", "Latin 'verbosus' (wordy, from verbum, word)", "17th century", "Shares its root with 'verb' and 'verbatim'.", []),
    ("tenacious", "adjective", 3, "Holding firmly to something; persistent.", "She was tenacious in pursuing her goals.", "/təˈneɪʃəs/", "Latin 'tenax' (holding fast, from tenere, to hold)", "17th century", "Shares a root with 'tenant' and 'contain'.", ["persistent"]),
    ("dubious", "adjective", 3, "Hesitating or doubting; not to be relied upon.", "He gave a dubious excuse.", "/ˈdjuːbiəs/", "Latin 'dubius' (doubtful)", "16th century", "Shares a root with 'doubt' through French.", ["doubtful"]),
    ("frugal", "adjective", 2, "Sparing or economical with money or food.", "They lived a frugal lifestyle.", "/ˈfruːɡəl/", "Latin 'frugalis' (economical, from frux, fruit/value)", "16th century", "Originally linked to enjoying the 'fruits' of one's labor wisely.", []),
    ("humble", "adjective", 2, "Having a modest view of one's own importance.", "Despite his success, he stayed humble.", "/ˈhʌmbəl/", "Latin 'humilis' (low, from humus, ground/earth)", "13th century", "Shares its root with 'humus' and 'exhume' — all tied to 'earth'.", ["modest"]),
    ("vivid", "adjective", 2, "Producing powerful feelings or clear images in the mind.", "She has a vivid imagination.", "/ˈvɪvɪd/", "Latin 'vividus' (lively, from vivere, to live)", "17th century", "Shares a root with 'vivacious' and 'revive'.", []),
    ("obscure", "adjective", 3, "Not discovered or known about; unclear.", "He mentioned an obscure fact.", "/əbˈskjʊər/", "Latin 'obscurus' (dark, dim)", "14th century", "Once purely meant 'dark' before extending to 'hard to understand'.", []),
    ("candor", "noun", 3, "The quality of being open and honest.", "She spoke with refreshing candor.", "/ˈkændər/", "Latin 'candor' (whiteness, purity)", "16th century", "Shares its root with 'candid' and 'candle' — both tied to brightness.", ["honesty"]),
    ("diligent", "adjective", 2, "Showing care and effort in work or duties.", "The diligent student reviewed every chapter.", "/ˈdɪlɪdʒənt/", "Latin 'diligere' (to value, esteem)", "14th century", "Originally meant 'to love' — hard work was seen as an act of care.", ["hardworking"]),
    ("solitude", "noun", 2, "The state of being alone.", "He enjoyed the solitude of the mountains.", "/ˈsɒlɪtjuːd/", "Latin 'solus' (alone)", "14th century", "Shares its root with 'sole' and 'solo'.", []),
    ("wander", "verb", 1, "To walk without a fixed direction or purpose.", "They wandered through the old town.", "/ˈwɒndər/", "Old English 'wandrian'", "before 12th century", "Unrelated to 'wonder', despite sounding similar.", ["roam"]),
    ("gather", "verb", 1, "To bring together in one place.", "We gathered around the fire.", "/ˈɡæðər/", "Old English 'gaderian'", "before 12th century", "Related to 'together', both from the same Germanic root meaning 'to unite'.", ["collect"]),
    ("whisper", "verb", 1, "To speak very softly.", "She whispered the secret to her friend.", "/ˈwɪspər/", "Old English 'hwisprian'", "before 12th century", "An imitative word — it sounds like the action it describes.", []),
    ("shatter", "verb", 2, "To break suddenly into many pieces.", "The glass shattered on the floor.", "/ˈʃætər/", "Middle English, related to 'scatter'", "13th century", "Long thought to share a root with 'scatter', though scholars debate it.", ["break"]),
    ("flourish", "verb", 2, "To grow or develop in a healthy way.", "The garden flourished in the spring.", "/ˈflʌrɪʃ/", "Latin 'florere' (to bloom)", "13th century", "Shares its root with 'flower' and 'flora'.", ["thrive"]),
    ("linger", "verb", 2, "To stay somewhere longer than necessary.", "The smell of coffee lingered in the kitchen.", "/ˈlɪŋɡər/", "Old English 'lengan' (to prolong)", "14th century", "Related to the word 'long', both describing extension in time.", []),
    ("thrive", "verb", 2, "To grow or develop well; prosper.", "The business thrived after the move.", "/θraɪv/", "Old Norse 'þrífa' (to grasp, seize)", "13th century", "Originally meant 'to grasp' — success once meant seizing opportunity.", ["flourish"]),
    ("wither", "verb", 2, "To become dry and shriveled.", "The flowers withered without water.", "/ˈwɪðər/", "Middle English, related to 'weather'", "14th century", "Believed to derive from being exposed to harsh weather.", []),
    ("banish", "verb", 3, "To send someone away as a punishment.", "The king banished the traitor.", "/ˈbænɪʃ/", "Old French 'banir' (to proclaim outlaw)", "14th century", "Related to 'ban' and 'abandon'.", ["exile"]),
    ("cultivate", "verb", 3, "To prepare land for crops; to develop a skill.", "She cultivated her love of painting.", "/ˈkʌltɪveɪt/", "Latin 'cultivare' (to till)", "17th century", "Shares its root with 'culture' and 'cult'.", []),
    ("scrutinize", "verb", 3, "To examine closely and thoroughly.", "The auditor scrutinized every receipt.", "/ˈskruːtɪnaɪz/", "Latin 'scrutari' (to search, from scruta, trash)", "17th century", "Originally meant to search through junk — literally 'to sort rubbish'.", ["examine"]),
    ("reconcile", "verb", 3, "To restore friendly relations between people.", "The brothers reconciled after years apart.", "/ˈrɛkənsaɪl/", "Latin 're-' (again) + 'conciliare' (to bring together)", "14th century", "Shares its root with 'council' and 'conciliate'.", []),
    ("procrastinate", "verb", 3, "To delay or postpone action.", "He tends to procrastinate before exams.", "/proʊˈkræstɪneɪt/", "Latin 'pro-' (forward) + 'cras' (tomorrow)", "16th century", "Literally means 'to push forward to tomorrow'.", []),
]

LEVELS = [
    {"order": 1, "name": "Roots", "subtitle": "Everyday words to start strong", "icon": "🌱", "color": "#4F46E5", "min_d": 1, "max_d": 1},
    {"order": 2, "name": "Sprout", "subtitle": "Growing your vocabulary", "icon": "🌿", "color": "#12B886", "min_d": 2, "max_d": 2},
    {"order": 3, "name": "Bloom", "subtitle": "Words that add color", "icon": "🌸", "color": "#F0553D", "min_d": 3, "max_d": 3},
    {"order": 4, "name": "Canopy", "subtitle": "Reach for richer language", "icon": "🌳", "color": "#2D9CDB", "min_d": 4, "max_d": 4},
    {"order": 5, "name": "Summit", "subtitle": "Master-level vocabulary", "icon": "🏔️", "color": "#F5A623", "min_d": 5, "max_d": 5},
]

LESSON_CYCLE = ["quiz", "typing", "wordle", "dragdrop", "connections", "sudoku", "history", "test"]
ICONS = {"quiz": "🧠", "typing": "⌨️", "wordle": "🟩", "dragdrop": "🧲", "connections": "🔗", "sudoku": "🔢", "history": "📜", "test": "🏁"}
TITLES = {"quiz": "Quick Quiz", "typing": "Type It Out", "wordle": "Word Guess", "dragdrop": "Match It Up",
          "connections": "Synonym Links", "sudoku": "Word Sudoku", "history": "Word Stories", "test": "Level Test"}


class Command(BaseCommand):
    help = "Seed Lexera with words, levels, lessons, store items and badges."

    def handle(self, *args, **options):
        self.stdout.write("Seeding words...")
        word_objs = {}
        for text, pos, diff, defi, example, ipa, origin, first_use, fact, syns in WORDS:
            w, _ = Word.objects.update_or_create(
                text=text,
                defaults=dict(part_of_speech=pos, difficulty=diff, definition=defi, example_sentence=example,
                              pronunciation_ipa=ipa, origin_language=origin, first_known_use=first_use, fun_fact=fact)
            )
            word_objs[text] = w
        for text, *_rest, syns in WORDS:
            w = word_objs[text]
            for s in syns:
                if s in word_objs:
                    w.synonyms.add(word_objs[s])

        self.stdout.write("Seeding word of the day...")
        today = timezone.localdate()
        WordOfDay.objects.get_or_create(date=today, defaults={"word": word_objs.get("serendipity", list(word_objs.values())[0])})

        self.stdout.write("Seeding levels and lessons...")
        for lvl in LEVELS:
            level, _ = Level.objects.update_or_create(
                order=lvl["order"],
                defaults=dict(name=lvl["name"], subtitle=lvl["subtitle"], icon=lvl["icon"], color=lvl["color"],
                              min_difficulty=lvl["min_d"], max_difficulty=lvl["max_d"])
            )
            pool = [w for w in word_objs.values() if lvl["min_d"] <= w.difficulty <= lvl["max_d"]]
            if not pool:
                continue
            chunk_size = max(3, len(pool) // len(LESSON_CYCLE) or 3)
            for i, ltype in enumerate(LESSON_CYCLE):
                chunk = pool[(i * chunk_size) % len(pool): (i * chunk_size) % len(pool) + chunk_size] or pool[:5]
                if ltype == "wordle":
                    chunk = [w for w in pool if 4 <= len(w.text) <= 8][:1] or pool[:1]
                if ltype == "sudoku":
                    chunk = pool[:1]
                lesson, _ = Lesson.objects.update_or_create(
                    level=level, order=i + 1,
                    defaults=dict(title=TITLES[ltype], lesson_type=ltype, icon=ICONS[ltype],
                                  xp_reward=15 + lvl["order"] * 5)
                )
                lesson.words.set(chunk)

        self.stdout.write("Seeding store...")
        StoreItem.objects.update_or_create(key="streak_freeze", defaults=dict(name="Streak Freeze", description="Protects your streak for one missed day.", icon="❄️", price_coins=200))
        StoreItem.objects.update_or_create(key="refill_lives", defaults=dict(name="Refill Lives", description="Instantly restore all your lives.", icon="❤️", price_coins=120))
        StoreItem.objects.update_or_create(key="double_xp", defaults=dict(name="Double XP Boost", description="Earn 2x XP for the next 15 minutes.", icon="⚡", price_coins=150))

        self.stdout.write("Seeding badges...")
        Badge.objects.update_or_create(key="first-lesson", defaults=dict(name="First Steps", description="Complete your first lesson.", icon="🥇", tier="bronze"))
        Badge.objects.update_or_create(key="streak-7", defaults=dict(name="Week Warrior", description="Reach a 7-day streak.", icon="🔥", tier="silver"))
        Badge.objects.update_or_create(key="streak-30", defaults=dict(name="Unstoppable", description="Reach a 30-day streak.", icon="🏆", tier="gold"))
        Badge.objects.update_or_create(key="level-summit", defaults=dict(name="Summit Climber", description="Complete the Summit level.", icon="🏔️", tier="gold"))

        self.stdout.write(self.style.SUCCESS(f"Done. {len(word_objs)} words, {Level.objects.count()} levels, {Lesson.objects.count()} lessons."))
