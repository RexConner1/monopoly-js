"use strict";

const GoBankruptChoice = require("@domain/choices/go-bankrupt-choice");
const PayRentChoice = require("@domain/choices/pay-rent-choice");
const PayTaxChoice = require("@domain/choices/pay-tax-choice");
const Player = require("@domain/player");

const { precondition } = require("@infrastructure/contract");

exports.rentChoices = function (rent, fromPlayer, toPlayer) {
	precondition(_.isNumber(rent) && rent > 0, "Rent choices requires a rent greater than 0");
	precondition(fromPlayer && Player.isPlayer(fromPlayer), "Rent choices requires the player who pays");
	precondition(toPlayer && Player.isPlayer(toPlayer), "Rent choices requires the player to pay to");

	if (rent > fromPlayer.money()) {
		return [GoBankruptChoice.newChoice()];
	}

	return [PayRentChoice.newChoice(rent, toPlayer)];
};

exports.taxChoices = function (tax, fromPlayer) {
	precondition(_.isNumber(tax) && tax > 0, "Tax choices requires a tax greater than 0");
	precondition(fromPlayer && Player.isPlayer(fromPlayer), "Tax choices requires the player who pays");

	if (tax > fromPlayer.money()) {
		return [GoBankruptChoice.newChoice()];
	}

	return [PayTaxChoice.newChoice(tax)];
};
