from ..models import Word
from ..providers.book_provider import book_provider


# Takes a request.POST or .GET and returns a reference.
def parse_reference(data_dict: dict):
    reference = []
    params = "bk ch_s vs_s ch_e vs_e".split()

    for param in params:
        data = data_dict.get(param)
        if data:
            reference.append(int(data))
        else:
            reference.append(None)

    return reference


def get_reference_string(words: list[Word], abbreviation=False):
    if not words:
        return "Choose a passage"

    if abbreviation:
        book = book_provider.get_name_osis(words[0].book)
    else:
        book = book_provider.get_name(words[0].book)

    ref_string = f"{book} {words[0].chapter}:{words[0].verse}"
    if words[0].chapter != words[-1].chapter:
        ref_string += f"–{words[-1].chapter}:{words[-1].verse}"
    else:
        ref_string += f"–{words[-1].verse}"

    return ref_string
