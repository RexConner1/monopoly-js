"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");
const GameState = require("@domain/game-state");

exports.newChoice = function () {
	return new RollDiceChoice();
};

class RollDiceChoice {
	constructor() {
		this.id = "roll-dice";
		this.name = i18n.CHOICE_ROLL_DICE;
	}

	equals(other) {
		return other instanceof RollDiceChoice;
	}

	requiresDice() {
		return true;
	}

	computeNextState(state, dice) {
		precondition(
			GameState.isGameState(state),
			"To compute next state, a roll-dice choice requires the actual state"
		);

		precondition(
			dice,
			"To compute next state, a roll-dice choice requires the result of a dice roll"
		);

		const isDouble = dice[0] === dice[1];
		const newCount = isDouble ? state.consecutiveDoubles() + 1 : 0;
		const tooManyDoubles = newCount >= 3;

		const newPlayers = state.players().map((player, index) => {
			if (index === state.currentPlayerIndex()) {
				return tooManyDoubles ? player.jail() : player.move(dice);
			}
			return player;
		});

		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex(),
			consecutiveDoubles: tooManyDoubles ? 0 : newCount
		});
	}
}
