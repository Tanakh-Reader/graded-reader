import logging

from django.contrib.auth import get_user_model
from django.http import HttpRequest


class CustomLogging:
    def __init__(self, name="custom"):
        self.name = name
        self.logger = logging.getLogger(self.name)
        self.extra: dict = {}

    def set_extra(self, extra={}, request=None):
        self.extra = extra
        if request:
            self.get_request_info(request)

    def update_extra(self, extra):
        self.extra.update(extra)

    def get_request_info(self, request: HttpRequest):
        """Adds authenticated user information to the extra dictionary."""
        if request:
            user_info = (
                request.user.log_info()
                if request.user.is_authenticated
                else "Anonymous"
            )
            post_data = request.POST.dict()

            # Remove or obfuscate sensitive data
            post_data = self.sanitize_post_data(post_data)

            self.extra.update(
                {
                    "user": user_info,
                    "request": {
                        "method": request.method,
                        "path": request.path,
                        "resolver": request.resolver_match,
                        "GET": request.GET.dict(),
                        "POST": post_data,
                    },
                }
            )

    def sanitize_post_data(self, post_data):
        """Remove sensitive keys from POST data."""
        sensitive_keys = [
            "password",
            "password1",
            "password2",
        ]  # Add any other sensitive keys here
        for key in sensitive_keys:
            if key in post_data:
                post_data[key] = "*****"  # Obfuscate or remove the sensitive data
        return post_data

    def log(self, level, message, request=None, extra=None, exc_info=None):
        """Enhanced logging method to include exception info."""
        if extra:
            self.extra.update(extra)
        self.get_request_info(request)
        if exc_info:
            getattr(self.logger, level)(message, extra=self.extra, exc_info=exc_info)
        else:
            getattr(self.logger, level)(message, extra=self.extra)

    def debug(self, message, request=None, extra=None):
        self.log("debug", message, request, extra)

    def info(self, message, request=None, extra=None):
        self.log("info", message, request, extra)

    def warning(self, message, request=None, extra=None, exc_info=False):
        self.log("warning", message, request, extra, exc_info)

    def error(self, message, request=None, extra=None, exc_info=False):
        self.log("error", message, request, extra, exc_info)

    def critical(self, message, request=None, extra=None, exc_info=False):
        self.log("critical", message, request, extra, exc_info)
