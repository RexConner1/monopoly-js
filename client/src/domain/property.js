"use strict";

const { precondition } = require("@infrastructure/contract");
const PropertyGroup = require("@domain/property-group");

// ---------------------------------------------------------
// Public API
// ---------------------------------------------------------

exports.isProperty = (candidate) => candidate instanceof Property;

// ---------- ESTATE ----------
exports.estate = function (id, group, prices) {
	precondition(_.isString(id) && id.length > 0, "Estate requires an id");
	precondition(PropertyGroup.isGroup(group), "Estate requires a group");
	precondition(_.isNumber(prices.value) && prices.value > 0, "Estate requires a price");
	precondition(_.isNumber(prices.rent) && prices.rent > 0, "Estate requires a rent");

	return new Property({
		id,
		group,
		type: "estate",
		price: prices.value,
		rent: estateRent(prices.rent, group)
	});
};

const estateRent = (baseRent, group) => (ownerProps) => {
	const multiplier = ownsAllEstatesInGroup(group, ownerProps) ? 2 : 1;
	return { amount: baseRent * multiplier };
};

const ownsAllEstatesInGroup = (group, properties) => {
	const groupIds = _.map(group.properties(), (p) => p.id());
	const ownedIds = _.map(properties, (p) => p.id());
	return _.every(groupIds, (id) => _.contains(ownedIds, id));
};

// ---------- COMPANY ----------
exports.company = function (id, group) {
	precondition(_.isString(id) && id.length > 0, "Company requires an id");
	precondition(PropertyGroup.isGroup(group), "Company requires a group");

	return new Property({
		id,
		group,
		type: "company",
		price: group.propertyValue(),
		rent: companyRent(group)
	});
};

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

// ---------- RAILROAD ----------
exports.railroad = function (id, group) {
	precondition(_.isString(id) && id.length > 0, "Railroad requires an id");
	precondition(PropertyGroup.isGroup(group), "Railroad requires a group");

	return new Property({
		id,
		group,
		type: "railroad",
		price: group.propertyValue(),
		rent: railroadRent(group)
	});
};

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

// ---------------------------------------------------------
// Property Class (ES6 Modernized)
// ---------------------------------------------------------

class Property {
	constructor(info) {
		this._id = info.id;
		this._group = info.group;
		this._price = info.price;
		this._rentFn = info.rent;
		this._type = info.type;
	}

	id() {
		return this._id;
	}

	price() {
		return this._price;
	}

	rent(ownerProperties) {
		return this._rentFn(ownerProperties);
	}

	group() {
		return this._group;
	}

	match(visitor) {
		return matchWithDefault(visitor, this._type, [
			this._id,
			this._price,
			this._group
		]);
	}

	compareTo(other) {
		precondition(other instanceof Property, "Comparing properties requires another Property");

		if (this._id === other._id) return 0;

		// Compare groups first
		const groupCmp = this._group.compareTo(other._group);
		if (groupCmp !== 0) return groupCmp;

		// Same group → compare index within group
		const indexMap = {};
		this._group.properties().forEach((estate, index) => {
			indexMap[estate.id()] = index;
		});

		return indexMap[this._id] < indexMap[other._id] ? 1 : -1;
	}

	equals(other) {
		precondition(other, "Testing property equality requires something to compare to");
		return other instanceof Property && this._id === other._id;
	}
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

function matchWithDefault(visitor, fn, args) {
	if (_.isFunction(visitor[fn])) {
		return visitor[fn].apply(visitor, args);
	}
	return visitor["_"]();
}
