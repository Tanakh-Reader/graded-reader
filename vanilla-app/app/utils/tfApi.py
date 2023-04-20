from tf.fabric import Fabric

path = "../bhsa/tf/2021"
features = 'sp prs gn nu vt vs prs_ps prs_gn prs_nu gloss freq_lex freq_occ'

TF = Fabric(locations=path)
API = TF.load(features=features)
API.makeAvailableIn(locals())

print(f"\n\nTF API LOADED\n\n")


