import math
import unicodedata


# The goal is to penalize at scale, fading out around frequency = 450
# penalty 10 - (√n * 4.5 - 5) / 10
def word_penalty(word_freq: int) -> float:
    part_1 = max(0, (math.sqrt(word_freq) * 4.5) - 5)
    part_2 = 10 - (part_1 / 10)
    return max(1, part_2)


def heb_stripped(word):
    normalized = unicodedata.normalize("NFKD", word)

    return "".join([c for c in normalized if not unicodedata.combining(c)])
