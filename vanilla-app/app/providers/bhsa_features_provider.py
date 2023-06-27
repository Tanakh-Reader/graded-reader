import yaml
import os

from django.conf import settings
from ..data import constants
from ..models import Word, Passage


ATTRIBUTES_FILE = os.path.join(settings.BASE_DIR, "app/data/bhsa_data_mapping.yml")

# Class that interfaces with the Sqlite DB to get words.
class BHSAFeaturesProvider:

    attribute_mappings = None

    # Load the mappings file into memory if not present.
    def get_attribute_mappings(self):
        if not self.attribute_mappings:
            with open(ATTRIBUTES_FILE, 'r') as file:
                self.attribute_mappings = yaml.load(file, Loader=yaml.FullLoader)
        return self.attribute_mappings
    
    # Get an object based on its key. 
    # E.g., key in [`vs`, `verbal stem`, `verb_stem`] would return the <vs> object.
    def get_attribute_by_name(self, key):
        mapping = self.get_attribute_mappings()
        # First check the top-level `vs` case
        if key in mapping:
            return mapping[key]
        # Otherwise iterate over the objects, checking their `name` and `python_var` for the key.
        for attribute in mapping.values():
            name = attribute.get('name')
            python_name = attribute.get('python_var')
            if key in [name, python_name]:
                return attribute
                
        return None

    # Get a value's definition.
    # E.g., key=vs, value=hif --> hif'il
    def get_value_definition(self, key, value):
        feature = self.get_attribute_by_name(key)
        if feature:
            feature_code = feature.get('codes').get(value)
            if feature_code:
                return self.get_definition(feature_code)
        # print("Not Found", key, value)
        return value
    
    # Get a value's custom (if present) or base definition.
    def get_definition(self, feature_code_object):
        # First check if there is a custom definition, otherwise return default.
        custom_value = feature_code_object.get('custom')
        if custom_value:
            return custom_value
        return feature_code_object.get('definition')
    
    # For a key, get all codes mapped to their definitions.
    def get_value_definition_mappings(self, key, as_list=False):
        feature = self.get_attribute_by_name(key)
        mapping = {}
        if feature:
            feature_codes = feature.get('codes')
            # Map each code to its definition
            for key, value in feature_codes.items():
                mapping[key] = self.get_definition(value)
        if as_list:
            mapping = [(k, v) for k, v in mapping.items()]
        return mapping
    
    def get_features_for_display(self):
        mapping = self.get_attribute_mappings()
        features = []
        for feature, feature_data in mapping.items():
            feature_formatted = {}
            codes = []
            for code, code_data in feature_data.get('codes').items():
                code_definition = self.get_definition(code_data)
                codes.append({'code': code, 'definition': code_definition})
            feature_formatted['feature'] = feature
            feature_formatted['url'] = feature_data.get('src')
            feature_formatted['name'] = feature_data.get('name')
            feature_formatted['codes'] = codes
            features.append(feature_formatted)
        return features

    

bhsa_features_provider = BHSAFeaturesProvider()