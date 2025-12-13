"use strict";

const { i18n: createI18n } = require('@i18n/i18n');
const { precondition } = require('@infrastructure/contract');
const Popup = require('@ui/popup');

const i18n = createI18n();

module.exports.render = (container, configureGameTask) => {
    precondition(container, 'Game configuration widget requires container to render into');
    precondition(configureGameTask, 'Game configuration widget requires a ConfigureGameTask');

    const panel = d3.select(container[0])
        .append('div')
        .classed('monopoly-game-configuration', true);

    panel.append('h1').text(i18n.CONFIGURE_GAME_TITLE);

    const slotsContainer = panel.append('div').classed('player-slots', true);
    const activeSlotsContainer = slotsContainer.append('div')
        .classed('active-player-slots', true);

    const emptyBlock = slotsContainer.append('div')
        .classed({
            'player-slot': true,
            'empty-slot': true
        });

    const emptyBlockButton = emptyBlock.append('button')
        .classed('empty-slot-btn', true)
        .text(i18n.BUTTON_ADD_PLAYER);

    emptyBlockButton.on('click', () => {
        const position = firstPlayerTypeOverEmptyBlock(emptyBlockButton, configureGameTask);
        const popup = Popup.render($(document.body), position);
        renderPlayerTypesList(popup, configureGameTask);
    });

    configureGameTask.canAddPlayerSlot()
        .subscribe(canAdd => {
            emptyBlock.style('display', canAdd ? null : 'none');
        });

    configureGameTask.playerSlots()
        .subscribe(slots => {
            const slotsSelection = activeSlotsContainer
                .selectAll('.player-slot')
                .data(slots);

            createNewSlots(slotsSelection, configureGameTask);
            updateSlots(slotsSelection);
            removeUnneededSlots(slotsSelection);
        });

    const startButton = panel.append('button')
        .classed({
            'btn-start-game': true,
            'btn': true,
            'btn-default': true
        })
        .text(i18n.BUTTON_START_GAME)
        .on('click', () => {
            configureGameTask.startGame();
        });

    configureGameTask.configurationValid()
        .subscribe(valid => {
            startButton.attr('disabled', valid ? null : 'disabled');
        });
};


// ---------- Helper Functions ----------

function firstPlayerTypeOverEmptyBlock(emptyBlockButton, configureGameTask) {
    const buttonRectangle = emptyBlockButton.node().getBoundingClientRect();

    const availableTypes = configureGameTask.availablePlayerTypes();
    const totalChoiceHeight = totalPlayerTypesHeight(availableTypes);
    const popupHeaderHeight = 60;

    return {
        top: `${buttonRectangle.top - 60}px`,
        left: `${buttonRectangle.left + 25}px`,
        width: "250px",
        height: `${totalChoiceHeight + popupHeaderHeight}px`
    };
}

function totalPlayerTypesHeight(types) {
    const lineHeight = 32;
    const maxChars = 22;

    return types
        .map(type => {
            const lines = Math.ceil(type.length / maxChars);
            return lines * lineHeight;
        })
        .reduce((a, b) => a + b, 0);
}

function renderPlayerTypesList(popup, configureGameTask) {
    const allTypes = configureGameTask.availablePlayerTypes();

    const typeItems = d3.select(popup.contentContainer()[0])
        .append("ul")
        .attr("data-ui", "available-types")
        .classed("choice-list", true)
        .selectAll("li")
        .data(allTypes);

    const typeButtons = typeItems.enter()
        .append("li")
        .append("button")
        .classed("choice-btn", true)
        .attr("data-ui", "available-type-choice")
        .attr("data-id", type => type)
        .on("click", type => {
            configureGameTask.addPlayerSlot(type);
            popup.close();
        });

    typeButtons.append("span")
        .classed("choice-label", true)
        .text(type =>
            type === "human" ? i18n.PLAYER_TYPE_HUMAN : i18n.PLAYER_TYPE_COMPUTER
        );
}

function createNewSlots(selection, configureGameTask) {
    const newSlot = selection.enter()
        .append("div")
        .classed("player-slot", true);

    newSlot.append("div")
        .classed("player-type-label", true);

    newSlot.append("div")
        .classed("remove-player-slot-btn", true)
        .on("click", (_, index) => configureGameTask.removePlayerSlot(index))
        .append("span")
        .classed({
            "glyphicon": true,
            "glyphicon-minus-sign": true
        });
}

function updateSlots(selection) {
    selection.select(".player-type-label")
        .text(slot =>
            slot.type === "human" ? i18n.PLAYER_TYPE_HUMAN : i18n.PLAYER_TYPE_COMPUTER
        );

    selection.select(".remove-player-slot-btn")
        .attr("data-index", (_, index) => index);
}

function removeUnneededSlots(selection) {
    selection.exit().remove();
}
