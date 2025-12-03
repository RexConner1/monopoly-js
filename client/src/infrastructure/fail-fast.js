"use strict";

const crashOnUnhandledException = () => {
    // Fail-fast if an unhandled exception occurs
    window.onerror = (message, file, line, column, error) => {
        const stackTrace = error && error.stack;
        showError(message, stackTrace);
    };
};

const crashOnResourceLoadingError = () => {
    const useCapturingEvent = true;

    // Fail-fast if an external resource fails to load
    document.addEventListener(
        "error",
        function (event) {
            // Avoid optional chaining — use defensive checks instead
            const el = event.srcElement || event.target;
            const failedUrl = el && el.src;
            const context =
                el && el.parentNode ? el.parentNode.outerHTML : "";

            showError(
                "Failed to load resource at url: " + failedUrl,
                context
            );
        },
        useCapturingEvent
    );
};

function showError(message, stackTrace) {
    if (window.isDisplayingError) return;

    $(document.body).html(
        '<h1 style="color: red; padding: 20px 40px; margin:0">The application crashed</h1>' +
        '<p style="padding:5px 40px;"><strong>' + message + '</strong></p>'
    );

    if (stackTrace) {
        var stackContainer =
            $('<pre style="padding:20px 20px; margin:0 40px"></pre>');
        $(document.body).append(stackContainer);
        stackContainer.text(stackTrace);
    }

    $(document.body).append(
        '<p style="padding:20px 40px;">' +
        '   <a href="javascript:location.reload();">Refresh the page to continue</a>' +
        '</p>'
    );

    window.isDisplayingError = true;
}

module.exports = {
    crashOnUnhandledException,
    crashOnResourceLoadingError
};
