#!/bin/bash

rm -r gradedhebrew/staticfiles

poetry run python3 manage.py collectstatic --no-input --ignore 'css/build/*'

poetry run python3 manage.py runserver