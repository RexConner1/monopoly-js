"use strict";

const { precondition } = require("@infrastructure/contract");
const{ PropertyGroup, isGroup }= require("@domain/property-group");
const Property = require("@domain/property").Property;


class Railroad extends Property {
    constructor(id, group) {
        super({
            id,
            group,
            type: "railroad",
            price: group.propertyValue(),
            rent: railroadRent(group)
        });
    }
}

const railroadRent = (group) => (ownerProps) => {
    const count = countRailroads(group, ownerProps);
    return { amount: group.baseRent() * Math.pow(2, count - 1) };
};

const countRailroads = (group, properties) => {
    const groupIds = _.map(group.properties(), (p) => p.id());
    return _.reduce(
        properties,
        (count, prop) => (groupIds.includes(prop.id()) ? count + 1 : count),
        0
    );
};

const railroadGroup = function (index, color, propertiesFn, prices) {
    precondition(_.isNumber(index), "Railroad property group requires index");
    precondition(_.isString(color), "Railroad property group requires color");
    precondition(_.isFunction(propertiesFn), "Railroad group requires property-listing function");
    precondition(_.isNumber(prices.value) && prices.value > 0, "Railroad requires value");
    precondition(_.isNumber(prices.baseRent) && prices.baseRent > 0, "Railroad requires base rent");

    const group = new PropertyGroup(index, color, propertiesFn);

    group.propertyValue = () => prices.value;
    group.baseRent = () => prices.baseRent;

    return group;
};

module.exports = {
    Railroad,
    railroadGroup
}
