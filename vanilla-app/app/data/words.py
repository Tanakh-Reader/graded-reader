# from ..utils.tfApi import API
# from ..constants import books
# from ..models import Word

# T, L, F = API.T, API.L, API.F

# # Replace string values with None
# def replace(value):
#     if value in {'NA', 'n/a', 'absent'}:
#         return None 
#     return value 

# # Add all TF words to the sqlite database
# def add_words_to_database():

#     words = []

#     for node_id in F.otype.s('word'):

#         word = Word()
#         book, chapter, verse = T.sectionFromNode(node_id)
#         word.id = node_id
#         word.book = books.BOOK_TO_INDEX[book]
#         word.chapter = chapter 
#         word.verse = verse
#         word.text = F.g_word_utf8.v(node_id)
#         word.trailer = F.trailer_utf8.v(node_id)
#         word.speech = F.sp.v(node_id)
#         word.person = replace(F.prs.v(node_id))
#         word.gender = replace(F.gn.v(node_id))
#         word.number = replace(F.nu.v(node_id))
#         word.verb_tense = replace(F.vt.v(node_id))
#         word.verb_stem = replace(F.vs.v(node_id))
#         word.suffix_person = replace(F.prs_ps.v(node_id))
#         word.suffix_gender = replace(F.prs_gn.v(node_id))
#         word.suffix_number = replace(F.prs_nu.v(node_id))
#         word.gloss = F.gloss.v(node_id)
#         word.lex_frequency = F.freq_lex.v(node_id)
#         word.occ_frequency = F.freq_occ.v(node_id)
#         word.lex_id = L.u(node_id, otype='lex')[0]
#         word.penalty = max(10 - word.lex_frequency / 20, 1)
#         words.append(word)

#     Word.objects.bulk_create(words, batch_size=1000, ignore_conflicts=True)
#     return len(words)