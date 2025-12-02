"use strict";

const { precondition } = require("@infrastructure/contract");

// ---------------------------------------------------------
// Public API
// ---------------------------------------------------------

exports.isGroup = (candidate) => candidate instanceof PropertyGroup;

exports.newGroup = function (index, color, propertiesFn) {
	precondition(_.isNumber(index), "PropertyGroup requires an index");
	precondition(_.isString(color), "PropertyGroup requires a color");
	precondition(_.isFunction(propertiesFn), "PropertyGroup requires a property-listing function");

	return new PropertyGroup(index, color, propertiesFn);
};

exports.companyGroup = function (index, color, propertiesFn, prices) {
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

exports.railroadGroup = function (index, color, propertiesFn, prices) {
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

// ---------------------------------------------------------
// PropertyGroup Class (ES6 Modernized)
// ---------------------------------------------------------

class PropertyGroup {
	constructor(index, color, propertiesFn) {
		this._index = index;
		this._color = color;
		this._propertiesFn = propertiesFn;
	}

	index() {
		return this._index;
	}

	color() {
		return this._color;
	}

	properties() {
		// original calls: properties(this._index)
		return this._propertiesFn(this._index);
	}

	compareTo(other) {
		precondition(other instanceof PropertyGroup, "Comparing requires another PropertyGroup");

		if (this._index === other._index) return 0;

		// Higher index → lower sort priority
		return this._index < other._index ? 1 : -1;
	}
}
