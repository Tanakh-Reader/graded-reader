from typing import Any, Union

from app.models import Word

from ..data.constants import DATA_SOURCE
from ..utils.general import heb_stripped, word_penalty
from .bhsa_provider import F, L, T
from .book_provider import book_provider


# Dealing with BHSA data.
def replace(value, check_string=False):
    if value in {"NA", "n/a", "absent"}:
        return None
    if check_string and value == "":
        return None

    return value


class HebrewDataProvider:
    def __init__(self, mode=None):
        # Not in use anymore with added type inference in methods
        self.mode = DATA_SOURCE.SQLITE

    def section_from_node(self, word: Union[Word, int]):
        if type(word) is not Word:
            return T.sectionFromNode(word)
        else:
            return word.book, word.chapter, word.verse

    def id(self, word: Union[Word, int]):
        if type(word) is not Word:
            return word
        else:
            return word.id

    def book(self, word: Union[Word, int]):
        if type(word) is not Word:
            book, _, _ = T.sectionFromNode(word)
            return book_provider.bhsa_to_id(book)
        else:
            return word.book

    def chapter(self, word: Union[Word, int]):
        if type(word) is not Word:
            _, chapter, _ = T.sectionFromNode(word)
            return chapter
        else:
            return word.chapter

    def verse(self, word: Union[Word, int]):
        if type(word) is not Word:
            _, _, verse = T.sectionFromNode(word)
            return verse
        else:
            return word.verse

    def text(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.g_word_utf8.v(word)
        else:
            return word.text

    def trailer(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.trailer_utf8.v(word)
        else:
            return word.trailer

    def speech(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.sp.v(word)
        else:
            return word.speech

    def person(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.ps.v(word))
        else:
            return word.person

    def gender(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.gn.v(word))
        else:
            return word.gender

    def number(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.nu.v(word))
        else:
            return word.number

    def verb_tense(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.vt.v(word))
        else:
            return word.verb_tense

    def verb_stem(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.vs.v(word))
        else:
            return word.verb_stem

    def suffix_person(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.prs_ps.v(word))
        else:
            return word.suffix_person

    def suffix_gender(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.prs_gn.v(word))
        else:
            return word.suffix_gender

    def suffix_number(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.prs_nu.v(word))
        else:
            return word.suffix_number

    def gloss(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.gloss.v(word)
        else:
            return word.gloss

    def lex_frequency(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.freq_lex.v(word)
        else:
            return word.lex_frequency

    def occ_frequency(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.freq_occ.v(word)
        else:
            return word.occ_frequency

    def lex_id(self, word: Union[Word, int]):
        if type(word) is not Word:
            return L.u(word, otype="lex")[0]
        else:
            return word.lex_id

    def penalty(self, word: Union[Word, int]):
        if type(word) is not Word:
            return word_penalty(F.freq_lex.v(word))
        else:
            return word.penalty

    def lex(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.g_lex_utf8.v(word)
        else:
            return word.lex

    def lex_stripped(self, word: Union[Word, int]):
        return heb_stripped(self.lex(word))

    def name_type(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.nametype.v(word))
        else:
            return word.name_type

    def lex_set(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.ls.v(word))
        else:
            return word.lex_set

    def state(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.st.v(word))
        else:
            return word.state

    def language(self, word: Union[Word, int]):
        if type(word) is not Word:
            return F.language.v(word)
        else:
            return word.language

    def qere(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.qere_utf8.v(word))
        else:
            return word.qere

    def ketiv(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.kq_hybrid_utf8.v(word))
        else:
            return word.ketiv

    def nominal_ending(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.g_nme_utf8.v(word))
        else:
            return word.nominal_ending

    def preformative(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.g_pfm_utf8.v(word))
        else:
            return word.preformative

    def pronominal_suffix(self, word: Union[Word, int]):
        if type(word) is not Word:
            # TODO : add check_string = True ?
            return replace(F.g_prs_utf8.v(word))
        else:
            return word.pronominal_suffix

    def univalent_final(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.g_uvf_utf8.v(word))
        else:
            return word.univalent_final

    def verbal_ending(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.g_vbe_utf8.v(word))
        else:
            return word.verbal_ending

    def root_formation(self, word: Union[Word, int]):
        if type(word) is not Word:
            return replace(F.g_vbs_utf8.v(word))
        else:
            return word.root_formation


hebrew_data_provider = HebrewDataProvider()
