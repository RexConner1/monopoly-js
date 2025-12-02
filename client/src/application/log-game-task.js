"use strict";

const { precondition } = require("@infrastructure/contract");
const Messages = require("@domain/messages");

exports.start = function (playGameTask) {
	precondition(playGameTask, "LogGameTask requires a PlayGameTask");
	return new LogGameTask(playGameTask);
};

class LogGameTask {
	constructor(playGameTask) {
		this._messages = new Rx.ReplaySubject(1);
		watchGame(this._messages, playGameTask);
	}

	messages() {
		return this._messages.asObservable();
	}
}

// ----------------------- WATCH GAME -----------------------

const watchGame = (messages, playGameTask) => {
	Rx.Observable.merge(
		onDiceRolled(playGameTask),
		onPropertyBought(playGameTask),
		onRentPaid(playGameTask),
		onSalaryEarned(playGameTask),
		onTaxPaid(playGameTask),
		onOfferMade(playGameTask),
		onOfferAcceptedOrRejected(playGameTask),
		onPlayerJailed(playGameTask),
		onPlayerGoneBankrupt(playGameTask),
		onGameWon(playGameTask)
	)
		.takeUntil(playGameTask.completed())
		.subscribe(messages);
};

// ----------------------- DICE -----------------------

const diceMessage = (dice) =>
	dice.firstDie === dice.secondDie
		? Messages.logDoubleDiceRoll(dice.player, dice.firstDie)
		: Messages.logDiceRoll(dice.player, dice.firstDie, dice.secondDie);

const onDiceRolled = (playGameTask) =>
	playGameTask
		.rollDiceTaskCreated()
		.flatMap(task =>
			task
				.diceRolled()
				.last()
				.withLatestFrom(playGameTask.gameState(), combineDiceAndState)
		)
		.map(dice => diceMessage(dice));

// ----------------------- PROPERTY BOUGHT -----------------------

const onPropertyBought = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(states => {
			if (_.isFunction(states.previous.offer)) return false;

			return _.some(states.current.players(), (player, index) => {
				const currentProps = player.properties();
				const prevProps = states.previous.players()[index].properties();
				return currentProps.length > prevProps.length;
			});
		})
		.map(states => {
			const player =
				states.previous.players()[states.current.currentPlayerIndex()];
			const newProperty = findNewProperty(states);
			return Messages.logPropertyBought(player, newProperty);
		});

// ----------------------- RENT PAID -----------------------

const onRentPaid = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(states => {
			if (_.isFunction(states.previous.offer)) return false;

			const fromPlayer = _.find(states.current.players(), (player, index) =>
				player.money() < states.previous.players()[index].money()
			);

			const toPlayer = _.find(states.current.players(), (player, index) =>
				player.money() > states.previous.players()[index].money()
			);

			return !!fromPlayer && !!toPlayer;
		})
		.map(states => {
			const fromPlayer = _.find(states.current.players(), (player, index) =>
				player.money() < states.previous.players()[index].money()
			);

			const toPlayer = _.find(states.current.players(), (player, index) =>
				player.money() > states.previous.players()[index].money()
			);

			const amount =
				states.previous
					.players()
					[states.current.currentPlayerIndex()].money() -
				states.current
					.players()
					[states.current.currentPlayerIndex()].money();

			return Messages.logRentPaid(amount, fromPlayer, toPlayer);
		});

// ----------------------- SALARY -----------------------

const onSalaryEarned = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(states =>
			_.reduce(
				states.current.players(),
				(memo, player, index) => {
					const prev = states.previous.players()[index];
					if (index === states.current.currentPlayerIndex()) {
						return memo && player.money() === prev.money() + 200;
					}
					return memo && player.money() === prev.money();
				},
				true
			)
		)
		.map(states => {
			const player =
				states.current.players()[states.current.currentPlayerIndex()];
			return Messages.logSalaryReceived(player);
		});

// ----------------------- OFFERS -----------------------

