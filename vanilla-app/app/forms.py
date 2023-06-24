from django import forms
from .providers.bhsa_features_provider import bhsa_features_provider

PENALTY_FIELD = forms.DecimalField(min_value=0)

class VerbForm(forms.Form):
    
    VERB_TYPES = [
        ('na', 'N/A'),
    ] + bhsa_features_provider.get_value_definition_mappings('vt', as_list=True)
    
    VERB_STEMS = [ 
        ('na', 'N/A'),
    ] + bhsa_features_provider.get_value_definition_mappings('vs', as_list=True)

    SUFFIXES = [
        ('na', 'False'),
        ('true', 'True'),
    ]

    verb_type = forms.ChoiceField(choices=VERB_TYPES)
    verb_stem = forms.ChoiceField(choices=VERB_STEMS)
    suffix = forms.ChoiceField(choices=SUFFIXES)
    penalty = PENALTY_FIELD

print(vars(VerbForm))
class FrequencyForm(forms.Form):
    start = forms.IntegerField(min_value=1)
    end = forms.IntegerField(min_value=1)
    penalty = PENALTY_FIELD
