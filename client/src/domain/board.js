"use strict";

const { precondition } = require("@infrastructure/contract");
const constants = require("@infrastructure/constants");

const Estate = require("@domain/properties/estate");
const Railroad = require("@domain/properties/railroad");
const Company = require("@domain/properties/company");

exports.isBoard = function (candidate) {
	return candidate instanceof Board;
};

exports.standard = function () {
	const properties = standardProperties();
	return new Board({
		squares: standardSquares(properties),
		properties,
		jailPosition: 10,
		jailBailout: constants.JAIL_BAILOUT,
		startMoney: constants.STARTING_MONEY,
		salary: 200
	});
};

// -----------------------------
// Board Class
// -----------------------------

class Board {
	constructor(info) {
		this._squares = info.squares;
		this._properties = info.properties;
		this._jailPosition = info.jailPosition;
		this._jailBailout = info.jailBailout;
		this._startMoney = info.startMoney;
		this._salary = info.salary;
	}

	playerParameters() {
		return {
			startMoney: this._startMoney,
			boardSize: this._squares.length,
			salary: this._salary,
			jailPosition: this._jailPosition
		};
	}

	jailBailout() {
		return this._jailBailout;
	}

	properties() {
		return this._properties;
	}

	squares() {
		return this._squares;
	}

	equals(other) {
		precondition(other, "Board equality requires another board to compare against");

		if (this === other) return true;
		if (!(other instanceof Board)) return false;

		if (!deepEquals(this._squares, other._squares)) return false;
		if (this._jailBailout !== other._jailBailout) return false;

		return true;
	}
}

// -----------------------------
// Property Setup
// -----------------------------

function standardProperties() {
	const groups = [
		Estate.newGroup(0, "midnightblue", groupMembers),
		Estate.newGroup(1, "lightskyblue", groupMembers),
		Estate.newGroup(2, "mediumvioletred", groupMembers),
		Estate.newGroup(3, "orange", groupMembers),
		Estate.newGroup(4, "red", groupMembers),
		Estate.newGroup(5, "yellow", groupMembers),
		Estate.newGroup(6, "green", groupMembers),
		Estate.newGroup(7, "blue", groupMembers)
	];

	const railroadGroup = Railroad.railroadGroup(
		8,
		"black",
		groupMembers,
		{ value: 200, baseRent: 25 }
	);

	const companyGroup = Company.companyGroup(
		9,
		"lightgreen",
		groupMembers,
		{ value: 150, multipliers: [4, 10] }
	);

	return {
		mediterranean: new Estate.Estate("md", groups[0], { value: 60, rent: 2 }),
		baltic: new Estate.Estate("bt", groups[0], { value: 60, rent: 4 }),
		east: new Estate.Estate("et", groups[1], { value: 100, rent: 6 }),
		vermont: new Estate.Estate("vt", groups[1], { value: 100, rent: 6 }),
		connecticut: new Estate.Estate("cn", groups[1], { value: 120, rent: 8 }),
		charles: new Estate.Estate("cl", groups[2], { value: 140, rent: 10 }),
		us: new Estate.Estate("us", groups[2], { value: 140, rent: 10 }),
		virginia: new Estate.Estate("vn", groups[2], { value: 160, rent: 12 }),
		jack: new Estate.Estate("jk", groups[3], { value: 180, rent: 14 }),
		tennessee: new Estate.Estate("tn", groups[3], { value: 180, rent: 14 }),
		newYork: new Estate.Estate("ny", groups[3], { value: 200, rent: 16 }),
		kentucky: new Estate.Estate("kt", groups[4], { value: 220, rent: 18 }),
		indiana: new Estate.Estate("in", groups[4], { value: 220, rent: 18 }),
		illinois: new Estate.Estate("il", groups[4], { value: 240, rent: 20 }),
		atlantic: new Estate.Estate("at", groups[5], { value: 260, rent: 22 }),
		ventnor: new Estate.Estate("vr", groups[5], { value: 260, rent: 22 }),
		marvin: new Estate.Estate("mv", groups[5], { value: 280, rent: 24 }),
		pacific: new Estate.Estate("pa", groups[6], { value: 300, rent: 26 }),
		northCarolina: new Estate.Estate("nc", groups[6], { value: 300, rent: 26 }),
		pennsylvania: new Estate.Estate("pn", groups[6], { value: 320, rent: 28 }),
		park: new Estate.Estate("pk", groups[7], { value: 350, rent: 35 }),
		broadwalk: new Estate.Estate("bw", groups[7], { value: 400, rent: 50 }),

		readingRailroad: new Railroad.Railroad("railroad_reading", railroadGroup),
		pennsylvaniaRailroad: new Railroad.Railroad("railroad_penn", railroadGroup),
		boRailroad: new Railroad.Railroad("railroad_b_o", railroadGroup),
		shortRailroad: new Railroad.Railroad("railroad_short", railroadGroup),

		electricCompany: new Company.Company("company_electric", companyGroup),
		waterWorks: new Company.Company("company_water", companyGroup)
	};
}