const onOfferMade = (playGameTask) =>
	playGameTask
		.gameState()
		.filter(state => _.isFunction(state.offer))
		.map(state => {
			const currentPlayerIndex = _.findIndex(
				state.players(),
				player => player.id() === state.offer().currentPlayerId()
			);

			const otherPlayerIndex = _.findIndex(
				state.players(),
				player => player.id() === state.offer().otherPlayerId()
			);

            const currentPlayer = state.players()[currentPlayerIndex];
			const otherPlayer = state.players()[otherPlayerIndex];

			return Messages.logOfferMade(currentPlayer, otherPlayer, state.offer());
		});

const onOfferAcceptedOrRejected = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(states => _.isFunction(states.previous.offer) && !states.current.offer)
		.map(states => {
			const anyChange = _.some(states.previous.players(), (player, index) => {
				const current = states.current.players()[index];
				if (!current) return true;

				const moneyChanged = player.money() !== current.money();
				const propsChanged = !sameProperties(
					player.properties(),
					current.properties()
				);

				return moneyChanged || propsChanged;
			});

			return anyChange
				? Messages.logOfferAccepted()
				: Messages.logOfferRejected();
		});

// ----------------------- PROPERTIES UTILITY -----------------------

const sameProperties = (left, right) => {
	if (left.length !== right.length) return false;
	return _.every(left, (prop, index) => prop.id() === right[index].id());
};

// ----------------------- TAX -----------------------

const onTaxPaid = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(states => {
			const payer = _.find(states.current.players(), (player, index) =>
				player.money() < states.previous.players()[index].money()
			);

			if (!payer) return false;

			const onlyOneChanged = _.every(states.current.players(), (player, index) =>
				player.id() === payer.id() ||
				player.money() === states.previous.players()[index].money()
			);

			const noPropertyChanged = _.every(states.current.players(), (player, index) =>
				player.properties().length ===
				states.previous.players()[index].properties().length
			);

			return onlyOneChanged && noPropertyChanged;
		})
		.map(states => {
			const payer = _.find(states.current.players(), (player, index) =>
				player.money() < states.previous.players()[index].money()
			);

			const amount =
				states.previous.players()[states.current.currentPlayerIndex()].money() -
				payer.money();

			return Messages.logTaxPaid(amount, payer);
		});

// ----------------------- JAIL -----------------------

const onPlayerJailed = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(
			states =>
				!states.previous.players()[states.current.currentPlayerIndex()].jailed() &&
				states.current.players()[states.current.currentPlayerIndex()].jailed()
		)
		.map(states => {
			const player =
				states.current.players()[states.current.currentPlayerIndex()];
			return Messages.logGoneToJail(player);
		});

// ----------------------- BANKRUPT -----------------------

const onPlayerGoneBankrupt = (playGameTask) =>
	combineWithPrevious(playGameTask.gameState())
		.filter(
			states =>
				states.previous.players().length !== states.current.players().length
		)
		.map(states => {
			const bankruptPlayer = _.find(states.previous.players(), (player, index) =>
				index >= states.current.players().length ||
				player.id() !== states.current.players()[index].id()
			);

			return Messages.logGoneBankrupt(bankruptPlayer);
		});

// ----------------------- GAME WON -----------------------

const onGameWon = (playGameTask) =>
	playGameTask
		.gameState()
		.filter(state => state.players().length === 1)
		.map(state => Messages.logGameWon(state.players()[0]));

// ----------------------- HELPERS -----------------------

const findNewProperty = (states) => {
	const prevProps =
		states.previous.players()[states.current.currentPlayerIndex()].properties();

	const currProps =
		states.current.players()[states.current.currentPlayerIndex()].properties();

	return _.find(currProps, prop => !_.contains(prevProps.map(p => p.id()), prop.id()));
};

const combineWithPrevious = (observable) => {
	let previous;
	const subject = new Rx.Subject();

	observable.subscribe(
		current => {
			if (previous) {
			 subject.onNext({ previous, current });
			}
			previous = current;
		},
		subject,
		_.noop
	);

	return subject.asObservable();
};

const combineDiceAndState = (dice, state) => ({
	firstDie: dice[0],
	secondDie: dice[1],
	player: state.players()[state.currentPlayerIndex()]
});
