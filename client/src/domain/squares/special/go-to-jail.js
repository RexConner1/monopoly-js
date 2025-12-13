"use strict";

const { Special } = require("./special");

class GoToJail extends Special {
    constructor() {
        super("go-to-jail");
    }
}

module.exports = {
    GoToJail
}