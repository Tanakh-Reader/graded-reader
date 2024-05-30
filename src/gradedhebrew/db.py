# from .env import env

# # `-pooler`: Adds a pooler flag to the connection string to use a connection pool, increasing your concurrent connection limit. Recommended for serverless and edge environments.
# DATABASE_USER = env("DATABASE_USER", default=None)
# if DATABASE_USER:  # and not env("DEBUG", default=False):
#     DATABASE_HOST = env("DATABASE_HOST", default=None)
#     # if env("VERSION", default="DEV") in ["DEV", "STAGING"]:
#     #     DATABASE_HOST = env("DATABASE_HOST_DEV", default=None)
#     #     DATABASE_USER = env("DATABASE_USER_DEV", default=None)

#     DATABASES = {
#         "default": {
#             "ENGINE": "django.db.backends.postgresql",
#             "NAME": env("DATABASE_NAME", default=None),
#             "USER": DATABASE_USER,
#             "PASSWORD": env("DATABASE_PASSWORD", default=None),
#             "HOST": DATABASE_HOST,
#             "PORT": env("DATABASE_PORT", default=None),
#             "OPTIONS": {"sslmode": "require"},
#         }
#     }
