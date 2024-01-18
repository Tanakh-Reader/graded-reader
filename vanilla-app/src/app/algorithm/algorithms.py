from __future__ import annotations

import math
from abc import ABC, abstractmethod
from typing import Any
from typing import SupportsFloat as Numeric
from typing import Union

from ..data.constants import *
from ..data.ranks import Classify, LexRanks, MorphRank, Rank
from ..data.verb_stems import VERB_STEMS
from ..models import Passage
from ..providers.hebrew_data_provider import hebrew_data_provider as hdp
from ..utils.general import word_penalty
from .models import AlgorithmConfig, FrequencyDefinition

lex_rank_default = LexRanks()._7_ranks


def is_proper_noun(word) -> bool:
    if (
        hdp.lex_set(word) == FEATURE_VALUES.GENTILIC
        or hdp.speech(word) == FEATURE_VALUES.PROPER_NOUN
    ):
        return True
    return False


# A class used to compare mismatches between differently sorted lists.
# TODO - will this be used to compare sorting of passages via penalty?
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


# Simply apply the a word penalty.
def get_passage_weight(passage: Passage) -> float:
    total_weight: float = 0.0
    # Iterate over words in the passage.
    for word in passage.word_ids():
        if hdp.lex_stripped(word) not in Classify().stop_words:
            total_weight += word_penalty(hdp.lex(word))
    total_weight /= len(passage.word_ids())

    return round(total_weight, 4)


# Use a rank scale
def get_passage_weight_2(passage: Passage, rank_scale=lex_rank_default) -> float:
    total_weight: float = 0.0
    # Iterate over words in the passage.
    for word in passage.word_ids():
        if hdp.lex_stripped(word) not in Classify().stop_words:
            # Iterate over the ranks present in the rank scale.
            for i, rank in enumerate(rank_scale.ranks):
                lex_freq = hdp.lex_frequency(word)
                min_occ, max_occ = rank_scale.get_range(i)
                if lex_freq >= min_occ and lex_freq < max_occ:
                    # Give a half penalty for proper nouns.
                    if is_proper_noun(word):  # proper noun
                        total_weight += rank_scale.get_penalty(i) / 2
                    # Give a full penalty for other word types.
                    else:
                        total_weight += rank_scale.get_penalty(i)
    total_weight /= len(passage.word_ids())

    return round(total_weight, 4)


# Only penalize once per lexical value.
def get_passage_weight_3(
    passage: Passage, rank_scale=lex_rank_default, div_all=True
) -> float:
    total_weight: float = 0.0
    unique_words = set()
    # Iterate over words in the passage.
    for word in passage.word_ids():
        lex = hdp.lex(word)
        if (
            hdp.lex_stripped(word) not in Classify().stop_words
            and lex not in unique_words
        ):
            # Iterate over the ranks present in the rank scale.
            for i, rank in enumerate(rank_scale.ranks):
                lex_freq = hdp.lex_frequency(word)
                min_occ, max_occ = rank_scale.get_range(i)
                if lex_freq >= min_occ and lex_freq < max_occ:
                    # Give a half penalty for proper nouns.
                    if is_proper_noun(word):  # proper noun
                        total_weight += rank_scale.get_penalty(i) / 2
                    # Give a full penalty for other word types.
                    else:
                        total_weight += rank_scale.get_penalty(i)
            unique_words.add(lex)
    # Compare using all words as denominator vs. unique words.
    if div_all:
        total_weight /= len(passage.word_ids())
    else:
        total_weight /= len(unique_words)

    return round(total_weight, 4)


