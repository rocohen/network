from django import forms
from django.forms import TextInput, Textarea, FileInput
from .models import Post, Profile

class ProfileSettingsForm(forms.ModelForm):

    class Meta:
      model = Profile
      fields = ('image', 'biography', 'location', 'website')
      labels = {
        'image': 'Image',
        'biography': 'Biography',
        'location': 'Location',
        'website': 'Website'
      }
      widgets = {
        'image': FileInput(attrs={'class': 'form-control-file mb-3'}),
        'biography': TextInput(attrs={'class': 'form-control mb-3'}),
        'location': TextInput(attrs={'class': 'form-control mb-3'}),
        'website': TextInput(attrs={'class': 'form-control mb-3'})
      }

class PostForm(forms.ModelForm):

  class Meta:
    model = Post
    fields = ('body',)
    labels = {
      'body': '',
    }
    widgets = {
      'body': Textarea(attrs={'class': 'form-control', 'id': 'new-post', 'cols': '95', 'rows': '4', 'placeholder': 'What\'s happening?' })
    }
