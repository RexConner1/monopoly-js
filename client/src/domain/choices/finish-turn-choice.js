"use strict";

const i18n = require("@i18n/i18n").i18n();
const GameState = require("@domain/game-state");
const { precondition } = require("@infrastructure/contract");

exports.newChoice = function () {
	return new FinishTurnChoice();
};

class FinishTurnChoice {
	constructor() {
		this.id = "finish-turn";
		this.name = i18n.CHOICE_FINISH_TURN;
	}

	equals(other) {
		return other instanceof FinishTurnChoice;
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"FinishTurnChoice requires a game state to compute the next one"
		);

		return GameState.turnStartState({
			board: state.board(),
			players: state.players(),
			currentPlayerIndex:
				(state.currentPlayerIndex() + 1) % state.players().length
		});
	}
}
