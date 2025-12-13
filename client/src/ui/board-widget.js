"use strict";

const precondition = require("@infrastructure/contract").precondition;
const i18n = require("@i18n/i18n").i18n();

const Symbols = require("@ui/symbols");
const TextWrapper = require("@ui/text-wrapper");

const SQUARE_WIDTH = 78;
const SQUARE_HEIGHT = 100;
const SQUARES_PER_ROW = 10;

module.exports = {
    render
};

function render(container, gameState) {
    precondition(container, "A Board Widget requires a container to render into");
    precondition(gameState, "A Board Widget requires an observable of the gameState");

    const board = renderBoard(container);
    gameState.subscribe(renderSquares(board));
}

function renderBoard(container) {
    const svg = d3
        .select(container[0])
        .append("svg")
        .classed("monopoly-board", true);

    svg.attr("width", 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT);
    svg.attr("height", 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT);

    return svg;
}

function renderSquares(container) {
    return function (state) {
        const rows = squaresToRows(state.board().squares());

        const rowGroups = container
            .selectAll(".monopoly-row")
            .data(rows)
            .enter()
            .append("g")
            .classed("monopoly-row", true)
            .attr("transform", (_, index) => transformForRow(index));

        const squares = rowGroups
            .selectAll(".monopoly-square")
            .data(row => row)
            .enter()
            .append("g")
            .classed("monopoly-square", true)
            .attr("transform", (_, index) =>
                `translate(${9 * SQUARE_WIDTH + SQUARE_HEIGHT - SQUARE_WIDTH * index})`
            );

        // Background rectangle
        squares.append("rect")
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("width", (_, index) => (index === 0 ? SQUARE_HEIGHT : SQUARE_WIDTH))
            .attr("height", SQUARE_HEIGHT);

        // Render inner square contents
        squares.each(function (square) {
            renderSquare(d3.select(this), square, state.players());
        });

        // Update tokens and ownership
        container
            .selectAll(".monopoly-square")
            .data(state.board().squares())
            .each(function (square, index) {
                const graphicalSquare = d3.select(this);
                graphicalSquare.attr("data-ui", index);

                renderPlayerTokens(graphicalSquare, index, square, state.players());

                square.match({
                    estate: updateOwnerBand(graphicalSquare, state.players(), square),
                    railroad: updateOwnerBand(graphicalSquare, state.players(), square),
                    company: updateOwnerBand(graphicalSquare, state.players(), square),
                    _: _.noop
                });
            });
    };
}

function squaresToRows(squares) {
    return [
        squares.slice(0, SQUARES_PER_ROW),
        squares.slice(SQUARES_PER_ROW, SQUARES_PER_ROW * 2),
        squares.slice(SQUARES_PER_ROW * 2, SQUARES_PER_ROW * 3),
        squares.slice(SQUARES_PER_ROW * 3, SQUARES_PER_ROW * 4)
    ];
}

function renderSquare(container, square) {
    square.match({
        estate: renderEstate(container),
        railroad: renderRailroad(container),
        "community-chest": () => writeText(container, i18n.COMMUNITY_CHEST, 14),
        chance: () => writeText(container, i18n.CHANCE, 14),
        "income-tax": () => {
            writeText(container, i18n.INCOME_TAX, 14);
            writeText(container, i18n.INCOME_TAX_DESCRIPTION, SQUARE_HEIGHT - 30, 10);
        },
        "luxury-tax": () => {
            writeText(container, i18n.LUXURY_TAX, 14);
            writeText(container, i18n.LUXURY_TAX_DESCRIPTION, SQUARE_HEIGHT - 8, 10);
        },
        company: renderCompany(container),
        go: renderStart(container),
        jail: renderJail(container),
        "go-to-jail": () =>
            writeAngledText(
                container,
                i18n.GO_TO_JAIL,
                { x: -8, y: 100 },
                12,
                SQUARE_WIDTH * 2
            ),
        parking: () =>
            writeAngledText(
                container,
                i18n.FREE_PARKING,
                { x: -8, y: 100 },
                12,
                SQUARE_WIDTH * 2
            )
    });
}

function renderPlayerTokens(container, squareIndex, square, players) {
    const playersOnSquare = players.filter(player => player.position() === squareIndex);

    const tokens = container.selectAll(".player-token").data(playersOnSquare);

    const tokenRadius = 8;

    tokens
        .enter()
        .append("circle")
        .classed("player-token", true)
        .attr("data-ui", player => player.id())
        .attr("cx", tokenX(square, tokenRadius))
        .attr("cy", tokenY(square, tokenRadius))
        .attr("r", tokenRadius)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    tokens.attr("fill", player => player.color());

    tokens.exit().remove();
}

function tokenX(square, tokenRadius) {
    return function (player, index) {
        return square.match({
            jail: () => {
                if (player.jailed()) {
                    return (SQUARE_WIDTH / 5) * ((index % 4) + 1) + SQUARE_WIDTH / 5;
                }
                if (index < 4) {
                    return (
                        SQUARE_HEIGHT -
                        ((SQUARE_HEIGHT / 4 - tokenRadius) / 2 + tokenRadius)
                    );
                }
                return (SQUARE_HEIGHT / 5) * ((index % 4) + 1);
            },
            _: () => (SQUARE_WIDTH / 5) * ((index % 4) + 1)
        });
    };
}

