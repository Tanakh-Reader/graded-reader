from django import forms
from django.forms import BaseFormSet
from django.http import HttpRequest

from .models import Algorithm
from .providers.bhsa_features_provider import bhsa_features_provider

PENALTY_FIELD = forms.FloatField(
    min_value=0,
    required=True,
    widget=forms.NumberInput(attrs={"required": True, "placeholder": "Penalty"}),
)


class CustomFormSet(BaseFormSet):
    @property
    def filtered_cleaned_data(self):
        """
        Returns the cleaned data of the formset, filtering out empty forms.
        #"""
        return [form.cleaned_data for form in self.forms if form.cleaned_data]


class FrequencyForm(forms.Form):
    start = forms.IntegerField(
        min_value=1,
        required=True,
        widget=forms.NumberInput(attrs={"required": True, "placeholder": "Start"}),
    )
    end = forms.IntegerField(
        min_value=1,
        required=True,
        widget=forms.NumberInput(attrs={"required": True, "placeholder": "End"}),
    )
    penalty = PENALTY_FIELD

    def clean(self):
        cleaned_data = super().clean()
        return [
            cleaned_data.get("start"),
            cleaned_data.get("end"),
            cleaned_data.get("penalty"),
        ]


class VerbForm(forms.Form):
    VERB_TENSES = [
        ("na", "TENSES"),
    ] + bhsa_features_provider.get_value_definition_mappings("vt", as_list=True)

    VERB_STEMS = [
        ("na", "STEMS"),
    ] + bhsa_features_provider.get_value_definition_mappings("vs", as_list=True)

    SUFFIXES = [
        ("na", "SUFFIX"),
        ("false", "False"),
        ("true", "True"),
    ]

    verb_tense = forms.ChoiceField(choices=VERB_TENSES)
    verb_stem = forms.ChoiceField(choices=VERB_STEMS)
    suffix = forms.ChoiceField(choices=SUFFIXES)
    penalty = PENALTY_FIELD

    def clean(self):
        cleaned_data = super().clean()
        vt = cleaned_data.get("verb_tense")
        vs = cleaned_data.get("verb_stem")
        sfx = cleaned_data.get("suffix")
        penalty = cleaned_data.get("penalty")
        conditions = []
        if vt != "na":
            conditions.append({"feature": "verb_tense", "rule": "EQUALS", "value": vt})
        if vs != "na":
            conditions.append({"feature": "verb_stem", "rule": "EQUALS", "value": vs})
        if sfx != "na":
            conditions.append(
                {"feature": "pronominal_suffix", "rule": "EXISTS", "value": sfx}
            )
        if not conditions:
            return []
        return [conditions, penalty]


class ConstructNounForm(forms.Form):
    chain_length = forms.IntegerField(
        min_value=1,
        max_value=10,
        required=True,
        widget=forms.NumberInput(
            attrs={"required": True, "placeholder": "Chain length"}
        ),
    )
    penalty = PENALTY_FIELD

    def clean(self):
        cleaned_data = super().clean()
        return [
            cleaned_data.get("chain_length"),
            cleaned_data.get("penalty"),
        ]


class ClauseForm(forms.Form):
    # TODO : update this
    CLAUSE_TYPES = [
        ("na", "TYPES"),
    ] + bhsa_features_provider.get_value_definition_mappings("typ", as_list=True)

    clause_type = forms.ChoiceField(choices=CLAUSE_TYPES)
    penalty = PENALTY_FIELD

    def clean(self):
        cleaned_data = super().clean()
        ct = cleaned_data.get("clause_type")
        if ct != "na":
            return [
                ct,
                cleaned_data.get("penalty"),
            ]
        return []


class PhraseForm(forms.Form):
    # TODO : update this
    PHRASE_FUNCTIONS = [
        ("na", "FUNCTIONS"),
    ] + bhsa_features_provider.get_value_definition_mappings("function", as_list=True)

    phrase_function = forms.ChoiceField(choices=PHRASE_FUNCTIONS)
    penalty = PENALTY_FIELD

    def clean(self):
        cleaned_data = super().clean()
        pf = cleaned_data.get("phrase_function")
        if pf != "na":
            return [
                pf,
                cleaned_data.get("penalty"),
            ]
        return []


