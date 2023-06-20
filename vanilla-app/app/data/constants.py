# Current value in BHSA 2021 is 426590
WORD_COUNT = 426500
PASSAGE_COUNT = 200  # 1900

# Used in the algorithm
UNCOMMON_WORD_FREQUENCY = 100

PARAGRAPH_MARKERS = {"פ": "open", "ס": "closed"}

# Psalm 119 has 176 verses.
LONGEST_CHAPTER = 176 

# Percent proper nouns to count as genealogy.
GENEALOGY_PERCENTAGE = 1 / 3

class TAGS:
    QERE = 'qere'
    GENEALOGY = 'genealogy'


BHSA_FEATURES = """
sp
ps
gn
nu
vt
vs
prs_ps
prs_gn
prs_nu
gloss
freq_lex
freq_occ
g_lex_utf8
nametype
ls
st
language
qere_utf8
kq_hybrid_utf8
g_nme_utf8
g_pfm_utf8
g_prs_utf8
g_uvf_utf8
g_vbe_utf8
g_vbs_utf8
""".replace("\n", " ")