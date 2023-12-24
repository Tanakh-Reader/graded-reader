import * as utils from './utils/utils.js';
import * as constants from './utils/constants.js';
import { COLORS } from './utils/theme.js';


// Get a reference to the dropdown menu
const dropdownMenu = document.getElementById('word-highlights-dropdown-menu');

class Condition {
    constructor({ checkboxId, text, color, conditionFunc, actionFunc }) {
        this.checkboxId = checkboxId;
        this.text = text;
        this.color = color;
        this.conditionFunc = conditionFunc;
        this.actionFunc = actionFunc;
        this.menuItem = null;
    }

    fire() {
        const checkbox = document.getElementById('checkbox-' + this.checkboxId);
        const words = document.querySelectorAll('.word');
        const isChecked = checkbox.checked;

        words.forEach(word => {
            const wordData = utils.contextToJson(word.dataset.dict);

            if (this.conditionFunc(wordData)) {
                this.actionFunc(word, isChecked);
            }
        });
    }

    attach() {
        const checkbox = document.getElementById('checkbox-' + this.checkboxId);
        checkbox.addEventListener('change', (event) => {
            this.fire()
        });
    }

    // Method to check if the condition is met by any word
    isMetByAnyWord(words) {
        for (let word of words) {
            const wordData = utils.contextToJson(word.dataset.dict);
            if (this.conditionFunc(wordData)) {
                return true;
            }
        }
        return false;
    }
}

const conditions = [
    new Condition({
        checkboxId: 'verb-suffix',
        text: "Verb + suffix",
        color: COLORS.LIGHT_CORAL,
        conditionFunc: word => word[constants.W_SPEECH] === 'verb' && has_data(word[constants.W_PRONOMINAL_SUFFIX]),
        // For some reason this wasn't functioning correctly without the timout.
        actionFunc: function (word, isChecked) {
            setTimeout(() => {
                word.style.backgroundColor = isChecked ? this.color : '';
            }, 0);
        }
    }),
    new Condition({
        checkboxId: 'qere',
        text: "Qere / Ketiv",
        color: COLORS.LIGHT_GOLDENROD_YELLOW,
        conditionFunc: word => has_data(word[constants.W_QERE]),
        actionFunc: function (word, isChecked) {
            word.style.backgroundColor = isChecked ? this.color : '';
        }
    }),
    new Condition({
        checkboxId: 'construct-noun',
        text: "Construct noun",
        color: COLORS.LIGHT_SALMON,
        conditionFunc: word => word[constants.W_STATE] === 'c',
        actionFunc: function (word, isChecked) {
            word.style.backgroundColor = isChecked ? this.color : '';
        }
    }),
    new Condition({
        checkboxId: '1',
        text: "Placeholder",
        color: COLORS.PALE_GREEN,
        conditionFunc: word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        actionFunc: function (word, isChecked) {
            word.style.backgroundColor = isChecked ? this.color : '';
        }
    }),
    new Condition({
        checkboxId: '2',
        text: "Placeholder",
        color: COLORS.POWDER_BLUE,
        conditionFunc: word => word[constants.W_SPEECH] === 'verb' && word[constants.W_SUFFIX_PERSON] !== null,
        actionFunc: function (word, isChecked) {
            word.style.backgroundColor = isChecked ? this.color : '';
        }
    }),
];

function has_data(data) {
    return !["", null].includes(data);
}

function refreshDropdown() {
    // Get all the words
    const words = document.querySelectorAll('.word');

    // Update the visibility of the dropdown items
    conditions.forEach(condition => {
        // Check if the condition is met by any word
        if (condition.isMetByAnyWord(Array.from(words))) {
            condition.menuItem.style.display = 'block';
        } else {
            condition.menuItem.style.display = 'none';
        }
    });

    // Run all conditions
    // conditions.forEach(condition => condition.fire());
}


// Populate the dropdown items
conditions.forEach(condition => {
    // Only add items from the current page.
    const listItem = document.createElement('li');
    listItem.className = 'rounded py-2 px-4 block whitespace-no-wrap text-sm';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `checkbox-${condition.checkboxId}`;
    checkbox.className = 'mr-2';

    listItem.appendChild(checkbox);
    listItem.appendChild(document.createTextNode(condition.text));

    listItem.style.background = condition.color;
    listItem.style.display = 'none'; // initially hidden
    condition.menuItem = listItem; // attach the reference to the Condition object

    dropdownMenu.appendChild(listItem);
    condition.attach();
});

// Prevent the box from closing when checkbox is clicked
dropdownMenu.addEventListener('click', function (event) {
    event.stopPropagation();
});

// Add event listener to dropdown
document.getElementById('word-highlights-dropdown').addEventListener('click', function () {
    dropdownMenu.classList.toggle('hidden');
});

refreshDropdown();

utils.subscribe(constants.TEXT_LOADED_EVENT, () => {
    refreshDropdown();
    conditions.forEach(condition => condition.fire());
});