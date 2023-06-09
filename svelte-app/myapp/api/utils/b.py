

"""
A class that contains a Hebrew passage, consisting of paragraphs 
as marked by a petach (פ) or samech (ס) in the Masoretic Text. If 
a book like Psalms, which lacks paragaph markers, is encountered,
the passages are split at the chapter level. 
"""
class Passage:

    def __init__(self, id):
        self.id = id
        self.verses = [] # a list of verse node ints. 
        self.words = [] # a list of word node ints. 
        self.start_word = 0
        self.end_word = 0
        self.start_verse = 0
        self.end_verse = 0
        self.word_count = 0
        self.weight0 = 0
        self.weight1 = 0
        self.weight2a = 0 # all words denom
        self.weight2b = 0 # unique words
        self.weight3a = 0 # all word denom
        self.weight3b = 0
        self.weight3c = 0 #3a with morph
        self.verb_types_present = set()
        self.verb_stems_present = set()
        self.word_ranks_data = {}
        self.start_ref = ''
        self.end_ref = ''

    paragraph_markers = {'פ': 'open', 'ס': 'closed'}

    # Returns a list of all words present in the passage.
    def get_all_words(self):
        words = []
        for verse in self.verses:
            for word in L.i(verse, otype='word'):
                words.append(word)
        return words

    # Returns a list of all words present in a specified verse in the passage.
    def get_vs_words(self, verse):
        verse_words = [w for w in L.i(verse, otype='word')]
        return verse_words

    # Returns a String of all the text in the passage.
    def get_text(self):
        return T.text(self.verses, fmt='text-orig-full')

    """
    get_vs_weights() returns a dictionary mapping each verse node in 
    the passage to a weight. It takes rank_scale as input, an instance
    of Classify(args).rank_scale() (see notes in Classify for instantiaion).
    """
    def get_vs_weights(self, rank_scale):
        # A dictionary mapping verse nodes to weights.
        verse_weights = {}
        # Iterate over verses in the passage.
        for verse in self.verses:
            verse_weight = 0
            words = self.get_vs_words(verse)
            # Add the scaled word weights to the verse's total weight.
            for word in words:
                if F.voc_lex_utf8.v(word) not in Classify().stop_words:
                    for rank in rank_scale.keys():
                        lex_freq = F.freq_lex.v(word)
                        _range = rank_scale[rank]['range']
                        if lex_freq >= _range[0] and lex_freq < _range[1]:
                            verse_weight += rank_scale[rank]['weight']
            # Add the verse's weight to the dictionary at this verse's key. 
            verse_weight /= len(words)
            verse_weights[verse] = round(verse_weight, 4)
        
        return verse_weights

    # Simply add the freq_lex of each word to weight.
    def get_passage_weight0(self):
        total_weight = 0
        # Iterate over words in the passage.
        for word in self.words:
            if F.voc_lex_utf8.v(word) not in Classify().stop_words:
                # Subtract 10000 to penalize rare words. 
                total_weight += 10000 - F.freq_lex.v(word)
        total_weight /= len(self.words)
        
        return round(total_weight, 4)

    def get_passage_weight1(self, rank_scale):
        total_weight = 0
        # Iterate over words in the passage.
        for word in self.words:
            if F.voc_lex_utf8.v(word) not in Classify().stop_words:
                # Iterate over the ranks present in the rank scale. 
                for rank in rank_scale.keys():
                    lex_freq = F.freq_lex.v(word)
                    _range = rank_scale[rank]['range']
                    if lex_freq >= _range[0] and lex_freq < _range[1]:
                        # Give a half penalty for proper nouns. 
                        if F.sp.v(word) == 'nmpr': # proper noun
                            total_weight += (rank_scale[rank]['weight']) / 2
                        # Give a full penalty for other word types. 
                        else:
                            total_weight += rank_scale[rank]['weight']
        total_weight /= len(self.words)
        
        return round(total_weight, 4)

    # Only penalize once per lexical value.  
    def get_passage_weight2(self, rank_scale, div_all=True):
        total_weight = 0
        unique_words = set()
        # Iterate over words in the passage.
        for word in self.words:
            lex = F.voc_lex_utf8.v(word)
            if lex not in Classify().stop_words and lex not in unique_words:
                # Iterate over the ranks present in the rank scale. 
                for rank in rank_scale.keys():
                    lex_freq = F.freq_lex.v(word)
                    _range = rank_scale[rank]['range']
                    if lex_freq >= _range[0] and lex_freq < _range[1]:
                        # Give a half penalty for proper nouns. 
                        if F.sp.v(word) == 'nmpr': # proper noun
                            total_weight += (rank_scale[rank]['weight']) / 2
                        # Give a full penalty for other word types. 
                        else:
                            total_weight += rank_scale[rank]['weight']
                unique_words.add(lex)
        # Compare using all words as denominator vs. unique words.
        if div_all:
            total_weight /= len(self.words)
        else:
            total_weight /= len(unique_words)
        
        return round(total_weight, 4)

    # Decrease penalty for each occurance. 
    def get_passage_weight3(self, rank_scale, div_all=True, morph=False):
        word_weights = {}
        verb_count = 0
        verb_weight = 0
        min_penalty = 1.7 # min penalty for rare words and proper nouns. 
        # Iterate over words in the passage.
        for word in self.words:
            lex = F.voc_lex_utf8.v(word)
            if lex not in Classify().stop_words:
                # Add partial penalty for reocurring words. 
                if lex in word_weights.keys():
                    # Only gradually decrease penalty for rarer words. 
                    # Decreases by 1 point per occurance. 
                    word_weights[lex]['count'] += 1
                    if F.freq_lex.v(word) < 100:
                        count = word_weights[lex]['count']
                        penalty = word_weights[lex]['penalty']
                        new_weight = penalty - count 
                        added_weight = new_weight if new_weight >= min_penalty else min_penalty
                        word_weights[lex]['weight'] += added_weight
                    else:
                        word_weights[lex]['weight'] += word_weights[lex]['penalty']
                # Add full penalty for the first occurance. 
                else:
                    # Add word to hash table
                    word_weights[lex] = {'count':0, 'weight':0, 'penalty':0}
                    # Iterate over the ranks present in the rank scale. 
                    for rank in rank_scale.keys():
                        lex_freq = F.freq_lex.v(word)
                        _range = rank_scale[rank]['range']
                        if lex_freq >= _range[0] and lex_freq < _range[1]:
                            # Give a half penalty for proper nouns. 
                            _penalty = rank_scale[rank]['weight']
                            if F.sp.v(word) == 'nmpr' and _penalty > min_penalty: # proper noun
                                word_weights[lex]['penalty'] = int(math.ceil(_penalty / 2))
                            # Give a full penalty for other word types. 
                            else:
                                word_weights[lex]['penalty'] = _penalty
                    word_weights[lex]['weight'] += word_weights[lex]['penalty']
                    word_weights[lex]['count'] += 1
                # If we're penalizing for morphology
                if morph:
                    if F.sp.v(word) == 'verb':
                        verb_count += 1
                        verb_weight += MorphRank.stem_map.get(F.vs.v(word),0) + MorphRank.tense_map[F.vt.v(word)]

        # Get the sum of all word weights. 
        total_weight = sum([w for w in [word_weights[k]['weight'] for k in word_weights.keys()]])
        # Compare using all words as denominator vs. unique words.
        if div_all:
            total_weight = total_weight / len(self.words) + (verb_weight / len(self.words))
        else:
            total_weight /= len(word_weights)
        
        return round(total_weight, 4)
    

