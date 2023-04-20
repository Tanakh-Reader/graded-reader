from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions
from rest_framework.renderers import JSONRenderer

from utils.c import add_words_to_database


class GreetingApi(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    renderer_classes = [JSONRenderer]
    words = add_words_to_database()
    response = [vars(word) for word in words]
    def get(self, request, format=None):
        return Response(response)