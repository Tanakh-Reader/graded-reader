from functools import lru_cache
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = BASE_DIR.parent
ENV_FILE_PATH = PROJECT_DIR / ".env"


@lru_cache()
def get_config():
    environ.Env.read_env(
        ENV_FILE_PATH
    )  # This will not do anything if the file is not present
    return environ.Env()


env = get_config()
