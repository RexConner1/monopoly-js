"use strict";

const { precondition } = require('@infrastructure/contract');
const { i18n: createI18n } = require('@i18n/i18n');

const i18n = createI18n();

module.exports.render = (container, gameState) => {
    precondition(container, 'Players widget requires a container to render into');
    precondition(gameState, 'Players widget requires an observable of the gameState');

    const panel = d3.select(container[0])
        .append('div')
        .classed('monopoly-players', true);

    gameState.subscribe(renderPlayerPanels(panel));
};


// ------------------------- Rendering Helpers -------------------------

function renderPlayerPanels(container) {
    return state => {
        const panelSelection = container.selectAll('.player-panel')
            .data(state.players(), player => player.id());

        createPlayerPanels(panelSelection);
        updatePlayerPanels(panelSelection, state);
        removeUnneededPlayerPanels(panelSelection);
    };
}

function createPlayerPanels(selection) {
    const panels = selection.enter()
        .append('div')
        .classed('player-panel', true)
        .attr('data-ui', player => player.id());

    createPlayerTokens(panels);

    panels.append('span')
        .classed('player-name', true)
        .text(player => player.name());

    panels.append('span')
        .classed('player-money', true)
        .attr('data-ui', 0);

    panels.append('div')
        .classed('player-properties', true);
}

function removeUnneededPlayerPanels(selection) {
    selection.exit().remove();
}

function createPlayerTokens(panels) {
    const svg = panels.append('svg')
        .attr('width', 12)
        .attr('height', 12)
        .classed('player-panel-token', true);

    svg.append('circle')
        .attr('cx', 6)
        .attr('cy', 6)
        .attr('r', 6)
        .attr('fill', player => player.color());
}


// ------------------------- Updating Panels -------------------------

function updatePlayerPanels(selection, state) {
    // Update money with color-transition
    selection.select('.player-money')
        .attr('data-ui', function (player) {
            const element = d3.select(this);
            const previousMoney = Number(element.attr('data-ui'));

            if (previousMoney > player.money()) {
                element.style('color', 'red');
                element.transition().duration(700).style('color', 'black');
            } else if (previousMoney < player.money()) {
                element.style('color', 'forestgreen');
                element.transition().duration(700).style('color', 'black');
            }
            return player.money();
        })
        .text(player => i18n.formatPrice(player.money()));

    // Update property list
    const propertySelection = selection
        .select('.player-properties')
        .selectAll('.player-property')
        .data(player => player.properties(), property => property.id());

    createPlayerProperties(propertySelection, state);
}

function createPlayerProperties(selection, state) {
    selection.enter()
        .append('div')
        .classed('player-property', true)
        .attr('data-ui', property => property.id())
        .text(property => i18n[`PROPERTY_${property.id().toUpperCase()}`])
        .style('background-color', property => property.group().color());

    selection.order();

    selection.exit().remove();
}
