
import * as utils from './utils/utils.js';

const dropdowns = document.querySelectorAll('select');
const definitionDiv = document.querySelector('#definition');

dropdowns.forEach((dropdown) => {
    dropdown.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        const definition = utils.contextToJson(selectedOption.dataset.definition);
        definitionDiv.textContent = JSON.stringify(definition, undefined, 2);
    });
});