# Decrease penalty for each occurance.
def get_passage_weight_4(
    passage: Passage, rank_scale: Rank = lex_rank_default, div_all=True, morph=False
) -> float:
    word_weights: dict[str, dict[str, Any]] = {}
    verb_count = 0
    verb_weight = 0
    min_penalty = 1.7  # min penalty for rare words and proper nouns.
    # Iterate over words in the passage.
    for word in passage.word_ids():
        lex_id = hdp.lex_id(word)
        if hdp.lex_stripped(word) not in Classify().stop_words:
            # Add partial penalty for reocurring words.
            if lex_id in word_weights.keys():
                # Only gradually decrease penalty for rarer words.
                # Decreases by 1 point per occurance.
                # TODO : does - 1 point make sense here?
                word_weights[lex_id]["count"] += 1
                if hdp.lex_frequency(word) < 100:
                    count = word_weights[lex_id]["count"]
                    penalty = word_weights[lex_id]["penalty"]
                    new_weight = penalty - count
                    added_weight = (
                        new_weight if new_weight >= min_penalty else min_penalty
                    )
                    word_weights[lex_id]["weight"] += added_weight
                else:
                    word_weights[lex_id]["weight"] += word_weights[lex_id]["penalty"]
            # Add full penalty for the first occurance.
            else:
                # Add word to hash table
                word_weights[lex_id] = {"count": 0, "weight": 0, "penalty": 0}
                # Iterate over the ranks present in the rank scale.
                for i, rank in enumerate(rank_scale.ranks):
                    lex_freq = hdp.lex_frequency(word)
                    min_occ, max_occ = rank_scale.get_range(i)
                    if lex_freq >= min_occ and lex_freq < max_occ:
                        # Give a half penalty for proper nouns.
                        _penalty = rank_scale.get_penalty(i)
                        if (
                            is_proper_noun(word) and _penalty > min_penalty
                        ):  # proper noun
                            word_weights[lex_id]["penalty"] = int(
                                math.ceil(_penalty / 2)
                            )
                        # Give a full penalty for other word types.
                        else:
                            word_weights[lex_id]["penalty"] = _penalty
                word_weights[lex_id]["weight"] += word_weights[lex_id]["penalty"]
                word_weights[lex_id]["count"] += 1
            # If we're penalizing for morphology
            if morph:
                if hdp.speech(word) == "verb":
                    verb_count += 1
                    verb_weight += (
                        MorphRank.stem_map.get(hdp.verb_stem(word), 0)
                        + MorphRank.tense_map[hdp.verb_tense(word)]
                    )

    # Get the sum of all word weights.
    total_weight = sum(
        [w for w in [word_weights[k]["weight"] for k in word_weights.keys()]]
    )
    # Compare using all words as denominator vs. unique words.
    if div_all:
        total_weight = total_weight / passage.word_count + (
            verb_weight / passage.word_count
        )
    else:
        total_weight /= len(word_weights)

    return round(total_weight, 4)


# Decrease penalty for each occurance.
def get_passage_weight_x(configuration: AlgorithmConfig, passage: Passage):
    categories = init_categories(configuration)
    lexemes = set()
    # Loop over words from the database, where the word is not a stop word.
    for word in passage.words():
        if configuration.include_stop_words:
            lexemes.add(hdp.lex_id(word))
            for category in categories:
                category.check_condition(word)
        elif hdp.lex_stripped(word) not in Classify().stop_words:
            lexemes.add(hdp.lex_id(word))
            for category in categories:
                category.check_condition(word)
    # for category in categories:
    #     for k, v in category.penalties.items():
    #         print(k, v, "\n")
    # print(category.name, category.penalties)
    total_penalty = sum([cat.total_penalty() for cat in categories])
    score = configuration.passage_penalty(passage, len(lexemes), total_penalty)
    penalties = {category.name: category.get_penalty_data() for category in categories}
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
    def __init__(self, name="", config: AlgorithmConfig = None):
        self.name = name
        self.config = config
        # Maps each word_id to a condition and penalty.
        self.instances: dict[int, dict[str, Any]] = {}
        # Maps each condition to a list of tuples [word_id, penalty].
        # self.penalties: dict[str, dict[str, list[Numeric]]] = {}
        self.penalties: dict[str, list[tuple(int, Numeric)]] = {}

    def total_penalty(self):
        total = 0
        # for word_id, data in self.instances.items():
        #     total += data.get("penalty")
        for penalties in self.penalties.values():
            for pair in penalties:
                total += pair[1]
        return total

    def add_penalty(self, condition, word_id, penalty):
        condition = str(condition)
        # if condition not in self.penalties:
        #     self.penalties[condition] = {"words": [word_id], "penalties": [penalty]}
        # else:
        #     self.penalties[condition]["words"].append(word_id)
        #     self.penalties[condition]["penalties"].append(penalty)
        if condition not in self.penalties.keys():
            self.penalties[condition] = [(word_id, penalty)]
        else:
            self.penalties[condition].append((word_id, penalty))

    def get_penalty_data(self):
        penalty_data = []
        for condition, data in self.penalties.items():
            # penalty_data.append(
            #     {
            #         "condition": condition,
            #         "words": data.get("words"),
            #         "penalties": data.get("penalties"),
            #     }
            # )
            penalty_data.append(
                {
                    "condition": condition,
                    "penalties": data,
                }
            )
        return penalty_data

    @abstractmethod
    def check_condition(self, word):
        pass


