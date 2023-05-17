

import threading

from ..models import Passage
from .add_passages import add_passages_to_database
from ..data import constants


# A class for providing Passage and Chapter objects.
class PassageProvider:

    passages_loaded = False
    loading_in_progress = False

    def load_passages_if_not_added(self) -> bool:
        if self.passages_loaded:
            return True

        elif Passage.objects.count() >= constants.PASSAGE_COUNT:
            self.passages_loaded = True
            return True

        else:
            if not self.loading_in_progress:
                self.loading_in_progress = True
                add_passages_task = threading.Thread(target=add_passages_to_database)
                add_passages_task.start()
            return False

    def get_all_passages(self, as_json=False):
        passages = Passage.objects.all()
        if as_json:
            return self.__passages_to_json(passages)
        return passages

    def get_passages_by_ids(self, ids, as_json=False):
        ids = [int(id) for id in ids]
        passages = Passage.objects.filter(id__in=ids)
        if as_json:
            return self.__passages_to_json(passages)
        return passages
        
    def delete_all_passages(self):
        Passage.objects.all().delete()
        self.passages_loaded = False
        self.loading_in_progress = False
    
    def __passages_to_json(self, passages: list[Passage]):
        return [passage.to_dict() for passage in passages]
    

passage_provider = PassageProvider()