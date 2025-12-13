"use strict";

const { precondition } = require("@infrastructure/contract");


const isGroup = (candidate) => candidate instanceof PropertyGroup;

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
		return this._propertiesFn(this._index);
	}

	compareTo(other) {
		precondition(other instanceof PropertyGroup, "Comparing requires another PropertyGroup");

		if (this._index === other._index) return 0;

		// Higher index → lower sort priority
		return this._index < other._index ? 1 : -1;
	}
}

module.exports = {
    isGroup,
    PropertyGroup
};
