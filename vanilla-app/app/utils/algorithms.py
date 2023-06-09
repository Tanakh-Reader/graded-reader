import math

from ..providers.bhsa_provider import bhsa_provider
from ..data.ranks import Classify, Rank, LexRanks, MorphRank

lex_rank_default = LexRanks()._7_ranks.get_rank_dict()

def is_proper_noun(word):
    T, L, F = bhsa_provider.api_globals()
    if F.ls.v(word) == 'gnt   l' or F.sp.v(word) == 'nmpr':
        return True
    
# A class used to compare mismatches between differently sorted lists.
class CompareData:
    def update_index(self, dict, key, i):
        if key not in dict:
            dict[key] = i
        else:
            dict[key] = i - dict[key]

    def compare_mismatches(self, list_a, list_b, sorted=False):
        mism = {}
        for i, (a, b) in enumerate(zip(list_a, list_b)):
            a, b = a.start_ref, b.start_ref
            self.update_index(mism, a, i)
            self.update_index(mism, b, i)
        if sorted:
            return {
                k: v
                for k, v in sorted(mism.items(), key=lambda item: item[1], reverse=True)
            }
        return mism

    def average_mismatch(self, mism):
        return sum(list(mism.values())) / len(mism)

    def max_mismatch(self, mism):
        return sorted(mism.items(), key=lambda item: item[1])[-1]


# The goal is to penalize at scale, fading out around frequency = 450
# penalty 10 - (√n * 4.5 - 5) / 10
def word_penalty(word_freq):
    part_1 = max(0, (math.sqrt(word_freq) * 4.5) - 5)
    part_2 = 10 - (part_1 / 10)
    return max(1, part_2)


def get_passage_weight(passage):
    T, L, F = bhsa_provider.api_globals()
    total_weight = 0
    # Iterate over words in the passage.
    for word in passage.words():
        if F.voc_lex_utf8.v(word) not in Classify().stop_words:
            total_weight += word_penalty(F.freq_lex.v(word))
    total_weight /= len(passage.words())

    return round(total_weight, 4)


def get_passage_weight1(passage, rank_scale=lex_rank_default):
    T, L, F = bhsa_provider.api_globals()
    total_weight = 0
    # Iterate over words in the passage.
    for word in passage.words():
        if F.voc_lex_utf8.v(word) not in Classify().stop_words:
            # Iterate over the ranks present in the rank scale.
            for rank in rank_scale.keys():
                lex_freq = F.freq_lex.v(word)
                _range = rank_scale[rank]["range"]
                if lex_freq >= _range[0] and lex_freq < _range[1]:
                    # Give a half penalty for proper nouns.
                    if is_proper_noun(word):  # proper noun
                        total_weight += (rank_scale[rank]["weight"]) / 2
                    # Give a full penalty for other word types.
                    else:
                        total_weight += rank_scale[rank]["weight"]
    total_weight /= len(passage.words())

    return round(total_weight, 4)


# Only penalize once per lexical value.
def get_passage_weight2(passage, rank_scale=lex_rank_default, div_all=True):
    T, L, F = bhsa_provider.api_globals()
    total_weight = 0
    unique_words = set()
    # Iterate over words in the passage.
    for word in passage.words():
        lex = F.voc_lex_utf8.v(word)
        if lex not in Classify().stop_words and lex not in unique_words:
            # Iterate over the ranks present in the rank scale.
            for rank in rank_scale.keys():
                lex_freq = F.freq_lex.v(word)
                _range = rank_scale[rank]["range"]
                if lex_freq >= _range[0] and lex_freq < _range[1]:
                    # Give a half penalty for proper nouns.
                    if is_proper_noun(word):  # proper noun
                        total_weight += (rank_scale[rank]["weight"]) / 2
                    # Give a full penalty for other word types.
                    else:
                        total_weight += rank_scale[rank]["weight"]
            unique_words.add(lex)
    # Compare using all words as denominator vs. unique words.
    if div_all:
        total_weight /= len(passage.words())
    else:
        total_weight /= len(unique_words)

    return round(total_weight, 4)


# Decrease penalty for each occurance.
def get_passage_weight3(passage, rank_scale=lex_rank_default, div_all=True, morph=False):
    T, L, F = bhsa_provider.api_globals()
    word_weights = {}
    verb_count = 0
    verb_weight = 0
    min_penalty = 1.7  # min penalty for rare words and proper nouns.
    # Iterate over words in the passage.
    for word in passage.words():
        lex = F.voc_lex_utf8.v(word)
        if lex not in Classify().stop_words:
            # Add partial penalty for reocurring words.
            if lex in word_weights.keys():
                # Only gradually decrease penalty for rarer words.
                # Decreases by 1 point per occurance.
                word_weights[lex]["count"] += 1
                if F.freq_lex.v(word) < 100:
                    count = word_weights[lex]["count"]
                    penalty = word_weights[lex]["penalty"]
                    new_weight = penalty - count
                    added_weight = (
                        new_weight if new_weight >= min_penalty else min_penalty
                    )
                    word_weights[lex]["weight"] += added_weight
                else:
                    word_weights[lex]["weight"] += word_weights[lex]["penalty"]
            # Add full penalty for the first occurance.
            else:
                # Add word to hash table
                word_weights[lex] = {"count": 0, "weight": 0, "penalty": 0}
                # Iterate over the ranks present in the rank scale.
                for rank in rank_scale.keys():
                    lex_freq = F.freq_lex.v(word)
                    _range = rank_scale[rank]["range"]
                    if lex_freq >= _range[0] and lex_freq < _range[1]:
                        # Give a half penalty for proper nouns.
                        _penalty = rank_scale[rank]["weight"]
                        if (
                            is_proper_noun(word) and _penalty > min_penalty
                        ):  # proper noun
                            word_weights[lex]["penalty"] = int(math.ceil(_penalty / 2))
                        # Give a full penalty for other word types.
                        else:
                            word_weights[lex]["penalty"] = _penalty
                word_weights[lex]["weight"] += word_weights[lex]["penalty"]
                word_weights[lex]["count"] += 1
            # If we're penalizing for morphology
            if morph:
                if F.sp.v(word) == "verb":
                    verb_count += 1
                    verb_weight += (
                        MorphRank.stem_map.get(F.vs.v(word), 0)
                        + MorphRank.tense_map[F.vt.v(word)]
                    )

    # Get the sum of all word weights.
    total_weight = sum(
        [w for w in [word_weights[k]["weight"] for k in word_weights.keys()]]
    )
    # Compare using all words as denominator vs. unique words.
    if div_all:
        total_weight = total_weight / len(passage.words()) + (
            verb_weight / len(passage.words())
        )
    else:
        total_weight /= len(word_weights)

    return round(total_weight, 4)
