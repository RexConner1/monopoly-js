"use strict";

const { precondition } = require("@infrastructure/contract");

exports.start = function (playGameTask) {
	precondition(playGameTask, "HandleChoicesTask requires a PlayGameTask");

	const humanChoices = new Rx.ReplaySubject(1);
	const completed = new Rx.AsyncSubject();

	// Human choices stream
	gameStateForPlayerType(playGameTask, "human", completed)
		.map(state => state.choices())
		.subscribe(humanChoices);

	const task = new HandleChoicesTask(humanChoices, completed);

	// Computer player decisions
	gameStateForPlayerType(playGameTask, "computer", completed)
		.filter(state => state.choices().length > 0)
		.map(computerPlayer)
		.subscribe(applyChoice(task));

	return task;
};


class HandleChoicesTask {
	constructor(humanChoices, completed) {
		this._humanChoices = humanChoices;
		this._choiceMade = new Rx.Subject();
		this._completed = completed;
	}

	stop() {
		this._completed.onNext(true);
		this._completed.onCompleted();
	}

	choices() {
		return this._humanChoices.takeUntil(this._completed);
	}

	choiceMade() {
		return this._choiceMade.takeUntil(this._completed);
	}

	completed() {
		return this._completed.asObservable();
	}

	makeChoice(choice, arg) {
		this._humanChoices.onNext([]); // clear choices
		this._choiceMade.onNext({ choice, arg });
	}
}


const gameStateForPlayerType = (playGameTask, type, completed) =>
	playGameTask
		.gameState()
		.takeUntil(completed)
		.filter(state => state.currentPlayer().type() === type);

const computerPlayer = (state) => {
	if (_.isFunction(state.offer)) {
		const offer = state.offer();
		const valueCurrent = calculateOfferValueFor(offer, 0);
		const valueOther = calculateOfferValueFor(offer, 1);

		return valueCurrent >= valueOther
			? state.choices()[0]
			: state.choices()[1];
	}

	return state.choices()[0];
};

const calculateOfferValueFor = (offer, playerIndex) =>
	_.reduce(
		offer.propertiesFor(playerIndex),
		(total, property) => total + property.price(),
		offer.moneyFor(playerIndex)
	);

const applyChoice = (task) => (choice) => {
	// Delay by 0 ms to keep ordering consistent with old code
	Rx.Observable.timer(0).subscribe(() => {
		task._choiceMade.onNext({ choice });
	});
};
