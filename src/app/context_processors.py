import yaml
from django.conf import settings


def site_data(request):
    # data_file = f"{settings.BASE_DIR}/utils/constants/site_content.yml"
    # with open(data_file, "r") as file:
    #     data = yaml.load(file, Loader=yaml.FullLoader)
    return {
        # "data": data,
        "GA_KEY": settings.GOOGLE_ANALYTICS_KEY,
        # "SECRET_PASSWORD": settings.SECRET_PASSWORD,
        # "GM_KEY": settings.GOOGLE_MAPS_KEY,
    }
