"use strict";

const BoardWidget = require('@ui/board-widget');
const DiceWidget = require('@ui/dice-widget');
const GameChoicesWidget = require('@ui/game-choices-widget');
const PlayersWidget = require('@ui/players-widget');
const LogGameWidget = require('@ui/log-game-widget');
const TradeWidget = require('@ui/trade-widget');

const { i18n: createI18n } = require('@i18n/i18n');
const { precondition } = require('@infrastructure/contract');

const i18n = createI18n();

module.exports.render = (container, playGameTask) => {
    precondition(container, 'A Monopoly game widget requires a container to render into');
    precondition(playGameTask, 'A Monopoly game widget requires a game task');

    const panel = d3.select(container[0])
        .append('div')
        .classed('monopoly-game', true);

    const centralComponentsContainer = panel.append('div')
        .classed('monopoly-central-components', true);

    // New Game button
    centralComponentsContainer.append('button')
        .attr('id', 'new-game-button')
        .classed({
            'btn': true,
            'btn-default': true
        })
        .text(i18n.BUTTON_NEW_GAME)
        .on('click', () => {
            playGameTask.stop();
        });

    // Core widgets
    GameChoicesWidget.render($(centralComponentsContainer[0]), playGameTask.handleChoicesTask());
    LogGameWidget.render($(centralComponentsContainer[0]), playGameTask.messages());
    BoardWidget.render($(panel[0]), playGameTask.gameState().takeUntil(playGameTask.completed()));
    PlayersWidget.render($(panel[0]), playGameTask.gameState().takeUntil(playGameTask.completed()));

    // Dice Widget when rollDiceTaskCreated fires
    playGameTask.rollDiceTaskCreated().subscribe(task => {
        DiceWidget.render($(centralComponentsContainer[0]), task);
    });

    // Trade Widget when tradeTaskCreated fires
    playGameTask.tradeTaskCreated().subscribe(task => {
        TradeWidget.render($(centralComponentsContainer[0]), task);
    });
};
