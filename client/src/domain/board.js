"use strict";

const { precondition } = require("@infrastructure/contract");
const constants = require("@infrastructure/constants");
const groupColors = require("@infrastructure/groupColors");
const squareDefinitions = require("@infrastructure/edition/standard/squares");

const { PropertyGroup } = require("./property-group");

const Property = require("@domain/squares/property/property");
const Estate = require("@domain/squares/property/estate").Estate;
const Railroad = require("@domain/squares/property/railroad").Railroad;
const Company = require("@domain/squares/property/company").Company;

const {
    Go,
    Jail,
    FreeParking,
    GoToJail,
    CommunityChest,
    Chance,
    IncomeTax,
    LuxuryTax
} = require("@domain/squares/special");

const FACTORY_MAP = {
	"estate": cfg => new Estate(cfg),
	"railroad": cfg => new Railroad(cfg),
	"company": cfg => new Company(cfg),

	"go": cfg => new Go(cfg),
	"jail": cfg => new Jail(cfg),
	"go-to-jail": cfg => new GoToJail(cfg),
	"chance": cfg => new Chance(cfg),
	"community-chest": cfg => new CommunityChest(cfg),
	"income-tax": cfg => new IncomeTax(cfg),
	"luxury-tax": cfg => new LuxuryTax(cfg),
	"parking": cfg => new FreeParking(cfg)
};

exports.isBoard = function (candidate) {
	return candidate instanceof Board;
};

exports.standard = function () {
	const properties = createSquares();
	return new Board({
		squares: properties,
		properties: createProperties(properties),
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

	jailPosition() {
		return this._jailPosition;
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

function createGroups() {
	let groups = {};

	for (const [groupNumber, color] of Object.entries(groupColors)) {
		groups[groupNumber] = new PropertyGroup(
			Number(groupNumber),
			color,
			groupFn
		);
	}

	return groups;

	function groupFn(groupIndex) {
		precondition(
			_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
			"Listing members of a group requires a valid group index"
		);

		return _.filter(createSquares(), square =>
			Property.isProperty(square) &&
			square.group().index() === groupIndex
		);;
	}
}

function createSquares() {
	const groups = createGroups();
	const squares = squareDefinitions.map(square => {
		const factory = FACTORY_MAP[square.type];
		return factory({...square, group: groups[square.gid]});
	});

	return squares;
}

function createProperties(squares) {
	const properties = squares.reduce((acc, square) => {
        if (!(Property.isProperty(square))) return acc;
        acc[square.uid()] = square;
        return acc;
    }, {});

	return properties;
}

// -----------------------------
// Deep Equality
// -----------------------------

function deepEquals(left, right) {
	if (left.length !== right.length) return false;
	return _.every(left, (element, index) => element.equals(right[index]));
}
