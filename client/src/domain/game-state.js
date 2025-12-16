"use strict";

const Board = require("@domain/board");
const Choices = require("@domain/choices");
const MoveChoice = require("@domain/choices/move-choice");
const FinishTurnChoice = require("@domain/choices/finish-turn-choice");
const BuyPropertyChoice = require("@domain/choices/buy-property-choice");
const ChooseTaxTypeChoice = require("@domain/choices/choose-tax-type-choice");
const CalculateDiceRentChoice = require("@domain/choices/calculate-dice-rent-choice");
const TradeChoice = require("@domain/choices/trade-choice");
const AcceptOfferChoice = require("@domain/choices/accept-offer-choice");
const RejectOfferChoice = require("@domain/choices/reject-offer-choice");
const TradeOffer = require("@domain/trade-offer");
const GoToJailChoice = require("@domain/choices/go-to-jail-choice");
const PayDepositChoice = require("@domain/choices/pay-deposit-choice");
const TryDoubleRollChoice = require("@domain/choices/try-double-roll-choice");

const { precondition } = require("@infrastructure/contract");

// ---------------------- Exports ----------------------

exports.isGameState = function (candidate) {
	return candidate instanceof GameState;
};

exports.gameInTradeState = function (board, players, offer) {
	precondition(Board.isBoard(board), "GameInTradeState requires a board");
	precondition(_.isArray(players), "GameInTradeState requires an array of players");
	precondition(TradeOffer.isOffer(offer), "GameInTradeState requires an offer");

	const otherPlayerIndex = _.findIndex(players, (player) =>
		player.id() === offer.otherPlayerId()
	);

	precondition(otherPlayerIndex >= 0, "Offer must be destined to an existing player");

	const choices = [
		AcceptOfferChoice.newChoice(offer),
		RejectOfferChoice.newChoice(offer.currentPlayerId())
	];

	const state = new GameState(
		{
			board,
			players,
			currentPlayerIndex: otherPlayerIndex
		},
		choices
	);

	state.offer = () => offer;

	return state;
};

exports.gameFinishedState = function (board, winner) {
	precondition(Board.isBoard(board), "GameFinishedState requires a board");
	precondition(winner, "GameFinishedState requires a winner");

	return new GameState(
		{
			board,
			players: [winner],
			currentPlayerIndex: 0
		},
		[]
	);
};

exports.turnStartState = function (info) {
	validateInfo(info);

	const enrichedInfo = {
		...info,
		consecutiveDoubles: info.consecutiveDoubles ? info.consecutiveDoubles : 0
	};
	
	const choices = newTurnChoices(enrichedInfo);
	
	return new GameState(enrichedInfo, choices);
};

exports.turnEndState = function (info) {
	validateInfo(info);

	const choices = turnEndChoices(info);

	return new GameState(info, choices);
};

exports.turnEndStateAfterPay = function (info) {
	validateInfo(info);

	const finishingTurnLogic = getFinishingTurnLogic(info)

	return new GameState(info, finishingTurnLogic());
};

// ---------------------- GameState Class ----------------------

class GameState {
	constructor(info, choices) {
		this._board = info.board;
		this._players = info.players;
		this._currentPlayerIndex = info.currentPlayerIndex;
		this._choices = choices;
		this._consecutiveDoubles = info.consecutiveDoubles;
	}

	board() {
		return this._board;
	}

	players() {
		return this._players;
	}

	currentPlayer() {
		return this._players[this._currentPlayerIndex];
	}

	currentPlayerIndex() {
		return this._currentPlayerIndex;
	}

	choices() {
		return this._choices;
	}

	consecutiveDoubles() {
		return this._consecutiveDoubles;
	}

	equals(other) {
		precondition(
			other,
			"Testing a game state for equality with something else requires that something else"
		);

		if (this === other) return true;
		if (!(other instanceof GameState)) return false;

		if (!this._board.equals(other._board)) return false;
		if (!deepEquals(this._players, other._players)) return false;
		if (this._currentPlayerIndex !== other._currentPlayerIndex) return false;
		if (!deepEquals(this._choices, other._choices)) return false;

		return true;
	}

	changeChoices(choices) {
		precondition(
			_.isArray(choices),
			"Changing a game state choices list requires a list of choices"
		);

		const state = new GameState(
			{
				board: this._board,
				players: this._players,
				currentPlayerIndex: this._currentPlayerIndex,
				consecutiveDoubles: this._consecutiveDoubles
			},
			choices
		);

		state._oldChoices = this._choices;

		return state;
	}

	restoreChoices() {
		precondition(
			_.isArray(this._oldChoices),
			"Restoring the choices of a game state require a list of choices to restore"
		);

		return new GameState(
			{
				board: this._board,
				players: this._players,
				currentPlayerIndex: this._currentPlayerIndex,
				consecutiveDoubles: this._consecutiveDoubles
			},
			this._oldChoices
		);
	}
}

