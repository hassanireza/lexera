from django.db import models

DIFFICULTY_CHOICES = [
    (1, 'Starter'), (2, 'Easy'), (3, 'Growing'), (4, 'Intermediate'),
    (5, 'Advanced'), (6, 'Expert'), (7, 'Master'),
]

POS_CHOICES = [
    ('noun', 'Noun'), ('verb', 'Verb'), ('adjective', 'Adjective'),
    ('adverb', 'Adverb'), ('phrase', 'Phrase'), ('preposition', 'Preposition'),
]


class Word(models.Model):
    text = models.CharField(max_length=60, unique=True)
    pronunciation_ipa = models.CharField(max_length=100, blank=True)
    part_of_speech = models.CharField(max_length=20, choices=POS_CHOICES, default='noun')
    definition = models.CharField(max_length=300)
    example_sentence = models.CharField(max_length=300, blank=True)
    difficulty = models.PositiveSmallIntegerField(choices=DIFFICULTY_CHOICES, default=1)
    etymology = models.TextField(blank=True, help_text="History / origin of the word")
    origin_language = models.CharField(max_length=60, blank=True)
    first_known_use = models.CharField(max_length=60, blank=True)
    fun_fact = models.CharField(max_length=300, blank=True)
    synonyms = models.ManyToManyField('self', blank=True, symmetrical=True)

    class Meta:
        ordering = ['difficulty', 'text']

    def __str__(self):
        return self.text

    @property
    def letters(self):
        return self.text.upper()


class WordOfDay(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    date = models.DateField(unique=True)

    def __str__(self):
        return f'{self.date}: {self.word.text}'
