"use strict";

const { precondition } = require("@infrastructure/contract");
const{ PropertyGroup, isGroup } = require("@domain/property-group");
const Property = require("@domain/squares/property/property").Property;


class Railroad extends Property {
    constructor(info) {
        super({
            id: info.id,
            uid: info.uid,
            position: info.position,
            group: info.group,
            type: "railroad",
            price: info.price,
            rent: railroadRent(info.group)
        });

        info.group.baseRent = () => info.rent;
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

module.exports = {
    Railroad
}
