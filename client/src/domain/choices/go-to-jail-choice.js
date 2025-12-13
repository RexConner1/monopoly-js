"use strict";

const i18n = require("@i18n/i18n").i18n();
const GameState = require("@domain/game-state");
const { precondition } = require("@infrastructure/contract");

exports.newChoice = function () {
	return new GoToJailChoice();
};

class GoToJailChoice {
	constructor() {
		// FIX: original incorrectly used 'finish-turn'
		this.id = "go-to-jail";
		this.name = i18n.CHOICE_GO_TO_JAIL;
	}

	equals(other) {
		return other instanceof GoToJailChoice;
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"GoToJailChoice requires a game state to compute the next one"
		);

		const newPlayers = state.players().map((player, index) => {
			if (index === state.currentPlayerIndex()) {
				return player.jail();
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
