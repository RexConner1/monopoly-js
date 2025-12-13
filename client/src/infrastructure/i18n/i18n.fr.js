"use strict";

const I18N_FR = {
	CONFIGURE_GAME_TITLE: "Monopoly - configuration de partie",

	// Buttons
	BUTTON_NEW_GAME: "Nouvelle partie",
	BUTTON_START_GAME: "Commencer la partie",
	BUTTON_ADD_PLAYER: "Cliquez ici pour ajouter un joueur",

	// Choices
	CHOICE_ROLL_DICE: "Lancer les dés",
	CHOICE_FINISH_TURN: "Terminer le tour",
	CHOICE_BUY_PROPERTY: "Acheter {property} pour {price}",
	CHOICE_PAY_RENT: "Payer {rent} à {toPlayer}",
	CHOICE_GO_BANKRUPT: "Faire faillite",
	CHOICE_PAY_TAX: "Payer une taxe de {amount}",
	CHOOSE_FLAT_TAX: "Choisir une taxe fixe de {amount}",
	CHOOSE_PERCENTAGE_TAX: "Choisir une taxe de {percentage}%",
	CHOICE_CALCULATE_DICE_RENT:
		"Lancer les dés et payer un loyer de {multiplier} fois le résultat",
	CHOICE_TRADE: "Échanger avec {player}",
	TRADE_MAKE_OFFER: "Faire cette offre",
	TRADE_CANCEL: "Annuler l'échange",
	CHOICE_ACCEPT_OFFER: "Accepter l'offre",
	CHOICE_REJECT_OFFER: "Rejeter l'offre",
	CHOICE_GO_TO_JAIL: "Aller en prison",
	CHOICE_PAY_DEPOSIT: "Payer une caution de {money} pour sortir de prison",
	CHOICE_TRY_DOUBLE_ROLL: "Tenter d'obtenir un doublé pour sortir de prison",

	// Log messages
	LOG_DICE_ROLL: "{player} a obtenu un {die1} et un {die2}",
	LOG_DOUBLE_DICE_ROLL: "{player} a obtenu un doublé de {dice}",
	LOG_PROPERTY_BOUGHT: "{player} a acheté {property}",
	LOG_RENT_PAID: "{fromPlayer} a payé {amount} à {toPlayer}",
	LOG_SALARY: "{player} a passé GO et reçu $200",
	LOG_TAX_PAID: "{player} a payé une taxe de {amount}",
	LOG_OFFER_MADE: "{player1} a offert à {player2} : {offer1} pour {offer2}",
	LOG_OFFER_ACCEPTED: "L'offre a été acceptée",
	LOG_CONJUNCTION: "et",
	LOG_OFFER_REJECTED: "L'offre a été rejetée",
	LOG_GONE_TO_JAIL: "{player} vient d'aller en prison",
	LOG_GONE_BANKRUPT: "{player} a fait faillite",
	LOG_GAME_WON: "{player} a gagné la partie",

	// Squares
	CHANCE: "Chance",
	COMMUNITY_CHEST: "Caisse commune",
	INCOME_TAX: "Impôt sur le revenu",
	LUXURY_TAX: "Taxe de luxe",
	LUXURY_TAX_DESCRIPTION: "Payez 75 $",
	INCOME_TAX_DESCRIPTION: "Payez 10% ou 200 $",
	START_DESCRIPTION: "Réclamez 200 $ de salaire en passant à",
	VISITING_JAIL: "En visite",
	FREE_PARKING: "Stationnement gratuit",
	GO_TO_JAIL: "Allez en prison",

	// Property names – Companies
	PROPERTY_COMPANY_WATER: "Aqueduc",
	PROPERTY_COMPANY_ELECTRIC: "Compagnie d'électricité",

	// Railroads
	PROPERTY_RAILROAD_READING: "Chemin de fer Reading",
	PROPERTY_RAILROAD_PENN: "Chemin de fer Pennsylvanie",
	PROPERTY_RAILROAD_B_O: "Chemin de fer B.& O.",
	PROPERTY_RAILROAD_SHORT: "Chemin de fer Petit Réseau",

	// Streets
	PROPERTY_MD: "Avenue de la Méditerrannée",
	PROPERTY_BT: "Avenue de la Baltique",
	PROPERTY_ET: "Avenue de l'Orient",
	PROPERTY_VT: "Avenue Vermont",
	PROPERTY_CN: "Avenue Connecticut",
	PROPERTY_CL: "Place St-Charles",
	PROPERTY_US: "Avenue des États-Unis",
	PROPERTY_VN: "Avenue Virginie",
	PROPERTY_JK: "Place St-Jacques",
	PROPERTY_TN: "Avenue Tennessee",
	PROPERTY_NY: "Avenue New York",
	PROPERTY_KT: "Avenue Kentucky",
	PROPERTY_IN: "Avenue Indiana",
	PROPERTY_IL: "Avenue Illinois",
	PROPERTY_AT: "Avenue Atlantique",
	PROPERTY_VR: "Avenue Ventnor",
	PROPERTY_MV: "Jardins Marvin",
	PROPERTY_PA: "Avenue Pacifique",
	PROPERTY_NC: "Avenue Caroline du Nord",
	PROPERTY_PN: "Avenue Pennsylvanie",
	PROPERTY_PK: "Place du parc",
	PROPERTY_BW: "Promenade",

	// Player name
	DEFAULT_PLAYER_NAME: "Joueur {index}",

	// Player types
	PLAYER_TYPE_HUMAN: "Humain",
	PLAYER_TYPE_COMPUTER: "Ordinateur",

	// Price formatting
	PRICE_STRING: "Prix {price}",
	formatPrice: (price) => `${price} $`,

	// Trade
	TRADE_TITLE: "Échange"
};

module.exports = I18N_FR;
