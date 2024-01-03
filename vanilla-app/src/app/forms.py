from django import forms

from .providers.bhsa_features_provider import bhsa_features_provider

PENALTY_FIELD = forms.DecimalField(
    min_value=0, widget=forms.NumberInput(attrs={"placeholder": "Penalty"})
)


class VerbForm(forms.Form):
    VERB_TENSES = [
        ("na", "VERB TENSES"),
    ] + bhsa_features_provider.get_value_definition_mappings("vt", as_list=True)

    VERB_STEMS = [
        ("na", "VERB STEMS"),
    ] + bhsa_features_provider.get_value_definition_mappings("vs", as_list=True)

    SUFFIXES = [
        ("na", "HAS SUFFIX"),
        ("false", "False"),
        ("true", "True"),
    ]

    verb_tense = forms.ChoiceField(choices=VERB_TENSES)
    verb_stem = forms.ChoiceField(choices=VERB_STEMS)
    suffix = forms.ChoiceField(choices=SUFFIXES)
    penalty = PENALTY_FIELD


class FrequencyForm(forms.Form):
    start = forms.IntegerField(
        min_value=1,
        required=True,
        widget=forms.NumberInput(attrs={"placeholder": "Start"}),
    )
    end = forms.IntegerField(
        min_value=1,
        required=True,
        widget=forms.NumberInput(attrs={"placeholder": "End"}),
    )
    penalty = PENALTY_FIELD
