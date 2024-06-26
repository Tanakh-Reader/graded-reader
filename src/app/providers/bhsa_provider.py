import os

from django.conf import settings
from tf.core.api import Api, Locality, NodeFeatures, Text
from tf.fabric import Fabric

# from tf.core.nodefeature import NodeFeature
from ..data import constants
from ..utils.timer import timer

ROOT_DIR = settings.BASE_DIR.parent


# Wrapper class for defining static data types
class HebrewApi:
    def __init__(self, api: Api):
        self.T: Text = api.T
        self.L: Locality = api.L
        self.F: NodeFeatures = api.F


class BHSAProvider:
    path = os.path.join(ROOT_DIR, "bhsa/tf/2021")
    api: Api = None

    def get_api(self) -> Api:
        if self.api:
            return self.api

        print("\nInitializing Text Fabric API")
        timer.start()

        tf = Fabric(locations=self.path)
        self.api = tf.load(features=constants.BHSA_FEATURES, add=False)
        self.api.makeAvailableIn(locals())

        timer.end()
        print(f"TF API LOADED\n")

        return self.api

    def api_globals(self) -> tuple[Text, Locality, NodeFeatures]:
        api = self.get_api()
        return api.T, api.L, api.F


bhsa_provider = BHSAProvider()
T, L, F = bhsa_provider.api_globals()

# TODO: error using TF on the web
# 2023-04-26 17:35:50   0.00s Not all of the warp features otype and oslots are present in#012/home/bhsa/tf/2021
# 2023-04-26 17:35:50   0.00s Only the Feature and Edge APIs will be enabled
# 2023-04-26 17:35:50   0.00s Warp feature "otext" not found. Working without Text-API
# 2023-04-26 17:35:50 [2023-04-26 17:35:50,100][   ERROR][            root]@[  170]$   0.00s Feature "freq_lex" not available in
# 2023-04-26 17:35:50 [2023-04-26 17:35:50,101][   ERROR][            root]@[  170]$ /home/bhsa/tf/2021
# 2023-04-26 17:35:50 [2023-04-26 17:35:50,101][   ERROR][            root]@[  170]$   0.00s Not all features could be loaded/computed
# 2023-04-26 17:35:50 [2023-04-26 17:35:50,102][   ERROR][            root]@[  170]$ Exception in thread Thread-1 (add_passages_to_database):
# 2023-04-26 17:35:50 [2023-04-26 17:35:50,102][   ERROR][            root]@[  170]$ Traceback (most recent call last):
# 2023-04-26 17:35:50 [2023-04-26 17:35:50,102][   ERROR][            root]@[  170]$   File "/usr/local/lib/python3.10/threading.py", line 1016, in _bootstrap_inner
