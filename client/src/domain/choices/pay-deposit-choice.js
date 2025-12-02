"use strict";

const i18n = require("@i18n/i18n").i18n();
const GameState = require("@domain/game-state");
const { precondition } = require("@infrastructure/contract");

exports.newChoice = function (amount) {
	precondition(
		_.isNumber(amount) && amount > 0,
		"A Pay Deposit Choice requires an amount greater than 0"
	);

	return new PayDepositChoice(amount);
};

class PayDepositChoice {
	constructor(amount) {
		this.id = "pay-deposit";
		this._amount = amount;
		this.name = i18n.CHOICE_PAY_DEPOSIT.replace(
			"{money}",
			i18n.formatPrice(amount)
		);
	}

	equals(other) {
		return other instanceof PayDepositChoice;
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"PayDepositChoice requires a game state to compute the next one"
		);

		const amount = this._amount;

		const newPlayers = state.players().map((player, index) => {
			if (index === state.currentPlayerIndex()) {
				return player.unjail().pay(amount);
			}
			return player;
		});

		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}
}
