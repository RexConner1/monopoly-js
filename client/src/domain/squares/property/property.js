"use strict";

const { precondition } = require("@infrastructure/contract");


const isProperty = (candidate) => candidate instanceof Property;

class Property {
	constructor(info) {
		this._id = info.id;
		this._uid = info.uid
		this._group = info.group;
		this._price = info.price;
		this._rentFn = info.rent;
		this._type = info.type;
	}

	id() {
		return this._id;
	}

	uid() {
		return this._uid;
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

module.exports = {
    isProperty,
    Property
};
