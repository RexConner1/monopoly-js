"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const GameState = require("@domain/game-state");

exports.newChoice = function (amount) {
	precondition(
		_.isNumber(amount) && amount > 0,
		"A PayTaxChoice requires a tax greater than 0"
	);

	const name = i18n.CHOICE_PAY_TAX.replace("{amount}", i18n.formatPrice(amount));
	return new PayTaxChoice(amount, name);
};

class PayTaxChoice {
	constructor(amount, name) {
		this.id = "pay-tax";
		this.name = name;
		this._amount = amount;
	}

	equals(other) {
		return (
			other instanceof PayTaxChoice &&
			this._amount === other._amount
		);
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"PayTaxChoice requires a game state to compute the next one"
		);

		const amount = this._amount;

		const newPlayers = state.players().map((player, index) => {
			if (index === state.currentPlayerIndex()) {
				return player.pay(amount);
			}
			return player;
		});

		return GameState.turnEndStateAfterPay({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}
}
