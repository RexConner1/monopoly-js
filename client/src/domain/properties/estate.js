"use strict";

const { precondition } = require("@infrastructure/contract");
const{ PropertyGroup, isGroup }= require("@domain/property-group");
const Property = require("@domain/property").Property;


class Estate extends Property {
    constructor(id, group, prices) {
        precondition(_.isString(id) && id.length > 0, "Estate requires an id");
        precondition(isGroup(group), "Estate requires a group");
        precondition(_.isNumber(prices.value) && prices.value > 0, "Estate requires a price");
        precondition(_.isNumber(prices.rent) && prices.rent > 0, "Estate requires a rent");

        super({
            id, 
            group, 
            type: "estate", 
            price: prices.value, 
            rent: estateRent(prices.rent, group)
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

const newGroup = function (index, color, propertiesFn) {
	precondition(_.isNumber(index), "PropertyGroup requires an index");
	precondition(_.isString(color), "PropertyGroup requires a color");
	precondition(_.isFunction(propertiesFn), "PropertyGroup requires a property-listing function");

	return new PropertyGroup(index, color, propertiesFn);
};

module.exports = {
    Estate,
    newGroup
};
