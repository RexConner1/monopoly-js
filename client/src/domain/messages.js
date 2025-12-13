"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const Player = require("@domain/player");
const Property = require("@domain/squares/property/property");
const TradeOffer = require("@domain/trade-offer");

// ---------------------------------------------------------
// Log class
// ---------------------------------------------------------

class Log {
	constructor(id, message) {
		this._id = id;
		this._message = message;
	}

	id() {
		return this._id;
	}

	message() {
		return this._message;
	}

	equals(other) {
		return (
			other instanceof Log &&
			this._id === other._id &&
			this._message === other._message
		);
	}
}

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const coloredPlayer = (player) =>
	`<span style="color: ${player.color()}; font-weight: bold;">${player.name()}</span>`;

const enumerateOfferFor = (offer, playerIndex) => {
	const propertiesOffer = offer
		.propertiesFor(playerIndex)
		.map((property) => property.name())
		.join(", ");

	const money = i18n.formatPrice(offer.moneyFor(playerIndex));

	if (propertiesOffer === "") {
		return money;
	}

	return `${propertiesOffer} ${i18n.LOG_CONJUNCTION} ${money}`;
};

// ---------------------------------------------------------
// Exported Logging Functions
// ---------------------------------------------------------

exports.logDiceRoll = function (player, die1, die2) {
	precondition(Player.isPlayer(player), "Valid player required");
	precondition(_.isNumber(die1) && die1 >= 1 && die1 <= 6, "Invalid die1");
	precondition(_.isNumber(die2) && die2 >= 1 && die2 <= 6, "Invalid die2");

	const message = i18n.LOG_DICE_ROLL
		.replace("{player}", coloredPlayer(player))
		.replace("{die1}", die1)
		.replace("{die2}", die2);

	return new Log("dice-roll", message);
};

exports.logDoubleDiceRoll = function (player, dice) {
	precondition(Player.isPlayer(player), "Valid player required");
	precondition(_.isNumber(dice) && dice, "Dice must be > 1");

	const message = i18n.LOG_DOUBLE_DICE_ROLL
		.replace("{player}", coloredPlayer(player))
		.replace("{dice}", dice);

	return new Log("double-dice-roll", message);
};

exports.logPropertyBought = function (player, property) {
	precondition(Player.isPlayer(player), "Valid player required");
	precondition(Property.isProperty(property), "Valid property required");

	const propertyName = i18n[`PROPERTY_${property.id().toUpperCase()}`];

	const message = i18n.LOG_PROPERTY_BOUGHT
		.replace("{player}", coloredPlayer(player))
		.replace("{property}", propertyName);

	return new Log("property-bought", message);
};

exports.logRentPaid = function (amount, fromPlayer, toPlayer) {
	precondition(_.isNumber(amount) && amount > 0, "Amount must be > 0");
	precondition(Player.isPlayer(fromPlayer), "Valid fromPlayer");
	precondition(Player.isPlayer(toPlayer), "Valid toPlayer");

	const message = i18n.LOG_RENT_PAID
		.replace("{amount}", i18n.formatPrice(amount))
		.replace("{fromPlayer}", coloredPlayer(fromPlayer))
		.replace("{toPlayer}", coloredPlayer(toPlayer));

	return new Log("rent-paid", message);
};

exports.logSalaryReceived = function (player) {
	precondition(Player.isPlayer(player), "Valid player required");

	const message = i18n.LOG_SALARY.replace("{player}", coloredPlayer(player));

	return new Log("salary-earned", message);
};

exports.logTaxPaid = function (amount, player) {
	precondition(_.isNumber(amount) && amount > 0, "Amount > 0 required");
	precondition(Player.isPlayer(player), "Valid player required");

	const message = i18n.LOG_TAX_PAID
		.replace("{amount}", i18n.formatPrice(amount))
		.replace("{player}", coloredPlayer(player));

	return new Log("tax-paid", message);
};

exports.logOfferMade = function (player1, player2, offer) {
	precondition(Player.isPlayer(player1), "Valid player required");
	precondition(Player.isPlayer(player2), "Valid player required");
	precondition(
		TradeOffer.isOffer(offer) && !offer.isEmpty(),
		"Valid non-empty offer required"
	);

	const message = i18n.LOG_OFFER_MADE
		.replace("{player1}", coloredPlayer(player1))
		.replace("{player2}", coloredPlayer(player2))
		.replace("{offer1}", enumerateOfferFor(offer, 0))
		.replace("{offer2}", enumerateOfferFor(offer, 1));

	return new Log("offer-made", message);
};

exports.logOfferAccepted = () =>
	new Log("offer-accepted", i18n.LOG_OFFER_ACCEPTED);

exports.logOfferRejected = () =>
	new Log("offer-rejected", i18n.LOG_OFFER_REJECTED);

exports.logGoneToJail = function (player) {
	precondition(Player.isPlayer(player), "Valid player required");

	const message = i18n.LOG_GONE_TO_JAIL.replace(
		"{player}",
		coloredPlayer(player)
	);

	return new Log("gone-to-jail", message);
};

exports.logGoneBankrupt = function (player) {
	precondition(Player.isPlayer(player), "Valid player required");

	const message = i18n.LOG_GONE_BANKRUPT.replace(
		"{player}",
		coloredPlayer(player)
	);

	return new Log("gone-bankrupt", message);
};

exports.logGameWon = function (player) {
	precondition(Player.isPlayer(player), "Valid player");

	const message = i18n.LOG_GAME_WON.replace("{player}", coloredPlayer(player));

	return new Log("game-won", message);
};

exports.simpleLog = function () {
	return new Log("simple", "A message");
};
