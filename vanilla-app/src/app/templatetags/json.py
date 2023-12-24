from django import template
import json

register = template.Library()

@register.filter
def to_json(value):
    for k, v in value.items():
        # Take care of apostrophes for HTML/js
        if type(v) == str:
            value[k] = v.replace("'", "&apos;")
    return json.dumps(value)