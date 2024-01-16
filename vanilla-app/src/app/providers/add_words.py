import math

from ..models import Word
from ..utils.timer import timer
from .bhsa_provider import F
from .book_provider import book_provider
from .hebrew_data_provider import hebrew_data_provider as hdp

BATCH_SIZE = 2500  # uploading words to the database
# BATCH 1000: 62 seconds
# BATCH 2500: 45 seconds


# Add all TF words to the sqlite database
def add_words_to_database():
    print("Collecting word data from BHSA")
    timer.start()

    words: list[Word] = []

    for node_id in F.otype.s("word"):
        word = Word()
        book, chapter, verse = hdp.section_from_node(node_id)
        word.id = node_id
        word.book = book_provider.bhsa_to_id(book)
        word.chapter = chapter
        word.verse = verse
        word.text = hdp.text(node_id)
        word.trailer = hdp.trailer(node_id)
        word.speech = hdp.speech(node_id)
        word.person = hdp.person(node_id)
        word.gender = hdp.gender(node_id)
        word.number = hdp.number(node_id)
        word.verb_tense = hdp.verb_tense(node_id)
        word.verb_stem = hdp.verb_stem(node_id)
        word.suffix_person = hdp.suffix_person(node_id)
        word.suffix_gender = hdp.suffix_gender(node_id)
        word.suffix_number = hdp.suffix_number(node_id)
        word.gloss = hdp.gloss(node_id)
        word.lex_frequency = hdp.lex_frequency(node_id)
        word.occ_frequency = hdp.occ_frequency(node_id)
        word.lex_id = hdp.lex_id(node_id)
        word.penalty = hdp.penalty(node_id)

        word.lex = hdp.lex(node_id)
        word.name_type = hdp.name_type(node_id)
        word.lex_set = hdp.lex_set(node_id)
        word.state = hdp.state(node_id)
        word.language = hdp.language(node_id)

        word.qere = hdp.qere(node_id)
        word.ketiv = hdp.ketiv(node_id)

        # MORPHEMES
        word.nominal_ending = hdp.nominal_ending(node_id)
        word.preformative = hdp.preformative(node_id)
        word.pronominal_suffix = hdp.pronominal_suffix(node_id)
        word.univalent_final = hdp.univalent_final(node_id)
        word.verbal_ending = hdp.verbal_ending(node_id)
        word.root_formation = hdp.root_formation(node_id)

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
