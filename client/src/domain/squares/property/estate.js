"use strict";

const { precondition } = require("@infrastructure/contract");
const{ PropertyGroup, isGroup }= require("@domain/property-group");
const Property = require("@domain/squares/property/property").Property;


class Estate extends Property {
    constructor(info) {
        precondition(_.isString(info.id) && info.id.length > 0, "Estate requires an id");
        precondition(isGroup(info.group), "Estate requires a group");
        precondition(_.isNumber(info.price) && info.price > 0, "Estate requires a price");
        precondition(_.isNumber(info.rent[0]) && info.rent[0] > 0, "Estate requires a rent");

        super({
            id: info.id, 
            uid: info.uid,
            position: info.position,
            group: info.group,
            type: "estate", 
            price: info.price, 
            rent: estateRent(info.rent[0], info.group)
        });
    }
}

const estateRent = (baseRent, group) => (ownerProps) => {
    const multiplier = ownsAllEstatesInGroup(group, ownerProps) ? 2 : 1;
    return { amount: baseRent * multiplier };
};

const ownsAllEstatesInGroup = (group, properties) => {
    const groupIds = _.map(group.properties(), (p) => p.id());
    const ownedIds = _.map(properties, (p) => p.id());
    return _.every(groupIds, (id) => _.contains(ownedIds, id));
};

module.exports = {
    Estate
};
