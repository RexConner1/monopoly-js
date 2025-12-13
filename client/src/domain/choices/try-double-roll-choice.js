"use strict";

const i18n = require("@i18n/i18n").i18n();
const GameState = require("@domain/game-state");
const { precondition } = require("@infrastructure/contract");

exports.newChoice = function () {
	return new TryDoubleRollChoice();
};

class TryDoubleRollChoice {
	constructor() {
		this.id = "try-double-roll";
		this.name = i18n.CHOICE_TRY_DOUBLE_ROLL;
	}

	equals(other) {
		return other instanceof TryDoubleRollChoice;
	}

	requiresDice() {
		return true;
	}

	computeNextState(state, dice) {
		precondition(
			GameState.isGameState(state),
			"TryDoubleRollChoice requires a game state to compute the next one"
		);

		precondition(
			dice,
			"TryDoubleRollChoice requires the result of a dice roll to compute the next state"
		);

		if (dice[0] !== dice[1]) {
			return GameState.turnEndState({
				board: state.board(),
				players: state.players(),
				currentPlayerIndex: state.currentPlayerIndex()
			});
		}

		const newPlayers = state.players().map((player, index) => {
			if (index === state.currentPlayerIndex()) {
				return player.unjail().move(dice);
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