class AlgorithmForm:
    def __init__(self, request: HttpRequest):
        self.BaseForm = forms.modelform_factory(
            Algorithm,
            fields=(
                "qere_penalty",
                "penalize_by_verb_stem",
                "taper_discount",
                "proper_noun_divisor",
                "include_stop_words",
                "total_penalty_divisor",
                "name",
            ),
        )
        FrequencyFormSet = forms.formset_factory(FrequencyForm, formset=CustomFormSet)
        VerbFormSet = forms.formset_factory(VerbForm, formset=CustomFormSet)
        ConstructNounFormSet = forms.formset_factory(
            ConstructNounForm, formset=CustomFormSet
        )
        ClauseFormSet = forms.formset_factory(ClauseForm, formset=CustomFormSet)
        PhraseFormSet = forms.formset_factory(PhraseForm, formset=CustomFormSet)

        self.base_form = self.BaseForm(request.POST or None)
        self.frequency_formset: FrequencyForm = FrequencyFormSet(
            request.POST or None, prefix="frequency"
        )
        self.verb_formset: VerbForm = VerbFormSet(request.POST or None, prefix="verb")
        self.construct_noun_formset: ConstructNounForm = ConstructNounFormSet(
            request.POST or None, prefix="noun"
        )
        self.clause_formset: ClauseForm = ClauseFormSet(
            request.POST or None, prefix="clause"
        )
        self.phrase_formset: PhraseForm = PhraseFormSet(
            request.POST or None, prefix="phrase"
        )
        self.request = request

    # Set the base form to an existing algorithm instance that will be updated
    def update_base_form(self, algorithm: Algorithm):
        self.base_form = self.BaseForm(self.request.POST, instance=algorithm)

    def update_algorithm(self):
        algorithm: Algorithm = self.base_form.save(commit=False)
        algorithm.frequencies = self.frequency_formset.filtered_cleaned_data
        algorithm.verbs = self.verb_formset.filtered_cleaned_data
        algorithm.construct_nouns = self.construct_noun_formset.filtered_cleaned_data
        algorithm.clauses = self.clause_formset.filtered_cleaned_data
        algorithm.phrases = self.phrase_formset.filtered_cleaned_data
        return algorithm

    def get_context(self):
        return {
            "algorithm_form": self.base_form,
            "frequency_formset": self.frequency_formset,
            "verb_formset": self.verb_formset,
            "construct_noun_formset": self.construct_noun_formset,
            "clause_formset": self.clause_formset,
            "phrase_formset": self.phrase_formset,
        }

    def get_errors(self):
        form_errors = {
            "verb_errors": self.verb_formset.errors,
            "frequency_errors": self.frequency_formset.errors,
            "noun_errors": self.construct_noun_formset.errors,
            "clause_errors": self.clause_formset.errors,
            "phrase_errors": self.phrase_formset.errors,
            "algorithm_errors": self.base_form.errors,
        }

        # Clean up the errors, remove keys with empty errors
        print("ERRORS", form_errors)
        cleaned_errors = {}
        for key, error_list in form_errors.items():
            if isinstance(error_list, list):
                # Filter out empty dictionaries from the error list
                cleaned_list = [error for error in error_list if error]
                if cleaned_list:
                    cleaned_errors[key] = cleaned_list
            elif error_list:  # For non-list error objects that are truthy
                cleaned_errors[key] = error_list

        return cleaned_errors

        # return clean_errors

    def is_valid(self):
        return (
            self.verb_formset.is_valid()
            and self.frequency_formset.is_valid()
            and self.construct_noun_formset.is_valid()
            and self.clause_formset.is_valid()
            and self.phrase_formset.is_valid()
        )
