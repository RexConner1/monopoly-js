"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const Player = require("@domain/player");
const GameState = require("@domain/game-state");

exports.newChoice = function (rent, toPlayer) {
	precondition(
		_.isNumber(rent) && rent > 0,
		"Pay rent choice requires a rent greater than 0"
	);
	precondition(
		toPlayer && Player.isPlayer(toPlayer),
		"Pay rent choice requires the player to pay to"
	);

	return new PayRentChoice(rent, toPlayer.id(), toPlayer.name());
};

class PayRentChoice {
	constructor(rent, toPlayerId, toPlayerName) {
		this.id = "pay-rent";
		this._rent = rent;
		this._toPlayerId = toPlayerId;
		this._toPlayerName = toPlayerName;

		this.name = i18n.CHOICE_PAY_RENT
			.replace("{rent}", i18n.formatPrice(rent))
			.replace("{toPlayer}", toPlayerName);
	}

	equals(other) {
		return (
			other instanceof PayRentChoice &&
			this._rent === other._rent &&
			this._toPlayerId === other._toPlayerId
		);
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"PayRentChoice requires a game state to compute the next one"
		);

		const rent = this._rent;
		const toPlayerId = this._toPlayerId;

		const newPlayers = state.players().map((player, index) => {
			if (index === state.currentPlayerIndex()) {
				return player.pay(rent);
			}

			if (player.id() === toPlayerId) {
				return player.earn(rent);
			}

			return player;
		});

		return GameState.turnEndStateAfterPay({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex(),
			consecutiveDoubles: state.consecutiveDoubles()
		});
	}
}
