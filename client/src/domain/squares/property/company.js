"use strict";

const { precondition } = require("@infrastructure/contract");
const{ PropertyGroup, isGroup }= require("@domain/property-group");
const Property = require("@domain/squares/property/property").Property;


class Company extends Property {
    constructor(info) {
        precondition(_.isString(info.id) && info.id.length > 0, "Company requires an id");
        precondition(isGroup(info.group), "Company requires a group");

        super({
            id: info.id, 
            uid: info.uid,
            group: info.group, 
            type: "company", 
            price: info.price, 
            rent: companyRent(info.group)
        });

        info.group.multipliers = () => info.multipliers;
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

module.exports = {
    Company
}
