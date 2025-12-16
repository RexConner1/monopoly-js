"use strict";
	
var GameState = require('@domain/game-state');
var Board = require('@domain/board');
var PayTaxChoice = require('@domain/choices/pay-tax-choice');
var PayRentChoice = require('@domain/choices/pay-rent-choice');
var GoBankruptChoice = require('@domain/choices/go-bankrupt-choice');
var ChooseTaxTypeChoice = require('@domain/choices/choose-tax-type-choice');
var CalculateDiceRentChoice = require('@domain/choices/calculate-dice-rent-choice');
var MoveChoice = require('@domain/choices/move-choice');
var FinishTurnChoice = require('@domain/choices/finish-turn-choice');
var BuyPropertyChoice = require('@domain/choices/buy-property-choice');
var TradeChoice = require('@domain/choices/trade-choice');
var GoToJailChoice = require('@domain/choices/go-to-jail-choice');
var PayDepositChoice = require('@domain/choices/pay-deposit-choice');
var TryDoubleRollChoice = require('@domain/choices/try-double-roll-choice');

var games = require('@test/unit/domain/sample-games');
var testData = require('@test/unit/test-data');
const { get } = require('http');

describe('A turnStart state', function () {
	describe('when player is in jail', function () {
		it('if player is broke, offers only the choice to try a double', function () {
			var state = games.firstPlayerBrokeInJail();
		
			assertChoices(state, [TryDoubleRollChoice.newChoice()]);
		});
		
		it('if player is not broke, offers both choices', function () {
			var state = games.firstPlayerInJail();
		
			assertChoices(state, [
				PayDepositChoice.newChoice(state.board().jailBailout()), TryDoubleRollChoice.newChoice()
			]);
		});
	});
	
	it('when player is not in jail, offers the roll-dice choice' +
		'and a choice to trade with each of the other players', function () {
		var state = games.turnStart();
		var tradeChoices = getPlayerTradeChoices(state);
				
		assertChoices(state, [MoveChoice.newChoice()].concat(tradeChoices));
	});
});

