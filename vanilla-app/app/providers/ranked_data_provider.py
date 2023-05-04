import pickle


with open('filename.pickle', 'wb') as handle:
    pickle.dump(a, handle, protocol=pickle.HIGHEST_PROTOCOL)

with open('filename.pickle', 'rb') as handle:
    b = pickle.load(handle)



class RankedDataProvider:


    


    def write_data(self, filename, data):
        with open(f'{filename}.pickle', 'wb') as handle:
            pickle.dump(data, handle, protocol=pickle.HIGHEST_PROTOCOL)

    def load_data(self, filename):
        with open(f'{filename}.pickle', 'rb') as handle:
            data = pickle.load(handle)
            return data
