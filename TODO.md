# TODO

- [ ] Implement state management to only update necessary parts of the UI
- [ ] Cache page data so that a user can navigate back and see the same state
    - Perhaps use my provider classes. E.g., word_provider.url to check for state change.
    - ```python
        if provider.url and request.GET.text not in ['', provider.url]:
            ...
            provider.current_state = render_to_string('read.html', context)
        return provider.current_state
        ```
    - Include things like the current sort option for passages, etc.