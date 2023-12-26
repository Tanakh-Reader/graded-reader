#!/bin/bash

APP_NAME="vanilla-app/src"

git pull origin main

cd "$APP_NAME"

# Set the DJANGO_PRODUCTION environment variable
export DJANGO_PRODUCTION="ON"

poetry install

poetry run python3 manage.py collectstatic --no-input --ignore 'css/build/*'
