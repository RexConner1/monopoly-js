"use strict";

const GameConfigurationWidget = require('@ui/game-configuration-widget');
const MonopolyGameWidget = require('@ui/monopoly-game-widget');
const { precondition } = require('@infrastructure/contract');

module.exports.render = (container, gameTask) => {
    precondition(container, 'A Game widget requires a container to render into');
    precondition(gameTask, 'A Game widget requires a game task');

    gameTask.status().subscribe(status => {
        d3.select(container[0]).selectAll('*').remove();

        status.match({
            configuring: renderGameConfiguration(container),
            playing: renderGame(container)
        });
    });
};

// ---------------- Helper Functions ----------------

function renderGameConfiguration(container) {
    return configureGameTask => {
        GameConfigurationWidget.render(container, configureGameTask);
    };
}

function renderGame(container) {
    return playGameTask => {
        MonopolyGameWidget.render(container, playGameTask);
    };
}
