import threading
import yaml
import os

from django.conf import settings
from .add_words import add_words_to_database
from ..data import constants
from ..models import Word, Passage


ATTRIBUTES_FILE = os.path.join(settings.BASE_DIR, "app/data/bhsa_data_mapping.yml")

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

    def get_words_from_passage(self, passage: Passage, as_json=False):

        words = self.get_words_by_ids(
            passage.start_word,
            passage.end_word,
            as_json
        )
        
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

    # GET WORD ATTRIBUTE MAPPINGS
    def get_attribute_mappings(self):
        if not self.attribute_mappings:
            with open(ATTRIBUTES_FILE, 'r') as file:
                self.attribute_mappings = yaml.load(file, Loader=yaml.FullLoader)
        return self.attribute_mappings
    
    def get_attribute_by_name(self, key):
        mapping = self.get_attribute_mappings()
    
        if key in mapping:
            return mapping[key]
        
        for attribute in mapping.values():
            custom_name = attribute.get('python_var')
            if (custom_name and custom_name == key) or attribute.get('name') == key:
                return attribute
                
        return None

    def get_value_definition(self, key, value):
        attribute = self.get_attribute_by_name(key)
        if attribute:
            attr_value = attribute.get('codes').get(value)
            if attr_value:
                custom_value = attr_value.get('custom')
                if custom_value:
                    return custom_value
                return attr_value.get('definition')
        # print("Not Found", key, value)
        return value
    

word_provider = WordProvider()