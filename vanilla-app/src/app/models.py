from __future__ import annotations

from django.db import models
from django.db.models.signals import post_init
from django.dispatch import receiver
from django.forms.models import model_to_dict

from .providers.bhsa_provider import L
from .providers.book_provider import book_provider


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
        passage_dict = model_to_dict(self)
        passage_dict["tags"] = self.tags.split(",")
        passage_dict["reference"] = self.get_reference()
        passage_dict["reference_abbr"] = self.get_reference(abbreviation=True)
        passage_dict["id"] = self.id
        return passage_dict

    def get_vs_words(self, verse):
        verse_words = [w for w in L.i(verse, otype="word")]
        return verse_words

    def get_all_words(self):
        words = []
        for verse in self.verses:
            for word in L.i(verse, otype="word"):
                words.append(word)
        return words

    def word_ids(self):
        return list(range(self.start_word, self.end_word + 1))

    def words(self):
        return Word.objects.filter(id__gte=self.start_word, id__lte=self.end_word)

    def get_reference(self, abbreviation=False):
        if abbreviation:
            book = book_provider.get_name_osis(self.book)
        else:
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


# Choices for divided_by field
DIVIDED_BY_CHOICES = (
    ("WORDS", "All Words"),
    ("LEXEMES", "Unique Words (Lexemes)"),
    # Add more options as needed
)


class VerbFeature:
    feature: str
    rule: str
    value: str


VerbConfig = list[tuple[VerbFeature, float]]


class FrequencyFeature:
    start: int
    end: int
    penalty: float


FrequencyConfig = list[FrequencyFeature]


class ConstructNounFeature:
    length: int
    penalty: float


ConstructNounConfig = list[ConstructNounFeature]


class ClauseFeature:
    feature: str
    penalty: float


ClauseConfig = list[ClauseFeature]


class AlgorithmConfig:
    def __init__(self, algorithm: Algorithm):
        self.id: int = algorithm.pk
        self.name: str = algorithm.name
        self.verbs: list[VerbConfig] = algorithm.verbs
        self.frequencies: list[FrequencyConfig] = algorithm.frequencies
        self.construct_nouns: list[ConstructNounConfig] = algorithm.construct_nouns
        self.clauses: list[ClauseConfig] = algorithm.clauses
        self.qere_penalty: float = algorithm.qere_penalty
        self.penalize_by_verb_stem: bool = algorithm.penalize_by_verb_stem
        self.taper_discount: float = algorithm.taper_discount
        self.proper_noun_discount: float = algorithm.proper_noun_divisor
        self.include_stop_words: bool = algorithm.include_stop_words
        self.total_penalty_divisor: str = algorithm.total_penalty_divisor


class Algorithm(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verbs = models.JSONField(default=list)
    frequencies = models.JSONField(default=list)
    construct_nouns = models.JSONField(default=list)
    clauses = models.JSONField(default=list)
    qere_penalty = models.FloatField(default=7)
    penalize_by_verb_stem = models.BooleanField(default=True)
    taper_discount = models.FloatField(default=1)
    proper_noun_divisor = models.FloatField(default=2)
    include_stop_words = models.BooleanField(default=False)
    total_penalty_divisor = models.CharField(
        max_length=50, choices=DIVIDED_BY_CHOICES, default="WORDS"
    )

    def __str__(self):
        return self.name

    def as_config(self, as_json=False) -> AlgorithmConfig:
        config = AlgorithmConfig(self)
        if as_json:
            return vars(config)
        return config
