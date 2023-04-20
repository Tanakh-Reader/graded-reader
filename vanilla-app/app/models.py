from django.db import models
from django.forms.models import model_to_dict

class Word(models.Model):

    id = models.IntegerField(primary_key=True)
    book = models.SmallIntegerField(db_index=True)
    chapter = models.SmallIntegerField(db_index=True)
    verse = models.SmallIntegerField()
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

    def to_dict(self):
        self.penalty = str(self.penalty)
        return model_to_dict(self)