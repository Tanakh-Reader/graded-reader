import pandas as pd
import os
from pathlib import Path

from ..data.book import Book
  
parent_dir = Path(__file__).resolve().parent.parent
BOOKS_CSV = os.path.join(parent_dir, "data/books.csv")

BOOK_NUMBER = 'bookId'
BHSA_NAME = 'bhsaName'
BOOK_NAME = 'bookName'
CHAPTERS = 'chapters'

class BookProvider:

    def __init__(self):
        self.df = pd.read_csv(BOOKS_CSV)
        self.book_to_id = {name: number for name, number in zip(self.df[BHSA_NAME], self.df[BOOK_NUMBER])}
        self.book_instances = []
        self.get_all_book_instances()

    def get_name(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BOOK_NAME].values[0]
    
    def get_name_bhsa(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, BHSA_NAME].values[0]
    
    def get_number_from_name(self, name):
        return self.df.loc[self.df[BOOK_NAME] == name, BOOK_NUMBER].values[0]
    
    def get_number_from_name_bhsa(self, name_bhsa):
        return self.df.loc[self.df[BHSA_NAME] == name_bhsa, BOOK_NUMBER].values[0]
    
    def get_chapters(self, number):
        return self.df.loc[self.df[BOOK_NUMBER] == number, CHAPTERS].values[0]
    
    # Faster function when loading words straight from BHSA.
    def bhsa_to_id(self, name_bhsa):
        return self.book_to_id[name_bhsa]
        
    def get_book_instance(self, number):
        name = self.get_name(number)
        name_bhsa = self.get_name_bhsa(number)
        chapters = self.get_chapters(number)
        return Book(number, name, name_bhsa, chapters)
    
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