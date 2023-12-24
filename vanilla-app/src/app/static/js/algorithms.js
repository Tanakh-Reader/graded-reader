import * as constants from './utils/constants.js';
import * as utils from './utils/utils.js';
import apis from './utils/api.js';


const dropdowns = $(document).find('.container select').toArray();
const definitionDiv = document.querySelector('#definition');
dropdowns.forEach((dropdown) => {
    dropdown.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        const definition = utils.contextToJson(selectedOption.dataset.definition);
        definitionDiv.textContent = JSON.stringify(definition, undefined, 2);
        const algorithmConfig = utils.contextToJson(selectedOption.dataset.definition);

        // Populate the forms with this data
        populateAlgorithmForm(algorithmConfig)
    });
});
