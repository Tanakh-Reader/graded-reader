from ..data.constants import DATA_SOURCE
from .book_provider import book_provider
from ..utils.general import word_penalty


# Dealing with BHSA data.
def replace(value):
    if value in {"NA", "n/a", "absent"}:
        return None
    
    return value

class HebrewDataProvider:
    def __init__(self, mode=None):
        self.mode = DATA_SOURCE.SQLITE

    def sectionFromNode(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return T.sectionFromNode(word)
        else: 
            return word.book, word.chapter, word.verse

    def id(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return word
        else:
            return word.id

    def book(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            book, _, _ = T.sectionFromNode(word)
            return book_provider.bhsa_to_id(book)
        else: 
            return word.book

    def chapter(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            _, chapter, _ = T.sectionFromNode(word)
            return chapter
        else:
            return word.chapter

    def verse(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            _, _, verse = T.sectionFromNode(word)
            return verse
        else:
            return word.verse

    def text(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.g_word_utf8.v(word)
        else:
            return word.text

    def trailer(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.trailer_utf8.v(word)
        else:
            return word.trailer

    def speech(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.sp.v(word)
        else:
            return word.speech

    def person(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.ps.v(word))
        else:
            return word.person

    def gender(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.gn.v(word))
        else:
            return word.gender

    def number(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.nu.v(word))
        else:
            return word.number

    def verb_tense(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.vt.v(word))
        else:
            return word.verb_tense

    def verb_stem(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.vs.v(word))
        else:
            return word.verb_stem

    def suffix_person(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.prs_ps.v(word))
        else:
            return word.suffix_person

    def suffix_gender(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.prs_gn.v(word))
        else:
            return word.suffix_gender

    def suffix_number(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.prs_nu.v(word))
        else:
            return word.suffix_number

    def gloss(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.gloss.v(word)
        else:
            return word.gloss

    def lex_frequency(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.freq_lex.v(word)
        else:
            return word.lex_frequency

    def occ_frequency(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.freq_occ.v(word)
        else:
            return word.occ_frequency

    def lex_id(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return L.u(word, otype="lex")[0]
        else:
            return word.lex_id

    def penalty(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return word_penalty(F.freq_lex.v(word))
        else:
            return word.penalty

    def lex(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.g_lex_utf8.v(word)
        else:
            return word.lex

    def name_type(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.nametype.v(word))
        else:
            return word.name_type

    def lex_set(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.ls.v(word))
        else:
            return word.lex_set

    def state(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.st.v(word))
        else:
            return word.state

    def language(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return F.language.v(word)
        else:
            return word.language

    def qere(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.qere_utf8.v(word))
        else:
            return word.qere

    def ketiv(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.kq_hybrid_utf8.v(word))
        else:
            return word.ketiv

    def nominal_ending(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.g_nme_utf8.v(word))
        else:
            return word.nominal_ending

    def preformative(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.g_pfm_utf8.v(word))
        else:
            return word.preformative

    def pronominal_suffix(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.g_prs_utf8.v(word))
        else:
            return word.pronominal_suffix

    def univalent_final(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.g_uvf_utf8.v(word))
        else:
            return word.univalent_final

    def verbal_ending(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.g_vbe_utf8.v(word))
        else:
            return word.verbal_ending

    def root_formation(self, word):
        if self.mode == DATA_SOURCE.BHSA:
            return replace(F.g_vbs_utf8.v(word))
        else:
            return word.root_formation

hebrew_data_provider = HebrewDataProvider()