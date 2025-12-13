"use strict";

const Board = require("@domain/board");
const PlayGameTask = require("@app/play-game-task");
const ConfigureGameTask = require("@app/configure-game-task");

exports.start = function () {
	return new GameTask();
};

class GameTask {
	constructor() {
		this._status = new Rx.BehaviorSubject(configuringStatus(this));
	}

	status() {
		return this._status.asObservable();
	}
}

const configuringStatus = (self) => {
	const task = ConfigureGameTask.start();

	task.playerSlots()
		.last()
		.subscribe((players) => {
			startGame(players, self);
		});

	return {
		statusName: "configuring",
		match(visitor) {
			visitor.configuring(task);
		}
	};
};

const playingStatus = (players, self) => {
	const gameConfiguration = {
		board: Board.standard(),
		players: players,
		options: { fastDice: false }
	};

	const task = PlayGameTask.start(gameConfiguration);

	task.completed().subscribe(() => {
		newGame(self);
	});

	return {
		statusName: "playing",
		match(visitor) {
			visitor.playing(task);
		}
	};
};

const newGame = (self) => {
	self._status.onNext(configuringStatus(self));
};

const startGame = (players, self) => {
	self._status.onNext(playingStatus(players, self));
};