// -----------------------------
// Board Squares
// -----------------------------

function standardSquares(properties) {
	return [
		go(),
		properties.mediterranean,
		communityChest(),
		properties.baltic,
		incomeTax(10, 200),
		properties.readingRailroad,
		properties.east,
		chance(),
		properties.vermont,
		properties.connecticut,

		jail(),
		properties.charles,
		properties.electricCompany,
		properties.us,
		properties.virginia,
		properties.pennsylvaniaRailroad,
		properties.jack,
		communityChest(),
		properties.tennessee,
		properties.newYork,

		parking(),
		properties.kentucky,
		chance(),
		properties.indiana,
		properties.illinois,
		properties.boRailroad,
		properties.atlantic,
		properties.ventnor,
		properties.waterWorks,
		properties.marvin,

		goToJail(),
		properties.pacific,
		properties.northCarolina,
		communityChest(),
		properties.pennsylvania,
		properties.shortRailroad,
		chance(),
		properties.park,
		luxuryTax(75),
		properties.broadwalk
	];
}

// -----------------------------
// Deep Equality
// -----------------------------

function deepEquals(left, right) {
	if (left.length !== right.length) return false;
	return _.every(left, (element, index) => element.equals(right[index]));
}

// -----------------------------
// Property Group Helper
// -----------------------------

function groupMembers(groupIndex) {
	precondition(
		_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
		"Listing members of a group requires a valid group index"
	);

	return _.filter(standardProperties(), square => square.group().index() === groupIndex);
}

// -----------------------------
// Square Definitions
// -----------------------------

const go = () => ({ match: match("go"), equals: hasId("go") });
const jail = () => ({ match: match("jail"), equals: hasId("jail") });
const parking = () => ({ match: match("parking"), equals: hasId("parking") });
const goToJail = () => ({ match: match("go-to-jail"), equals: hasId("go-to-jail") });

const communityChest = () => ({ match: match("community-chest", []), equals: hasId("community-chest") });
const chance = () => ({ match: match("chance", []), equals: hasId("chance") });

const incomeTax = (percentage, flat) => ({
	match: match("income-tax", [percentage, flat]),
	equals: hasId("income-tax")
});

const luxuryTax = amount => ({
	match: match("luxury-tax", [amount]),
	equals: hasId("luxury-tax")
});

// -----------------------------
// Matchers
// -----------------------------

function match(fn, args) {
	return function (visitor) {
		if (_.isFunction(visitor[fn])) {
			return visitor[fn].apply(this, args);
		}
		return visitor["_"]();
	};
}

function hasId(id) {
	return function (other) {
		precondition(other, "Square equality requires another object");

		if (_.isFunction(other.match)) {
			const matcher = { _: () => false };
			matcher[id] = () => true;
			return other.match(matcher);
		}

		return false;
	};
}
