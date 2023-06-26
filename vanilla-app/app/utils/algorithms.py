import math
from abc import ABC, abstractmethod
from typing import Any, Union



from ..providers.bhsa_provider import bhsa_provider
from ..data.ranks import Classify, Rank, LexRanks, MorphRank
from ..models import Word, Passage
from ..data.constants import *

lex_rank_default = LexRanks()._7_ranks.get_rank_dict()


def is_proper_noun(word: int) -> bool:
    T, L, F = bhsa_provider.api_globals()
    if F.ls.v(word) == "gntl" or F.sp.v(word) == "nmpr":
        return True
    return False

# The goal is to penalize at scale, fading out around frequency = 450
# penalty 10 - (√n * 4.5 - 5) / 10
def word_penalty(word_freq: int) -> float:
    part_1 = max(0, (math.sqrt(word_freq) * 4.5) - 5)
    part_2 = 10 - (part_1 / 10)
    return max(1, part_2)


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


def get_passage_weight(passage: Passage) -> float:
    T, L, F = bhsa_provider.api_globals()
    total_weight: float = 0.0
    # Iterate over words in the passage.
    for word in passage.words():
        if F.voc_lex_utf8.v(word) not in Classify().stop_words:
            total_weight += word_penalty(F.freq_lex.v(word))
    total_weight /= len(passage.words())

    return round(total_weight, 4)


def get_passage_weight1(passage: Passage, rank_scale=lex_rank_default) -> float:
    T, L, F = bhsa_provider.api_globals()
    total_weight: float = 0.0
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
def get_passage_weight2(passage: Passage, rank_scale=lex_rank_default, div_all=True) -> float:
    T, L, F = bhsa_provider.api_globals()
    total_weight: float = 0.0
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
def get_passage_weight3(
    passage: Passage, rank_scale=lex_rank_default, div_all=True, morph=False
) -> float:
    T, L, F = bhsa_provider.api_globals()
    word_weights: dict[str, dict[str, Any]] = {}
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


# Decrease penalty for each occurance.
def get_passage_weight_x(
    configuration,
    passage: Passage
):
    categories = init_categories(configuration)
    print("CONFIG", configuration)
    for word in passage.words_2():
        if word.lex not in Classify().stop_words:
            for category in categories:
                category.check_condition(word)
    print("DONE")
    for category in categories:
        for k, v in category.penalties.items():
            print(k, v, "\n")
        # print(category.name, category.penalties)
    total_penalty = sum([cat.total_penalty() for cat in categories])
    total_weight = total_penalty / passage.word_count
    score = round(total_weight, 4)
    penalties = None
    return score, penalties

    # Compare using all words as denominator vs. unique words.
    # TODO !! would the unique word route only be taken for frequencies, or other items as well?
    # TODO !! should verbs be / len verbs, or total words?
    # if div_all:
    #     total_weight = total_weight / len(passage.words()) + (
    #         verb_weight / len(passage.words())
    #     )
    # else:
    #     total_weight /= len(word_weights)



class Category(ABC):
    def __init__(self, name="", args=[]):
        self.name = name
        self.args = args
        # Maps each word_id to a condition and penalty.
        self.instances = {}
        # Maps each condition to a list of tuples [word_id, penalty].
        self.penalties = {}

    def total_penalty(self):
        total = 0
        for k, v in self.instances.items():
            total += v.get("penalty")
        return total

    def add_penalty(self, condition, word_id, penalty):
        condition = str(condition)
        if condition not in self.penalties:
            self.penalties[condition] = [(word_id, penalty)]
        else:
            self.penalties[condition].append((word_id, penalty))


    @abstractmethod
    def check_condition(self, word):
        pass



class Compare(Category):
    def check_condition(self, word: Word):
        for arg in self.args:
            conditions = arg[:-1]
            penalty = arg[-1]
            conditions_met = 0
            for condition in conditions:
                # Get the actual feature value from the word using the 'feature' key from the condition
                feature_value = getattr(word, condition['feature'])
                # Check the rule
                if condition['rule'] == 'EQUALS':
                    # if rule is "EQUALS" then check if feature value is equal to condition value
                    if feature_value == condition['value']:
                        conditions_met += 1
                elif condition['rule'] == 'EXISTS':
                    # if rule is "EXISTS" then check if feature value is not None
                    if feature_value is not None:
                        conditions_met += 1
            # if all conditions are met, add to instances
            if conditions_met == len(conditions):
                self.instances[word.id] = {"conditions": conditions, "penalty": penalty}
                self.add_penalty(arg, word.id, penalty)



class Frequency(Category):
    def __init__(self, name, args, apply_taper=True, apply_proper_nouns=True, proper_noun_discount=2):
        super().__init__(name, args)  # calling the parent's __init__ method
        self.apply_taper = apply_taper
        self.apply_proper_nouns = apply_proper_nouns
        self.proper_noun_discount = proper_noun_discount
        self.word_weights = {}
        self.min_penalty = 1.7
        

    def check_condition(self, word: Word) -> None:
        if self.apply_taper and word.lex_id in self.word_weights:
            # Only gradually decrease penalty for rarer words.
            # Decreases by 1 point per occurance.
            self.word_weights[word.lex_id]["count"] += 1
            if word.lex_frequency < UNCOMMON_WORD_FREQUENCY:
                count = self.word_weights[word.lex_id]["count"]
                penalty = self.word_weights[word.lex_id]["penalty"]
                new_weight = penalty - count
                added_weight = (
                    new_weight if new_weight >= self.min_penalty else self.min_penalty
                )
                self.word_weights[word.lex_id]["weight"] += added_weight
            else:
                self.word_weights[word.lex_id]["weight"] += self.word_weights[word.lex_id][
                    "penalty"
                ]
        # Add full penalty for the first occurance.
        else:
            # Add word to hash table
            self.word_weights[word.lex_id] = {"count": 0, "weight": 0, "penalty": 0}
            # Iterate over the ranks present in the rank scale.
            for arg in self.args:
                start, end, penalty = arg

                if start <= word.lex_frequency <= end:
                    self.add_penalty(arg, word.id, penalty)
                    # Give a custom penalty for proper nouns.
                    # TODO: update proper_noun fxn.
                    if self.apply_proper_nouns and is_proper_noun(word) and penalty > self.min_penalty:
                        self.word_weights[word.lex_id]["penalty"] = int(
                            math.ceil(penalty / self.proper_noun_discount)
                        )
                    # Give a full penalty for other word types.
                    else:
                        self.word_weights[word.lex_id]["penalty"] = penalty
            self.word_weights[word.lex_id]["weight"] += self.word_weights[word.lex_id]["penalty"]
            self.word_weights[word.lex_id]["count"] += 1
            self.instances[word.id] = {"range": [start, end], "penalty": penalty}            


class ConstructNoun(Category):
    def check_condition(self, word: Word) -> None:
        if word.state == "c":
            pass


def init_categories(configuration: dict[str, Any]) -> list[Category]:
    categories: list[Category] = []
    config_data = configuration.get('data')
    verb_conditions = config_data.get("verbs")
    frequency_conditions = config_data.get("frequencies")
    x_conditions = config_data.get("x")

    print("DATA", verb_conditions, frequency_conditions)

    if verb_conditions and len(verb_conditions) > 0:
        categories.append(Compare("verbs", verb_conditions))

    if frequency_conditions and len(frequency_conditions) > 0:
        categories.append(Frequency("frequency", frequency_conditions))

    return categories