"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const GameState = require("@domain/game-state");
const TradeOffer = require("@domain/trade-offer");
const Player = require("@domain/player");

exports.newChoice = function (player) {
	precondition(
		Player.isPlayer(player),
		"A TradeChoice requires a player to trade with"
	);

	return new TradeChoice(player);
};

class TradeChoice {
	constructor(player) {
		this.id = `trade-with-${player.id()}`;
		this.name = i18n.CHOICE_TRADE.replace("{player}", player.name());
		this._player = player;
	}

	equals(other) {
		return other instanceof TradeChoice && this._player.equals(other._player);
	}

	requiresDice() {
		return false;
	}

	requiresTrade() {
		return true;
	}

	otherPlayer() {
		return this._player;
	}

	computeNextState(state, offer) {
		precondition(
			GameState.isGameState(state),
			"TradeChoice requires a game state to compute the next one"
		);

		precondition(
			TradeOffer.isOffer(offer),
			"TradeChoice requires a game offer"
		);

		if (offer.isEmpty()) {
			return state;
		}

		return GameState.gameInTradeState(state.board(), state.players(), offer);
	}
}
