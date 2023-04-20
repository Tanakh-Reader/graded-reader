from django.db import models

# Create your models here.

class HebrewWord(models.Model):
    id = models.AutoField(primary_key=True)
    book = models.IntegerField(db_index=True)
    chapter = models.IntegerField(db_index=True)
    verse = models.IntegerField()
    text = models.CharField(max_length=255)
    trailer = models.CharField(max_length=255)
    frequency = models.IntegerField()
    penalty = models.FloatField()
    speech = models.CharField(max_length=50)
    person = models.CharField(max_length=10)
    gender = models.CharField(max_length=10)
    number = models.CharField(max_length=10)
    verb_tense = models.CharField(max_length=50)
    verb_stem = models.CharField(max_length=50)
    suffix_person = models.CharField(max_length=10)
    suffix_gender = models.CharField(max_length=10)
    suffix_number = models.CharField(max_length=10)
    gloss = models.CharField(max_length=255)

class Paragraph(models.Model):
    id = models.AutoField(primary_key=True)
    book = models.CharField(max_length=255)
    weight = models.FloatField()
    words = models.ManyToManyField(HebrewWord)