import math

from .timer import timer
from ..providers.tf_api import bhsa_provider
from ..providers.books import book_provider
from ..models import Word

BATCH_SIZE = 2500 # uploading words to the database

# Replace string values with None
def replace(value):

    if value in {'NA', 'n/a', 'absent'}:
        return None 
    
    return value 

# The goal is to penalize at scale, fading out around frequency = 450
# penalty 10 - (√n * 4.5 - 5) / 10
def word_penalty(word):

    part_1 = max( 0, ( math.sqrt(word.lex_frequency) * 4.5 ) - 5)
    part_2 = 10 - ( part_1 / 10 )
    return max(1, part_2)

# Add all TF words to the sqlite database
def add_words_to_database():

    api = bhsa_provider.get_api()
    T, L, F = api.T, api.L, api.F
    words = []
    
    print("Collecting word data from BHSA")
    timer.start()

    for node_id in F.otype.s('word'):

        word = Word()
        book, chapter, verse = T.sectionFromNode(node_id)
        word.id = node_id
        word.book = book_provider.bhsa_to_id(book)
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
        word.penalty = word_penalty(word)
        words.append(word)

    timer.end()
    
    print("Writing words to the database")
    timer.start()
    
    added_words = Word.objects.bulk_create(words, batch_size=BATCH_SIZE, ignore_conflicts=True)
    timer.end()
    print(f"{len(added_words)} words added")

    return len(words)

# BATCH 1000 -- 46 seconds for 2000
# Initializing Text Fabric API
# Elapsed time: 6 seconds
# TF API LOADED

# Collecting word data from BHSA
# Elapsed time: 34 seconds
# Writing words to the database

# Elapsed time: 62 seconds

# Initializing Text Fabric API
# ✅Elapsed time: 5 seconds

# TF API LOADED

# Collecting word data from BHSA
# ✅Elapsed time: 32 seconds

# Writing words to the database

# ✅Elapsed time: 61 seconds

# BATCH 10000
# Initializing Text Fabric API
# ✅Elapsed time: 6 seconds

# TF API LOADED

# Collecting word data from BHSA
# ✅Elapsed time: 33 seconds

# Writing words to the database

# ✅Elapsed time: 69 seconds