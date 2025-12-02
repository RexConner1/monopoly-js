"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const GameState = require("@domain/game-state");
const Player = require("@domain/player");
const Choices = require("@domain/choices");

exports.newChoice = function (multiplier, toPlayer) {
	precondition(
		_.isNumber(multiplier) && multiplier > 0,
		"Calculate dice rent choice requires a multiplier greater than 0"
	);

	precondition(
		toPlayer && Player.isPlayer(toPlayer),
		"Calculate dice rent choice requires the player to pay to"
	);

	return new CalculateDiceRentChoice(multiplier, toPlayer);
};

class CalculateDiceRentChoice {
	constructor(multiplier, toPlayer) {
		this.id = "calculate-dice-rent";
		this.name = i18n.CHOICE_CALCULATE_DICE_RENT.replace("{multiplier}", multiplier);
		this._multiplier = multiplier;
		this._toPlayer = toPlayer;
	}

	equals(other) {
		return (
			other instanceof CalculateDiceRentChoice &&
			this._multiplier === other._multiplier &&
			this._toPlayer.id() === other._toPlayer.id()
		);
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

		const rent = this._multiplier * (dice[0] + dice[1]);
		const currentPlayer = state.currentPlayer();

		return state.changeChoices(
			Choices.rentChoices(rent, currentPlayer, this._toPlayer)
		);
	}
}
