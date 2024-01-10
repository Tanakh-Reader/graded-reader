# Generated by Django 4.1.4 on 2023-05-26 15:22

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0002_passage_alter_word_book_alter_word_chapter_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="word",
            name="ketiv",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="language",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="lex",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="lex_set",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="name_type",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="nominal_ending",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="preformative",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="pronominal_suffix",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="qere",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="root_formation",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="state",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="univalent_final",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name="word",
            name="verbal_ending",
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]