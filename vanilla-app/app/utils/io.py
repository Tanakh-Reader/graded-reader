import pickle

def write_pickle_data(filename, data):
        with open(f'{filename}.pkl', 'wb') as handle:
            pickle.dump(data, handle, protocol=pickle.HIGHEST_PROTOCOL)

def load_pickle_data(filename):
    with open(f'{filename}.pkl', 'rb') as handle:
        data = pickle.load(handle)
        return data