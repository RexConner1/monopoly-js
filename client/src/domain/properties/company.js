"use strict";

const { precondition } = require("@infrastructure/contract");
const{ PropertyGroup, isGroup }= require("@domain/property-group");
const Property = require("@domain/property").Property;


class Company extends Property {
    constructor(id, group) {
        precondition(_.isString(id) && id.length > 0, "Company requires an id");
        precondition(isGroup(group), "Company requires a group");

        super({
            id, 
            group, 
            type: "company", 
            price: group.propertyValue(), 
            rent: companyRent(group)
        });
    }
}

const companyRent = (group) => (ownerProps) => {
    const multiplier = ownsBothCompanies(group, ownerProps)
        ? group.multipliers()[1]
        : group.multipliers()[0];

    return { multiplier };
};

const ownsBothCompanies = (group, properties) => {
    const groupIds = _.map(group.properties(), (p) => p.id());
    const ownedGroupProps = _.filter(properties, (prop) => groupIds.includes(prop.id()));
    return ownedGroupProps.length === 2;
};

const companyGroup = function (index, color, propertiesFn, prices) {
    precondition(_.isNumber(index), "Company property group requires index");
    precondition(_.isString(color), "Company property group requires color");
    precondition(_.isFunction(propertiesFn), "Company group requires property-listing function");
    precondition(_.isNumber(prices.value) && prices.value > 0, "Company requires a value");
    precondition(
        _.isArray(prices.multipliers) && prices.multipliers.length === 2,
        "Company group requires two multipliers"
    );

    const group = new PropertyGroup(index, color, propertiesFn);

    group.propertyValue = () => prices.value;
    group.multipliers = () => prices.multipliers;

    return group;
};

module.exports = {
    Company,
    companyGroup
}
