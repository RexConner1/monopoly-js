"use strict";

const { precondition } = require("@infrastructure/contract");
const constants = require("@infrastructure/constants");

exports.start = function () {
    return new ConfigureGameTask();
};

class ConfigureGameTask {
    constructor() {
        this._availablePlayerTypes = ["human", "computer"];
        this._completed = new Rx.AsyncSubject();

        this._playerSlots = new Rx.BehaviorSubject([
            { type: this._availablePlayerTypes[0] },
            { type: this._availablePlayerTypes[1] },
            { type: this._availablePlayerTypes[1] }
        ]);

        this._canAddPlayerSlot = new Rx.BehaviorSubject(true);
        this._configurationValid = new Rx.BehaviorSubject(true);
    }

    availablePlayerTypes() {
        return [...this._availablePlayerTypes];
    }

    playerSlots() {
        return this._playerSlots.takeUntil(this._completed);
    }

    configurationValid() {
        return this._configurationValid.takeUntil(this._completed);
    }

    addPlayerSlot(type) {
        precondition(
            _.contains(this._availablePlayerTypes, type),
            `Player type [${type}] is not authorized`
        );

        this._playerSlots.take(1).subscribe((slots) => {
            slots.push({ type });
            this._playerSlots.onNext(slots);

            if (slots.length === constants.MAX_NUMBER_OF_PLAYERS) {
                this._canAddPlayerSlot.onNext(false);
            }

            if (slots.length >= constants.MIN_NUMBER_OF_PLAYERS) {
                this._configurationValid.onNext(true);
            }
        });
    }

    removePlayerSlot(slotIndex) {
        precondition(
            _.isNumber(slotIndex) && slotIndex >= 0,
            "Removing a player slot requires its index"
        );

        this._playerSlots.take(1).subscribe((slots) => {
            precondition(
                slotIndex < slots.length,
                "Removing a player slot requires its index to be valid"
            );

            slots.splice(slotIndex, 1);
            this._playerSlots.onNext(slots);

            if (slots.length < constants.MAX_NUMBER_OF_PLAYERS) {
                this._canAddPlayerSlot.onNext(true);
            }

            if (slots.length < constants.MIN_NUMBER_OF_PLAYERS) {
                this._configurationValid.onNext(false);
            }
        });
    }

    canAddPlayerSlot() {
        return this._canAddPlayerSlot.takeUntil(this._completed);
    }

    startGame() {
        this._completed.onNext(true);
        this._completed.onCompleted();
    }
}
