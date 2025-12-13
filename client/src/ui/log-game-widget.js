"use strict";

const { precondition } = require('@infrastructure/contract');

module.exports.render = (container, messages) => {
    precondition(container, 'LogGame widget requires a container to render into');
    precondition(messages, 'LogGame widget requires a messages observable');

    const consoleEl = d3.select(container[0])
        .append('div')
        .classed('game-log-console', true);

    messages.subscribe(log => {
        consoleEl.insert('p', '.game-log-message')
            .classed('game-log-message', true)
            .html(log.message())
            .style('opacity', 0)
            .transition()
            .duration(600)
            .style('opacity', 1);
    });
};