"""
A class to store passages. It includes methods to sort the passages
by attributes such as word count, weight, and canonical order. It
also stores the rank scale used to create the passage list. The passages
will be stored in order_sorted by default. 
"""
class Passages:
    
    def __init__(self, passages, rank_scale={}):
        self.rank_scale = rank_scale
        self.order_sorted = passages
        self.word_count_sorted = self.word_count_sort()
        self.weight_sorted0 = self.weight_sort0()
        self.weight_sorted1 = self.weight_sort1()
        self.weight_sorted2a = self.weight_sort2a()
        self.weight_sorted2b = self.weight_sort2b()
        self.weight_sorted3a = self.weight_sort3a()
        self.weight_sorted3b = self.weight_sort3b()
        self.weight_sorted3c = self.weight_sort3c()
    
    def word_count_sort(self):
        return sorted(self.order_sorted, key=lambda p: p.word_count)

    """ For weight sorts I use a dict mapping Passage objects to their rank
    number so that I can then compare all the weight sorts in a dataframe. """
    def weight_sort0(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight0)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    def weight_sort1(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight1)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    def weight_sort2a(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight2a)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    def weight_sort2b(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight2b)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    def weight_sort3a(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight3a)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    def weight_sort3b(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight3b)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    # Morph
    def weight_sort3c(self):
        sorted_list = sorted(self.order_sorted, key=lambda p: p.weight3c)
        return {sorted_list[i]:i for i in range(len(sorted_list))}

    # A function to display the rank scale as a multi-line string. 
    def print_scale(self):
        scale = self.rank_scale
        output_text = ""
        for i, rank in enumerate(scale.ranks):
            _range = scale.ranges[i]
            weight = scale.weights[i]
            output = f"{weight}\t{_range[0]}-{_range[1]} occ"
            output_text += f"{rank}:   \t{output}\n"
        return output_text