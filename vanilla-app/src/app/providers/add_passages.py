from ..data.constants import *
from ..models import Passage
from ..utils.algorithms import *
from ..utils.timer import timer
from .bhsa_provider import bhsa_provider
from .book_provider import book_provider
from .hebrew_data_provider import HebrewDataProvider as hdp
from .hebrew_data_provider import replace

"""
Used by get_passages()

Check whether we have reached the end of a valid passage as defined by 
passage_size and paragraph markers. If we have, or if a new book (or new 
chapter in certain books like Psalms), then mark the passage as valid by
setting its value to True. 
In certain cases we will not want to add the current verse to the current
passage, so we will set add_verse to False. 
"""


def valid_passage(passage, verse, passage_size_min, passage_size_max):
    T, L, F = bhsa_provider.api_globals()
    is_valid = False
    add_verse = True
    # Get the string value at the end of the verse.
    verse_ending = T.text(verse).split()[-1]
    verse_book = L.u(verse, otype="book")[0]
    verse_chapter = L.u(verse, otype="chapter")[0]
    verse_word_count = len(passage.get_vs_words(verse))
    ps_119 = 427315  # node for Psalm 119.
    # Check if we've reached a new book, if yes, end the paragraph.
    if L.u(passage.verses[-1], otype="book")[0] != verse_book:
        is_valid = True
        add_verse = False
    # Check if the current verse is in the following books.
    # Since they lack enough paragraph markers to make meaningful passages,
    # we create passages at the chapter level.
    elif verse_book in [
        T.bookNode("Ruth"),
        T.bookNode("Jonah"),
        T.bookNode("Ecclesiastes"),
        T.bookNode("Psalms"),
    ]:
        if verse_chapter != L.u(passage.verses[-1], otype="chapter")[0]:
            is_valid = True
            add_verse = False
        # If Psalm 119, split up into 8 verse sections to preserve acrostic.
        elif verse_chapter == ps_119:
            if (verse - 1) % 8 == 0:
                is_valid = True
                add_verse = False
    # Otherwise check if we have reached the end of a paragraph.

    elif (
        verse_ending in PARAGRAPH_MARKERS.keys()
        and len(passage.get_all_words()) + verse_word_count >= passage_size_min
    ):
        is_valid = True

    # TODO Optimize this to create meaningful passages.
    # Or if the passage is too long.
    # ** the len(getAllWords) greatly increases the run time -- we need a way to optimize.
    # elif len(passage.get_all_words()) + verse_word_count > passage_size_max:
    #     is_valid = True
    #     add_verse = False

    return is_valid, add_verse


def get_passage_tags(passage: Passage):
    T, L, F = bhsa_provider.api_globals()

    tags = ""
    word_count = 0
    proper_noun_count = 0
    has_qere = False

    for word in passage.words():
        # Only look an non-stop words.
        if hdp.lex_stripped(word) not in Classify().stop_words:
            # Check for proper nouns
            if is_proper_noun(word):
                proper_noun_count += 1
            # Check for qere
            if not has_qere and replace(F.qere_utf8.v(word)) not in ["", None]:
                has_qere = True
                tags += f"{TAGS.QERE},"
            word_count += 1
    # Check proper noun ratio
    if proper_noun_count / word_count >= GENEALOGY_PERCENTAGE:
        tags += f"{TAGS.GENEALOGY},"

    return tags.rstrip(",")


"""
Used by get_passages

Update all of the data of a passage instance once its end verse 
has been reached. 
"""


def update_passage_data(passage: Passage, rank_scale):
    T, L, F = bhsa_provider.api_globals()

    start_ref = T.sectionFromNode(passage.verses[0])
    end_ref = T.sectionFromNode(passage.verses[-1])

    passage.book = book_provider.bhsa_to_id(start_ref[0])
    passage.start_chapter = start_ref[1]
    passage.end_chapter = end_ref[1]
    passage.start_verse = start_ref[2]
    passage.end_verse = end_ref[2]
    passage.start_word = L.d(passage.verses[0], otype="word")[0]
    passage.end_word = L.d(passage.verses[-1], otype="word")[-1]
    passage.word_count = len(passage.words())

    passage.tags = get_passage_tags(passage)
    passage.penalty = get_passage_weight3(passage)

    # Update the passage's word frequency and verb data.
    for word in passage.words():
        # Update the types and stems of verbs present.
        if F.sp.v(word) == "verb":
            # if F.vt.v(word) not in c.easy_vtypes:
            passage.verb_types_present.add(F.vt.v(word))
            # if F.vt.v(word) not in c.easy_vstems:
            passage.verb_stems_present.add(F.vs.v(word))
        # Update the word_ranks_data dictionary with
        # the words in each category.
        # for rank in rank_scale.keys():
        #     lex_freq = F.freq_lex.v(word)
        #     _range = rank_scale[rank]["range"]
        #     if lex_freq >= _range[0] and lex_freq < _range[1]:
        #         passage.word_ranks_data[rank]["occ"] += 1
        #         passage.word_ranks_data[rank]["words"].add(F.voc_lex_utf8.v(word))


"""
Iterates over verses in the OT and combines them into passages. 
The function returns a list of Passage objects. 

rank_scale - a dictionary generated by Ranks().rank_scales()
    For example:
        rank_scales = Ranks().rank_scales(Ranks().all_ranks)[index]

start_node - the verse node at which get_passages will begin. 

end_node - the verse node at which get_passages will finish executing.

passage_size - the minimum words in a passage, unless a chapter is shorter
than that (e.g., Psalm 117).
"""


def get_passages(
    rank_scale={},
    start_node=0,
    # end_node=len(F.otype.s("verse")),
    passage_size_min=100,
    passage_size_max=4000,
):
    T, L, F = bhsa_provider.api_globals()
    # A list of all passages.
    passages = []
    end_node = len(F.otype.s("verse"))

    # Initiate the id counter and instantiate the first passage.
    passage_id = 1
    passage = Passage(id=passage_id)

    # Iterate through all verses in the OT.
    for verse in F.otype.s("verse")[start_node:end_node]:
        # Check if the string is a paragraph marker and if the paragraph is large enough.
        if len(passage.verses) > 1:
            valid, add_verse = valid_passage(
                passage, verse, passage_size_min, passage_size_max
            )
            if valid:
                # We have reached the end of the passage so we update all of its attribute values.
                if add_verse:
                    passage.verses.append(verse)
                update_passage_data(passage, rank_scale)
                passages.append(passage)
                # Begin a new passage.
                passage_id += 1
                passage = Passage(id=passage_id)

                # The current verse is in a new chapter or book so we append it to the
                # verses of the newly created passage as its start verse.
                if not add_verse:
                    passage.verses.append(verse)
            # We haven't reached a new passage yet, so add the current verse to its list.
            else:
                passage.verses.append(verse)

        # Add the first verse to the passage.
        else:
            passage.verses.append(verse)

    return passages


def add_passages_to_database():
    print("\nCreating passages from BHSA")
    timer.start()

    passages = get_passages()

    timer.end()

    print("Writing passages to the database")
    timer.start()

    added_passages = Passage.objects.bulk_create(
        passages, batch_size=500, ignore_conflicts=True
    )
    timer.end()
    print(f"{len(added_passages)} passages added")


# add_passages_to_database()
