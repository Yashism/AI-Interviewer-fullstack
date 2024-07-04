from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth.models import Group


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        """
        add group and set active status of user after account creating using social account
        """

        print("---- adapter is running --------")
        user = super().save_user(request, sociallogin, form)

        group, _ = Group.objects.get_or_create(name="Customer")
        
        if not user.is_active:
            user.is_active = True
            user.groups.add(group)
            user.account_provider = sociallogin.account.provider
            user.save()
        
        return user
