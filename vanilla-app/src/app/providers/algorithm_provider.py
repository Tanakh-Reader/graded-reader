import datetime
import os

from django.conf import settings
from django.shortcuts import get_object_or_404

from ..data import ranks
from ..models import Algorithm
from ..utils.io import *

DATA_PATH = os.path.join(settings.BASE_DIR, "app/data/algorithms")
ID_FILE = os.path.join(DATA_PATH, "id.txt")


class Algorithm2:
    def __init__(self, id, config):
        self.id = id
        self.configuration = config
        self.created_timestamp = datetime.datetime.now().replace(microsecond=0)
        self.updated_timestamp = datetime.datetime.now()
        self.__update_configuration(init=True)

    def __update_configuration(self, init=False):
        self.name = self.configuration.get("name")
        self.configuration["updated"] = self.updated_timestamp.strftime(
            "%Y-%m-%dT%H:%M:%S"
        )
        if init:
            self.configuration["id"] = self.id
            self.configuration["created"] = self.created_timestamp.strftime(
                "%Y-%m-%dT%H:%M:%S"
            )
        self.__sort_frequencies()

    # For better display on front end.
    def __sort_frequencies(self):
        frequencies = self.configuration.get("data").get("frequencies")
        frequencies = sorted(frequencies, key=lambda frequency: frequency[0])
        self.configuration["data"]["frequencies"] = frequencies

    def update(self, config=None):
        self.configuration = config
        self.updated_timestamp = datetime.datetime.now().replace(microsecond=0)
        self.__update_configuration()

    # Save and return the instance.
    def save(self):
        path = os.path.join(DATA_PATH, str(self.id))
        write_pickle_data(path, self)
        return self


class AlgorithmProvider2:
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
        path = os.path.join(DATA_PATH, str(id))
        algorithm: Algorithm2 = load_pickle_data(path)
        return algorithm

    # Save an algorithm and return the <Algorithm> instance.
    def save_algorithm(self, config):
        id = config.get("id")
        # Update existing algorithm
        if id:
            algorithm = self.get_algorithm_by_id(id)
            algorithm.update(config=config)
            print(config, algorithm.configuration)
            return algorithm.save()
        # Save new algorithm
        else:
            algorithm = Algorithm2(self.get_id(), config)
            return algorithm.save()

    def get_saved_algorithms(self, configs_only=False):
        algorithms: list[Algorithm2] = []
        # Use id file to get all algorithms
        max_id = self.get_id(increment=False)
        for id in range(1, max_id):
            try:
                algorithm = load_pickle_data(os.path.join(DATA_PATH, str(id)))
                algorithms.append(algorithm)
            except:
                pass
        if configs_only:
            return [alg.configuration for alg in algorithms]
        return algorithms

    def get_default_configurations(self, configs_only=True):
        algorithms: list[Algorithm2] = []
        all_ranks = ranks.LexRanks.all_ranks
        for rank in all_ranks:
            config = {"name": rank.name, "frequencies": rank.get_rank_array()}
            # algorithm = Algorithm(None, config)
            # algorithms.append(algorithm)
            algorithms.append(config)
        if configs_only:
            # return [alg.configuration for alg in algorithms]
            return algorithms
        return algorithms

    def get_all_algorithms(self, configs_only=False):
        algorithms: list[Algorithm2] = []
        # Use id file to get all algorithms
        max_id = self.get_id(increment=False)
        for alg in self.get_default_configurations(configs_only=False):
            algorithms.append(alg)
        for id in range(1, max_id):
            try:
                algorithm = load_pickle_data(os.path.join(DATA_PATH, str(id)))
                algorithms.append(algorithm)
            except:
                pass
        if configs_only:
            return [alg.configuration for alg in algorithms]
        return algorithms


class AlgorithmProvider:
    def config_to_algorithm(self, config):
        pass

    def get_all_algorithms(self):
        algorithms = Algorithm.objects.all()
        # if as_json:
        #     return self.__algorithms_to_json(passages)
        return algorithms

    def get_algorithms_by_ids(self, ids, as_json=False):
        ids = [int(id) for id in ids]
        algorithms = Algorithm.objects.filter(id__in=ids)
        return algorithms

    def get_configs(self, ids=None, as_json=False):
        algorithms = None
        if ids:
            algorithms = self.get_algorithms_by_ids(ids)
        else:
            algorithms = self.get_all_algorithms()
        return [a.as_config(as_json) for a in algorithms]

    def delete_algorithm(self, id):
        algorithm = get_object_or_404(Algorithm, pk=id)
        algorithm.delete()
        return algorithm

    def get_default_configurations(self, configs_only=True):
        algorithms = []
        all_ranks = ranks.LexRanks.all_ranks
        for rank in all_ranks:
            config = {"name": rank.name, "frequencies": rank.get_rank_array()}
            algorithms.append(config)
        return algorithms

    def __algorithms_to_json(self, algorithms: list[Algorithm]):
        return []


algorithm_provider = AlgorithmProvider()