# Sample args
# [
#     [{"feature": "verb_tense", "rule": "EQUALS", "value": "impv"}, 3],
#     [{"feature": "verb_stem", "rule": "EQUALS", "value": "hof"}, 4],
#     [{"feature": "pronominal_suffix", "rule": "EXISTS", "value": "true"}, 2],
#     [
#         {"feature": "verb_tense", "rule": "EQUALS", "value": "perf"},
#         {"feature": "verb_stem", "rule": "EQUALS", "value": "hif"},
#         {"feature": "pronominal_suffix", "rule": "EXISTS", "value": "true"},
#         3,
#     ],
# ]


class Frequency(Category):
    def __init__(
        self,
        name,
        config,
    ):
        super().__init__(name, config)  # calling the parent's __init__ method
        self.word_occurences: dict[int, dict[str, Numeric]] = {}
        self.current_penalty = 0
        self.current_definition: FrequencyDefinition = None

    # TODO : alternate logic without word_occurences when not using a taper.
    def check_condition(self, word) -> None:
        lex_id = hdp.lex_id(word)
        # If taper, gradually reduce the penalty per lex occurence.
        if lex_id in self.word_occurences.keys():
            count = self.update_count(lex_id)
            penalty = self.word_occurences[lex_id].get("penalty")
            # TODO : look at other taper methods?
            # Only gradually decrease penalty for rarer words.
            # Decreases by 1 point per occurance.
            if hdp.lex_frequency(word) < UNCOMMON_WORD_FREQUENCY:
                decreased_penalty = penalty - (count * self.config.taper_discount)
                updated_penalty = (
                    decreased_penalty
                    if decreased_penalty >= MIN_RARE_WORD_PENALTY
                    else MIN_RARE_WORD_PENALTY
                )
                self.current_penalty = updated_penalty
            else:
                self.current_penalty = penalty
        # Add full penalty for the first occurance.
        else:
            # Add word to hash tabled
            self.word_occurences[lex_id] = {
                "count": 0,
                "penalty": 0,
                "definition": None,
            }

            self.find_occ_range(word)
            self.word_occurences[lex_id]["penalty"] = self.current_penalty
            self.word_occurences[lex_id][
                "definition"
            ] = self.current_definition.definition

        self.instances[hdp.id(word)] = self.current_definition.definition_obj()
        self.add_penalty(
            self.word_occurences[lex_id].get("definition"),
            hdp.id(word),
            self.current_penalty,
        )

    # Find the occurrence range for the current word.
    def find_occ_range(self, word):
        if hdp.ketiv_qere(word) and self.config.qere_penalty != 0:
            self.instances[hdp.id(word)] = "Qere"
            self.add_penalty("Qere", hdp.id(word), self.config.qere_penalty)
            return
        # TODO : rethink this.
        elif self.config.penalize_by_verb_stem and hdp.speech(word) == "verb":
            verb_stem = hdp.verb_stem(word)
            lex_id = str(hdp.lex_id(word))
            try:
                freq = VERB_STEMS.get(lex_id).get(verb_stem)
                penalty = 0
                if 20 < freq < 45:
                    penalty = 3
                elif freq <= 20:
                    penalty = 7
                if penalty > 0:
                    self.instances[hdp.id(word)] = "vs_" + verb_stem
                    self.add_penalty("vs_" + verb_stem, hdp.id(word), penalty)
                    return
            except AttributeError:
                pass
        # Iterate over the frequency definitions.
        for _def in self.config.frequencies:
            if _def.check_condition(word):
                self.current_definition = _def
                # Give a custom penalty for proper nouns.
                if is_proper_noun(word) and _def.penalty > MIN_RARE_WORD_PENALTY:
                    self.current_penalty = int(
                        math.ceil(_def.penalty / self.config.proper_noun_divisor)
                    )
                # Give a full penalty for other word types.
                else:
                    self.current_penalty = _def.penalty

                return True

    def update_count(self, lex_id: int):
        self.word_occurences[lex_id]["count"] += 1
        return self.word_occurences[lex_id].get("count")


