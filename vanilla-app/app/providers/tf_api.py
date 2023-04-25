from tf.fabric import Fabric
from ..utils.timer import timer

class BHSAProvider:

    path = "../bhsa/tf/2021"
    features = 'sp prs gn nu vt vs prs_ps prs_gn prs_nu gloss freq_lex freq_occ'
    api = None

    def get_api(self):

        if self.api:
            return self.api
    
        print("\nInitializing Text Fabric API")
        timer.start()

        tf = Fabric(locations=self.path)
        self.api = tf.load(features=self.features)
        self.api.makeAvailableIn(locals())

        timer.end()
        print(f"TF API LOADED\n")
        
        return  self.api 

bhsa_provider = BHSAProvider()

