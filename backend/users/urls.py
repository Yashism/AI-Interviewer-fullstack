from django.urls import path
from .interview_views import analyze_interview

urlpatterns = [
    path('analyze-interview/', analyze_interview, name='analyze_interview'),
]
