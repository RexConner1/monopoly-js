"use strict";

const { i18n: createI18n } = require('@i18n/i18n');
const { precondition } = require('@infrastructure/contract');

const i18n = createI18n();

module.exports.render = (container, tradeTask) => {
    precondition(container, 'A TradeWidget requires a container to render into');
    precondition(tradeTask, 'A Tradewidget requires a TradeTask');

    const dialog = renderDialog(container[0], tradeTask);

    // Remove dialog when offer is completed
    tradeTask.offer().subscribeOnCompleted(() => {
        dialog.remove();
    });

    // Bootstrap modal configuration
    $(dialog[0]).modal({
        backdrop: 'static',
        keyboard: false
    });

    $(dialog[0]).modal('show');
};


// ------------------------------------------------------------
// Render Dialog
// ------------------------------------------------------------

function renderDialog(container, tradeTask) {
    const dialog = d3.select(container)
        .append('div')
        .attr({
            tabindex: '-1',
            role: 'dialog'
        })
        .classed({
            modal: true,
            fade: true,
            'monopoly-trade-panel': true
        });

    const dialogContent = dialog.append('div')
        .attr('role', 'document')
        .classed('modal-dialog', true)
        .append('div')
        .classed('modal-content', true);

    dialogContent.append('div')
        .classed('modal-header', true)
        .append('h4')
        .attr('id', 'trade-title')
        .classed('modal-title', true)
        .text(i18n.TRADE_TITLE);

    const modalBody = dialogContent.append('div')
        .classed('modal-body', true);

    renderPlayerPanel(modalBody, tradeTask.currentPlayer(), tradeTask, 0);
    renderPlayerPanel(modalBody, tradeTask.otherPlayer(), tradeTask, 1);

    modalBody.append('div').classed('clearfix', true);

    const modalFooter = dialogContent.append('div')
        .classed('modal-footer', true);

    renderCancelTradeButton(modalFooter, tradeTask);
    renderMakeOfferButton(modalFooter, tradeTask);

    return dialog;
}


// ------------------------------------------------------------
// Footer Buttons
// ------------------------------------------------------------

function renderCancelTradeButton(container, tradeTask) {
    container.append('button')
        .attr({
            type: 'button',
            'data-dismiss': 'modal',
            'data-ui': 'cancel-trade-btn'
        })
        .classed({
            btn: true,
            'btn-default': true
        })
        .text(i18n.TRADE_CANCEL)
        .on('click', () => tradeTask.cancel());
}

function renderMakeOfferButton(container, tradeTask) {
    const makeOfferBtn = container.append('button')
        .attr({
            type: 'button',
            'data-dismiss': 'modal',
            'data-ui': 'make-offer-btn'
        })
        .classed({
            btn: true,
            'btn-primary': true
        })
        .text(i18n.TRADE_MAKE_OFFER)
        .on('click', () => tradeTask.makeOffer());

    tradeTask.offer()
        .map(offer => offer.isValid())
        .subscribe(valid => {
            makeOfferBtn.attr('disabled', valid ? null : 'disabled');
        });
}


// ------------------------------------------------------------
// Player Panels
// ------------------------------------------------------------

function renderPlayerPanel(container, player, tradeTask, playerIndex) {
    const panel = container.append('div')
        .classed('monopoly-trade-player-panel', true)
        .attr('data-ui', player.id());

    panel.append('span')
        .classed('monopoly-trade-player-name', true)
        .text(player.name());

    const list = panel.append('div')
        .classed('monopoly-trade-player-properties', true);

    // Update properties when offer changes
    tradeTask.offer()
        .map(offer => offer.propertiesFor(playerIndex))
        .distinctUntilChanged()
        .subscribe(selectedProperties => {
            const items = list
                .selectAll('.monopoly-trade-player-property')
                .data(player.properties());

            // Enter
            items.enter()
                .append('button')
                .classed('monopoly-trade-player-property', true)
                .text(property => i18n[`PROPERTY_${property.id().toUpperCase()}`])
                .style('background-color', property => property.group().color())
                .on('click', (property) => {
                    // The comment from original code remains:
                    // "But not this ???"
                    tradeTask.togglePropertyOfferedByPlayer(property.id(), playerIndex);
                });

            // Update selected state
            items.classed(
                'monopoly-trade-player-property-selected',
                property => {
                    const ids = _.map(selectedProperties, p => p.id());
                    return _.contains(ids, property.id());
                }
            );
        });

    // Money spinner
    panel.append('input')
        .attr('type', 'text')
        .classed('monopoly-trade-player-money-spinner', true)
        .each(function () {
            $(this)
                .spinner({
                    min: 0,
                    max: player.money(),
                    step: 1,
                    change: onMoneySpinnerChange(tradeTask, playerIndex),
                    stop: onMoneySpinnerChange(tradeTask, playerIndex)
                })
                .val(0)
                .on('input', function () {
                    if ($(this).data('onInputPrevented')) return;

                    let val = this.value;
                    const $this = $(this);
                    const max = $this.spinner('option', 'max');
                    const min = $this.spinner('option', 'min');

                    // Only numeric allowed
                    if (!val.match(/^[+-]?\d*$/)) {
                        val = $(this).data('defaultValue');
                    }

                    this.value = val > max ? max : val < min ? min : val;
                })
                .on('keydown', function (e) {
                    if (!$(this).data('defaultValue')) {
                        $(this).data('defaultValue', this.value);
                    }
                    $(this).data('onInputPrevented', e.which === 8);
                });
        });

    panel.append('span')
        .classed('monopoly-trade-player-money-total', true)
        .text(`/ ${i18n.formatPrice(player.money())}`);
}


// ------------------------------------------------------------
// Money Spinner Callback
// ------------------------------------------------------------

function onMoneySpinnerChange(task, playerIndex) {
    return (event, ui) => {
        task.setMoneyOfferedByPlayer(
            $(event.target).spinner('value'),
            playerIndex
        );
    };
}
