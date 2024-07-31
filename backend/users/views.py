import jwt
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.providers.oauth2.client import OAuth2Error
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings


class CustomGoogleOAuth2Adapter(GoogleOAuth2Adapter):
    def complete_login(self, request, app, token, response, **kwargs):
        print("------running-adaptor------")
        try:
            
            token =None
            """ 
                an issue caused the response to have the id_token nested in the format of {"id_token":{"id_token":"token"}}
                which was later fixed to give single level dict
                to handle both case using the following conditional 
            """

            if "id_token" in response and isinstance(response["id_token"], dict) and "id_token" in response["id_token"]:
                # handles nested id_token in the form of {"id_token":{"id_token":"token"}}
                token = response["id_token"]["id_token"]

            if "id_token" in response and not isinstance(response["id_token"], dict):
                # handles {"id_token":"token"}
                token = response["id_token"]
            print("token is ",token)
            print(response)
            identity_data = jwt.decode(
                token,  
                options={
                    "verify_signature": False,
                    "verify_iss": True,
                    "verify_aud": True,
                    "verify_exp": True,
                },
                issuer=self.id_token_issuer,
                audience=app.client_id,
            )
        except jwt.PyJWTError as e:
            raise OAuth2Error("Invalid id_token") from e
        login = self.get_provider().sociallogin_from_response(request, identity_data)
        print(login)
        return login


class GoogleLogin(SocialLoginView):
    adapter_class = CustomGoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.GOOGLE_CALLBACK_URL


    def process_login(self):
        """
            fcm_data = {
            "user_id": self.user.id,
            "fcm_token": self.request.data.get("fcm_token"),
            "fcm_type": self.request.data.get("fcm_type"),
        }
        
        """



        # create_fcm_device(fcm_data)
        super().process_login()
