"use strict";

const RollDiceTask = require("@app/roll-dice-task");
const TradeTask = require("@app/trade-task");
const LogGameTask = require("@app/log-game-task");
const HandleChoicesTask = require("@app/handle-choices-task");
const Player = require("@domain/player");
const GameState = require("@domain/game-state");
const TradeOffer = require("@domain/trade-offer");
const Board = require("@domain/board");
const { precondition } = require("@infrastructure/contract");

exports.start = function (gameConfiguration) {
	precondition(Board.isBoard(gameConfiguration.board), "PlayGameTask requires a configuration with a board");
	precondition(_.isArray(gameConfiguration.players), "PlayGameTask requires a configuration with a list of players");
	precondition(gameConfiguration.options, "PlayGameTask requires a configuration with an options object");

	const task = new PlayGameTask(gameConfiguration);
	listenForChoices(task);
	return task;
};

// ---------------------------- CLASS ----------------------------

class PlayGameTask {
	constructor(gameConfiguration) {
		this._options = gameConfiguration.options;
		this._completed = new Rx.AsyncSubject();
		this._rollDiceTaskCreated = new Rx.Subject();
		this._tradeTaskCreated = new Rx.Subject();

		const initialState = initialGameState(
			gameConfiguration.board,
			gameConfiguration.players
		);

		this._gameState = new Rx.BehaviorSubject(initialState);

		this._logGameTask = LogGameTask.start(this);
		this._handleChoicesTask = HandleChoicesTask.start(this);
	}

	handleChoicesTask() {
		return this._handleChoicesTask;
	}

	messages() {
		return this._logGameTask.messages().takeUntil(this._completed);
	}

	gameState() {
		return this._gameState.asObservable().takeUntil(this._completed);
	}

	rollDiceTaskCreated() {
		return this._rollDiceTaskCreated.takeUntil(this._completed);
	}

	tradeTaskCreated() {
		return this._tradeTaskCreated.takeUntil(this._completed);
	}

	completed() {
		return this._completed.asObservable();
	}

	stop() {
		this._handleChoicesTask.stop();
		this._completed.onNext(true);
		this._completed.onCompleted();
	}
}

// ---------------------------- Initialization ----------------------------

const initialGameState = (board, players) =>
	GameState.turnStartState({
		board,
		players: Player.newPlayers(players, board.playerParameters()),
		currentPlayerIndex: 0
	});

// ---------------------------- Choice Handling ----------------------------

const listenForChoices = (self) => {
	self._handleChoicesTask
		.choiceMade()
		.withLatestFrom(self._gameState, (action, state) => ({
			choice: action.choice,
			arg: action.arg,
			state
		}))
		.flatMap(computeNextState(self))
		.subscribe((nextState) => {
			self._gameState.onNext(nextState);
		});
};

const computeNextState = (self) => (action) => {
	if (action.choice.requiresDice()) {
		return computeNextStateWithDice(self, action.state, action.choice);
	}

	if (_.isFunction(action.choice.requiresTrade)) {
		return computeNextStateWithTrade(self, action.state, action.choice, action.arg);
	}

	const nextState = action.choice.computeNextState(action.state);
	return Rx.Observable.return(nextState);
};

// ---------------------------- Dice Path ----------------------------

const computeNextStateWithDice = (self, state, choice) => {
	const task = RollDiceTask.start({
		fast: self._options.fastDice,
		dieFunction: self._options.dieFunction
	});

	self._rollDiceTaskCreated.onNext(task);

	return task
		.diceRolled()
		.last()
		.map((dice) => choice.computeNextState(state, dice));
};

// ---------------------------- Trade Path ----------------------------

const computeNextStateWithTrade = (self, state, choice, arg) => {
	if (TradeOffer.isOffer(arg) && !arg.isEmpty()) {
		const nextState = choice.computeNextState(state, arg);
		return Rx.Observable.return(nextState);
	}

	const currentPlayer = state.players()[state.currentPlayerIndex()];
	const otherPlayer = choice.otherPlayer();
	const task = TradeTask.start(currentPlayer, otherPlayer);

	self._tradeTaskCreated.onNext(task);

	return task
		.offer()
		.last()
		.map((offer) => choice.computeNextState(state, offer));
};
