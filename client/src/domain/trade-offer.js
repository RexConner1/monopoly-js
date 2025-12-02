"use strict";

const { precondition } = require("@infrastructure/contract");
const Player = require("@domain/player");

// ---------------------------------------------------------
// Public API
// ---------------------------------------------------------

exports.isOffer = (candidate) => candidate instanceof TradeOffer;

exports.emptyOffer = () =>
	new TradeOffer([
		{ properties: [], money: 0 },
		{ properties: [], money: 0 }
	]);

exports.newOffer = (info) => {
	// ---- CURRENT PLAYER ----
	precondition(Player.isPlayer(info[0].player), "A TradeOffer requires the current player");
	precondition(_.isArray(info[0].properties), "Current player must provide property list");
	precondition(_.isNumber(info[0].money), "Current player must provide money amount");
	precondition(
		propertiesOwnedBy(info[0].properties, info[0].player),
		"Properties offered by current player must be owned by current player"
	);

	info[0].properties = realProperties(info[0].properties, info[0].player);

	// ---- OTHER PLAYER ----
	precondition(Player.isPlayer(info[1].player), "A TradeOffer requires the other player");
	precondition(_.isArray(info[1].properties), "Other player must provide property list");
	precondition(_.isNumber(info[1].money), "Other player must provide money amount");
	precondition(
		propertiesOwnedBy(info[1].properties, info[1].player),
		"Properties offered by other player must be owned by that player"
	);

	info[1].properties = realProperties(info[1].properties, info[1].player);

	return new TradeOffer(info);
};

// ---------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------

function propertiesOwnedBy(propertyIds, player) {
	return _.every(propertyIds, (pid) =>
		_.some(player.properties(), (p) => p.id() === pid)
	);
}

function realProperties(propertyIds, player) {
	return propertyIds.map((pid) =>
		_.find(player.properties(), (p) => p.id() === pid)
	);
}

function sameProperties(left, right) {
	if (left.length !== right.length) return false;
	return _.every(left, (prop, i) => prop.id() === right[i].id());
}

// ---------------------------------------------------------
// TradeOffer Class (ES6)
// ---------------------------------------------------------

class TradeOffer {
	constructor(info) {
		this._currentPlayer = info[0].player;
		this._currentPlayerProperties = info[0].properties;
		this._currentPlayerMoney = info[0].money;

		this._otherPlayer = info[1].player;
		this._otherPlayerProperties = info[1].properties;
		this._otherPlayerMoney = info[1].money;
	}

	// ---------------------------------------------
	// Offer state
	// ---------------------------------------------
	isEmpty() {
		return (
			this._currentPlayerProperties.length === 0 &&
			this._currentPlayerMoney === 0 &&
			this._otherPlayerProperties.length === 0 &&
			this._otherPlayerMoney === 0
		);
	}

	isValid() {
		const currentValid =
			this._currentPlayerProperties.length > 0 || this._currentPlayerMoney > 0;
		const otherValid =
			this._otherPlayerProperties.length > 0 || this._otherPlayerMoney > 0;

		return currentValid && otherValid;
	}

	// ---------------------------------------------
	// Accessors
	// ---------------------------------------------
	currentPlayerId() {
		return this._currentPlayer.id();
	}

	otherPlayerId() {
		return this._otherPlayer.id();
	}

	propertiesFor(playerIndex) {
		return playerIndex === 0
			? this._currentPlayerProperties.slice()
			: this._otherPlayerProperties.slice();
	}

	moneyFor(playerIndex) {
		return playerIndex === 0
			? this._currentPlayerMoney
			: this._otherPlayerMoney;
	}

	// ---------------------------------------------
	// Equality
	// ---------------------------------------------
	equals(other) {
		if (!(other instanceof TradeOffer)) return false;

		if (this._currentPlayer.id() !== other._currentPlayer.id()) return false;
		if (this._otherPlayer.id() !== other._otherPlayer.id()) return false;

		if (this._currentPlayerMoney !== other._currentPlayerMoney) return false;
		if (this._otherPlayerMoney !== other._otherPlayerMoney) return false;

		if (!sameProperties(this._currentPlayerProperties, other._currentPlayerProperties))
			return false;

		if (!sameProperties(this._otherPlayerProperties, other._otherPlayerProperties))
			return false;

		return true;
	}
}
