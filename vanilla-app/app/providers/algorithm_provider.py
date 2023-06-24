
import os
import time
from ..utils.io import *
from ..data import ranks
from django.conf import settings

DATA_PATH = os.path.join(settings.BASE_DIR, "app/data/algorithms")
ID_FILE = os.path.join(DATA_PATH, 'id.txt')

class Algorithm:

    def __init__(self, id, config):
        self.id = id
        self.configuration = config
        self.created_timestamp = time.time()
        self.updated_timestamp = time.time()
        self.__update_configuration(init=True)
    
    def __update_configuration(self, init=False):
        self.name = self.configuration.get('name')
        self.configuration['updated'] = self.updated_timestamp
        if init:
            self.configuration['id'] = self.id
            self.configuration['created'] = self.created_timestamp
            
    def update(self, config=None):
        self.updated_timestamp = time.time()
        self.__update_configuration()
    
    def save(self):
        path = os.path.join(DATA_PATH, str(self.id))
        write_pickle_data(path, self)



class AlgorithmProvider:
    
    def config_to_algorithm(self, config):
        pass

    # Increment the id and return it.
    def get_id(self, increment=True):
        with open(ID_FILE, "r+") as f:
            id = int(f.read())
            if increment:
                f.seek(0)
                f.write(str(id + 1))
            return id
    
    def get_algorithm_by_id(self, id):
        path = os.path.join(DATA_PATH, id)
        algorithm: Algorithm = load_pickle_data(path)
        return algorithm

    def save_algorithm(self, config):
        id = config.get('id')
        # Update existing algorithm
        if id:
            algorithm = self.get_algorithm_by_id(id)
            algorithm.update(config=config)
            algorithm.save()
        # Save new algorithm
        else:
            algorithm = Algorithm(self.get_id(), config)
            algorithm.save()

    def get_all_algorithms(self, configs_only=False):
        files = os.listdir(DATA_PATH)
        algorithms: list[Algorithm] = []
        # Use id file to get all algorithms
        max_id = self.get_id(increment=False)
        for id in range(1, max_id):
            try:
                algorithm = load_pickle_data( os.path.join(DATA_PATH, str(id)) )
                algorithms.append(algorithm)
            except:
                pass
        if configs_only:
            return [alg.configuration for alg in algorithms]
        return algorithms
    
    def get_default_configurations(self):
        configurations = []
        all_ranks = ranks.LexRanks.all_ranks
        for rank in all_ranks:
            config = {
                'name': rank.name,
                'data': {
                    'frequencies': rank.get_rank_array()
                }
            }
            configurations.append(config)
        return configurations
    

    
algorithm_provider = AlgorithmProvider()