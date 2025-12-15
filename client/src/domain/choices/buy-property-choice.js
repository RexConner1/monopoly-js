"use strict";

const i18n = require("@i18n/i18n").i18n();
const { precondition } = require("@infrastructure/contract");

const Property = require("@domain/squares/property/property");
const GameState = require("@domain/game-state");

exports.newChoice = function (property) {
	precondition(Property.isProperty(property), "Buy property choice requires a property");
	return new BuyPropertyChoice(property);
};

class BuyPropertyChoice {
	constructor(property) {
		this.id = "buy-property";

		const propertyName = i18n["PROPERTY_" + property.id().toUpperCase()];

		this.name = i18n.CHOICE_BUY_PROPERTY
			.replace("{property}", propertyName)
			.replace("{price}", i18n.formatPrice(property.price()));

		this._property = property;
	}

	equals(other) {
		return other instanceof BuyPropertyChoice &&
			this._property.equals(other._property);
	}

	requiresDice() {
		return false;
	}

	computeNextState(state) {
		precondition(
			GameState.isGameState(state),
			"BuyPropertyChoice requires a game state to compute the next one"
		);

		return transferOwnership(state, this._property);
	}
}


const transferOwnership = (state, property) => {
	const newPlayers = state.players().map((player, index) => {
		if (index === state.currentPlayerIndex()) {
			return player.buyProperty(property);
		}
		return player;
	});

	return GameState.turnEndState({
		board: state.board(),
		players: newPlayers,
		currentPlayerIndex: state.currentPlayerIndex(),
		consecutiveDoubles: state.consecutiveDoubles()
	});
};
