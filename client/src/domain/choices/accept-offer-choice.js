"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const GameState = require("@domain/game-state");
const TradeOffer = require("@domain/trade-offer");

exports.newChoice = function (offer) {
	precondition(TradeOffer.isOffer(offer), "An AcceptOfferChoice requires an offer");
	return new AcceptOfferChoice(offer);
};

class AcceptOfferChoice {
	constructor(offer) {
		this.id = "accept-offer";
		this.name = i18n.CHOICE_ACCEPT_OFFER;
		this._offer = offer;
	}

	equals(other) {
		if (!(other instanceof AcceptOfferChoice)) return false;
		return this._offer.equals(other._offer);
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"AcceptOfferChoice requires a game state to compute the next one"
		);

		const playerIndex = _.findIndex(state.players(), player =>
			player.id() === this._offer.currentPlayerId()
		);

		precondition(
			playerIndex >= 0,
			"Offer accepted must have been made by a valid player"
		);

		const newPlayers = state.players().map(player => {
			if (player.id() === this._offer.currentPlayerId()) {
				return transferPossessionsInOffer(player, this._offer, 0, 1);
			}

			if (player.id() === this._offer.otherPlayerId()) {
				return transferPossessionsInOffer(player, this._offer, 1, 0);
			}

			return player;
		});

		return GameState.turnStartState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: playerIndex
		});
	}
}

// ---------------------- Helper Function ----------------------

const transferPossessionsInOffer = (player, offer, fromIndex, toIndex) => {
	let newPlayer = player.pay(offer.moneyFor(fromIndex)).earn(offer.moneyFor(toIndex));

	newPlayer = _.reduce(
		offer.propertiesFor(fromIndex),
		(p, property) => p.loseProperty(property),
		newPlayer
	);

	newPlayer = _.reduce(
		offer.propertiesFor(toIndex),
		(p, property) => p.gainProperty(property),
		newPlayer
	);

	return newPlayer;
};
