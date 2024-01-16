from typing import SupportsFloat as Numeric
from typing import Union

from ..models import Algorithm, Passage
from ..providers.hebrew_data_provider import hebrew_data_provider as hdp


class AlgorithmConfig:
    def __init__(self, algorithm: Algorithm):
        self.id: int = algorithm.pk
        self.name: str = algorithm.name
        self.frequencies: list[
            Union[FrequencyType, FrequencyDefinition]
        ] = algorithm.frequencies
        self.verbs: list[Union[VerbType, VerbDefinition]] = algorithm.verbs
        self.construct_nouns: list[
            Union[ConstructNounType, ConstructNounDefinition]
        ] = algorithm.construct_nouns
        self.clauses: list[Union[ClauseType, ClauseDefinition]] = algorithm.clauses
        self.phrases: list[Union[PhraseType, PhraseDefinition]] = algorithm.phrases
        self.qere_penalty: float = algorithm.qere_penalty
        self.penalize_by_verb_stem: bool = algorithm.penalize_by_verb_stem
        self.taper_discount: float = algorithm.taper_discount
        self.proper_noun_divisor: float = algorithm.proper_noun_divisor
        self.include_stop_words: bool = algorithm.include_stop_words
        self.total_penalty_divisor: str = algorithm.total_penalty_divisor

    def passage_penalty(self, passage: Passage, lexeme_count: int, penalty: float):
        divisor = {"WORDS": passage.word_count, "LEXEMES": lexeme_count}.get(
            self.total_penalty_divisor
        )
        total_penalty = penalty / divisor
        return round(total_penalty, 4)

    def set_definitions(self):
        self.frequencies = [FrequencyDefinition(f) for f in self.frequencies]
        self.verbs = [VerbDefinition(v) for v in self.verbs]
        self.construct_nouns = [
            ConstructNounDefinition(cn) for cn in self.construct_nouns
        ]
        self.clauses = [ClauseDefinition(c) for c in self.clauses]
        self.phrases = [PhraseDefinition(p) for p in self.phrases]


FrequencyType = tuple[int, int, Numeric]
VerbType = tuple[list[dict[str, str]], int]
ConstructNounType = tuple[int, Numeric]
ClauseType = tuple[str, Numeric]
PhraseType = tuple[str, Numeric]


class FrequencyDefinition:
    def __init__(self, definition: FrequencyType):
        # Minimum and maximum lex occurrences.
        self.definition = definition
        self.min_occ = definition[0]
        self.max_occ = definition[1]
        self.penalty = definition[2]
        self.range = [self.min_occ, self.max_occ]

    def check_condition(self, word):
        return self.min_occ <= hdp.lex_frequency(word) < self.max_occ

    def definition_obj(self):
        return {"condition": self.range, "penalty": self.penalty}


class VerbDefinition:
    def __init__(self, definition: VerbType):
        self.definition = definition
        self.conditions = definition[0]
        self.penalty = definition[1]
        self.conditions_met: int = 0
        self.conditions_range = range(len(self.conditions))

    def feature(self, i: int):
        return self.conditions[i].get("feature")

    def rule(self, i: int):
        return self.conditions[i].get("rule")

    def value(self, i: int):
        return self.conditions[i].get("value")

    def check_condition(self, feature_value, i: int):
        if self.rule(i) == "EQUALS":
            # if rule is "EQUALS" then check if feature value is equal to condition value
            if feature_value == self.value(i):
                self.conditions_met += 1
                return True
        elif self.rule(i) == "EXISTS":
            # if rule is "EXISTS" then check if feature value is not None
            value = {"true": True, "false": False}.get(self.value(i))
            if (feature_value not in [None, ""]) == value:
                self.conditions_met += 1
                return True
        return False

    def all_conditions_met(self):
        conditions_met = self.conditions_met
        self.conditions_met = 0
        return conditions_met == len(self.conditions)

    def definition_obj(self):
        return {
            "condition": self.conditions,
            "penalty": self.penalty,
        }


class ConstructNounDefinition:
    def __init__(self, definition: ConstructNounType):
        self.definition = definition
        self.chain_length = definition[0]
        self.penalty = definition[1]

    def check_condition(self, chain_length):
        return chain_length >= self.chain_length

    def definition_obj(self):
        return {"condition": self.chain_length, "penalty": self.penalty}


class ClauseDefinition:
    def __init__(self, definition: ClauseType):
        self.definition = definition
        self.clause_type = definition[0]
        self.penalty = definition[1]

    def check_condition(self, word):
        # Handle phrase types like AdvP: Adverbial phrase
        x_type = hdp.clause_type(word)
        if self.clause_type[-1] == "P":  # a phrase
            x_type = hdp.phrase_type(word)
        return x_type == self.clause_type

    def definition_obj(self):
        return {"condition": self.clause_type, "penalty": self.penalty}


class PhraseDefinition:
    def __init__(self, definition: PhraseType):
        self.definition = definition
        self.phrase_function = definition[0]
        self.penalty = definition[1]

    def check_condition(self, word):
        return hdp.phrase_function(word) == self.phrase_function

    def definition_obj(self):
        return {"condition": self.phrase_function, "penalty": self.penalty}