function tokenY(square, tokenRadius) {
    return function (player, index) {
        return square.match({
            jail: () => {
                if (player.jailed()) {
                    return (SQUARE_HEIGHT / 3) * (Math.floor(index / 4) + 1);
                }
                if (index < 4) {
                    return (SQUARE_HEIGHT / 5) * ((index % 4) + 1);
                }
                return (
                    SQUARE_HEIGHT -
                    ((SQUARE_HEIGHT / 4 - tokenRadius) / 2 + tokenRadius)
                );
            },
            _: () =>
                (SQUARE_HEIGHT / 3) * (Math.floor(index / 4) + 1)
        });
    };
}

function updateOwnerBand(container, players, square) {
    const owner = getOwner(players, square);

    const band = container.select(".owner-band");

    if (owner) {
        band.attr("fill", owner.color()).style("display", null);
    } else {
        band.style("display", "none");
    }
}

function renderOwnerBand(container) {
    container
        .append("rect")
        .classed("owner-band", true)
        .attr("y", SQUARE_HEIGHT - 3)
        .attr("width", SQUARE_WIDTH)
        .attr("height", 3)
        .attr("stroke", "black")
        .style("display", "none");
}

function getOwner(players, square) {
    return players.find(player =>
        player.properties().some(property => property.equals(square))
    );
}

function renderEstate(container) {
    return function (id, price, group) {
        container
            .append("rect")
            .attr("width", SQUARE_WIDTH)
            .attr("height", SQUARE_HEIGHT / 5)
            .attr("fill", group.color())
            .attr("stroke", "black");

        const name = i18n["PROPERTY_" + id.toUpperCase()];
        writeText(container, name, SQUARE_HEIGHT / 4 + 10);
        writePrice(container, price);
        renderOwnerBand(container);
    };
}

function renderRailroad(container) {
    return function (id, price) {
        container
            .append("g")
            .attr("transform", "scale(0.2) translate(50, 140)")
            .html(Symbols.train());

        const name = i18n["PROPERTY_" + id.toUpperCase()];
        writeText(container, name, 14);
        writePrice(container, price);
        renderOwnerBand(container);
    };
}

function renderStart(container) {
    return function () {
        const angled = writeAngledText(
            container,
            i18n.START_DESCRIPTION,
            { x: 4, y: 58 }
        );

        angled
            .append("g")
            .attr("transform", "translate(20, 30)")
            .html(Symbols.go());

        container
            .append("g")
            .attr("transform", "scale(0.6) translate(6, 134)")
            .html(Symbols.arrow());
    };
}

function renderCompany(container) {
    return function (id, price) {
        const name = i18n["PROPERTY_" + id.toUpperCase()];
        writeText(container, name, 14);
        writePrice(container, price);
        renderOwnerBand(container);
    };
}

function renderJail(container) {
    return function () {
        container
            .append("rect")
            .attr("width", (SQUARE_HEIGHT * 3) / 4)
            .attr("height", (SQUARE_HEIGHT * 3) / 4)
            .attr("fill", "orangered")
            .attr("stroke", "black");

        container
            .append("rect")
            .attr("width", (SQUARE_HEIGHT * 3) / 8)
            .attr("height", (SQUARE_HEIGHT * 3) / 8)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr(
                "transform",
                `translate(${(SQUARE_HEIGHT * 3) / 11}) rotate(45)`
            );

        const words = i18n.VISITING_JAIL.split(" ");
        writeText(container, words[0], SQUARE_HEIGHT - 8, 12);

        const reversed = container
            .append("g")
            .attr(
                "transform",
                `translate(${SQUARE_HEIGHT - 8} ${(SQUARE_HEIGHT * 3) / 4}) rotate(-90)`
            );

        writeText(reversed, words[1], 0, 12);
    };
}

function writeText(container, text, y, fontSize) {
    TextWrapper.wrap(container, text.toUpperCase(), fontSize || 8, y, SQUARE_WIDTH);
}

function writeAngledText(container, text, position, fontSize, width) {
    const angledContainer = container
        .append("g")
        .attr(
            "transform",
            `translate(${position.x}, ${position.y}) rotate(-45)`
        );

    TextWrapper.wrap(
        angledContainer,
        text.toUpperCase(),
        fontSize || 8,
        0,
        width || SQUARE_WIDTH
    );

    return angledContainer;
}

function writePrice(container, price) {
    const priceString = i18n.PRICE_STRING.replace(
        "{price}",
        i18n.formatPrice(price)
    );
    writeText(container, priceString, SQUARE_HEIGHT - 8, 10);
}

function transformForRow(rowIndex) {
    const transforms = [
        `translate(0, ${9 * SQUARE_WIDTH + SQUARE_HEIGHT})`,
        `translate(${SQUARE_HEIGHT}) rotate(90)`,
        `translate(${9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT}, ${SQUARE_HEIGHT}) rotate(180)`,
        `translate(${9 * SQUARE_WIDTH + SQUARE_HEIGHT}, ${
            9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT
        }) rotate(270)`
    ];

    precondition(
        transforms[rowIndex],
        "No transform has been defined for row " + rowIndex
    );

    return transforms[rowIndex];
}