describe('A turnEnd state', function () {
	it('offers the finish-turn choice', function () {
		var state = turnEndStateWithPlayers(testData.players());
		var tradeChoices = getPlayerTradeChoices(state);
		assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
	});

	it('when player is not in jail and rolls doubles, player is offered to roll/trade again', function () {
		var choice = MoveChoice.newChoice();
		var state = choice.computeNextState(games.turnStart(), [5, 5]);
		var tradeChoices = getPlayerTradeChoices(state);
				
		assertChoices(state, [MoveChoice.newChoice()].concat(tradeChoices));
	});

	it('when player is not in jail and rolls doubles three times, player is sent to jail', function () {
		var choice = MoveChoice.newChoice();
		var state = choice.computeNextState(games.turnStart(), [5, 5]);
		state = choice.computeNextState(state, [5, 5]);
		state = choice.computeNextState(state, [1, 1]);
		var tradeChoices = getPlayerTradeChoices(state);
				
		assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
	});
	
	describe('when current player is on a property', function () {
		it('if it is not owned, offers to buy it', function () {
			assertBuyPropertyChoiceWhenOnPropertyWithoutOwner();
		});
		
		it('if it is owned, does not offer to buy it', function () {
			assertNoBuyPropertyChoiceWhenOnPropertyWithOwner();
		});
		
		it('if it is not owned but too expensive, does not offer to buy it', function () {
			assertNoBuyPropertyChoiceWhenOnPropertyTooExpensive();
		});
	});
	
	describe('when current player is on property owned by other player, offers to pay the rent of', function () {
		it('the estate rent if that property is an estate and owner does not own group', function () {
			assertRentToPayIsEstateRentWhenOwnerDoesNotOwnGroup();
		});
		
		it('double the estate rent if that property is an estate and owner owns group', function () {
			assertRentToPayIsDoubleTheEstateRentWhenOwnerOwnsGroup();
		});
		
		it('25$ if that property is a railroad and owner possess 1 railroad', function () {
			var state = games.playerOnRailroadOwnedByOtherWithOneRailroad();
			var secondPlayer = state.players()[1];
			
			assertChoices(state, [PayRentChoice.newChoice(25, secondPlayer)]);
		});
		
		it('50$ if that property is a railroad and owner possess 2 railroads', function () {
			var state = games.playerOnRailroadOwnedByOtherWithTwoRailroads();
			var secondPlayer = state.players()[1];
			
			assertChoices(state, [PayRentChoice.newChoice(50, secondPlayer)]);
		});
		
		it('100$ if that property is a railroad and owner possess 3 railroads', function () {
			var state = games.playerOnRailroadOwnedByOtherWithThreeRailroads();
			var secondPlayer = state.players()[1];
			
			assertChoices(state, [PayRentChoice.newChoice(100, secondPlayer)]);
		});
		
		it('200$ if that property is a railroad and owner possess 4 railroads', function () {
			var state = games.playerOnRailroadOwnedByOtherWithFourRailroads();
			var secondPlayer = state.players()[1];
			
			assertChoices(state, [PayRentChoice.newChoice(200, secondPlayer)]);
		});
		
		it('4 times the dice if that property is a company and owner possess only one company', function () {
			var state = games.playerOnCompanyOwnedByOther();
			var secondPlayer = state.players()[1];
			
			assertChoices(state, [CalculateDiceRentChoice.newChoice(4, secondPlayer)]);
		});
		
		it('10 times the dice if that property is a company and owner, possess all companies', function () {
			var state = games.playerOnCompanyOwnedByOtherWithAllCompanies();
			var secondPlayer = state.players()[1];
			
			assertChoices(state, [CalculateDiceRentChoice.newChoice(10, secondPlayer)]);
		});
	});
	
	it('when current player is on property owned by other player, but already paid, ' +
		'does not offer to pay the rent again', function () {
			assertNoPayRentChoiceWhenAlreadyPaidPropertyRent();
	});
	
	it('when current player is on property owned by other player, but rent is too high, ' +
		'offers bankruptcy', function () {
			assertBankruptcyChoiceWhenPropertyRentIsTooHigh();
	});
	
	describe('when current player is on luxury-tax', function () {
		it('offers a 75$ tax', function () {
			var state = games.playerOnLuxuryTax();
			
			assertChoices(state, [PayTaxChoice.newChoice(75)]);
		});
		
		it('if he is broke on luxury-tax, offers bankruptcy', function () {
			var state = games.playerBrokeOnLuxuryTax();
			
			assertChoices(state, [GoBankruptChoice.newChoice()]);
		});
		
		it('if he already paid, does not offer to pay the tax again', function () {
			assertNoPayTaxChoiceWhenAlreadyPaidLuxuryTax();
		});
	});
	
	describe('when current player is on income-tax', function () {
		it('offers a $200 flat tax or a 10% tax', function () {
			var state = games.playerOnIncomeTax();
			var currentPlayer = state.currentPlayer();
			
			assertChoices(state, [
				ChooseTaxTypeChoice.newPercentageTax(10, currentPlayer.netWorth()),
				ChooseTaxTypeChoice.newFlatTax(200)
			]);
		});
		
		it('if he already paid, does not offer to pay the tax again', function () {
			assertNoPayTaxChoiceWhenAlreadyPaidIncomeTax();
		});
	});
	
	it('if current player is on GoToJail, offers the only choice of going to jail', function () {
		var state = games.playerOnGoToJail();
		
		assertChoices(state, [
			GoToJailChoice.newChoice()
		]);
	});
});

function assertNoBuyPropertyChoiceWhenOnPropertyTooExpensive() {
	var state = games.playerBrokeOnEstate();
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertNoBuyPropertyChoiceWhenOnPropertyWithOwner() {
	var state = games.playerOnOwnedEstate();
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertBuyPropertyChoiceWhenOnPropertyWithoutOwner() {
	assertBuyPropertyChoiceWhenOnEstateWithoutOwner();
	assertBuyPropertyChoiceWhenOnRailroadWithoutOwner();
	assertBuyPropertyChoiceWhenOnCompanyWithoutOwner();
}

function assertBuyPropertyChoiceWhenOnEstateWithoutOwner() {
	var state = games.playerOnEstate();
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [
		BuyPropertyChoice.newChoice(Board.standard().properties().mediterranean),
		FinishTurnChoice.newChoice()
	].concat(tradeChoices));
}

function assertBuyPropertyChoiceWhenOnRailroadWithoutOwner() {
	var state = games.playerOnRailroad();
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [
		BuyPropertyChoice.newChoice(Board.standard().properties().readingRailroad),
		FinishTurnChoice.newChoice()
	].concat(tradeChoices));
}

function assertBuyPropertyChoiceWhenOnCompanyWithoutOwner() {
	var state = games.playerOnCompany();
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [
		BuyPropertyChoice.newChoice(Board.standard().properties().electricCompany),
		FinishTurnChoice.newChoice()
	].concat(tradeChoices));
}