// ---------------------- Turn Logic ----------------------

function newTurnChoices(info) {
	const currentPlayer = info.players[info.currentPlayerIndex];

	if (currentPlayer.jailed()) {
		if (currentPlayer.money() > info.board.jailBailout()) {
			return [
				PayDepositChoice.newChoice(info.board.jailBailout()),
				TryDoubleRollChoice.newChoice()
			];
		}
		return [TryDoubleRollChoice.newChoice()];
	}

	const tradeChoices = info.players
		.filter((_, index) => index !== info.currentPlayerIndex)
		.map((player) => TradeChoice.newChoice(player));

	return [MoveChoice.newChoice()].concat(tradeChoices);
}

function turnEndChoices(info) {
	const currentPlayer = info.players[info.currentPlayerIndex];
	const currentPosition = determineIfPlayerRolledTooManyDoubles(info);
	const currentSquare = info.board.squares()[currentPosition];
	const finishingTurnLogic = getFinishingTurnLogic(info);

	return choicesForSquare(currentSquare, info.players, currentPlayer, finishingTurnLogic);
}

function choicesForSquare(square, players, currentPlayer, finishingTurnLogic) {
	return square.match({
		estate: choicesForProperty(square, players, currentPlayer, finishingTurnLogic),
		railroad: choicesForProperty(square, players, currentPlayer, finishingTurnLogic),
		company: choicesForProperty(square, players, currentPlayer, finishingTurnLogic),
		"luxury-tax": payLuxuryTax(currentPlayer),
		"income-tax": payIncomeTax(currentPlayer),
		"go-to-jail": goToJail,
		_: () => onlyFinishTurn(finishingTurnLogic)
	});
}

function goToJail() {
	return [GoToJailChoice.newChoice()];
}

function payLuxuryTax(currentPlayer) {
	return function (amount) {
		return Choices.taxChoices(amount, currentPlayer);
	};
}

function payIncomeTax(currentPlayer) {
	return function (percentageTax, flatTax) {
		return [
			ChooseTaxTypeChoice.newPercentageTax(percentageTax, currentPlayer.netWorth()),
			ChooseTaxTypeChoice.newFlatTax(flatTax)
		];
	};
}

function onlyFinishTurn(finishingTurnLogic) {
	return finishingTurnLogic();
}

function choicesForProperty(square, players, currentPlayer, finishingTurnLogic) {
	return function (_, price) {
		const owner = getOwner(players, square);

		if (owner && owner.id() !== currentPlayer.id()) {
			const rent = square.rent(owner.properties());

			if (rent.amount) {
				return Choices.rentChoices(rent.amount, currentPlayer, owner);
			}

			return [CalculateDiceRentChoice.newChoice(rent.multiplier, owner)];
		}

		if (!owner && currentPlayer.money() > price) {
			return [BuyPropertyChoice.newChoice(square)].concat(finishingTurnLogic());
		}

		return finishingTurnLogic();
	};
}

// ---------------------- Helpers ----------------------

function getOwner(players, square) {
	return _.find(players, (player) =>
		_.some(player.properties(), (property) => property.equals(square))
	);
}

function validateInfo(info) {
	precondition(Board.isBoard(info.board), "GameState requires a board");
	precondition(
		_.isArray(info.players) && info.players.length >= 2,
		"GameState requires an array of at least 2 players"
	);
	precondition(
		_.isNumber(info.currentPlayerIndex) &&
			validIndex(info.players, info.currentPlayerIndex),
		"GameState requires the index of the current player"
	);
}

function validIndex(array, index) {
	return index >= 0 && index < array.length;
}

function deepEquals(left, right) {
	if (left.length !== right.length) return false;
	return _.every(left, (element, idx) => element.equals(right[idx]));
}

function getFinishingTurnLogic(info) {
	const tradeChoices = info.players
		.filter((_, index) => index !== info.currentPlayerIndex)
		.map((player) => TradeChoice.newChoice(player));
	
	if (info.consecutiveDoubles && info.consecutiveDoubles < 3) {
		return () => {return [MoveChoice.newChoice()]}//.concat(tradeChoices)};
	} else {
		return () => {return [FinishTurnChoice.newChoice()]}//.concat(tradeChoices)};
	}
}

function determineIfPlayerRolledTooManyDoubles(info, doublesForJail = 3) {
	const currentPlayer = info.players[info.currentPlayerIndex];
	const tooManyDoubles = info.consecutiveDoubles && info.consecutiveDoubles >= doublesForJail;
	const newPosition = !tooManyDoubles ? currentPlayer.position() : info.board.jailPosition();
	return newPosition;
}
