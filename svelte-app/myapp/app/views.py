from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin


class AppView(LoginRequiredMixin, TemplateView):
    template_name = "app/index.html"