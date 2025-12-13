"use strict";

const PlayerColors = require("@domain/player-colors").colors();
const Property = require("@domain/squares/property/property");
const { precondition } = require("@infrastructure/contract");
const i18n = require("@i18n/i18n").i18n();
const constants = require("@infrastructure/constants");

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

exports.isPlayer = (candidate) => candidate instanceof Player;

exports.newPlayers = function (playerConfigurations, boardParameters) {
	precondition(
		_.isArray(playerConfigurations) &&
			playerConfigurations.length >= constants.MIN_NUMBER_OF_PLAYERS,
		`Creating players require at least ${constants.MIN_NUMBER_OF_PLAYERS} player configurations`
	);

	precondition(
		_.isNumber(boardParameters.startMoney) && boardParameters.startMoney,
		"Creating players require an amount of money each player starts with"
	);

	precondition(
		_.isNumber(boardParameters.boardSize) && boardParameters.boardSize > 0,
		"Creating players require a board size"
	);

	precondition(
		_.isNumber(boardParameters.salary) && boardParameters.salary > 0,
		"Creating players require the salary players get when lapping the board"
	);

	precondition(
		_.isNumber(boardParameters.jailPosition) && boardParameters.jailPosition,
		"Creating players require a jail position"
	);

	return playerConfigurations.map((config, index) =>
		newPlayer({
			id: "player" + index,
			name: i18n.DEFAULT_PLAYER_NAME.replace("{index}", index + 1),
			money: boardParameters.startMoney,
			position: 0,
			color: PlayerColors[index],
			type: config.type,
			properties: [],
			boardParameters
		})
	);
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function validPlayerType(type) {
	return type === "human" || type === "computer";
}

function sameProperties(left, right) {
	if (left.length !== right.length) return false;

	return _.every(left, (property, index) => {
		return property.id() === right[index].id();
	});
}

function newPlayer(info) {
	precondition(_.isString(info.id) && info.id !== "", "Player requires an id");
	precondition(_.isString(info.name) && info.name !== "", "Player requires a name");
	precondition(_.isNumber(info.money) && info.money >= 0, "Player requires money");
	precondition(_.isNumber(info.position) && info.position >= 0, "Player requires a position");
	precondition(_.isString(info.color) && info.color !== "", "Player requires a color");
	precondition(_.isString(info.type) && validPlayerType(info.type), "Invalid player type");
	precondition(_.isArray(info.properties), "Player requires a list of properties");
	precondition(info.boardParameters, "Player requires board parameters");

	return new Player(info);
}

function insertProperty(property, properties) {
	return insertPropertyAt(property, 0, properties);
}

function insertPropertyAt(property, index, properties) {
	if (index === properties.length) {
		return properties.concat([property]);
	}

	const other = properties[index];

	if (property.compareTo(other) === 1) {
		const newProps = properties.slice();
		newProps.splice(index, 0, property);
		return newProps;
	}

	return insertPropertyAt(property, index + 1, properties);
}

function playerWithAdditionalMoney(player, amount) {
	return newPlayer({
		id: player.id(),
		name: player.name(),
		money: player.money() + amount,
		position: player.position(),
		color: player.color(),
		type: player.type(),
		properties: player.properties(),
		boardParameters: player._boardParameters
	});
}

// ---------------------------------------------------------------------
// Player Class (modern ES6)
// ---------------------------------------------------------------------

class Player {
	constructor(info) {
		this._id = info.id;
		this._name = info.name;
		this._money = info.money;
		this._position = info.position;
		this._color = info.color;
		this._type = info.type;
		this._properties = info.properties;
		this._jailed = false;
		this._boardParameters = info.boardParameters;
	}

	id() {
		return this._id;
	}

	name() {
		return this._name;
	}

	money() {
		return this._money;
	}

	position() {
		return this._position;
	}

	color() {
		return this._color;
	}

	type() {
		return this._type;
	}

	properties() {
		return this._properties.slice();
	}

	jailed() {
		return this._jailed;
	}

	equals(other) {
		precondition(other, "Comparing a player requires something to compare with");

		if (this === other) return true;
		if (!(other instanceof Player)) return false;

		return (
			this._id === other._id &&
			this._name === other._name &&
			this._money === other._money &&
			this._position === other._position &&
			this._color === other._color &&
			this._type === other._type &&
			this._jailed === other._jailed &&
			sameProperties(this._properties, other._properties)
		);
	}

	// -----------------------------
	// Game mechanics
	// -----------------------------

	netWorth() {
		const valueOfProperties = this._properties.reduce(
			(total, property) => total + property.price(),
			0
		);

		return this.money() + valueOfProperties;
	}

	move(dice) {
		precondition(
			_.isArray(dice) && dice.length === 2 && _.isNumber(dice[0]) && _.isNumber(dice[1]),
			"Move requires a 2-number dice array"
		);

		const squareCount = this._boardParameters.boardSize;
		const newPosition = this.position() + dice[0] + dice[1];

		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() + (newPosition >= squareCount ? this._boardParameters.salary : 0),
			position: newPosition % squareCount,
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
	}

	jail() {
		const jailedPlayer = newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this._boardParameters.jailPosition,
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});

		jailedPlayer._jailed = true;
		return jailedPlayer;
	}

	unjail() {
		const player = newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});

		player._jailed = false;
		return player;
	}

	// -----------------------------
	// Property ownership
	// -----------------------------

	buyProperty(property) {
		precondition(Property.isProperty(property), "Must buy a valid property");

		const alreadyOwned = this.properties().some((p) => p.id() === property.id());
		precondition(!alreadyOwned, "Cannot buy a property already owned");

		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() - property.price(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties()),
			boardParameters: this._boardParameters
		});
	}

	gainProperty(property) {
		precondition(Property.isProperty(property), "Player must gain a valid property");

		const alreadyOwned = this.properties().some((p) => p.id() === property.id());
		precondition(!alreadyOwned, "Player cannot gain a property already owned");

		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties()),
			boardParameters: this._boardParameters
		});
	}

	loseProperty(property) {
		precondition(Property.isProperty(property), "Player losing property requires a property");

		const alreadyOwned = this.properties().some((p) => p.id() === property.id());
		precondition(alreadyOwned, "Player cannot lose a property not owned");

		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: this.properties().filter((p) => p.id() !== property.id()),
			boardParameters: this._boardParameters
		});
	}

	// -----------------------------
	// Money mechanics
	// -----------------------------

	pay(amount) {
		precondition(_.isNumber(amount) && amount >= 0, "Pay amount must be >= 0");
		precondition(this.money() > amount, "Player cannot pay more than he has");

		return playerWithAdditionalMoney(this, -amount);
	}

	earn(amount) {
		precondition(_.isNumber(amount) && amount >= 0, "Earn amount must be >= 0");

		return playerWithAdditionalMoney(this, amount);
	}
}