function assertNoPayRentChoiceWhenAlreadyPaidPropertyRent() {
	assertNoPayRentChoiceWhenAlreadyPaidEstateRent();
	assertNoPayRentChoiceWhenAlreadyPaidRailroadRent();
	assertNoPayRentChoiceWhenAlreadyPaidCompanyRent();
}

function assertNoPayRentChoiceWhenAlreadyPaidEstateRent() {
	var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther(), true);
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertNoPayRentChoiceWhenAlreadyPaidRailroadRent() {
	var state = games.playerOnRailroadOwnedByOtherWithOneRailroad(true);
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertNoPayRentChoiceWhenAlreadyPaidCompanyRent() {
	var state = games.playerOnCompanyOwnedByOther(true);
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertNoPayTaxChoiceWhenAlreadyPaidLuxuryTax() {
	var state = games.playerOnLuxuryTax(true);
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertNoPayTaxChoiceWhenAlreadyPaidIncomeTax() {
	var state = games.playerOnIncomeTax(true);
	var tradeChoices = getPlayerTradeChoices(state);
	assertChoices(state, [FinishTurnChoice.newChoice()].concat(tradeChoices));
}

function assertBankruptcyChoiceWhenPropertyRentIsTooHigh() {
	assertBankruptcyChoiceWhenEstateRentIsTooHigh();
	assertBankruptcyChoiceWhenRailroadRentIsTooHigh();
}

function assertBankruptcyChoiceWhenEstateRentIsTooHigh() {
	var state = games.playerBrokeOnEstateOwnedByOther();
	assertChoices(state, [GoBankruptChoice.newChoice()]);
}

function assertBankruptcyChoiceWhenRailroadRentIsTooHigh() {
	var state = games.playerBrokeOnRailroadOwnedByOther();
	assertChoices(state, [GoBankruptChoice.newChoice()]);
}

function assertRentToPayIsEstateRentWhenOwnerDoesNotOwnGroup() {
	assertRentIsMediterraneanAvenueRent();
	assertRentIsBroadwalkRent();
}

function assertRentIsMediterraneanAvenueRent() {
	var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther(Board.standard().properties().mediterranean));
	var secondPlayer = testData.players()[1];
			
	assertChoices(state, [PayRentChoice.newChoice(2, secondPlayer)]);
}

function assertRentIsBroadwalkRent() {
	var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther(Board.standard().properties().boardwalk, 39));
	var secondPlayer = testData.players()[1];
			
	assertChoices(state, [PayRentChoice.newChoice(50, secondPlayer)]);
}

function assertRentToPayIsDoubleTheEstateRentWhenOwnerOwnsGroup() {
	assertRentIsDoubleMediterraneanAvenueRent();
	assertRentIsDoubleBroadwalkRent();
}

function assertRentIsDoubleMediterraneanAvenueRent() {
	var state = games.playerOnMediterraneanAvenueAndGroupOwned();
	var secondPlayer = testData.players()[1];
			
	assertChoices(state, [PayRentChoice.newChoice(4, secondPlayer)]);
}

function assertRentIsDoubleBroadwalkRent() {
	var state = games.turnEndStateWithPlayerOnBroadwalkAndGroupOwned();
	var secondPlayer = testData.players()[1];
			
	assertChoices(state, [PayRentChoice.newChoice(100, secondPlayer)]);
}

function assertChoices(state, choices) {
	expect(state.choices().length).to.eql(choices.length);
	_.each(state.choices(), function (choice, index) {
		expect(choice.equals(choices[index])).to.be(true);
	});
}

function turnEndStateWithPlayers(players, paid) {
	if (paid) {
		return GameState.turnEndStateAfterPay({
			board: Board.standard(),
			players: players,
			currentPlayerIndex: 0
		});
	}
	
	return GameState.turnEndState({
		board: Board.standard(),
		players: players,
		currentPlayerIndex: 0
	});
}

function playerOnEstateOwnedByOther(property, squareIndex) {
	var players = testData.players();
	return [
		players[0].move([0, squareIndex || 1]),
		players[1].buyProperty(property || Board.standard().properties().mediterranean),
		players[2]
	];
}

function getPlayerTradeChoices(state) {
	return _.filter(state.players(), function (player, index) {
		return index !== state.currentPlayerIndex();
	})
	.map(function (player) {
		return TradeChoice.newChoice(player);
	});
}
