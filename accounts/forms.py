from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, AVATAR_CHOICES


class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)
    display_name = forms.CharField(max_length=60, required=True)
    birth_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))

    class Meta:
        model = User
        fields = ('username', 'email', 'display_name', 'birth_date', 'password1', 'password2')


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('display_name', 'bio', 'avatar_key', 'birth_date', 'is_public', 'daily_goal_xp')
        widgets = {'birth_date': forms.DateInput(attrs={'type': 'date'})}
