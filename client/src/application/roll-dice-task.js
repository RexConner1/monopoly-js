"use strict";

exports.start = function (options) {
	const fast = (options && options.fast) || false;
	const dieFunction = (options && options.dieFunction) || rollDie;

	return new RollDiceTask(fast, dieFunction);
};

class RollDiceTask {
	constructor(fastOption, dieFunction) {
		this._diceRolled = new Rx.BehaviorSubject([
			dieFunction(),
			dieFunction()
		]);

		rollDice(fastOption, dieFunction, this._diceRolled);
	}

	diceRolled() {
		return this._diceRolled.asObservable();
	}
}

const rollDice = (fastOption, dieFunction, diceRolled) => {
	Rx.Observable.interval(100)
		.take(fastOption ? 1 : 15)
		.map(() => [dieFunction(), dieFunction()])
		.subscribe(diceRolled);
};

const rollDie = () =>
	Math.floor(Math.random() * 6 + 1);
