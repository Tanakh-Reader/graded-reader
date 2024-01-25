import threading

from ..data import constants
from ..models import Passage, Word
from .add_words import add_words_to_database


# Class that interfaces with the Sqlite DB to get words.
class WordProvider:
    words_loaded = False
    loading_in_progress = False
    attribute_mappings = None

    def load_words_if_not_added(self) -> bool:
        if self.words_loaded:
            return True

        elif Word.objects.count() >= constants.WORD_COUNT:
            self.words_loaded = True
            return True

        else:
            if not self.loading_in_progress:
                self.loading_in_progress = True
                add_words_task = threading.Thread(target=add_words_to_database)
                add_words_task.start()
            return False

    def get_all_words(self, as_json=False):
        words = Word.objects.all()

        if as_json:
            return self.words_to_json(words)

        return words

    def get_verbs(self, lex_ids):
        verbs = {}
        # for lex_id in lex_ids:
        # obj = {}
        words = Word.objects.filter(speech="verb")
        for word in words:
            if word.lex_frequency >= 10:
                if word.lex_id not in verbs:
                    verbs[word.lex_id] = {
                        # "stem": {},
                        # "text": word.lex,
                    }  # {"stem": {}, "tense": {}}
                if word.verb_stem not in verbs[word.lex_id]:
                    verbs[word.lex_id][word.verb_stem] = 1
                else:
                    verbs[word.lex_id][word.verb_stem] += 1

        return verbs

    def get_words_from_passage(self, passage: Passage, as_json=False):
        words = self.get_words_by_ids(passage.start_word, passage.end_word, as_json)

        return words

    def get_words_by_ids(self, start_id, end_id, as_json=False):
        words = Word.objects.filter(
            id__gte=start_id,
            id__lte=end_id,
        )

        if as_json:
            return self.words_to_json(words)

        return words

    def get_words_from_reference(self, reference, as_json=False):
        book, start_chapter, start_verse, end_chapter, end_verse = reference

        if not end_chapter:
            end_chapter = start_chapter
        if not start_verse:
            start_verse = 1
        if not end_verse:
            end_verse = constants.LONGEST_CHAPTER

        # Load words from DB
        words = Word.objects.filter(
            book=book,
            chapter__gte=start_chapter,
            chapter__lte=end_chapter,
        )

        referenced_words = []

        # GpT mAgIc
        for word in words:
            if (  # multi-chapter solution
                (word.chapter == start_chapter and word.verse >= start_verse)
                or (word.chapter == end_chapter and word.verse <= end_verse)
                or (start_chapter < word.chapter < end_chapter)
            ) and (end_chapter > start_chapter):
                referenced_words.append(word)
            elif start_verse <= word.verse <= end_verse:
                referenced_words.append(word)

        if as_json:
            return self.words_to_json(referenced_words)

        return referenced_words

    def words_to_json(self, words: list[Word]):
        return [word.to_dict() for word in words]

    def delete_all(self):
        Word.objects.all().delete()
        self.words_loaded = False
        self.loading_in_progress = False


word_provider = WordProvider()
