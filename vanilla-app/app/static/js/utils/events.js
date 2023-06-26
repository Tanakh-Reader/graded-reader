// Create and dispatch a custom event
export function publish(eventName, detail) {
    const event = new CustomEvent(eventName, { detail: detail });
    document.dispatchEvent(event);
}

// Subscribe to a custom event
export function subscribe(eventName, callback) {
    document.addEventListener(eventName, callback);
}