class Verb(Category):
    def __init__(
        self,
        name,
        config,
    ):
        super().__init__(name, config)  # calling the parent's __init__ method

    def check_condition(self, word):
        if hdp.speech(word) != "verb":
            return
        for _def in self.config.verbs:
            for i in _def.conditions_range:
                # Get the method from HebrewDataProvider using the 'feature' key from the condition
                # One of hdp.{verb_tense, verb_stem, pronominal_suffix}
                feature_method = getattr(hdp, _def.feature(i))
                # Use the method to get the actual feature value from the word
                feature_value = feature_method(word)
                # Check the rule
                if not _def.check_condition(feature_value, i):
                    break
            # if all conditions are met, add to instances
            if _def.all_conditions_met():
                self.instances[hdp.id(word)] = _def.definition_obj()
                self.add_penalty(_def.definition, hdp.id(word), _def.penalty)


class ConstructNoun(Category):
    def __init__(
        self,
        name,
        config,
    ):
        super().__init__(name, config)  # calling the parent's __init__ method
        # Sort in reverse to check chain-length condition and exit properly.
        self.config.construct_nouns.sort(key=lambda x: x.chain_length, reverse=True)
        self.current_chain_length: int = 0

    def check_condition(self, word) -> None:
        if hdp.state(word) == "c":
            self.current_chain_length += 1
        else:
            # If true, end of chain is reached.
            if self.current_chain_length > 0:
                for _def in self.config.construct_nouns:
                    if _def.check_condition(self.current_chain_length):
                        self.instances[hdp.id(word)] = _def.definition_obj()
                        self.add_penalty(_def.definition, hdp.id(word), _def.penalty)
                        break
                self.current_chain_length = 0


class SyntaxUnit(Category):
    def __init__(
        self,
        name,
        config,
    ):
        super().__init__(name, config)  # calling the parent's __init__ method
        self.current_unit: int = 0

    def check_condition(self, word):
        unit_id, definitions = None, None
        if self.name == "clauses":
            unit_id = hdp.clause_id(word)
            definitions = self.config.clauses
        else:
            unit_id = hdp.phrase_id(word)
            definitions = self.config.phrases

        if unit_id != self.current_unit:
            for _def in definitions:
                if _def.check_condition(word):
                    self.instances[hdp.id(word)] = _def.definition_obj()
                    self.add_penalty(_def.definition, hdp.id(word), _def.penalty)
                    break
        self.current_unit = unit_id


# [
#     [{"feature": "verb_tense", "rule": "EQUALS", "value": "impv"}, 3],
#     [{"feature": "verb_stem", "rule": "EQUALS", "value": "hof"}, 4],
#     [{"feature": "pronominal_suffix", "rule": "EXISTS", "value": "true"}, 2],
#     [
#         {"feature": "verb_tense", "rule": "EQUALS", "value": "perf"},
#         {"feature": "verb_stem", "rule": "EQUALS", "value": "hif"},
#         {"feature": "pronominal_suffix", "rule": "EXISTS", "value": "true"},
#         3,
#     ],
# ]


# TEST: http://127.0.0.1:8000/passages/compare?id=1473&id=1511
def init_categories(config: AlgorithmConfig) -> list[Category]:
    categories: list[Category] = []

    if config.verbs:
        categories.append(Verb("verbs", config))

    if config.frequencies:
        categories.append(Frequency("frequencies", config))

    if config.construct_nouns:
        categories.append(ConstructNoun("construct_nouns", config))

    if config.clauses:
        categories.append(SyntaxUnit("clauses", config))

    if config.phrases:
        categories.append(SyntaxUnit("phrases", config))

    return categories
