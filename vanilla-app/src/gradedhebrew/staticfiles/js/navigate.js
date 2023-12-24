// You can use JavaScript to control the navigation and prevent full page reloads when going back to the read page. You can achieve this using the History API to manipulate the browser's history and control the page content without triggering a full page reload.

// In your base layout file, wrap your page content in a div with the id content:

//     < !--app / layout.html-- >
//     {% block content %}
// <div id="content">
//     <!-- Your page content goes here -->
// </div>
// {% endblock %}

// This approach uses JavaScript to intercept internal link clicks and update the page content without triggering a full page reload.When the user goes back to the read page, the content will be preserved, and there will be no need to query the database again.Only when the user clicks on a new passage or reference will the content be updated.






// This function will be responsible for updating the page content
function loadPageContent(url) {
    // Fetch the new content from the server using the Fetch API
    fetch(url)
        .then((response) => response.text())
        .then((html) => {
            // Replace the current page content with the new content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('#content');
            const currentContent = document.querySelector('#content');
            currentContent.replaceWith(newContent);
        })
        .catch((error) => {
            console.error('Error fetching page content:', error);
        });
}

// This function will handle internal link clicks
function onLinkClick(event) {
    event.preventDefault();
    const link = event.target.closest('a');
    if (!link) return;

    const url = link.href;

    // Update the browser's history
    history.pushState(null, '', url);

    // Update the page content without a full page reload
    loadPageContent(url);
}

// Listen for the 'popstate' event to handle browser's back/forward navigation
window.addEventListener('popstate', (event) => {
    loadPageContent(window.location.href);
});

// Delegate link clicks to the onLinkClick function
document.body.addEventListener('click', onLinkClick);
