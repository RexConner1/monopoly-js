"use strict";

const { precondition } = require('@infrastructure/contract');

module.exports.wrap = (container, text, fontSize, y, width) => {
    precondition(container);
    precondition(_.isString(text));
    precondition(_.isNumber(fontSize));
    precondition(_.isNumber(y));
    precondition(_.isNumber(width));

    const textElement = container.append('text')
        .attr({
            x: 0,
            y,
            'font-size': fontSize
        });

    const words = text.split(' ');
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.4; // ems
    const margin = 4;

    let tspan = textElement.append('tspan');

    while (words.length > 0) {
        const word = words[0];
        line.push(word);
        tspan.text(line.join(" "));

        const textLength = tspan.node().getComputedTextLength();

        if (textLength > (width - 2 * margin)) {
            // Remove last word and finalize this line
            line.pop();
            tspan
                .text(line.join(" "))
                .attr("x", (width - tspan.node().getComputedTextLength()) / 2)
                .attr("dy", `${(lineNumber > 0 ? 1 : 0) * lineHeight}em`);

            // Prepare next line
            line = [];
            lineNumber += 1;
            tspan = textElement.append("tspan");
        } else {
            // Word fits, remove it from queue
            words.shift();
        }
    }

    // Render remaining words (final line)
    if (line.length > 0) {
        tspan
            .text(line.join(" "))
            .attr("x", (width - tspan.node().getComputedTextLength()) / 2)
            .attr("dy", `${(lineNumber > 0 ? 1 : 0) * lineHeight}em`);
    }
};
