"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const GameState = require("@domain/game-state");
const Choices = require("@domain/choices");

// --------------------- FACTORY EXPORTS ---------------------

exports.newFlatTax = function (amount) {
	precondition(
		_.isNumber(amount) && amount > 0,
		"A PayFlatTaxChoice requires a tax greater than 0"
	);

	const name = i18n.CHOOSE_FLAT_TAX.replace("{amount}", i18n.formatPrice(amount));

	return new ChooseTaxTypeChoice(amount, name);
};

exports.newPercentageTax = function (percentage, amount) {
	precondition(
		_.isNumber(percentage) && percentage >= 1 && percentage < 100,
		"A PayPercentageTaxChoice requires a percentage between 1 and 100"
	);

	precondition(
		_.isNumber(amount) && amount > 0,
		"A PayPercentageTaxChoice requires an amount greater than 0 from which to calculate the percentage"
	);

	const taxAmount = Math.round(amount * (percentage / 100));
	const name = i18n.CHOOSE_PERCENTAGE_TAX.replace("{percentage}", percentage);

	return new ChooseTaxTypeChoice(taxAmount, name);
};

// --------------------- CLASS DEFINITION ---------------------

class ChooseTaxTypeChoice {
	constructor(amount, name) {
		this.id = "choose-tax-type";
		this.name = name;
		this._amount = amount;
	}

	equals(other) {
		return other instanceof ChooseTaxTypeChoice && this._amount === other._amount;
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"ChooseTaxTypeChoice requires a game state to compute the next one"
		);

		const currentPlayer = state.currentPlayer();
		return state.changeChoices(Choices.taxChoices(this._amount, currentPlayer));
	}
}
