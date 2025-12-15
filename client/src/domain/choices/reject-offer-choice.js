"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const GameState = require("@domain/game-state");

exports.newChoice = function (offerCurrentPlayerId) {
	precondition(
		_.isString(offerCurrentPlayerId),
		"A RejectOfferChoice requires an offer current player id"
	);

	return new RejectOfferChoice(offerCurrentPlayerId);
};

class RejectOfferChoice {
	constructor(offerCurrentPlayerId) {
		this.id = "reject-offer";
		this.name = i18n.CHOICE_REJECT_OFFER;
		this._offerCurrentPlayerId = offerCurrentPlayerId;
	}

	equals(other) {
		return (
			other instanceof RejectOfferChoice &&
			this._offerCurrentPlayerId === other._offerCurrentPlayerId
		);
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"RejectOfferChoice requires a game state to compute the next one"
		);

		const playerIndex = _.findIndex(
			state.players(),
			player => player.id() === this._offerCurrentPlayerId
		);

		precondition(
			playerIndex >= 0,
			"Offer rejected must have been made by a valid player"
		);

		return GameState.turnStartState({
			board: state.board(),
			players: state.players(),
			currentPlayerIndex: playerIndex,
			consecutiveDoubles: state.consecutiveDoubles()
		});
	}
}
