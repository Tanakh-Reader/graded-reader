from django.db import models
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.db.models.signals import post_init
from .providers.book_provider import book_provider
from .providers.bhsa_provider import bhsa_provider


class Word(models.Model):
    id = models.IntegerField(primary_key=True)
    book = models.PositiveSmallIntegerField(db_index=True)
    chapter = models.PositiveSmallIntegerField(db_index=True)
    verse = models.PositiveSmallIntegerField()
    text = models.CharField(max_length=30, blank=True, null=True)
    trailer = models.CharField(max_length=5, blank=True, null=True)
    speech = models.CharField(max_length=10, blank=True, null=True)
    person = models.CharField(max_length=10, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    number = models.CharField(max_length=10, blank=True, null=True)
    verb_tense = models.CharField(max_length=10, blank=True, null=True)
    verb_stem = models.CharField(max_length=10, blank=True, null=True)
    suffix_person = models.CharField(max_length=10, blank=True, null=True)
    suffix_gender = models.CharField(max_length=10, blank=True, null=True)
    suffix_number = models.CharField(max_length=10, blank=True, null=True)
    gloss = models.CharField(max_length=30, blank=True, null=True)
    lex_frequency = models.IntegerField()
    occ_frequency = models.IntegerField()
    penalty = models.DecimalField(decimal_places=4, max_digits=7)
    lex_id = models.IntegerField(db_index=True)

    lex = models.CharField(max_length=30, blank=True, null=True)
    name_type = models.CharField(max_length=10, blank=True, null=True)
    lex_set = models.CharField(max_length=10, blank=True, null=True)
    state = models.CharField(max_length=10, blank=True, null=True)
    language = models.CharField(max_length=10, blank=True, null=True)

    qere = models.CharField(max_length=30, blank=True, null=True)
    ketiv = models.CharField(max_length=30, blank=True, null=True)

    # Morphemes
    nominal_ending = models.CharField(max_length=10, blank=True, null=True)
    preformative = models.CharField(max_length=10, blank=True, null=True)
    pronominal_suffix = models.CharField(max_length=10, blank=True, null=True)
    univalent_final = models.CharField(max_length=10, blank=True, null=True)
    verbal_ending = models.CharField(max_length=10, blank=True, null=True)
    root_formation = models.CharField(max_length=10, blank=True, null=True)

    def to_dict(self):
        self.penalty = str(self.penalty)
        return model_to_dict(self)


class Passage(models.Model):
    id = models.IntegerField(primary_key=True)
    start_word = models.IntegerField(blank=True, null=True)
    end_word = models.IntegerField(blank=True, null=True)
    book = models.PositiveSmallIntegerField(db_index=True, blank=True, null=True)
    start_chapter = models.PositiveSmallIntegerField(blank=True, null=True)
    end_chapter = models.PositiveSmallIntegerField(blank=True, null=True)
    start_verse = models.PositiveSmallIntegerField(blank=True, null=True)
    end_verse = models.PositiveSmallIntegerField(blank=True, null=True)
    word_count = models.PositiveSmallIntegerField(db_index=True, blank=True, null=True)
    penalty = models.DecimalField(db_index=True, max_digits=7, decimal_places=4)
    tags = models.TextField(blank=True, null=True)

    # fields used for getting passages from BHSA
    def __post_init__(self):
        self.verb_types_present = set()
        self.verb_stems_present = set()
        self.verses = []

    def to_dict(self):
        self.penalty = str(self.penalty)
        self.tags = self.tags.split(',')
        passage_dict = model_to_dict(self)
        passage_dict["reference"] = self.get_reference()
        passage_dict['id'] = self.id
        return passage_dict

    def get_vs_words(self, verse):
        api = bhsa_provider.get_api()
        verse_words = [w for w in api.L.i(verse, otype="word")]
        return verse_words

    def get_all_words(self):
        api = bhsa_provider.get_api()
        words = []
        for verse in self.verses:
            for word in api.L.i(verse, otype="word"):
                words.append(word)
        return words

    def words(self):
        return list(range(self.start_word, self.end_word + 1))

    def get_reference(self):
        book = book_provider.get_name(self.book)

        ref_string = f"{book} {self.start_chapter}:{self.start_verse}"
        if self.start_chapter != self.end_chapter:
            ref_string += f"–{self.end_chapter}:{self.end_verse}"
        else:
            ref_string += f"–{self.end_verse}"

        return ref_string


@receiver(post_init, sender=Passage)
def post_init_callback(sender, **kwargs):
    instance = kwargs["instance"]
    instance.__post_init__()
