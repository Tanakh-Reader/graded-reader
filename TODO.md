# TODO

- [ ] Implement state management to only update necessary parts of the UI
    - Use a front-end framework?
        - [Blog](https://vsupalov.com/when-and-why-js-framework-for-django/): "When starting out to transition a site to be more dynamic, most people start out manipulating the DOM manipulations with jQuery or plain JS. This works well for small things in the beginning, *but gets messy with time*. Frontend framework provide more structure than ad-hoc JS or jQuery code snippets, and will help you work on a higher level of abstraction than DOM element manipulation."   
        - See [Vue.js + Django Example](https://vsupalov.com/vue-js-in-django-template/)
        - Start using JQuery?
        - See [Material UI](https://mui.com/) - known for *quick* setup
        - For inline AJAX, checkout [HTMX](https://htmx.org/)
- [ ] Cache page data so that a user can navigate back and see the same state
    - Perhaps use my provider classes. E.g., word_provider.url to check for state change.
    - ```python
        if provider.url and request.GET.text not in ['', provider.url]:
            ...
            provider.current_state = render_to_string('read.html', context)
        return provider.current_state
        ```
    - Include things like the current sort option for passages, etc.

- [ ] Look into [state management](https://www.screamingatmyscreen.com/managing-state-in-django-models/)
