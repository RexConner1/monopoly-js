"use strict";

const { Special } = require("./special");

class Jail extends Special {
    constructor() {
        super("jail");
    }
}

module.exports = {
    Jail
}