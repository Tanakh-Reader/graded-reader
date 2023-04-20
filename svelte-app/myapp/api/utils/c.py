from tf.fabric import Fabric

path = "bhsa/tf/2021"
features = 'sp prs gn nu vt vs prs_ps prs_gn prs_nu gloss freq_lex freq_occ'

TF = Fabric(locations=path)
api = TF.load(features=features)
api.makeAvailableIn(globals())

print(f"\n\nTF API LOADED\n\n")

class Word:
    
    id: int = 0                 # e.g., 2
    book: int = 0
    chapter: int = 0
    verse: int = 0
    text: str = ""              # e.g., יִשְׁרְצ֣וּ
    trailer: str = ""
    penalty: float = 0.0        # e.g., 2.4845
    speech: str = ""            # e.g., verb
    person: str = ""            # e.g., p3
    gender: str = ""            # e.g., m
    number: str = ""            # e.g., sg
    verb_tense: str = ""        # e.g., impf
    verb_stem: str = ""         # e.g., piel
    suffix_person: str = ""     # e.g., p3
    suffix_gender: str = ""     # e.g., m
    suffix_number: str = ""     # e.g., sg
    gloss: str = ""             # e.g., swarm
    lex_frequency: int = 0          # e.g., 3403
    occ_frequency: int = 0
    lex_id: int = 0
    
    
BOOK_TO_INDEX = { "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5, "Joshua": 6, "Judges": 7, "Ruth": 8, "1_Samuel": 9, "2_Samuel": 10, "1_Kings": 11, "2_Kings": 12, "1_Chronicles": 13, "2_Chronicles": 14, "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19, "Proverbs": 20, "Ecclesiastes": 21, "Song_of_songs": 22, "Isaiah": 23, "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27, "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32, "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37, "Zechariah": 38, "Malachi": 39}

def replace(value):
    if value in {'NA', 'n/a', 'absent'}:
        return None 
    return value 

def add_words_to_database(n):
    words = []
    for node_id in F.otype.s('word')[:n]:
        word = Word()
        book, chapter, verse = T.sectionFromNode(node_id)
        word.id = node_id
        word.book = BOOK_TO_INDEX[book]
        word.chapter = chapter 
        word.verse = verse
        word.text = F.g_word_utf8.v(node_id)
        word.trailer = F.trailer_utf8.v(node_id)
        word.speech = F.sp.v(node_id)
        word.person = replace(F.prs.v(node_id))
        word.gender = replace(F.gn.v(node_id))
        word.number = replace(F.nu.v(node_id))
        word.verb_tense = replace(F.vt.v(node_id))
        word.verb_stem = replace(F.vs.v(node_id))
        word.suffix_person = replace(F.prs_ps.v(node_id))
        word.suffix_gender = replace(F.prs_gn.v(node_id))
        word.suffix_number = replace(F.prs_nu.v(node_id))
        word.gloss = F.gloss.v(node_id)
        word.lex_frequency = F.freq_lex.v(node_id)
        word.occ_frequency = F.freq_occ.v(node_id)
        word.lex_id = L.u(node_id, otype='lex')[0]
        words.append(word)
    return words

