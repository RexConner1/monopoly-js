"use strict";

const { precondition } = require('@infrastructure/contract');

module.exports.render = (container, positioning, options = defaultOptions()) => {
    precondition(container, "A popup requires a positioned container to render into");
    precondition(isFullyPositioned(positioning),
        "The popup must be fully positioned vertically and horizontally"
    );

    const htmlElements = renderDom(container, positioning);
    const closedSubject = bindEvents(htmlElements.popupElement, options);

    return externalInterface(htmlElements, closedSubject);
};


// ------------------------- Default Options -------------------------

function defaultOptions() {
    return {
        closeBtn: true
    };
}


// ------------------------- Position Validation -------------------------

function isFullyPositioned(positioning) {
    const cssAttributes = _.keys(positioning);

    const vertical = ["top", "bottom", "height"];
    const horizontal = ["left", "width", "right"];

    return (
        cssAttributes.length === 4 &&
        _.intersection(cssAttributes, vertical).length === 2 &&
        _.intersection(cssAttributes, horizontal).length === 2
    );
}


// ------------------------- DOM Rendering -------------------------

function renderDom(container, positioning) {
    const popupElement = d3.select(container[0])
        .append('div')
        .classed('popup', true)
        .style('position', 'absolute')
        .style(positioning);

    const contentContainer = popupElement.append('div')
        .classed('popup-content', true);

    return {
        popupElement,
        contentContainer
    };
}


// ------------------------- Events & Close Handling -------------------------

function bindEvents(popupElement, options) {
    const closedSubject = new Rx.AsyncSubject();

    if (options.closeBtn) {
        const closeButton = popupElement.append('button')
            .classed('popup-close-btn', true)
            .attr('data-ui', 'popup-close')
            .on('click', () => {
                closePopup(popupElement, closedSubject);
            });

        closeButton.append('span')
            .classed({
                glyphicon: true,
                'glyphicon-remove': true
            });
    }

    return closedSubject;
}


// ------------------------- External API -------------------------

function externalInterface(htmlElements, closedSubject) {
    return {
        contentContainer: () => $(htmlElements.contentContainer[0]),

        closed: () => closedSubject.asObservable(),

        close: () => closePopup(htmlElements.popupElement, closedSubject)
    };
}


// ------------------------- Close Logic -------------------------

function closePopup(popupElement, closedSubject) {
    // Fix bug: classed('.class') should be classed('class')
    popupElement.classed('popup-closing', true);

    popupElement.remove();
    closedSubject.onNext(true);
    closedSubject.onCompleted();
}
