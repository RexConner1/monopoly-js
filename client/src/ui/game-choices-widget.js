"use strict";

const precondition = require("@infrastructure/contract").precondition;

module.exports = {
    render
};

function render(container, handleChoicesTask) {
    precondition(container, "The game choices widget requires a container to render into");
    precondition(handleChoicesTask, "The game choices widget requires a HandleChoicesTask");

    const choicesContainer = d3
        .select(container[0])
        .append("div")
        .classed("monopoly-game-choices", true);

    handleChoicesTask.choices().subscribe(choices => {
        renderChoices(choicesContainer, handleChoicesTask, choices);
    });
}

function renderChoices(choicesContainer, handleChoicesTask, choices) {
    const choiceButtons = choicesContainer
        .selectAll(".monopoly-game-choices-item")
        .data(choices);

    // ENTER
    choiceButtons
        .enter()
        .append("button")
        .classed("monopoly-game-choices-item", true)
        .attr("data-id", choice => choice.id)
        .text(choice => choice.name)
        .on("click", choice => {
            handleChoicesTask.makeChoice(choice);
        });

    // EXIT
    choiceButtons.exit().remove();
}
