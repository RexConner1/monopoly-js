"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");
const GameState = require("@domain/game-state");

exports.newChoice = function () {
	return new GoBankruptChoice();
};

class GoBankruptChoice {
	constructor() {
		this.id = "go-bankrupt";
		this.name = i18n.CHOICE_GO_BANKRUPT;
	}

	equals(other) {
		return other instanceof GoBankruptChoice;
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"GoBankruptChoice requires a game state to compute the next one"
		);

		return goBankruptNextState(state);
	}
}


const goBankruptNextState = (state) => {
	const newPlayers = state.players().filter(
		(_, index) => index !== state.currentPlayerIndex()
	);

	// Only one player left → they win
	if (newPlayers.length === 1) {
		return GameState.gameFinishedState(state.board(), newPlayers[0]);
	}

	const newPlayerIndex = state.currentPlayerIndex() % newPlayers.length;

	return GameState.turnStartState({
		board: state.board(),
		players: newPlayers,
		currentPlayerIndex: newPlayerIndex
	});
};
