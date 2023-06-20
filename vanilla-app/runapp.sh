#!/bin/bash

# rm -r gradedhebrew/staticfiles

export DJANGO_PRODUCTION="ON"

poetry run python3 manage.py collectstatic --no-input --ignore 'css/build/*'

poetry run python3 manage.py runserver