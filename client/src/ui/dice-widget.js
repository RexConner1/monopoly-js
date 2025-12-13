"use strict";

const precondition = require("@infrastructure/contract").precondition;

module.exports = {
    render
};

function render(container, rollDiceTask) {
    precondition(container, "Dice Widget requires a container to render into");
    precondition(rollDiceTask, "Dice Widget requires a RollDiceTask");

    const diceContainer = d3
        .select(container[0])
        .append("div")
        .classed("dice-container", true);

    rollDiceTask.diceRolled().subscribe(
        function (dice) {
            const diceSelection = diceContainer.selectAll(".die").data(dice);

            // Enter
            const enteringDice = diceSelection
                .enter()
                .append("div")
                .classed("die", true)
                .append("svg");

            enteringDice
                .attr("width", 60)
                .attr("height", 60);

            // Update
            diceSelection
                .select("svg")
                .html(die => dieRepresentation(die));
        },
        _.noop,
        function () {
            diceContainer.remove();
        }
    );
}

/**
 * Returns the SVG-based pip layout for a die value.
 */
function dieRepresentation(value) {
    switch (value) {
        case 6:
            return (
                dot(15, 15) + dot(30, 15) + dot(45, 15) +
                dot(15, 45) + dot(30, 45) + dot(45, 45)
            );

        case 5:
            return (
                dot(15, 15) + dot(45, 15) + dot(30, 30) +
                dot(15, 45) + dot(45, 45)
            );

        case 4:
            return (
                dot(20, 20) + dot(40, 20) +
                dot(20, 40) + dot(40, 40)
            );

        case 3:
            return dot(15, 30) + dot(30, 30) + dot(45, 30);

        case 2:
            return dot(20, 30) + dot(40, 30);

        default:
            return dot(30, 30);
    }
}

/**
 * Returns a single SVG circle for a die pip.
 */
function dot(x, y) {
    return `<circle fill="black" r="5" cx="${x}" cy="${y}" />`;
}
