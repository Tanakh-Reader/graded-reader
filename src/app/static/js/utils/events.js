// Create and dispatch a custom event
export function publish(eventName, detail) {
    const event = new CustomEvent(eventName, { detail: detail });
    document.dispatchEvent(event);
}

// Subscribe to a custom event
export function subscribe(eventName, callback) {
    document.addEventListener(eventName, callback);
}

export function addListeners(eventNames, callback) {
    eventNames.forEach(eventName => {
        subscribe(eventName, callback);
    });
}

// PUBLISH & SUBSCRIBE EVENTS
// ----------------------------------------------------------------

export const TEXT_FETCHED_COMPLETED_EVENT = "textFetchedComplete";
export const PASSAGE_WIDGET_ADDED_EVENT = "passageWidgetAdded";
export const TEXT_SUBMITTED_BY_PASSAGE_SELECTOR_EVENT = "textSubmittedByPassageSelector";
export const PASSAGE_LISTS_TEXT_COMPARISON_EVENT = "passageListsTextComparison";
export const PASSAGE_LISTS_PENALTY_COMPARISON_EVENT = "passageListsPenaltyComparison";
export const ALG_FORM_LOADED_EVENT = "algorithmFormLoaded";
export const ALG_FORM_SUBMITTED_EVENT = "algorithmFormSubmitted";