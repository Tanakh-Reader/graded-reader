import pandas as pd
import os
from pathlib import Path

from django.conf import settings
from ..data.book import Book
from ..data.constants import *
  
BOOKS_CSV = os.path.join(settings.BASE_DIR, "app/data/books.csv")

class BookProvider:

    def __init__(self):
        self.df = pd.read_csv(BOOKS_CSV)
        self.book_to_id = {name: int(number) for name, number in zip(self.df[BOOK_NAME_BHSA], self.df[BOOK_NUMBER])}
        self.book_instances = []
        self.get_all_book_instances()

    def get_name(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BOOK_NAME].values[0]
    
    def get_name_osis(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BOOK_NAME_OSIS].values[0]
    
    def get_name_bhsa(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BOOK_NAME_BHSA].values[0]
    
    def get_name_shebanq(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BOOK_NAME_SHEBANQ].values[0]
    
    def get_number_from_name(self, name):
        return self.df.loc[self.df[BOOK_NAME] == name, BOOK_NUMBER].values[0]
    
    def get_number_from_name_bhsa(self, name_bhsa):
        return self.df.loc[self.df[BOOK_NAME_BHSA] == name_bhsa, BOOK_NUMBER].values[0]
    
    def get_chapters(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BOOK_CHAPTERS].values[0]
    
    # Faster function when loading words straight from BHSA.
    def bhsa_to_id(self, name_bhsa):
        return self.book_to_id[name_bhsa]
        
    def get_book_instance(self, number):
        name = self.get_name(number)
        name_bhsa = self.get_name_bhsa(number)
        name_shebanq = self.get_name_shebanq(number)
        name_osis = self.get_name_osis(number)
        chapters = int(self.get_chapters(number)) # replace pandas default int64
        return Book(number, name, name_bhsa, name_shebanq, name_osis, chapters)
    
    def get_all_book_instances(self, as_json=False):
        if len(self.book_instances) == 0:
            for number in self.book_to_id.values():
                book = self.get_book_instance(number)
                self.book_instances.append(book)

        if as_json:
            return [vars(book) for book in self.book_instances]
        
        return self.book_instances
    
    def get_all_names(self):
        return self.df[BOOK_NAME].tolist()
    

book_provider = BookProvider()