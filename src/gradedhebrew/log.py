import json
import logging
import os
from pathlib import Path

from google.cloud import logging as gc_logging

from .env import env

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logging"

# Create the directory if it doesn't exist.
if not os.path.exists(LOG_DIR):
    os.mkdir(LOG_DIR)


class IgnoreSpecificMessageFilter(logging.Filter):
    def filter(self, record):
        ignore_phrases = [
            "first seen with mtime",
            "Watching dir",
            "Watching for file changes",
            "changed, reloading.",
        ]
        return not any(phrase in record.getMessage() for phrase in ignore_phrases)


class IgnoreHTTPInfoFilter(logging.Filter):
    def filter(self, record):
        http_methods = ["GET", "POST"]

        # Check if the log record's level is INFO and if it starts with 'GET' or 'POST'.
        if record.levelno == logging.INFO:
            return not any(
                record.getMessage().startswith(method) for method in http_methods
            )
        # Allow all non-INFO level messages.
        return True


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {name} {asctime} {module} {message} {exc_info} {args} {funcName}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {name} {message}",
            "style": "{",
        },
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
        },
    },
    "filters": {
        "ignore_specific": {"()": IgnoreSpecificMessageFilter},
        "ignore_http_info": {
            "()": IgnoreHTTPInfoFilter,
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "filters": ["ignore_specific"],
        },
        "general_file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": str(LOG_DIR / "general.log"),
            "formatter": "verbose",
            "filters": ["ignore_specific"],
        },
        "warning_file": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": str(LOG_DIR / "warnings.log"),
            "formatter": "verbose",
            "filters": ["ignore_specific"],
        },
        "error_file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": str(LOG_DIR / "errors.log"),
            "formatter": "verbose",
            "filters": ["ignore_specific"],
        },
    },
    "loggers": {
        "root": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}

logger = logging.getLogger(__name__)

ROOT_HANDLERS: list = LOGGING["loggers"]["root"]["handlers"]


def add_google_logging():
    try:
        # Load the credentials from the environment variable
        credentials_json = env("GOOGLE_LOGGING_CREDENTIALS", default=None)
        if credentials_json is None:
            raise ValueError(
                "Google logging credentials not found in environment variables."
            )
        credentials = json.loads(credentials_json)
        client = gc_logging.Client.from_service_account_info(credentials)

        # Set up Google Cloud Logging handler with the client
        LOGGING["handlers"]["cloud_logging"] = {
            "level": "INFO",
            "class": "google.cloud.logging.handlers.CloudLoggingHandler",
            "client": client,
            "filters": ["ignore_specific", "ignore_http_info"],
            "formatter": "json",
        }

        ROOT_HANDLERS.append("cloud_logging")

    except Exception as e:
        logger.warning("Failed to initialize Google Logging Client: %s", e)


# Include log files if in DEV or DEBUG mode.
if env("VERSION", default="DEV") == "DEV" or env("DEBUG", default=False):
    for handler in "general_file warning_file error_file".split(" "):
        ROOT_HANDLERS.append(handler)
# else:
#     add_google_logging()
add_google_logging()
