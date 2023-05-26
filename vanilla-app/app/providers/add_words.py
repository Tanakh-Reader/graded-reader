import math

from ..utils.timer import timer
from ..utils.algorithms import word_penalty
from ..models import Word

from .bhsa_provider import bhsa_provider
from .book_provider import book_provider

BATCH_SIZE = 2500  # uploading words to the database
# BATCH 1000: 62 seconds
# BATCH 2500: 45 seconds


# Replace string values with None
def replace(value):
    if value in {"NA", "n/a", "absent"}:
        return None
    
    return value


# Add all TF words to the sqlite database
def add_words_to_database():
    api = bhsa_provider.get_api()
    T, L, F = api.T, api.L, api.F
    print("Collecting word data from BHSA")
    timer.start()

    words = []

    for node_id in F.otype.s("word"):
        word = Word()
        book, chapter, verse = T.sectionFromNode(node_id)
        word.id = node_id
        word.book = book_provider.bhsa_to_id(book)
        word.chapter = chapter
        word.verse = verse
        word.text = F.g_word_utf8.v(node_id)
        word.trailer = F.trailer_utf8.v(node_id)
        word.speech = F.sp.v(node_id)
        word.person = replace(F.ps.v(node_id))
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
        word.lex_id = L.u(node_id, otype="lex")[0]
        word.penalty = word_penalty(word.lex_frequency)

        word.lex = F.g_lex_utf8.v(node_id)
        word.name_type = replace(F.nametype.v(node_id))
        word.lex_set = replace(F.ls.v(node_id))
        word.state = replace(F.st.v(node_id))
        word.language = F.language.v(node_id)

        word.qere = replace(F.qere_utf8.v(node_id))
        word.ketiv = replace(F.kq_hybrid_utf8.v(node_id))

        # MORPHEMES
        word.nominal_ending = replace(F.g_nme_utf8.v(node_id))
        word.preformative = replace(F.g_pfm_utf8.v(node_id))
        word.pronominal_suffix = replace(F.g_prs_utf8.v(node_id))
        word.univalent_final = replace(F.g_uvf_utf8.v(node_id))
        word.verbal_ending = replace(F.g_vbe_utf8.v(node_id))
        word.root_formation	= replace(F.g_vbs_utf8.v(node_id))

        words.append(word)

    timer.end()

    print("Writing words to the database")
    timer.start()

    added_words = Word.objects.bulk_create(
        words, batch_size=BATCH_SIZE, ignore_conflicts=True
    )
    timer.end()
    print(f"{len(added_words)} words added")

    return len(words)
