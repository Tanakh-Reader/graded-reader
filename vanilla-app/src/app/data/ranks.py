from typing import Any, Union

"""
A class with data used to assign difficulty weights to passages based
on the lexical frequencies of words in the passage. 

ranks: a list of string categories for lexical frequency ranges
ranges: a 2D list of the numeric range for each rank
weights: a list of the weight penalties assigned per word for each rank
"""


class Rank:
    def __init__(self, name, ranks, ranges, weights):
        self.name: str = name
        self.ranks: list[str] = ranks
        self.ranges: list[list[int]] = ranges
        self.weights: list[float] = weights

    # Auxiliary function to create a single rank_scale dictionary.
    def get_rank_dict(self) -> dict[str, dict[str, Any]]:
        rank_dict = {}
        for i in range(len(self.ranks)):
            rank_dict[self.ranks[i]] = {
                "range": self.ranges[i],
                "weight": self.weights[i],
            }
        return rank_dict

    def get_rank_array(self):
        ranks = []
        for i in range(len(self.ranks)):
            _range = self.ranges[i]
            penalty = self.weights[i]
            ranks.append(_range + [penalty])
        return ranks


""" 
A class to store different ranking scales. 
"""


class LexRanks:
    # Using 2-elem lists is far faster than searching entire ranges.
    # Rather than if i in range(), check if i > l[0] and <= l[1].
    # Using this method scales runtime from ~0:04:30 to ~0:00:15.
    _3_ranks = Rank(
        "3_ranks",
        ["Frequent", "Uncommon", "Rare"],
        [
            [100, 51000],
            [10, 100],
            [1, 10],
        ],
        [1, 3, 7],
    )

    _4_ranks = Rank(
        "4_ranks",
        ["Frequent", "Medium", "Uncommon", "Rare"],
        [
            [100, 51000],
            [50, 100],
            [10, 50],
            [1, 10],
        ],
        [1, 4, 5, 8],
    )

    _5_ranks_a = Rank(
        "5_ranks_a",
        ["Frequent", "Common", "Medium", "Uncommon", "Rare"],
        [
            [500, 51000],
            [250, 500],
            [150, 250],
            [50, 150],
            [1, 50],
        ],
        [1, 2, 3, 5, 8],
    )

    _5_ranks_b = Rank(
        "5_ranks_b",
        ["Frequent", "Common", "Infrequent", "Rare", "Scarce"],
        [
            [200, 51000],
            [100, 200],
            [50, 100],
            [20, 50],
            [1, 20],
        ],
        [1, 1.5, 3, 5, 8],
    )

    _7_ranks = Rank(
        "7_ranks",
        ["Abundant", "Frequent", "Common", "Average", "Uncommon", "Rare", "Scarce"],
        [
            [800, 51000],
            [400, 800],
            [200, 400],
            [100, 200],
            [50, 100],
            [15, 50],
            [1, 15],
        ],
        [1, 1.1, 1.3, 1.7, 3, 5.5, 8.5],
    )

    _9_ranks = Rank(
        "9_ranks",
        [
            "Abundant",
            "Frequent",
            "Common",
            "Average",
            "Uncommon",
            "Rare",
            "Scarce",
            "Scarcer",
            "Scarcest",
        ],
        [
            [1000, 51000],
            [400, 1000],
            [200, 400],
            [100, 200],
            [50, 100],
            [30, 50],
            [20, 30],
            [10, 20],
            [1, 10],
        ],
        [1, 1.1, 1.3, 1.7, 3, 5.5, 8, 9, 10],
    )

    _10_ranks = Rank(
        "10_ranks",
        [
            "Abundant",
            "Frequent",
            "Common",
            "Average",
            "Uncommon",
            "Rare",
            "Rarer",
            "Scarce",
            "Scarcer",
            "Scarcest",
        ],
        [
            [1000, 51000],
            [400, 1000],
            [200, 400],
            [100, 200],
            [50, 100],
            [40, 50],
            [30, 40],
            [20, 30],
            [10, 20],
            [1, 10],
        ],
        [1, 1.1, 1.3, 1.7, 3, 5.5, 7, 8, 9, 10],
    )

    all_ranks: list[Rank] = [
        _3_ranks,
        _4_ranks,
        _5_ranks_a,
        _5_ranks_b,
        _7_ranks,
        _9_ranks,
        _10_ranks,
    ]


# Include morphology penalties.
class MorphRank:
    other: int = 8
    base: int = 0

    stem_map: dict[str, int] = {
        "hif": 2,  # hif‘il
        "hit": 3,  # hitpa“el
        "htpo": other,  # hitpo“el
        "hof": 5,  # hof‘al
        "nif": 3,  # nif‘al
        "piel": 2,  # pi“el
        "poal": other,  # po“al
        "poel": other,  # po“el
        "pual": 5,  # pu“al
        "qal": base,  # qal
    }
    tense_map: dict[str, int] = {
        "perf": base,  # perfect
        "impf": 2,  # imperfect
        "wayq": base,  # wayyiqtol
        "impv": 3.5,  # imperative
        "infa": 5,  # infinitive (absolute)
        "infc": 2,  # infinitive (construct)
        "ptca": 3,  # participle
        "ptcp": 5,  # participle (passive)
    }


"""
A class that contains data to help assign difficulty weights to 
any portion of Hebrew text that has more than one word. 
"""


class Classify:
    """
    Notes on stop_words_types and other exclusion lists.

    Most prepositions, articles, and conjunctions don't
    add any meaningul weight to a text and could thus be exlcuded.

    Example use:
    words = [w for w in passage if F.sp.v(w) not in stop_words_types]

    Note: the only Heb article is 'הַ' with 30,386 occurences. There are some
    preps and conjs that have few occurences, so I recommend not using
    stop_words_types when weighing passages and using stop_words instead.
    """

    stop_words_types: list[str] = ["prep", "art", "conj"]
    # Check if F.voc_lex_utf8.v(word) is in this list. If
    # so it can be excluded since it occurs so often.
    stop_words: list[str] = ["את", "ב", "ל", "ה", "ו", "", None]
    # stop_words: list[str] = ["אֵת", "בְּ", "לְ", "הַ", "וְ"]
    # If you take verb data into account when weighing a
    # paragraph, these common types could be excluded.
    easy_vtypes: list[str] = ["perf", "impf", "wayq"]
    easy_vstems: list[str] = ["qal", "hif", "nif", "piel"]
