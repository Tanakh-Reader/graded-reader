#!/bin/bash

APP_NAME="vanilla-app"

git pull origin main

cd "$APP_NAME"

poetry install

poetry run python manage.py collectstatic --no-input --ignore 'css/build/*'
