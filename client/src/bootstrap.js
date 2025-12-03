"use strict";

const GameTask = require('@app/game-task');
const GameWidget = require('@ui/game-widget');

const failFast = require('@infrastructure/fail-fast');

// Crash app on unexpected errors
failFast.crashOnUnhandledException();
failFast.crashOnResourceLoadingError();

// Run when DOM is ready
$(startApplication);

function startApplication() {
    const container = $('.game-container');

    const task = GameTask.start();
    GameWidget.render(container, task);
}
