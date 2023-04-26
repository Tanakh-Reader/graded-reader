import threading

from ..models import Word, Passage
from .add_words import add_words_to_database
from .add_passages import add_passages_to_database
from ..data import constants


class WordLoader:
    words_loaded = False
    loading_in_progress = False

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

    # Call this after deleting words from the database.
    def reset(self):
        self.words_loaded = False
        self.loading_in_progress = False


word_loader = WordLoader()


class PassageLoader:
    passages_loaded = False
    loading_in_progress = False

    def load_passages_if_not_added(self) -> bool:
        if self.passages_loaded:
            return True

        elif Passage.objects.count() >= constants.PASSAGE_COUNT:
            self.passages_loaded = True
            return True

        else:
            if not self.loading_in_progress:
                self.loading_in_progress = True
                add_passages_task = threading.Thread(target=add_passages_to_database)
                add_passages_task.start()
            return False

    # Call this after deleting words from the database.
    def reset(self):
        self.passages_loaded = False
        self.loading_in_progress = False


passage_loader = PassageLoader()
