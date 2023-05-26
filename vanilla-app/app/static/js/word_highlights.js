import * as utils from './utils/utils.js';
import * as constants from './utils/constants.js';

class Condition {
    constructor(checkboxId, text, conditionFunc, actionFunc) {
        this.checkboxId = checkboxId;
        this.text = text;
        this.conditionFunc = conditionFunc;
        this.actionFunc = actionFunc;
    }

    attach() {
        const checkbox = document.getElementById('checkbox-' + this.checkboxId);
        checkbox.addEventListener('change', (event) => {
            const words = document.querySelectorAll('.word');
            const isChecked = checkbox.checked;

            words.forEach(word => {
                const wordData = utils.contextToJson(word.dataset.dict);

                if (this.conditionFunc(wordData)) {
                    this.actionFunc(word, isChecked);
                }
            });
        });
    }
}

const conditions = [
    new Condition(
        'verb-suffix',
        "Verb + suffix",
        word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        (word, isChecked) => {
            word.style.backgroundColor = isChecked ? 'yellow' : '';
        }
    ),
    new Condition(
        'qere',
        "Qere",
        word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        (word, isChecked) => {
            word.style.backgroundColor = isChecked ? 'yellow' : '';
        }
    ),
    new Condition(
        'construct-noun',
        "Construct noun",
        word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        (word, isChecked) => {
            word.style.backgroundColor = isChecked ? 'yellow' : '';
        }
    ),
    new Condition(
        '1',
        "Qere",
        word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        (word, isChecked) => {
            word.style.backgroundColor = isChecked ? 'yellow' : '';
        }
    ),
    new Condition(
        '2',
        "Construct noun",
        word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        (word, isChecked) => {
            word.style.backgroundColor = isChecked ? 'yellow' : '';
        }
    ),
];


// Get a reference to the dropdown menu
const dropdownMenu = document.getElementById('word-highlights-dropdown-menu');

// Populate the dropdown items
conditions.forEach(condition => {
    const listItem = document.createElement('li');
    listItem.className = 'rounded py-2 px-4 block whitespace-no-wrap text-sm';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `checkbox-${condition.checkboxId}`;
    checkbox.className = 'mr-2';

    listItem.appendChild(checkbox);
    listItem.appendChild(document.createTextNode(condition.text));

    dropdownMenu.appendChild(listItem);
    condition.attach()
});

// Add event listener to dropdown
dropdownMenu.addEventListener('click', function (event) {
    event.stopPropagation();
});

// Add event listener to dropdown
document.getElementById('word-highlights-dropdown').addEventListener('click', function () {
    dropdownMenu.classList.toggle('hidden');
});