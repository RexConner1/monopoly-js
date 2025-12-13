"use strict";

const CONFIG = {
	// Titles
	CONFIGURE_GAME_TITLE: "Monopoly - game configuration",

	// Buttons
	BUTTON_NEW_GAME: "New game",
	BUTTON_START_GAME: "Start game",
	BUTTON_ADD_PLAYER: "Click here to add a player",

	// Choices
	CHOICE_ROLL_DICE: "Roll the dice",
	CHOICE_FINISH_TURN: "Finish turn",
	CHOICE_BUY_PROPERTY: "Buy {property} for {price}",
	CHOICE_PAY_RENT: "Pay {rent} to {toPlayer}",
	CHOICE_GO_BANKRUPT: "Go bankrupt",
	CHOICE_PAY_TAX: "Pay a {amount} tax",
	CHOOSE_FLAT_TAX: "Choose a flat {amount} tax",
	CHOOSE_PERCENTAGE_TAX: "Choose a {percentage}% tax",
	CHOICE_CALCULATE_DICE_RENT:
		"Roll the dice and pay a rent of {multiplier} times the result",

	CHOICE_TRADE: "Trade with {player}",
	TRADE_MAKE_OFFER: "Make this offer",
	TRADE_CANCEL: "Cancel trade",
	CHOICE_ACCEPT_OFFER: "Accept offer",
	CHOICE_REJECT_OFFER: "Reject offer",
	
	CHOICE_GO_TO_JAIL: "Go to jail",
	CHOICE_PAY_DEPOSIT: "Pay a {money} deposit to get out of jail",
	CHOICE_TRY_DOUBLE_ROLL: "Try to roll a double to get out of jail",

	// Log messages
	LOG_DICE_ROLL: "{player} rolled a {die1} and a {die2}",
	LOG_DOUBLE_DICE_ROLL: "{player} rolled a double of {dice}",
	LOG_PROPERTY_BOUGHT: "{player} bought {property}",
	LOG_RENT_PAID: "{fromPlayer} paid {amount} to {toPlayer}",
	LOG_SALARY: "{player} passed GO and received $200",
	LOG_TAX_PAID: "{player} paid a {amount} tax",
	LOG_OFFER_MADE: "{player1} offered {player2} : {offer1} for {offer2}",
	LOG_OFFER_ACCEPTED: "The offer has been accepted",
	LOG_CONJUNCTION: "and",
	LOG_OFFER_REJECTED: "The offer has been rejected",
	LOG_GONE_TO_JAIL: "{player} went to jail",
	LOG_GONE_BANKRUPT: "{player} has gone bankrupt",
	LOG_GAME_WON: "{player} has won the game",

	// Squares
	CHANCE: "Chance",
	COMMUNITY_CHEST: "Community Chest",
	INCOME_TAX: "Income Tax",
	LUXURY_TAX: "Luxury Tax",
	LUXURY_TAX_DESCRIPTION: "Pay $75",
	INCOME_TAX_DESCRIPTION: "Pay 10% or $200",
	START_DESCRIPTION: "Collect $200 salary as you pass",
	VISITING_JAIL: "Just visiting",
	FREE_PARKING: "Free parking",
	GO_TO_JAIL: "Go to jail",

	// Properties (Companies)
	PROPERTY_COMPANY_WATER: "Water Works",
	PROPERTY_COMPANY_ELECTRIC: "Electric Company",

	// Railroads
	PROPERTY_RAILROAD_READING: "Reading Railroad",
	PROPERTY_RAILROAD_PENN: "Pennsylvania Railroad",
	PROPERTY_RAILROAD_B_O: "B.& O. Railroad",
	PROPERTY_RAILROAD_SHORT: "Short line",

	// Property Names
	PROPERTY_MD: "Mediterranean Avenue",
	PROPERTY_BT: "Baltic Avenue",
	PROPERTY_ET: "Oriental Avenue",
	PROPERTY_VT: "Vermont Avenue",
	PROPERTY_CN: "Connecticut Avenue",
	PROPERTY_CL: "St.Charles Place",
	PROPERTY_US: "States Avenue",
	PROPERTY_VN: "Virginia Avenue",
	PROPERTY_JK: "St.James Place",
	PROPERTY_TN: "Tennessee Avenue",
	PROPERTY_NY: "New York Avenue",
	PROPERTY_KT: "Kentucky Avenue",
	PROPERTY_IN: "Indiana Avenue",
	PROPERTY_IL: "Illinois Avenue",
	PROPERTY_AT: "Atlantic Avenue",
	PROPERTY_VR: "Ventnor Avenue",
	PROPERTY_MV: "Marvin Gardens",
	PROPERTY_PA: "Pacific Avenue",
	PROPERTY_NC: "North Carolina Avenue",
	PROPERTY_PN: "Pennsylvania Avenue",
	PROPERTY_PK: "Park Place",
	PROPERTY_BW: "Boardwalk",

	// Player
	DEFAULT_PLAYER_NAME: "Player {index}",

	// Player types
	PLAYER_TYPE_HUMAN: "Human",
	PLAYER_TYPE_COMPUTER: "Computer",

	// Price formatting
	PRICE_STRING: "Price {price}",
	formatPrice: (price) => `$${price}`,

	// Trade
	TRADE_TITLE: "Trade"
};

module.exports = CONFIG;
