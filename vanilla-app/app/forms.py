from django import forms
from .providers.bhsa_features_provider import bhsa_features_provider

PENALTY_FIELD = forms.DecimalField(initial=1.0, min_value=0)

class VerbForm(forms.Form):
    
    VERB_TENSES = [
        ('na', 'N/A'),
    ] + bhsa_features_provider.get_value_definition_mappings('vt', as_list=True)
    
    VERB_STEMS = [ 
        ('na', 'N/A'),
    ] + bhsa_features_provider.get_value_definition_mappings('vs', as_list=True)

    SUFFIXES = [
        ('na', 'False'),
        ('true', 'True'),
    ]

    verb_tense = forms.ChoiceField(choices=VERB_TENSES)
    verb_stem = forms.ChoiceField(choices=VERB_STEMS)
    suffix = forms.ChoiceField(choices=SUFFIXES)
    penalty = PENALTY_FIELD

class FrequencyForm(forms.Form):
    start = forms.IntegerField(min_value=1, required=True)
    end = forms.IntegerField(min_value=1, required=True)
    penalty = PENALTY_FIELD
